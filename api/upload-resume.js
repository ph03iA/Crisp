import formidable from 'formidable'
import fs from 'fs'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Parse the form data using formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        return mimetype === 'application/pdf' || 
               mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    })

    const [fields, files] = await form.parse(req)
    const resumeFile = files.resume?.[0]

    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file uploaded' })
    }

    let extracted = { name: '', email: '', phone: '' }
    let fullText = ''
    
    // Read file buffer
    const buffer = fs.readFileSync(resumeFile.filepath)
    
    if (resumeFile.mimetype === 'application/pdf') {
      const parsed = await pdfParse(buffer)
      const text = parsed.text || ''
      const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
      const phoneMatch = text.match(/(\+?\d[\d\s-]{7,}\d)/g)
      extracted.email = emailMatch?.[0] || ''
      extracted.phone = phoneMatch?.[0] || ''
      const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0)
      extracted.name = firstLine || ''
      fullText = text
    } else if (resumeFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value || ''
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
    fs.unlinkSync(resumeFile.filepath)

    return res.json({ 
      ok: true, 
      fields: extracted, 
      text: fullText, 
      fileId: resumeFile.originalFilename || 'resume'
    })
    
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: 'Failed to process resume' })
  }
}

