const { GoogleGenerativeAI } = require('@google/generative-ai')
const { getDb, getSession, addCandidate } = require('./lib/db.js')

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

  const { sessionId } = req.body || {}
  const session = getSession(sessionId)
  
  if (!session) return res.status(404).json({ error: 'Session not found' })
  
  const ruleBasedScore = () => {
    const haveMcq = session.questions.some(q => Array.isArray(q.options) && q.options.length > 0)
    if (!haveMcq) return Math.round(Math.random() * 40 + 30)
    
    let correct = 0
    let total = 0
    
    session.questions.forEach(q => {
      if (Array.isArray(q.options) && q.options.length > 0) {
        total++
        const answer = session.answers.find(a => a.questionId === q.id)
        if (answer && typeof answer.isCorrect === 'boolean' && answer.isCorrect) {
          correct++
        }
      }
    })
    
    return total > 0 ? Math.round((correct / total) * 100) : Math.round(Math.random() * 40 + 30)
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
    addCandidate(candidate)
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
}

