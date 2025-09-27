import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { submitAnswer, finishSession } from '../../features/sessionsSlice'
import { calculateFinalScore, generateSummary } from '../../api/scoring'
import Timer from './Timer'
import QuestionCard from './QuestionCard'
import { broadcastManager } from '../../utils/broadcast'

const ChatLayout = ({ session }) => {
  const dispatch = useDispatch()
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const textareaRef = useRef(null)
  const [startTime, setStartTime] = useState(null)

  const currentQuestion = session.questions[session.currentQuestionIndex]
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

  const handleSubmitAnswer = (autoSubmit = false) => {
    if (!currentQuestion || !startTime) return

    const timeTakenSec = Math.floor((Date.now() - startTime) / 1000)
    const answerText = currentAnswer.trim()

    const answer = {
      questionId: currentQuestion.id,
      text: answerText,
      timeTakenSec: Math.min(timeTakenSec, currentQuestion.timeLimit)
    }

    dispatch(submitAnswer({
      sessionId: session.id,
      answer
    }))

    // Broadcast update to other tabs
    broadcastManager.broadcast('SESSION_UPDATE', {
      sessionId: session.id,
      type: 'answer_submitted'
    })

    // Check if this was the last question
    if (isLastQuestion) {
      // Calculate final score and finish session
      const allAnswers = [...session.answers, answer]
      const finalScore = calculateFinalScore(allAnswers, session.questions)
      const summary = generateSummary(allAnswers, session.questions, finalScore, session.name)

      dispatch(finishSession({
        sessionId: session.id,
        finalScore,
        summary
      }))

      broadcastManager.broadcast('SESSION_UPDATE', {
        sessionId: session.id,
        type: 'session_finished'
      })
    }

    // Reset for next question
    setCurrentAnswer('')
    setIsTimerActive(false)
    setStartTime(null)
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Complete!
            </h2>
            <p className="text-gray-600">
              Thank you for completing the interview, {session.name || 'candidate'}.
            </p>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {session.finalScore || 0}/{session.questions.length * 10}
            </div>
            <div className="text-lg text-gray-600">
              Overall Score ({Math.round(((session.finalScore || 0) / (session.questions.length * 10)) * 100)}%)
            </div>
          </div>

          {session.summary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-700">{session.summary}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Your interview results are now available in the Interviewer dashboard.
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading questions...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {session.currentQuestionIndex + 1} of {session.questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {currentQuestion.difficulty} • {currentQuestion.timeLimit}s
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question and Answer Section */}
        <div className="lg:col-span-2">
          <QuestionCard
            question={currentQuestion}
            answer={currentAnswer}
            onAnswerChange={setCurrentAnswer}
            onSubmit={() => handleSubmitAnswer(false)}
            disabled={!isTimerActive}
            textareaRef={textareaRef}
          />
        </div>

        {/* Timer and Status Section */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <Timer
              timeLimit={currentQuestion.timeLimit}
              isActive={isTimerActive}
              onTimeUp={handleTimeUp}
            />

            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={!currentAnswer.trim() || !isTimerActive}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLastQuestion ? 'Finish Interview' : 'Submit & Next'}
              </button>

              <div className="text-xs text-gray-500">
                {currentAnswer.trim().split(/\s+/).length} words • {currentAnswer.length} characters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatLayout
