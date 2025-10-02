import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Disable worker completely to avoid CDN issues
pdfjsLib.GlobalWorkerOptions.workerSrc = ''

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
const NAME_PATTERNS = [
  /^(.+)$/m, // First non-empty line
  /name[:\s]+(.+)$/im, // Line with "Name:" label
  /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m // Capital First Last pattern
]

export const extractTextFromPDF = async (file) => {
  try {
    console.log('Starting PDF text extraction...')
    const arrayBuffer = await file.arrayBuffer()
    console.log('File loaded, attempting PDF parsing...')
    
    // Use pdfjs-dist with multiple fallback configurations
    let pdf
    let extractionMethod = 'unknown'
    
    // Method 1: Try with minimal configuration
    try {
      console.log('Attempting PDF parsing with minimal config...')
      pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        disableWorker: true,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        verbosity: 0 // Reduce logging
      }).promise
      extractionMethod = 'minimal'
      console.log('PDF parsed successfully with minimal config')
    } catch (minimalError) {
      console.warn('Minimal config failed, trying basic config:', minimalError.message)
      
      // Method 2: Try with even simpler configuration
      try {
        console.log('Attempting PDF parsing with basic config...')
        pdf = await pdfjsLib.getDocument(arrayBuffer).promise
        extractionMethod = 'basic'
        console.log('PDF parsed successfully with basic config')
      } catch (basicError) {
        console.warn('Basic config failed, trying with disabled features:', basicError.message)
        
        // Method 3: Try with all features disabled
        try {
          console.log('Attempting PDF parsing with all features disabled...')
          pdf = await pdfjsLib.getDocument({
            data: arrayBuffer,
            disableWorker: true,
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: false,
            disableFontFace: true,
            disableRange: true,
            disableStream: true
          }).promise
          extractionMethod = 'disabled-features'
          console.log('PDF parsed successfully with disabled features')
        } catch (disabledError) {
          console.warn('All PDF parsing methods failed, using fallback...')
          
          // Fallback: no sample data; trigger missing-fields flow
          console.log('Using empty fallback text for PDF parsing')
          return ''
        }
      }
    }
    
    console.log(`PDF loaded successfully using ${extractionMethod} method. Pages: ${pdf.numPages}`)
    let fullText = ''
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Extracting text from page ${pageNum}...`)
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        const pageText = textContent.items
          .map((item) => item.str)
          .join(' ')
        
        fullText += pageText + '\n'
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError.message)
        // Continue with other pages
      }
    }
    
    if (fullText.trim().length === 0) {
      console.warn('No text extracted; returning empty to trigger missing-fields flow')
      return ''
    }
    
    console.log('PDF text extraction completed successfully')
    return fullText
    
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    
    // Provide more helpful error message
    if (error.message.includes('Failed to fetch')) {
      throw new Error('PDF parsing failed due to network issues. Please try again or upload a different file.')
    } else if (error.message.includes('Invalid PDF')) {
      throw new Error('The uploaded file is not a valid PDF or is corrupted. Please try a different file.')
    } else if (error.message.includes('image-based')) {
      throw new Error('This PDF appears to be image-based and cannot extract text. Please try a text-based PDF or DOCX file.')
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
  }
}

export const extractTextFromDOCX = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('Error extracting DOCX text:', error)
    throw new Error('Failed to extract text from DOCX')
  }
}

const extractEmail = (text) => {
  const matches = text.match(EMAIL_REGEX)
  return matches ? matches[0] : undefined
}

const extractPhone = (text) => {
  const matches = text.match(PHONE_REGEX)
  if (matches) {
    // Clean up the phone number
    return matches[0].replace(/[^\d+]/g, '').replace(/^\+?1?/, '')
  }
  return undefined
}

const extractName = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Try different patterns to find the name
  for (const pattern of NAME_PATTERNS) {
    for (const line of lines) {
      const match = line.match(pattern)
      if (match && match[1]) {
        const name = match[1].trim()
        // Basic validation - should be reasonable length and not look like email/phone
        if (name.length >= 3 && name.length <= 50 && 
            !name.includes('@') && !name.match(/^\d+$/)) {
          return name
        }
      }
    }
  }
  
  // Fallback: use first non-empty line if it looks like a name
  if (lines.length > 0) {
    const firstLine = lines[0]
    if (firstLine.length >= 3 && firstLine.length <= 50 && 
        !firstLine.includes('@') && !firstLine.match(/^\d+$/)) {
      return firstLine
    }
  }
  
  return undefined
}

export const parseResume = async (file) => {
  let text
  
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file)
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await extractTextFromDOCX(file)
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.')
  }
  
  const name = extractName(text)
  const email = extractEmail(text)
  const phone = extractPhone(text)
  
  return {
    name,
    email,
    phone,
    text: text.trim()
  }
}

export const validateResumeData = (data) => {
  const missing = []
  
  if (!data.name) missing.push('name')
  if (!data.email) missing.push('email')
  if (!data.phone) missing.push('phone')
  
  return {
    isValid: missing.length === 0,
    missing
  }
}
