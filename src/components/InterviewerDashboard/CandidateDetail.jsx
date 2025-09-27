import React from 'react'
import dayjs from 'dayjs'
import { scoreAnswer } from '../../api/scoring'

const CandidateDetail = ({ session }) => {
  const maxScore = session.questions.length * 10
  const score = session.finalScore || 0
  const percentage = Math.round((score / maxScore) * 100)

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {session.name || 'Unknown Candidate'}
            </h1>
            <div className="space-y-1 text-sm text-gray-600">
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
                  {score}/{maxScore}
                </div>
                <div className="text-sm">
                  {percentage}% Overall
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {session.summary && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Performance Summary
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              {session.summary}
            </p>
          </div>
        </div>
      )}

      {/* Questions and Answers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Interview Details
        </h2>
        
        {session.questions.map((question, index) => {
          const answer = session.answers.find(a => a.questionId === question.id)
          const questionScore = answer ? scoreAnswer(answer, question) : 0
          const questionPercentage = (questionScore / 10) * 100
          
          return (
            <div key={question.id} className="card">
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.timeLimit}s limit
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      questionPercentage >= 70 ? 'text-green-600' : 
                      questionPercentage >= 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {questionScore}/10
                    </div>
                    <div className="text-sm text-gray-500">
                      {questionPercentage}%
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Question:</h3>
                  <p className="text-gray-700">{question.text}</p>
                </div>

                {/* Answer */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Answer:</h3>
                    {answer && (
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Time: {formatTime(answer.timeTakenSec)}</span>
                        <span>Words: {answer.text.trim().split(/\s+/).filter(w => w).length}</span>
                      </div>
                    )}
                  </div>
                  
                  {answer ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {answer.text || 'No answer provided'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-red-600 italic">Question not answered</p>
                    </div>
                  )}
                </div>

                {/* Answer Analysis */}
                {answer && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Analysis:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Length:</span>
                        <span className="text-blue-600 ml-1">
                          {answer.text.trim().split(/\s+/).filter(w => w).length} words
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Time Efficiency:</span>
                        <span className="text-blue-600 ml-1">
                          {((answer.timeTakenSec / question.timeLimit) * 100).toFixed(0)}% used
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Keywords:</span>
                        <span className="text-blue-600 ml-1">
                          {question.keywords?.filter(keyword => 
                            answer.text.toLowerCase().includes(keyword.toLowerCase())
                          ).length || 0}/{question.keywords?.length || 0}
                        </span>
                      </div>
                    </div>
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
