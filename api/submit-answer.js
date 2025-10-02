// In-memory database for Vercel serverless
let db = {
  sessions: {},
  candidates: []
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, questionId, answer, timeUsed, selectedIndex } = req.body || {}
  const session = db.sessions[sessionId]
  
  if (!session) return res.status(404).json({ error: 'Session not found' })
  
  const question = session.questions.find(q => q.id === questionId)
  if (!question) return res.status(404).json({ error: 'Question not found' })
  
  const isCorrect = typeof selectedIndex === 'number' && typeof question.correctIndex === 'number' 
    ? selectedIndex === question.correctIndex 
    : undefined
  
  session.answers.push({
    questionId: String(questionId),
    answer: answer || '',
    selectedIndex: typeof selectedIndex === 'number' ? Number(selectedIndex) : undefined,
    isCorrect: typeof isCorrect === 'boolean' ? isCorrect : undefined,
    timeUsed: Number(timeUsed) || 0
  })
  
  return res.json({ ok: true })
}

