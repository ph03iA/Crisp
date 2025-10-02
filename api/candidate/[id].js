import { getDb, getCandidate, getSession } from './lib/db.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const candidate = getCandidate(id)
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' })
  
  const session = getSession(candidate.sessionId)
  if (!session) return res.status(404).json({ error: 'Session not found' })
  
  return res.json({ candidate, session })
}

