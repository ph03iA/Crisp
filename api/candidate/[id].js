// In-memory database for Vercel serverless
let db = {
  sessions: {},
  candidates: []
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const candidate = db.candidates.find(c => c.id === id)
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' })
  
  const session = db.sessions[candidate.sessionId]
  if (!session) return res.status(404).json({ error: 'Session not found' })
  
  return res.json({ candidate, session })
}

