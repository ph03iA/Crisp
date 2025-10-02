// Shared in-memory database for all Vercel serverless functions
// Note: This is temporary storage and will reset on each deployment
// For production, you should use a persistent database like MongoDB, PostgreSQL, etc.

let db = {
  sessions: {},
  candidates: []
}

export const getDb = () => db

export const setDb = (newDb) => {
  db = newDb
}

export const addSession = (sessionId, session) => {
  db.sessions[sessionId] = session
}

export const getSession = (sessionId) => {
  return db.sessions[sessionId]
}

export const updateSession = (sessionId, updates) => {
  if (db.sessions[sessionId]) {
    db.sessions[sessionId] = { ...db.sessions[sessionId], ...updates }
  }
}

export const addCandidate = (candidate) => {
  db.candidates.push(candidate)
}

export const getCandidates = () => {
  return db.candidates
}

export const getCandidate = (id) => {
  return db.candidates.find(c => c.id === id)
}
