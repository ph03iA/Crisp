import { getDb, getCandidate, getSession } from './lib/db.js'

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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

// Vercel serverless function configuration
export const config = {
  api: {
    bodyParser: true,
  },
}
