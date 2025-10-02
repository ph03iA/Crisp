import { getCandidates } from './lib/db.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.json({ candidates: getCandidates() })
}

