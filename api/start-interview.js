const { GoogleGenerativeAI } = require('@google/generative-ai')
const { getDb, addSession } = require('./lib/db.js')

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, resumeText } = req.body || {}
  const sessionId = `s_${Date.now()}`
  const difficulties = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard', 'Hard']

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return res.status(400).json({ error: 'AI key missing. Set GOOGLE_API_KEY on server.' })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const baseContext = (resumeText || '').slice(0, 4000)
    const prompt = `You are an expert interviewer. Create RESUME-SPECIFIC multiple-choice questions strictly about FRONTEND or BACKEND topics that the candidate has experience with.
Use this resume context to ground every question (do not ask generic definitions; reference frameworks, libraries, tools, databases, cloud, patterns or accomplishments from the resume):\n${baseContext}
Return ONLY a JSON array of 6 items (no prose). Each item must be:
{"text":"...","difficulty":"Easy|Medium|Hard","keywords":["resume terms"],"domain":"frontend"|"backend","options":["...","...","...","..."],"correctIndex":0|1|2|3}
STRICT RULES:
- Exactly 6 items, exactly 4 concise options per item.
- Exactly 2 Easy, 2 Medium, 2 Hard.
- Question text <= 150 chars; options <= 80 chars.
- Each question must be directly related to technologies or work described in the resume and labeled domain as "frontend" or "backend".
- Options must be plausible; exactly one best answer (correctIndex).`
    
    const raw = await model.generateContent(prompt).then(r => r.response.text())
    const extractJsonArray = (s) => {
      if (!s) return null
      const clean = s.replace(/```[\s\S]*?```/g, (m) => m.replace(/```(json)?/g, '').replace(/```/g, ''))
      const start = clean.indexOf('[')
      const end = clean.lastIndexOf(']')
      if (start === -1 || end === -1) return null
      return clean.slice(start, end + 1)
    }

    const jsonChunk = extractJsonArray(raw) || raw
    const parsed = JSON.parse(jsonChunk)
    if (!Array.isArray(parsed) || parsed.length < 6) throw new Error('Invalid AI questions')
    
    const normalizeOptions = (q) => {
      if (Array.isArray(q.options)) return q.options.filter(Boolean).map(String)
      if (Array.isArray(q.choices)) return q.choices.filter(Boolean).map(String)
      if (Array.isArray(q.answers)) return q.answers.filter(Boolean).map(String)
      if (typeof q.options === 'string') {
        const lines = q.options.split(/\r?\n|;|\||,/).map(s => s.trim()).filter(Boolean)
        return lines
      }
      if (typeof q.text === 'string' && /Options?:/i.test(q.text)) {
        const after = q.text.split(/Options?:/i)[1] || ''
        const lines = after.split(/\r?\n|;|\||,/).map(s => s.replace(/^\(?[A-Da-d][)\.]\s*/, '').trim()).filter(Boolean)
        return lines
      }
      return []
    }

    const tryGenerateOptions = async (questionText) => {
      try {
        const optPrompt = `Provide exactly 4 concise, mutually exclusive multiple-choice options for this question. Return ONLY JSON array of 4 strings, no prose. Question: ${questionText}`
        const txt = await model.generateContent(optPrompt).then(r => r.response.text())
        const start = txt.indexOf('[')
        const end = txt.lastIndexOf(']')
        if (start === -1 || end === -1) return []
        return JSON.parse(txt.slice(start, end + 1))
      } catch { return [] }
    }

    const mapped = []
    for (let i = 0; i < 6; i++) {
      const q = parsed[i]
      let options = normalizeOptions(q).slice(0, 4)
      if (options.length < 4) {
        const regenerated = await tryGenerateOptions(q.text)
        if (regenerated.length === 4) options = regenerated
      }
      mapped.push({
        id: `${i + 1}`,
        text: q.text,
        difficulty: q.difficulty,
        timeLimit: q.difficulty === 'Easy' ? 20 : q.difficulty === 'Medium' ? 60 : 120,
        keywords: Array.isArray(q.keywords) ? q.keywords : [],
        options,
        correctIndex: (typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3) ? q.correctIndex : undefined
      })
    }

    if (mapped.some(q => !Array.isArray(q.options) || q.options.length !== 4)) throw new Error('AI did not return 4 options')

    const byDiff = {
      Easy: mapped.filter(q => q.difficulty === 'Easy').slice(0, 2),
      Medium: mapped.filter(q => q.difficulty === 'Medium').slice(0, 2),
      Hard: mapped.filter(q => q.difficulty === 'Hard').slice(0, 2)
    }
    if (byDiff.Easy.length < 2 || byDiff.Medium.length < 2 || byDiff.Hard.length < 2) throw new Error('AI did not produce required difficulties')
    const questions = [...byDiff.Easy, ...byDiff.Medium, ...byDiff.Hard]

    addSession(sessionId, {
      id: sessionId,
      candidate: { name: name || '', email: email || '' },
      questions,
      answers: []
    })

    return res.json({ sessionId, questions, aiUsed: true })
  } catch (e) {
    console.error('AI question generation failed:', e?.message || e)
    return res.status(500).json({ error: 'Failed to generate AI questions' })
  }
}

