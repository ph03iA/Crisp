import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ResumeUploader from '../ResumeUploader/index'
import ChatLayout from './ChatLayout'
import { discardSession, discardUnfinishedSessions } from '../../features/sessionsSlice'
import { persistor } from '../../app/store'

const IntervieweeTab = () => {
  const dispatch = useDispatch()
  const { currentSessionId, sessions } = useSelector(state => state.sessions)
  const [stage, setStage] = useState('upload') // 'upload', 'interview'

  const currentSession = currentSessionId ? sessions[currentSessionId] : null

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
    <div className="max-w-4xl mx-auto">
      {stage !== 'upload' && (
        <div className="flex justify-end mb-2">
          <button
            onClick={async () => {
              dispatch(discardUnfinishedSessions())
              setStage('upload')
              
              // Purge persisted state after dispatch to avoid serialization warning
              try { 
                await persistor.purge() 
              } catch (error) {
                console.warn('Failed to purge persisted state:', error)
              }
            }}
            className="bg-white text-black hover:bg-white/90 shadow-lg rounded-full px-6 py-2 text-sm font-medium transition-all duration-300"
          >
            Start Fresh
          </button>
        </div>
      )}
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
