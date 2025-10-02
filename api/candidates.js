// In-memory database for Vercel serverless
let db = {
  sessions: {},
  candidates: []
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.json(db.candidates)
}

