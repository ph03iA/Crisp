import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js to use a local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Initialize Google AI
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  /* console.log('Environment check:', {
    hasEnv: !!import.meta.env.VITE_GOOGLE_API_KEY,
    envValue: import.meta.env.VITE_GOOGLE_API_KEY ? '***' + import.meta.env.VITE_GOOGLE_API_KEY.slice(-4) : 'undefined',
    allEnv: Object.keys(import.meta.env),
    allEnvValues: import.meta.env
  }); */
  
  if (!apiKey) {
    throw new Error('AI key missing. Set VITE_GOOGLE_API_KEY in environment.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const uploadResume = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    let fullText = '';
    let extracted = {};
    
    // Extract text using appropriate method
    if (file.type === 'application/pdf') {
      // console.log('Processing PDF file with PDF.js...');
      
      try {
        // Load the PDF document
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        // console.log(`PDF loaded: ${pdf.numPages} pages`);
        
        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        // console.log('PDF text extracted:', fullText.substring(0, 200) + '...');
        
        // Use AI to extract structured information from PDF text
        if (fullText.length > 50) {
          // console.log('Using AI to extract resume information from PDF...');
          const genAI = getGenAI();
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          
          const prompt = `Extract the following information from this resume text and return ONLY a JSON object with these exact keys:

{
  "name": "Full name of the person",
  "email": "Email address if found",
  "phone": "Phone number if found"
}

Resume text:
${fullText.slice(0, 8000)}

Return only the JSON object, no other text.`;

          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          
          // Parse the AI response
          try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              extracted = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in AI response');
            }
          } catch (parseError) {
            console.warn('AI response parsing failed for PDF, using fallback:', parseError);
            // Fallback to regex extraction
            const emailMatch = fullText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
            const phoneMatch = fullText.match(/(\+?\d[\d\s-]{7,}\d)/g);
            const firstLine = fullText.split('\n').map(l => l.trim()).find(l => l.length > 0);
            
            extracted = { 
              name: firstLine || '', 
              email: emailMatch?.[0] || '', 
              phone: phoneMatch?.[0] || ''
            };
          }
        } else {
          // console.log('Insufficient text in PDF - returning empty fields');
          extracted = { 
            name: '', 
            email: '', 
            phone: ''
          };
        }
      } catch (pdfError) {
        console.error('PDF parsing failed:', pdfError);
        fullText = `PDF file: ${file.name}. Error parsing PDF content.`;
        extracted = { 
          name: '', 
          email: '', 
          phone: ''
        };
      }
      
    } else if (file.type.includes('word') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // console.log('Processing DOCX file with AI...');
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      fullText = result.value || '';
      // console.log('DOCX text extracted:', fullText.substring(0, 200) + '...');
      
      // Use AI to extract structured information from DOCX
      if (fullText.length > 50) {
        // console.log('Using AI to extract resume information from DOCX...');
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `Extract the following information from this resume text and return ONLY a JSON object with these exact keys:

{
  "name": "Full name of the person",
  "email": "Email address if found",
  "phone": "Phone number if found"
}

Resume text:
${fullText.slice(0, 8000)}

Return only the JSON object, no other text.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Parse the AI response
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            extracted = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in AI response');
          }
        } catch (parseError) {
          console.warn('AI response parsing failed, using fallback:', parseError);
          // Fallback to regex extraction
          const emailMatch = fullText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
          const phoneMatch = fullText.match(/(\+?\d[\d\s-]{7,}\d)/g);
          const firstLine = fullText.split('\n').map(l => l.trim()).find(l => l.length > 0);
          
          extracted = { 
            name: firstLine || '', 
            email: emailMatch?.[0] || '', 
            phone: phoneMatch?.[0] || ''
          };
        }
      } else {
        // console.log('Insufficient text in DOCX - returning empty fields');
        extracted = { 
          name: '', 
          email: '', 
          phone: ''
        };
      }
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }

    // Ensure all required fields exist
    const finalExtracted = {
      name: extracted.name || '',
      email: extracted.email || '',
      phone: extracted.phone || ''
    };
    
    const fileId = uuidv4() + (file.type === 'application/pdf' ? '.pdf' : '.docx');
    
    // console.log('Extraction complete:', { extracted: finalExtracted, textLength: fullText.length });
    
    return { 
      ok: true, 
      fields: finalExtracted, 
      text: fullText, 
      fileId 
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to process resume');
  }
};
