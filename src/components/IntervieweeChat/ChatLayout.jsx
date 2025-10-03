import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { submitAnswer, finishSession, discardSession } from '../../features/sessionsSlice'
import { setActiveTab } from '../../features/uiSlice'
import { submitAnswerApi, finishInterview } from '../../api/backend'
import Timer from './Timer'
import QuestionCard from './QuestionCard'
import { broadcastManager } from '../../utils/broadcast'

const ChatLayout = ({ session, onStartNewInterview }) => {
  const dispatch = useDispatch()
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isAIScoring, setIsAIScoring] = useState(false)
  const [isCalculatingScore, setIsCalculatingScore] = useState(false)
  const textareaRef = useRef(null)
  const [startTime, setStartTime] = useState(null)

  const currentQuestion = session.questions[session.currentQuestionIndex]
  const effectiveTimeLimit = currentQuestion
    ? (typeof currentQuestion.timeLimit === 'number' && currentQuestion.timeLimit > 0
        ? currentQuestion.timeLimit
        : (currentQuestion.difficulty === 'Easy' ? 20 : currentQuestion.difficulty === 'Medium' ? 60 : 120))
    : 60
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1
  const isFinished = session.status === 'finished'

  useEffect(() => {
    if (currentQuestion && !isFinished) {
      setIsTimerActive(true)
      setStartTime(Date.now())
    }
  }, [currentQuestion, isFinished])

  useEffect(() => {
    if (isFinished) {
      setShowResults(true)
    }
  }, [isFinished])

  const handleTimeUp = () => {
    handleSubmitAnswer(true)
  }

  const handleSubmitAnswer = async (autoSubmit = false, selectedValue = null) => {
    if (!currentQuestion || !startTime) return

    // Safety check: ensure we have a server session ID
    if (!session.serverSessionId) {
      console.error('No server session ID found. Cannot submit answer.')
      return
    }

    // Stop timer immediately to avoid brief "Time's up!" flicker on manual submit
    setIsTimerActive(false)

    const timeUsed = Math.floor((Date.now() - startTime) / 1000)
    // Use selectedValue if provided (from MCQ), otherwise use currentAnswer
    const answerText = (selectedValue || currentAnswer).trim()
    const hasMcq = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
    let selectedIndex = hasMcq ? currentQuestion.options.findIndex(opt => opt === (selectedValue || currentAnswer)) : undefined
    
    // Fallback: if findIndex returns -1, try to find by text content
    if (hasMcq && selectedIndex === -1) {
      const searchText = (selectedValue || currentAnswer).trim()
      selectedIndex = currentQuestion.options.findIndex(opt => opt.trim() === searchText)
    }
    
    // If still not found, try case-insensitive comparison
    if (hasMcq && selectedIndex === -1) {
      const searchText = (selectedValue || currentAnswer).trim().toLowerCase()
      selectedIndex = currentQuestion.options.findIndex(opt => opt.trim().toLowerCase() === searchText)
    }
    
    // Final safety check: if selectedIndex is still -1, set to undefined
    if (selectedIndex === -1) {
      selectedIndex = undefined
    }
    
    // Debug logging removed for performance

    try {
      setIsAIScoring(true)
      // Submit to backend (scoring handled server-side later or fallback here)
      // Debug: sending payload (disabled in production for performance)
      /* console.log('Sending to server:', {
        sessionId: session.serverSessionId,
        questionId: currentQuestion.id,
        answer: answerText,
        timeUsed,
        selectedIndex,
        selectedIndexType: typeof selectedIndex
      }) */
      
      await submitAnswerApi({
        sessionId: session.serverSessionId, // Use server session ID
        questionId: currentQuestion.id,
        answer: answerText,
        timeUsed,
        selectedIndex
      })

      dispatch(submitAnswer({
        sessionId: session.id,
        answer: answerText,
        timeUsed,
        selectedIndex,
        isCorrect: hasMcq && typeof selectedIndex === 'number' && typeof currentQuestion.correctIndex === 'number' 
          ? selectedIndex === currentQuestion.correctIndex 
          : undefined,
        score: 0,
        feedback: '',
        keywords: [],
        strengths: [],
        improvements: []
      }))

      // Broadcast update to other tabs
      broadcastManager.broadcast('SESSION_UPDATE', {
        sessionId: session.id,
        type: 'answer_submitted'
      })

      // Check if this was the last question
      if (isLastQuestion) {
        if (!session.serverSessionId) {
          console.error('No server session ID found. Cannot finish interview.')
          return
        }
        
        // Show calculating score loading
        setIsCalculatingScore(true)
        
        try {
          const result = await finishInterview({ sessionId: session.serverSessionId })
          dispatch(finishSession({
            sessionId: session.id,
            finalScore: result.candidate.score,
            summary: result.candidate.summary
          }))

          broadcastManager.broadcast('SESSION_UPDATE', {
            sessionId: session.id,
            type: 'session_finished'
          })
        } catch (error) {
          console.error('Error finishing interview:', error)
        } finally {
          setIsCalculatingScore(false)
        }
      }

      // Reset for next question
      setCurrentAnswer('')
      setIsTimerActive(false)
      setStartTime(null)
    } catch (error) {
      console.error('Error scoring answer:', error)
      // Fallback to basic scoring
      dispatch(submitAnswer({
        sessionId: session.id,
        answer: answerText,
        timeUsed,
        score: 50, // Default score
        feedback: 'Answer submitted successfully',
        keywords: []
      }))
    } finally {
      setIsAIScoring(false)
    }
  }

  const handleNextQuestion = () => {
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setIsTimerActive(true)
      setStartTime(Date.now())
    }
  }

  useEffect(() => {
    if (currentQuestion && !isFinished && startTime && !isTimerActive) {
      handleNextQuestion()
    }
  }, [session.currentQuestionIndex])

  if (showResults && session.status === 'finished') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Interview Complete!
            </h2>
            <p className="text-muted-foreground">
              Thank you for completing the interview, {session.name || 'candidate'}.
            </p>
          </div>

          <div className="mb-6">
            {isCalculatingScore ? (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-lg text-muted-foreground">
                  Calculating your score...
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  AI is analyzing your responses
                </div>
              </div>
            ) : (
              <>
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {session.finalScore || 0}/100
                </div>
                <div className="text-lg text-muted-foreground">
                  Overall Score ({session.finalScore || 0}%)
                </div>
              </>
            )}
          </div>

          {!isCalculatingScore && session.summary && (
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2 text-foreground">Summary</h3>
              <p className="text-muted-foreground">{session.summary}</p>
            </div>
          )}

          {!isCalculatingScore && session.strengths && session.strengths.length > 0 && (
            <div className="bg-green-500/10 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 text-green-400">Strengths</h3>
              <ul className="text-green-300">
                {session.strengths.map((strength, index) => (
                  <li key={index} className="mb-1">• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {!isCalculatingScore && session.areasForImprovement && session.areasForImprovement.length > 0 && (
            <div className="bg-yellow-500/10 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 text-yellow-400">Areas for Improvement</h3>
              <ul className="text-yellow-300">
                {session.areasForImprovement.map((area, index) => (
                  <li key={index} className="mb-1">• {area}</li>
                ))}
              </ul>
            </div>
          )}

          {!isCalculatingScore && session.recommendation && (
            <div className="bg-blue-500/10 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2 text-blue-400">AI Recommendation</h3>
              <p className="text-blue-300 font-medium mb-2">{session.recommendation}</p>
              {session.reasoning && (
                <p className="text-blue-400 text-sm">{session.reasoning}</p>
              )}
            </div>
          )}

          {!isCalculatingScore && (
            <>
              <div className="text-sm text-muted-foreground">
                Your interview results are now available in the Interviewer dashboard.
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    if (onStartNewInterview) {
                      onStartNewInterview()
                    } else {
                      // Fallback to old behavior
                      dispatch(discardSession(session.id))
                      dispatch(setActiveTab('interviewee'))
                    }
                  }}
                  className="bg-amber-200 text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Start New Interview
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Question and Answer Section */}
        <div className="lg:col-span-2">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              answer={currentAnswer}
              onAnswerChange={setCurrentAnswer}
              onSubmit={(selectedValue) => handleSubmitAnswer(false, selectedValue)}
              disabled={!isTimerActive}
              textareaRef={textareaRef}
              questionNumber={session.currentQuestionIndex + 1}
            />
          </div>
        </div>

        {/* Timer and Status Section */}
        <div className="lg:col-span-1">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 text-center">
            {isTimerActive && (
              <Timer
                key={currentQuestion.id}
                timeLimit={effectiveTimeLimit}
                isActive={isTimerActive}
                onTimeUp={handleTimeUp}
              />
            )}

            <div className="mt-6 space-y-3">
              {!(Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) && (
                <button
                  onClick={() => handleSubmitAnswer(false)}
                  disabled={!currentAnswer.trim() || !isTimerActive || isAIScoring}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAIScoring ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      AI Analyzing...
                    </div>
                  ) : (
                    isLastQuestion ? 'Finish Test' : 'Submit & Next'
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  const confirmed = window.confirm('Finish interview and start fresh? Your current progress will be lost.')
                  if (!confirmed) return
                  dispatch(discardSession(session.id))
                  dispatch(setActiveTab('interviewee'))
                }}
                className="w-full btn-secondary"
              >
                Finish Test
              </button>

              <div className="text-xs text-gray-500">
                {Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
                  ? 'Select one option'
                  : `${currentAnswer.trim().split(/\s+/).filter(Boolean).length} words • ${currentAnswer.length} characters`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatLayout
