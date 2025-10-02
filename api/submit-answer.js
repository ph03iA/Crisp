import { getDb, getSession, updateSession } from './lib/db.js'

export default function handler(req, res) {
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

  const { sessionId, questionId, answer, timeUsed, selectedIndex } = req.body || {}
  const session = getSession(sessionId)
  
  if (!session) return res.status(404).json({ error: 'Session not found' })
  
  const question = session.questions.find(q => q.id === questionId)
  if (!question) return res.status(404).json({ error: 'Question not found' })
  
  const isCorrect = typeof selectedIndex === 'number' && typeof question.correctIndex === 'number' 
    ? selectedIndex === question.correctIndex 
    : undefined
  
  const newAnswer = {
    questionId: String(questionId),
    answer: answer || '',
    selectedIndex: typeof selectedIndex === 'number' ? Number(selectedIndex) : undefined,
    isCorrect: typeof isCorrect === 'boolean' ? isCorrect : undefined,
    timeUsed: Number(timeUsed) || 0
  }
  
  // Update session with new answer
  const updatedAnswers = [...session.answers.filter(a => a.questionId !== String(questionId)), newAnswer]
  updateSession(sessionId, { answers: updatedAnswers })
  
  return res.json({ ok: true })
}

