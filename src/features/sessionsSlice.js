import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  sessions: {},
  currentSessionId: undefined,
}

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    createSession: (state, action) => {
      const sessionId = uuidv4()
      const newSession = {
        id: sessionId,
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
        resumeFileName: action.payload.resumeFileName,
        answers: [],
        currentQuestionIndex: 0,
        status: 'in-progress',
        startedAt: new Date().toISOString(),
        questions: action.payload.questions,
      }
      state.sessions[sessionId] = newSession
      state.currentSessionId = sessionId
    },

    updateSessionInfo: (state, action) => {
      const session = state.sessions[action.payload.sessionId]
      if (session) {
        if (action.payload.name !== undefined) session.name = action.payload.name
        if (action.payload.email !== undefined) session.email = action.payload.email
        if (action.payload.phone !== undefined) session.phone = action.payload.phone
      }
    },

    submitAnswer: (state, action) => {
      const session = state.sessions[action.payload.sessionId]
      if (session) {
        const currentQuestion = session.questions[session.currentQuestionIndex]
        const answerData = {
          questionId: currentQuestion.id,
          answer: action.payload.answer,
          timeUsed: action.payload.timeUsed,
          timeLimit: currentQuestion.timeLimit,
          submittedAt: new Date().toISOString(),
          score: action.payload.score || 0,
          feedback: action.payload.feedback || '',
          keywords: action.payload.keywords || []
        }
        
        session.answers.push(answerData)
        session.currentQuestionIndex++
        
        // If all questions answered, mark as finished
        if (session.currentQuestionIndex >= session.questions.length) {
          session.status = 'finished'
          session.completedAt = new Date().toISOString()
        }
      }
    },

    pauseSession: (state, action) => {
      const session = state.sessions[action.payload]
      if (session) {
        session.status = 'paused'
      }
    },

    resumeSession: (state, action) => {
      const session = state.sessions[action.payload]
      if (session && session.status === 'paused') {
        session.status = 'in-progress'
      }
      state.currentSessionId = action.payload
    },

    finishSession: (state, action) => {
      const session = state.sessions[action.payload.sessionId]
      if (session) {
        session.status = 'finished'
        session.finalScore = action.payload.finalScore
        session.summary = action.payload.summary
      }
    },

    setCurrentSession: (state, action) => {
      state.currentSessionId = action.payload
    },
  },
})

export const {
  createSession,
  updateSessionInfo,
  submitAnswer,
  pauseSession,
  resumeSession,
  finishSession,
  setCurrentSession,
} = sessionsSlice.actions

export default sessionsSlice.reducer
