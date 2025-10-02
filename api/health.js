export default function handler(req, res) {
  res.status(200).json({ ok: true })
}

// Vercel serverless function configuration
export const config = {
  api: {
    bodyParser: true,
  },
}

