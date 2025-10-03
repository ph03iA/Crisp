import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ResumeUploader from '../ResumeUploader/index'
import ChatLayout from './ChatLayout'
import { discardSession, discardUnfinishedSessions } from '../../features/sessionsSlice'
import { persistor } from '../../app/store'

const IntervieweeTab = () => {
  const dispatch = useDispatch()
  const { currentSessionId, sessions } = useSelector(state => state.sessions)
  const currentSession = currentSessionId ? sessions[currentSessionId] : null
  const [stage, setStage] = useState(() => (currentSession ? 'interview' : 'upload')) // 'upload', 'interview'

  

  useEffect(() => {
    if (currentSession) {
      if (currentSession.status === 'finished') {
        // Show results instead of immediately discarding
        setStage('interview')
        return
      }
      
      // Go directly to interview for any active session
      setStage('interview')
    } else {
      setStage('upload')
    }
  }, [currentSession])

  const handleUploadSuccess = (sessionId, missing) => {
    // Go directly to interview regardless of missing fields
    setStage('interview')
  }


  const handleStartNewInterview = () => {
    // Clean up current session and start fresh
    if (currentSessionId) {
      dispatch(discardSession(currentSessionId))
    }
    setStage('upload')
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Start Fresh button moved to Interview header */}
      {stage === 'upload' && (
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-2xl">
            <ResumeUploader onSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}


      {stage === 'interview' && currentSession && (
        <ChatLayout session={currentSession} onStartNewInterview={handleStartNewInterview} />
      )}
    </div>
  )
}

export default IntervieweeTab
