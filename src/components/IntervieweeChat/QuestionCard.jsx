import React, { useEffect } from 'react'

const QuestionCard = ({ 
  question, 
  answer, 
  onAnswerChange, 
  onSubmit, 
  disabled,
  textareaRef 
}) => {
  useEffect(() => {
    if (textareaRef?.current && !disabled) {
      textareaRef.current.focus()
    }
  }, [question.id, disabled])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (!disabled && answer.trim()) {
        onSubmit()
      }
    }
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

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className="text-sm text-gray-500">
              {question.timeLimit}s
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Question
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {question.text}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Answer
            </h3>
            {disabled && (
              <span className="text-sm text-red-600">
                Time's up!
              </span>
            )}
          </div>
          
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your answer here... (Ctrl+Enter to submit)"
            className={`w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">
              Tip: Use Ctrl+Enter to submit quickly
            </div>
            <div className="text-xs text-gray-500">
              {answer.trim().split(/\s+/).filter(word => word).length} words
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
