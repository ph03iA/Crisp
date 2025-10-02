import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setShowWelcomeBack, setActiveTab } from '../../features/uiSlice'
import { resumeSession, discardUnfinishedSessions } from '../../features/sessionsSlice'

const WelcomeBackModal = () => {
  const dispatch = useDispatch()
  const { sessions } = useSelector(state => state.sessions)

  const unfinishedSessions = Object.values(sessions).filter(
    session => session.status === 'in-progress' && session.currentQuestionIndex < session.questions.length
  )

  const handleResumeSession = (sessionId) => {
    dispatch(resumeSession(sessionId))
    dispatch(setActiveTab('interviewee'))
    dispatch(setShowWelcomeBack(false))
  }

  const handleStartNew = () => {
    dispatch(discardUnfinishedSessions())
    dispatch(setActiveTab('interviewee'))
    dispatch(setShowWelcomeBack(false))
  }

  const handleGoHome = () => {
    dispatch(setActiveTab('home'))
    dispatch(setShowWelcomeBack(false))
  }

  const handleClose = () => {
    dispatch(setShowWelcomeBack(false))
  }

  if (unfinishedSessions.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Welcome Back!
            </h3>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-muted-foreground mb-4">
            You have unfinished interview sessions. Would you like to resume or start fresh?
          </p>

          <div className="space-y-3 mb-6">
            {unfinishedSessions.map(session => (
              <div
                key={session.id}
                className="border border-border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleResumeSession(session.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {session.name || 'Interview Session'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Question {session.currentQuestionIndex + 1} of {session.questions.length}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={() => handleResumeSession(unfinishedSessions[0].id)}
                className="flex-1 btn-primary"
              >
                Resume Latest
              </button>
              <button
                onClick={handleStartNew}
                className="flex-1 btn-secondary"
              >
                Start New
              </button>
            </div>
            <button
              onClick={handleGoHome}
              className="w-full text-sm text-muted-foreground hover:text-foreground underline"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeBackModal
