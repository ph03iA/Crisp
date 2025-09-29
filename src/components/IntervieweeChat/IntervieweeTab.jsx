import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ResumeUploader from '../ResumeUploader/index'
import ChatLayout from './ChatLayout'
import InfoCollector from './InfoCollector'
import { updateSessionInfo } from '../../features/sessionsSlice'

const IntervieweeTab = () => {
  const dispatch = useDispatch()
  const { currentSessionId, sessions } = useSelector(state => state.sessions)
  const [stage, setStage] = useState('upload') // 'upload', 'info', 'interview'
  const [missingFields, setMissingFields] = useState([])

  const currentSession = currentSessionId ? sessions[currentSessionId] : null

  useEffect(() => {
    if (currentSession) {
      if (missingFields.length > 0 || !currentSession.name || !currentSession.email || !currentSession.phone) {
        setStage('info')
      } else {
        setStage('interview')
      }
    } else {
      setStage('upload')
    }
  }, [currentSession, missingFields])

  const handleUploadSuccess = (sessionId, missing) => {
    setMissingFields(missing)
    if (missing.length === 0) {
      setStage('interview')
    } else {
      setStage('info')
    }
  }

  const handleInfoComplete = (info) => {
    if (currentSessionId) {
      dispatch(updateSessionInfo({
        sessionId: currentSessionId,
        ...info
      }))
    }
    setStage('interview')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {stage === 'upload' && (
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-2xl">
            <ResumeUploader onSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}

      {stage === 'info' && (
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md">
            <InfoCollector 
              missingFields={missingFields}
              currentInfo={currentSession ? {
                name: currentSession.name,
                email: currentSession.email,
                phone: currentSession.phone
              } : {}}
              onComplete={handleInfoComplete}
            />
          </div>
        </div>
      )}

      {stage === 'interview' && currentSession && (
        <ChatLayout session={currentSession} />
      )}
    </div>
  )
}

export default IntervieweeTab
