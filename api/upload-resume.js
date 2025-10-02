import formidable from 'formidable'
import fs from 'fs'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import os from 'os'
import path from 'path'

export default async function handler(req, res) {
  // Set comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Max-Age', '86400')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Allow GET for health check
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Upload resume endpoint is working',
      methods: ['POST'],
      timestamp: new Date().toISOString()
    })
  }

  // Only allow POST requests for actual upload
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    return
  }

  try {
    console.log('Upload request received:', {
      method: req.method,
      headers: req.headers,
      url: req.url
    })

    // Parse the form data using formidable with Vercel temp directory
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      uploadDir: os.tmpdir(), // Use Vercel's temporary directory
      keepExtensions: true,
      filter: ({ mimetype }) => {
        console.log('File type check:', mimetype)
        return mimetype === 'application/pdf' || 
               mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    })

    const [fields, files] = await form.parse(req)
    console.log('Parsed form data:', { fields, files })
    
    const resumeFile = files.resume?.[0]

    if (!resumeFile) {
      console.error('No resume file found in upload')
      return res.status(400).json({ error: 'No resume file uploaded' })
    }

    console.log('Processing file:', {
      filename: resumeFile.originalFilename,
      mimetype: resumeFile.mimetype,
      size: resumeFile.size
    })

    let extracted = { name: '', email: '', phone: '' }
    let fullText = ''
    
    // Read file buffer from temporary file
    const buffer = fs.readFileSync(resumeFile.filepath)
    console.log('File buffer size:', buffer.length, 'bytes')
    
    if (resumeFile.mimetype === 'application/pdf') {
      console.log('Processing PDF file')
      const parsed = await pdfParse(buffer)
      const text = parsed.text || ''
      console.log('PDF text extracted, length:', text.length)
      
      const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
      const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/g)
      extracted.email = emailMatch?.[0] || ''
      extracted.phone = phoneMatch?.[0] || ''
      const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0)
      extracted.name = firstLine || ''
      fullText = text
    } else if (resumeFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Processing DOCX file')
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value || ''
      console.log('DOCX text extracted, length:', text.length)
      
      const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
      const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/g)
      extracted.email = emailMatch?.[0] || ''
      extracted.phone = phoneMatch?.[0] || ''
      const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0)
      extracted.name = firstLine || ''
      fullText = text
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF or DOCX.' })
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(resumeFile.filepath)
    } catch (cleanupErr) {
      console.warn('Failed to cleanup temp file:', cleanupErr)
    }

    console.log('Upload successful:', { extracted, textLength: fullText.length })
    return res.status(200).json({ 
      ok: true, 
      fields: extracted, 
      text: fullText, 
      fileId: resumeFile.originalFilename || 'resume'
    })
    
  } catch (err) {
    console.error('Upload error:', err)
    console.error('Error stack:', err.stack)
    
    let errorMessage = 'Failed to process resume'
    if (err.message) {
      errorMessage = err.message
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
  }
}

// Vercel serverless function configuration
export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
}

