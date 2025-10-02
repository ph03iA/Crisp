import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for Vercel serverless functions (memory storage)
const storage = multer.memoryStorage()
const upload = multer({ storage })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Handle file upload
    upload.single('resume')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'File upload error' })
      }

      const file = req.file
      if (!file) return res.status(400).json({ error: 'No file uploaded' })

      let extracted = { name: '', email: '', phone: '' }
      let fullText = ''
      
      if (file.mimetype === 'application/pdf') {
        const buffer = file.buffer
        const parsed = await pdfParse(buffer)
        const text = parsed.text || ''
        const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
        const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/g)
        extracted.email = emailMatch?.[0] || ''
        extracted.phone = phoneMatch?.[0] || ''
        const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0)
        extracted.name = firstLine || ''
        fullText = text
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const buffer = file.buffer
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

      return res.json({ ok: true, fields: extracted, text: fullText, fileId: file.originalname })
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to process resume' })
  }
}

