export const getApiKey = () => {
  // Prefer Vite env var when available
  let key = ''
  try {
    key = (import.meta && import.meta.env && import.meta.env.GOOGLE_API_KEY) || ''
  } catch (e) {
    // Accessing import.meta may throw in some environments; ignore and fallback
  }
  if (!key && typeof process !== 'undefined' && process.env) {
    key = process.env.GOOGLE_API_KEY || ''
  }
  if (!key) {
    console.warn('VITE_GOOGLE_API_KEY is not set. AI features may be disabled.')
  }
  return key
}


