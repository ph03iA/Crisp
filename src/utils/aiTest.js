// Test file to verify AI integration
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getApiKey } from '../config/api'

export const testAI = async () => {
  try {
    console.log('Testing AI integration...')
    console.log('API Key:', getApiKey() ? 'Present' : 'Missing')
    
    const genAI = new GoogleGenerativeAI(getApiKey())
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const result = await model.generateContent("Say 'AI is working!' if you can process this request.")
    const response = await result.response
    const text = response.text()
    
    console.log('AI Response:', text)
    return { success: true, response: text }
  } catch (error) {
    console.error('AI Test Error:', error)
    return { success: false, error: error.message }
  }
}

// Auto-test on import (for development)
if (import.meta.env.DEV) {
  // testAI()
}
