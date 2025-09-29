import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { submitAnswer, finishSession } from '../../features/sessionsSlice'
import { scoreAnswer, generateFinalSummary } from '../../api/aiScoring'
import Timer from './Timer'
import QuestionCard from './QuestionCard'
import { broadcastManager } from '../../utils/broadcast'

const ChatLayout = ({ session }) => {
  const dispatch = useDispatch()
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isAIScoring, setIsAIScoring] = useState(false)
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

  const handleSubmitAnswer = async (autoSubmit = false) => {
    if (!currentQuestion || !startTime) return

    const timeUsed = Math.floor((Date.now() - startTime) / 1000)
    const answerText = currentAnswer.trim()

    try {
      setIsAIScoring(true)
      // Get AI score for the answer
      const scoringResult = await scoreAnswer(
        currentQuestion,
        answerText,
        timeUsed,
        currentQuestion.timeLimit
      )

      dispatch(submitAnswer({
        sessionId: session.id,
        answer: answerText,
        timeUsed,
        score: scoringResult.score,
        feedback: scoringResult.feedback,
        keywords: scoringResult.keywords,
        strengths: scoringResult.strengths,
        improvements: scoringResult.improvements
      }))

      // Broadcast update to other tabs
      broadcastManager.broadcast('SESSION_UPDATE', {
        sessionId: session.id,
        type: 'answer_submitted'
      })

      // Check if this was the last question
      if (isLastQuestion) {
        // Generate final AI summary
        const updatedSession = {
          ...session,
          answers: [...session.answers, {
            questionId: currentQuestion.id,
            answer: answerText,
            timeUsed,
            score: scoringResult.score,
            feedback: scoringResult.feedback,
            keywords: scoringResult.keywords
          }]
        }
        
        const finalSummary = await generateFinalSummary(updatedSession)

        dispatch(finishSession({
          sessionId: session.id,
          finalScore: finalSummary.overallScore,
          summary: finalSummary.summary,
          strengths: finalSummary.strengths,
          areasForImprovement: finalSummary.areasForImprovement,
          recommendation: finalSummary.recommendation,
          reasoning: finalSummary.reasoning
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
              {session.finalScore || 0}/100
            </div>
            <div className="text-lg text-gray-600">
              Overall Score ({session.finalScore || 0}%)
            </div>
          </div>

          {session.summary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">AI Summary</h3>
              <p className="text-gray-700">{session.summary}</p>
            </div>
          )}

          {session.strengths && session.strengths.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 text-green-800">Strengths</h3>
              <ul className="text-green-700">
                {session.strengths.map((strength, index) => (
                  <li key={index} className="mb-1">• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {session.areasForImprovement && session.areasForImprovement.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 text-yellow-800">Areas for Improvement</h3>
              <ul className="text-yellow-700">
                {session.areasForImprovement.map((area, index) => (
                  <li key={index} className="mb-1">• {area}</li>
                ))}
              </ul>
            </div>
          )}

          {session.recommendation && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2 text-blue-800">AI Recommendation</h3>
              <p className="text-blue-700 font-medium mb-2">{session.recommendation}</p>
              {session.reasoning && (
                <p className="text-blue-600 text-sm">{session.reasoning}</p>
              )}
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
      <div className="mb-6 bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">
            Question {session.currentQuestionIndex + 1} of {session.questions.length}
          </span>
          <span className="text-sm text-white/70">
            {currentQuestion.difficulty} • {currentQuestion.timeLimit}s
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
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
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl">
            <QuestionCard
              question={currentQuestion}
              answer={currentAnswer}
              onAnswerChange={setCurrentAnswer}
              onSubmit={() => handleSubmitAnswer(false)}
              disabled={!isTimerActive}
              textareaRef={textareaRef}
            />
          </div>
        </div>

        {/* Timer and Status Section */}
        <div className="lg:col-span-1">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
            <Timer
              timeLimit={currentQuestion.timeLimit}
              isActive={isTimerActive}
              onTimeUp={handleTimeUp}
            />

            <div className="mt-6 space-y-3">
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
                  isLastQuestion ? 'Finish Interview' : 'Submit & Next'
                )}
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
