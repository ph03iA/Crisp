import React from 'react'
import dayjs from 'dayjs'

const CandidateDetail = ({ session }) => {
  const score = session.finalScore || 0
  const percentage = score // AI scores are already percentages

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400 bg-green-500/10 border-green-500/20'
    if (percentage >= 60) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    return 'text-red-400 bg-red-500/10 border-red-500/20'
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'Hard':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {session.name || 'Unknown Candidate'}
            </h1>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>📧 {session.email || 'Not provided'}</p>
              <p>📱 {session.phone || 'Not provided'}</p>
              <p>📄 {session.resumeFileName || 'No resume uploaded'}</p>
              <p>📅 {dayjs(session.startedAt).format('MMMM D, YYYY [at] h:mm A')}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 ${getScoreColor(percentage)}`}>
              <div>
                <div className="text-2xl font-bold">
                  {score}/100
                </div>
                <div className="text-sm">
                  AI Score
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {session.summary && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            AI Performance Analysis
          </h2>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-muted-foreground leading-relaxed">
              {session.summary}
            </p>
          </div>
          
          {session.strengths && session.strengths.length > 0 && (
            <div className="bg-green-500/10 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 text-green-400">Strengths</h3>
              <ul className="text-green-300">
                {session.strengths.map((strength, index) => (
                  <li key={index} className="mb-1">• {strength}</li>
                ))}
              </ul>
            </div>
          )}

          {session.areasForImprovement && session.areasForImprovement.length > 0 && (
            <div className="bg-yellow-500/10 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2 text-yellow-400">Areas for Improvement</h3>
              <ul className="text-yellow-300">
                {session.areasForImprovement.map((area, index) => (
                  <li key={index} className="mb-1">• {area}</li>
                ))}
              </ul>
            </div>
          )}

          {session.recommendation && (
            <div className="bg-blue-500/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-400">AI Recommendation</h3>
              <p className="text-blue-300 font-medium mb-2">{session.recommendation}</p>
              {session.reasoning && (
                <p className="text-blue-400 text-sm">{session.reasoning}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Questions and Answers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Interview Details
        </h2>
        
        {session.questions.map((question, index) => {
          const answer = session.answers.find(a => a.questionId === question.id)
          const questionScore = answer?.score || 0
          const questionPercentage = questionScore
          const answerText = (answer?.text ?? answer?.answer ?? '').trim()
          const timeUsedVal = answer?.timeUsed ?? answer?.timeTakenSec ?? 0
          
          return (
            <div key={question.id} className="card">
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary/20 text-primary rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {question.timeLimit}s limit
                      </span>
                    </div>
                  </div>
                  
                </div>

                {/* Question */}
                <div className="mb-4">
                  <h3 className="font-medium text-foreground mb-2">Question:</h3>
                  <p className="text-muted-foreground">{question.text}</p>
                </div>

                {/* Answer */}
                <div className="mb-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-foreground">Answer:</h3>
                  </div>
                  
                  {answer ? (
                    <div className="space-y-3">
                      {/* Selected Answer */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Selected:</span>
                          {typeof answer.isCorrect === 'boolean' && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              answer.isCorrect 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {Array.isArray(question.options) && typeof answer.selectedIndex === 'number' 
                            ? question.options[answer.selectedIndex] || 'No option selected'
                            : answerText || 'No answer provided'
                          }
                        </p>
                      </div>

                      {/* Correct Answer (for MCQ) */}
                      {Array.isArray(question.options) && typeof question.correctIndex === 'number' && (
                        <div className="bg-green-500/10 p-4 rounded-lg">
                          <span className="text-sm font-medium text-green-400">Correct Answer:</span>
                          <p className="text-green-300 mt-1">
                            {question.options[question.correctIndex]}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-500/10 p-4 rounded-lg">
                      <p className="text-red-400 italic">Question not answered</p>
                    </div>
                  )}
                </div>

                {/* AI Feedback */}
                {answer && answer.feedback && (
                  <div className="bg-blue-500/10 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-400 mb-2">AI Feedback:</h4>
                    <p className="text-blue-300">{answer.feedback}</p>
                  </div>
                )}

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CandidateDetail

