import React, { useEffect, useState } from 'react'
import { generateOptions } from '../../api/backend'

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

  // If no options provided, attempt to fetch 4 options from server
  const [fetchedOptions, setFetchedOptions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const hasOptions = Array.isArray(question.options) && question.options.length > 0

  useEffect(() => {
    let cancelled = false
    const maybeFetch = async () => {
      if (hasOptions) {
        setFetchedOptions([])
        return
      }
      try {
        setIsGenerating(true)
        const res = await generateOptions({ text: question.text })
        if (!cancelled && Array.isArray(res.options) && res.options.length === 4) {
          setFetchedOptions(res.options)
        }
      } catch {
        // ignore; fall back to textarea
      } finally {
        if (!cancelled) setIsGenerating(false)
      }
    }
    maybeFetch()
    return () => { cancelled = true }
  }, [question.id])

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
          <h3 className="text-xl font-bold text-white mb-2">
            Question
          </h3>
          <p className="text-white/90 leading-relaxed text-lg">
            {question.text}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              {Array.isArray(question.options) && question.options.length > 0 ? 'Choose an option' : 'Your Answer'}
            </h3>
            {disabled && (
              <span className="text-sm text-red-600">
                Time's up!
              </span>
            )}
          </div>

          {(hasOptions || fetchedOptions.length === 4) ? (
            <div className="space-y-3">
              {(hasOptions ? question.options : fetchedOptions).map((opt, idx) => (
                <label key={idx} className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${answer === opt ? 'border-primary-500 bg-white/10' : 'border-white/30 hover:bg-white/10'}`}>
                  <input
                    type="radio"
                    name={`q_${question.id}`}
                    value={opt}
                    checked={answer === opt}
                    onChange={(e) => {
                      const val = e.target.value
                      onAnswerChange(val)
                      if (!disabled) {
                        // Pass the selected value directly to onSubmit
                        onSubmit(val)
                      }
                    }}
                    disabled={disabled}
                    className="mt-1"
                  />
                  <span className="text-white text-base leading-relaxed">{opt}</span>
                </label>
              ))}
            </div>
          ) : isGenerating ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
              Generating options...
            </div>
          ) : (
            <>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                className={`w-full h-32 px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-white placeholder-white/60 bg-white/10 ${
                  disabled ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-white/70">
                  Tip: Use Ctrl+Enter to submit quickly
                </div>
                <div className="text-xs text-white/70">
                  {answer.trim().split(/\s+/).filter(word => word).length} words
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
