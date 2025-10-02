let API_BASE = ''
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) {
    API_BASE = import.meta.env.VITE_API_BASE
  }
} catch (e) {
  // ignore, fallback below
}
if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE) {
  API_BASE = process.env.VITE_API_BASE
}

let detectedBasePromise
const ensureApiBase = async (force = false) => {
  if (force) detectedBasePromise = undefined
  if (detectedBasePromise) return detectedBasePromise
  const candidates = []
  // Prefer explicit env/base first
  if (API_BASE) candidates.push(API_BASE)
  // Prefer 5175 (API) over 5174 (often Vite)
  candidates.push('http://localhost:5175', 'http://localhost:5174', 'http://localhost:5176')
  detectedBasePromise = (async () => {
    for (const base of candidates) {
      try {
        const res = await fetch(`${base}/health`, { method: 'GET' })
        if (res.ok) {
          API_BASE = base
          return API_BASE
        }
      } catch {
        // try next
      }
    }
    return API_BASE
  })()
  return detectedBasePromise
}

const fetchJson = async (path, options = {}, retry = true) => {
  await ensureApiBase()
  try {
    const res = await fetch(`${API_BASE}${path}`, options)
    if (!res.ok) {
      if (retry && (res.status === 404 || res.status === 0)) {
        await ensureApiBase(true)
        return fetchJson(path, options, false)
      }
      throw new Error(`${res.status}`)
    }
    return res.json()
  } catch (e) {
    if (retry) {
      await ensureApiBase(true)
      return fetchJson(path, options, false)
    }
    throw e
  }
}

export const uploadResume = async (file) => {
  const form = new FormData()
  form.append('resume', file)
  return fetchJson('/upload-resume', { method: 'POST', body: form })
}

export const startInterview = async ({ name, email, resumeText }) => {
  return fetchJson('/start-interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, resumeText })
  })
}

export const submitAnswerApi = async ({ sessionId, questionId, answer, timeUsed, selectedIndex }) => {
  const payload = { sessionId, questionId, answer, timeUsed, selectedIndex }
  console.log('API payload:', payload)
  return fetchJson('/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export const finishInterview = async ({ sessionId }) => {
  return fetchJson('/finish-interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  })
}

export const generateOptions = async ({ text }) => {
  return fetchJson('/generate-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
}

export const listCandidates = async () => {
  return fetchJson('/candidates')
}

export const getCandidate = async (id) => {
  return fetchJson(`/candidate/${id}`)
}



