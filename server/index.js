import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { ensureFile, readJson, writeJson } from './utils/storage.js'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import mammoth from 'mammoth'
// Import internal module to avoid debug code in pdf-parse index.js
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
const app = express()
const DEFAULT_PORT = Number(process.env.PORT) || 5174

app.use(cors())
app.use(express.json({ limit: '2mb' }))

// simple JSON file DB
const dataDir = path.join(__dirname, 'data')
const dbFile = path.join(dataDir, 'db.json')
ensureFile(dbFile, { candidates: [], sessions: {} })

const readDb = () => readJson(dbFile)
const writeDb = (data) => writeJson(dbFile, data)

// storage for uploads
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const upload = multer({ dest: uploadDir })

// Health
app.get('/health', (req, res) => res.json({ ok: true }))

// Upload resume (PDF/DOCX). Parse PDF with pdf-parse and DOCX with mammoth.
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file?.path
    if (!filePath) return res.status(400).json({ error: 'No file uploaded' })

    let extracted = { name: '', email: '', phone: '' }
    let fullText = ''
    if (req.file.mimetype === 'application/pdf') {
      const buffer = fs.readFileSync(filePath)
      const parsed = await pdfParse(buffer)
      const text = parsed.text || ''
      const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
      const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/g)
      extracted.email = emailMatch?.[0] || ''
      extracted.phone = phoneMatch?.[0] || ''
      // naive name heuristic: first non-empty line
      const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0)
      extracted.name = firstLine || ''
      fullText = text
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const buffer = fs.readFileSync(filePath)
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value || ''
      const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
      const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/g)
      extracted.email = emailMatch?.[0] || ''
      extracted.phone = phoneMatch?.[0] || ''
      const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0)
      extracted.name = firstLine || ''
      fullText = text
    }

    return res.json({ ok: true, fields: extracted, text: fullText, fileId: path.basename(filePath) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to process resume' })
  }
})

// Start interview: generate 6 AI questions using resume text and create a session
app.post('/start-interview', async (req, res) => {
  const { name, email, resumeText } = req.body || {}
  const db = readDb()
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
      if (start === -1 || end === -1 || end <= start) return null
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
      const optPrompt = `Provide exactly 4 concise, mutually exclusive multiple-choice options for this question. Return ONLY JSON array of 4 strings, no prose. Question: ${questionText}`
      const txt = await model.generateContent(optPrompt).then(r => r.response.text())
      const start = txt.indexOf('[')
      const end = txt.lastIndexOf(']')
      if (start === -1 || end === -1) return []
      try { const arr = JSON.parse(txt.slice(start, end + 1)); return Array.isArray(arr) ? arr.slice(0, 4).map(String) : [] } catch { return [] }
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
    // Validate options
    if (mapped.some(q => !Array.isArray(q.options) || q.options.length !== 4)) throw new Error('AI did not return 4 options')

    const byDiff = {
      Easy: mapped.filter(q => q.difficulty === 'Easy').slice(0, 2),
      Medium: mapped.filter(q => q.difficulty === 'Medium').slice(0, 2),
      Hard: mapped.filter(q => q.difficulty === 'Hard').slice(0, 2)
    }
    if (byDiff.Easy.length < 2 || byDiff.Medium.length < 2 || byDiff.Hard.length < 2) throw new Error('AI did not produce required difficulties')
    const questions = [...byDiff.Easy, ...byDiff.Medium, ...byDiff.Hard]

    db.sessions[sessionId] = {
      id: sessionId,
      candidate: { name: name || '', email: email || '' },
      questions,
      answers: []
    }
    writeDb(db)
    return res.json({ sessionId, questions, aiUsed: true })
  } catch (e) {
    console.error('AI question generation failed:', e?.message || e)
    return res.status(500).json({ error: 'Failed to generate AI questions' })
  }
})

// Submit answer for a question
app.post('/submit-answer', (req, res) => {
  const { sessionId, questionId, answer, timeUsed, selectedIndex } = req.body || {}
  console.log('Submit answer received:', { sessionId, questionId, answer, timeUsed, selectedIndex })
  if (!sessionId || !questionId) return res.status(400).json({ error: 'Missing sessionId or questionId' })
  const db = readDb()
  const session = db.sessions[sessionId]
  if (!session) return res.status(404).json({ error: 'Session not found' })
  const question = session.questions.find(q => q.id === String(questionId))
  if (!question) return res.status(404).json({ error: 'Question not found' })
  
  console.log('Question details:', {
    questionId: question.id,
    options: question.options,
    correctIndex: question.correctIndex,
    selectedIndex,
    hasOptions: Array.isArray(question.options),
    correctIndexType: typeof question.correctIndex,
    selectedIndexType: typeof selectedIndex
  })
  session.answers = session.answers.filter(a => a.questionId !== String(questionId))
  let isCorrect
  if (Array.isArray(question.options) && typeof question.correctIndex === 'number' && typeof selectedIndex === 'number') {
    isCorrect = Number(selectedIndex) === Number(question.correctIndex)
    console.log('Correctness calculation:', {
      selectedIndex: Number(selectedIndex),
      correctIndex: Number(question.correctIndex),
      isCorrect,
      comparison: `${Number(selectedIndex)} === ${Number(question.correctIndex)}`
    })
  } else {
    console.log('Cannot calculate correctness:', {
      hasOptions: Array.isArray(question.options),
      correctIndexType: typeof question.correctIndex,
      selectedIndexType: typeof selectedIndex,
      correctIndex: question.correctIndex,
      selectedIndex
    })
  }
  const answerData = {
    questionId: String(questionId),
    answer: answer || '',
    selectedIndex: typeof selectedIndex === 'number' ? Number(selectedIndex) : undefined,
    isCorrect: typeof isCorrect === 'boolean' ? isCorrect : undefined,
    timeUsed: Number(timeUsed) || 0
  }
  console.log('Storing answer data:', answerData)
  console.log('isCorrect type:', typeof isCorrect, 'value:', isCorrect)
  session.answers.push(answerData)
  writeDb(db)
  res.json({ ok: true })
})

// Finish interview: Gemini-based summary if key present, else rule-based
app.post('/finish-interview', (req, res) => {
  const { sessionId } = req.body || {}
  const db = readDb()
  const session = db.sessions[sessionId]
  if (!session) return res.status(404).json({ error: 'Session not found' })

  const ruleBasedScore = () => {
    // If MCQ correctness is available, use it; otherwise fall back to length-based heuristic
    const haveMcq = session.questions.some(q => typeof q.correctIndex === 'number')
    console.log('Scoring calculation:', {
      haveMcq,
      questions: session.questions.map(q => ({ id: q.id, correctIndex: q.correctIndex })),
      answers: session.answers.map(a => ({ questionId: a.questionId, isCorrect: a.isCorrect, selectedIndex: a.selectedIndex }))
    })
    
    if (haveMcq) {
      let correct = 0
      let total = 0
      session.questions.forEach(q => {
        const a = session.answers.find(ans => ans.questionId === q.id)
        if (typeof q.correctIndex === 'number') {
          total += 1
          console.log(`Question ${q.id}: correctIndex=${q.correctIndex}, answer.isCorrect=${a?.isCorrect}, selectedIndex=${a?.selectedIndex}`)
          if (a && a.isCorrect === true) correct += 1
        }
      })
      console.log(`MCQ scoring: ${correct}/${total} = ${Math.round((correct / total) * 100)}%`)
      if (total > 0) {
        return Math.round((correct / total) * 100)
      }
    }
    // Fallback: heuristic based on text length and difficulty
    let totalScore = 0
    session.questions.forEach(q => {
      const ans = session.answers.find(a => a.questionId === q.id)?.answer || ''
      const len = ans.trim().length
      const base = len > 200 ? 80 : len > 100 ? 65 : len > 30 ? 50 : 30
      const diffBonus = q.difficulty === 'Hard' ? 15 : q.difficulty === 'Medium' ? 8 : 0
      totalScore += Math.min(100, base + diffBonus)
    })
    return Math.round(totalScore / session.questions.length)
  }

  const respond = (overall, summary) => {
    const candidateId = `c_${Date.now()}`
    const candidate = {
      id: candidateId,
      name: session.candidate.name || 'Unknown',
      email: session.candidate.email || '',
      score: overall,
      summary,
      sessionId
    }
    db.candidates.push(candidate)
    writeDb(db)
    res.json({ candidate })
  }

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    const overall = ruleBasedScore()
    const summary = overall >= 80 ? 'Excellent performance.' : overall >= 60 ? 'Good performance.' : 'Needs improvement.'
    return respond(overall, summary)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const lines = session.questions.map((q, i) => {
      const ans = session.answers.find(a => a.questionId === q.id)?.answer || 'No answer'
      return `Q${i + 1} (${q.difficulty}): ${q.text}\nA: ${ans}`
    }).join('\n\n')
    const prompt = `You are an interviewer. Score 0-100 and summarize succinctly.\n${lines}\nReturn JSON {overallScore:number, summary:string}`
    model.generateContent(prompt).then(result => result.response.text()).then(text => {
      try {
        const json = JSON.parse(text)
        const overall = Math.round(json.overallScore || ruleBasedScore())
        const summary = json.summary || 'Interview summary unavailable.'
        respond(overall, summary)
      } catch {
        const overall = ruleBasedScore()
        const summary = overall >= 80 ? 'Excellent performance.' : overall >= 60 ? 'Good performance.' : 'Needs improvement.'
        respond(overall, summary)
      }
    }).catch(() => {
      const overall = ruleBasedScore()
      const summary = overall >= 80 ? 'Excellent performance.' : overall >= 60 ? 'Good performance.' : 'Needs improvement.'
      respond(overall, summary)
    })
  } catch (e) {
    const overall = ruleBasedScore()
    const summary = overall >= 80 ? 'Excellent performance.' : overall >= 60 ? 'Good performance.' : 'Needs improvement.'
    respond(overall, summary)
  }
})

// Generate 4 MCQ options for a given question text
app.post('/generate-options', async (req, res) => {
  try {
    const { text } = req.body || {}
    if (!text) return res.status(400).json({ error: 'Missing text' })
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) return res.status(400).json({ error: 'AI key missing' })
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `Provide exactly 4 concise, mutually exclusive multiple-choice options for this question. Return ONLY JSON array of 4 strings, no prose. Question: ${text}`
    const raw = await model.generateContent(prompt).then(r => r.response.text())
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start === -1 || end === -1) return res.status(500).json({ error: 'Failed to parse options' })
    let arr
    try { arr = JSON.parse(raw.slice(start, end + 1)) } catch { return res.status(500).json({ error: 'Invalid options JSON' }) }
    if (!Array.isArray(arr) || arr.length < 4) return res.status(500).json({ error: 'Insufficient options' })
    return res.json({ options: arr.slice(0, 4).map(String) })
  } catch (e) {
    console.error('generate-options failed:', e?.message || e)
    return res.status(500).json({ error: 'Failed to generate options' })
  }
})

// Dashboard endpoints
app.get('/candidates', (req, res) => {
  const db = readDb()
  res.json({ candidates: db.candidates })
})

app.get('/candidate/:id', (req, res) => {
  const db = readDb()
  const candidate = db.candidates.find(c => c.id === req.params.id)
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' })
  const session = db.sessions[candidate.sessionId]
  res.json({ candidate, session })
})

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`)
  })

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      const next = port + 1
      console.warn(`Port ${port} in use. Retrying on ${next}...`)
      startServer(next)
    } else {
      throw err
    }
  })
}

startServer(DEFAULT_PORT)


