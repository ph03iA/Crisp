// Shared in-memory database for all Vercel serverless functions
// Note: This is temporary storage and will reset on each deployment
// For production, you should use a persistent database like MongoDB, PostgreSQL, etc.

let db = {
  sessions: {},
  candidates: []
}

const getDb = () => db

const setDb = (newDb) => {
  db = newDb
}

const addSession = (sessionId, session) => {
  db.sessions[sessionId] = session
}

const getSession = (sessionId) => {
  return db.sessions[sessionId]
}

const updateSession = (sessionId, updates) => {
  if (db.sessions[sessionId]) {
    db.sessions[sessionId] = { ...db.sessions[sessionId], ...updates }
  }
}

const addCandidate = (candidate) => {
  db.candidates.push(candidate)
}

const getCandidates = () => {
  return db.candidates
}

const getCandidate = (id) => {
  return db.candidates.find(c => c.id === id)
}

module.exports = {
  getDb,
  setDb,
  addSession,
  getSession,
  updateSession,
  addCandidate,
  getCandidates,
  getCandidate
}
