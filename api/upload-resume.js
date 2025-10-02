import formidable from 'formidable'
import fs from 'fs'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export const config = {
  api: {
    bodyParser: false,
  },
}

const parseForm = (form, req) =>
  new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Accept, Content-Type, Authorization, X-Requested-With'
  )
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Upload resume endpoint is working',
      methods: ['POST'],
      timestamp: new Date().toISOString(),
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS')
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: false,
      keepExtensions: true,
    })

    const { fields, files } = await parseForm(form, req)

    let resumeFile = files?.resume || files?.file || null
    if (Array.isArray(resumeFile)) resumeFile = resumeFile[0]
    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file uploaded' })
    }

    const filepath = resumeFile.filepath || resumeFile.path
    const mimetype = resumeFile.mimetype || resumeFile.type || ''
    const originalFilename = resumeFile.originalFilename || resumeFile.name || 'resume'

    if (!filepath) {
      return res.status(500).json({ error: 'Uploaded file did not provide a temporary path' })
    }

    const buffer = fs.readFileSync(filepath)

    let extracted = { name: '', email: '', phone: '' }
    let fullText = ''

    const emailRe = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
    const phoneRe = /(\+?\d[\d\s-]{7,}\d)/g

    if (mimetype === 'application/pdf' || filepath.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer)
      const text = parsed.text || ''
      extracted.email = (text.match(emailRe) || [])[0] || ''
      extracted.phone = (text.match(phoneRe) || [])[0] || ''
      extracted.name = (text.split('\n').map(l => l.trim()).find(l => l.length > 0)) || ''
      fullText = text
    } else if (
      mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filepath.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value || ''
      extracted.email = (text.match(emailRe) || [])[0] || ''
      extracted.phone = (text.match(phoneRe) || [])[0] || ''
      extracted.name = (text.split('\n').map(l => l.trim()).find(l => l.length > 0)) || ''
      fullText = text
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX.' })
    }

    // cleanup (best-effort)
    try {
      fs.unlinkSync(filepath)
    } catch (cleanupErr) {
      console.warn('Cleanup failed (non-fatal):', cleanupErr.message)
    }

    return res.status(200).json({
      ok: true,
      fields: extracted,
      text: fullText,
      fileId: originalFilename,
    })
  } catch (err) {
    console.error('Upload error:', err)
    // handle common formidable error
    if (err.code === 'PayloadTooLarge' || err.message?.includes('maxFileSize')) {
      return res.status(413).json({ error: 'File is too large' })
    }
    return res.status(500).json({
      error: err.message || 'Failed to process resume',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  }
}
