export const scoreAnswer = (answer, question) => {
  const { text, timeTakenSec } = answer
  const { timeLimit, keywords = [] } = question

  let score = 0

  // 1. Length-based scoring (0-4 points)
  const wordCount = text.trim().split(/\s+/).length
  let lengthScore = 0
  if (wordCount >= 50) lengthScore = 4
  else if (wordCount >= 30) lengthScore = 3
  else if (wordCount >= 15) lengthScore = 2
  else if (wordCount >= 5) lengthScore = 1

  // 2. Keyword-based scoring (0-4 points)
  const lowerText = text.toLowerCase()
  const foundKeywords = keywords.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  )
  let keywordScore = Math.min(4, foundKeywords.length)

  // 3. Time-based scoring (0-2 points)
  let timeScore = 0
  if (timeTakenSec <= timeLimit * 0.5) {
    timeScore = 2 // Answered quickly
  } else if (timeTakenSec <= timeLimit * 0.8) {
    timeScore = 1 // Answered reasonably fast
  }
  // No points if took too long or didn't finish

  score = lengthScore + keywordScore + timeScore
  return Math.min(10, score) // Cap at 10 points per question
}

export const calculateFinalScore = (answers, questions) => {
  if (answers.length === 0) return 0

  const totalScore = answers.reduce((sum, answer) => {
    const question = questions.find(q => q.id === answer.questionId)
    if (!question) return sum
    return sum + scoreAnswer(answer, question)
  }, 0)

  return Math.round(totalScore)
}

export const generateSummary = (
  answers,
  questions,
  finalScore,
  candidateName
) => {
  const name = candidateName || 'The candidate'
  const maxScore = questions.length * 10
  const percentage = Math.round((finalScore / maxScore) * 100)

  let performance = ''
  if (percentage >= 80) performance = 'excellent'
  else if (percentage >= 70) performance = 'strong'
  else if (percentage >= 60) performance = 'good'
  else if (percentage >= 50) performance = 'fair'
  else performance = 'needs improvement'

  // Analyze response patterns
  const avgWordsPerAnswer = answers.reduce((sum, answer) => 
    sum + answer.text.trim().split(/\s+/).length, 0) / answers.length

  const quickResponses = answers.filter((answer) => {
    const question = questions.find(q => q.id === answer.questionId)
    return question && answer.timeTakenSec <= question.timeLimit * 0.5
  }).length

  let strengths = []
  let improvements = []

  // Determine strengths and areas for improvement
  if (avgWordsPerAnswer >= 30) {
    strengths.push('provides detailed responses')
  } else {
    improvements.push('could provide more comprehensive answers')
  }

  if (quickResponses >= answers.length * 0.5) {
    strengths.push('responds efficiently under time pressure')
  }

  const hardQuestions = questions.filter(q => q.difficulty === 'Hard')
  const hardAnswers = answers.filter(answer => 
    hardQuestions.some(q => q.id === answer.questionId)
  )
  
  if (hardAnswers.length > 0) {
    const hardAvgScore = hardAnswers.reduce((sum, answer) => {
      const question = questions.find(q => q.id === answer.questionId)
      return question ? sum + scoreAnswer(answer, question) : sum
    }, 0) / hardAnswers.length

    if (hardAvgScore >= 7) {
      strengths.push('handles complex technical questions well')
    } else {
      improvements.push('could strengthen technical problem-solving skills')
    }
  }

  const strengthsText = strengths.length > 0 
    ? `Strengths include: ${strengths.join(', ')}.`
    : ''

  const improvementsText = improvements.length > 0
    ? ` Areas for improvement: ${improvements.join(', ')}.`
    : ''

  return `${name} achieved a ${performance} performance with ${finalScore}/${maxScore} points (${percentage}%). ${strengthsText}${improvementsText} Overall, ${name.toLowerCase()} demonstrates ${percentage >= 70 ? 'strong potential' : 'room for growth'} as a candidate.`
}
