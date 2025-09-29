import { GoogleGenerativeAI } from "@google/generative-ai"
import { getApiKey } from '../config/api'

// Initialize Google AI
const genAI = new GoogleGenerativeAI(getApiKey())

// AI-powered scoring system for interview answers
export const scoreAnswer = async (question, answer, timeUsed, timeLimit) => {
  try {
    // Use real AI for scoring
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `
You are an expert technical interviewer evaluating a candidate's answer. Please provide a comprehensive assessment.

Question: "${question.text}"
Difficulty: ${question.difficulty}
Time Limit: ${question.timeLimit} seconds
Time Used: ${timeUsed} seconds

Candidate's Answer: "${answer}"

Please evaluate and provide:
1. A score from 0-100 based on:
   - Technical accuracy and depth
   - Relevance to the question
   - Clarity and structure
   - Use of appropriate terminology
   - Time management (efficiency)

2. Specific feedback highlighting:
   - What the candidate did well
   - Areas for improvement
   - Technical suggestions

3. Key technical terms or concepts mentioned

Format your response as JSON:
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>",
  "keywords": ["<term1>", "<term2>", ...],
  "strengths": ["<strength1>", "<strength2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...]
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse AI response
    const aiResponse = JSON.parse(text)
    
    return {
      score: Math.round(aiResponse.score),
      feedback: aiResponse.feedback,
      keywords: aiResponse.keywords || [],
      strengths: aiResponse.strengths || [],
      improvements: aiResponse.improvements || []
    }
    
  } catch (error) {
    console.error('AI scoring error:', error)
    // Fallback to rule-based scoring
    return await fallbackScoring(question, answer, timeUsed, timeLimit)
  }
}

// Fallback scoring system
const fallbackScoring = async (question, answer, timeUsed, timeLimit) => {
  const baseScore = calculateBaseScore(question, answer)
  const timeBonus = calculateTimeBonus(timeUsed, timeLimit)
  const keywordScore = calculateKeywordScore(question, answer)
  
  const totalScore = Math.min(100, Math.max(0, baseScore + timeBonus + keywordScore))
  
  return {
    score: Math.round(totalScore),
    feedback: generateFeedback(question, answer, totalScore),
    keywords: extractKeywords(answer),
    strengths: [],
    improvements: []
  }
}

const calculateBaseScore = (question, answer) => {
  const answerLength = answer.trim().length
  const questionDifficulty = question.difficulty
  
  let baseScore = 0
  
  // Length scoring (0-40 points)
  if (answerLength < 50) {
    baseScore += 10
  } else if (answerLength < 100) {
    baseScore += 20
  } else if (answerLength < 200) {
    baseScore += 30
  } else {
    baseScore += 40
  }
  
  // Difficulty-based scoring (0-30 points)
  const difficultyMultiplier = {
    'Easy': 1.0,
    'Medium': 1.2,
    'Hard': 1.5
  }
  
  baseScore *= difficultyMultiplier[questionDifficulty] || 1.0
  
  return Math.min(70, baseScore)
}

const calculateTimeBonus = (timeUsed, timeLimit) => {
  const timeRatio = timeUsed / timeLimit
  
  if (timeRatio <= 0.3) {
    return 20 // Excellent time management
  } else if (timeRatio <= 0.6) {
    return 15 // Good time management
  } else if (timeRatio <= 0.8) {
    return 10 // Adequate time management
  } else if (timeRatio <= 1.0) {
    return 5 // Just in time
  } else {
    return -10 // Over time limit
  }
}

const calculateKeywordScore = (question, answer) => {
  const expectedKeywords = question.keywords || []
  const answerText = answer.toLowerCase()
  
  let keywordScore = 0
  const matchedKeywords = []
  
  expectedKeywords.forEach(keyword => {
    if (answerText.includes(keyword.toLowerCase())) {
      keywordScore += 5
      matchedKeywords.push(keyword)
    }
  })
  
  return Math.min(30, keywordScore)
}

const generateFeedback = (question, answer, totalScore) => {
  const scoreRanges = {
    excellent: { min: 85, feedback: "Excellent answer! You demonstrated strong understanding and provided comprehensive details." },
    good: { min: 70, feedback: "Good answer! You covered the main points well with room for more detail." },
    fair: { min: 50, feedback: "Fair answer. Consider providing more specific examples and technical details." },
    poor: { min: 0, feedback: "The answer needs improvement. Try to be more specific and provide concrete examples." }
  }
  
  let feedback = ""
  for (const [level, range] of Object.entries(scoreRanges)) {
    if (totalScore >= range.min) {
      feedback = range.feedback
      break
    }
  }
  
  // Add specific suggestions based on question difficulty
  if (question.difficulty === 'Hard' && totalScore < 70) {
    feedback += " For complex questions like this, consider breaking down your approach step-by-step and discussing trade-offs."
  }
  
  return feedback
}

const extractKeywords = (answer) => {
  // Simple keyword extraction (in a real implementation, this would use NLP)
  const words = answer.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  // Count word frequency
  const wordCount = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  // Return top keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
}

export const generateFinalSummary = async (session) => {
  try {
    // Use real AI for final summary
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const sessionData = {
      candidateName: session.name,
      questions: session.questions.map((q, index) => ({
        question: q.text,
        difficulty: q.difficulty,
        answer: session.answers[index]?.answer || "No answer provided",
        score: session.answers[index]?.score || 0,
        feedback: session.answers[index]?.feedback || ""
      }))
    }
    
    const prompt = `
You are an expert HR manager and technical interviewer analyzing a complete interview session. Please provide a comprehensive final assessment.

Candidate: ${sessionData.candidateName}

Interview Questions and Answers:
${sessionData.questions.map((q, i) => `
Question ${i + 1} (${q.difficulty}): ${q.question}
Answer: ${q.answer}
Score: ${q.score}/100
Feedback: ${q.feedback}
`).join('\n')}

Please provide a comprehensive analysis including:
1. Overall performance assessment
2. Key strengths demonstrated
3. Areas for improvement
4. Technical competency evaluation
5. Hiring recommendation with reasoning

Format your response as JSON:
{
  "overallScore": <number 0-100>,
  "summary": "<comprehensive performance summary>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "areasForImprovement": ["<area1>", "<area2>", ...],
  "recommendation": "<hire/consider/not recommended>",
  "reasoning": "<detailed reasoning for recommendation>"
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse AI response
    const aiResponse = JSON.parse(text)
    
    return {
      overallScore: Math.round(aiResponse.overallScore),
      summary: aiResponse.summary,
      strengths: aiResponse.strengths || [],
      areasForImprovement: aiResponse.areasForImprovement || [],
      recommendation: aiResponse.recommendation,
      reasoning: aiResponse.reasoning
    }
    
  } catch (error) {
    console.error('AI summary generation error:', error)
    // Fallback to rule-based summary
    return await fallbackSummary(session)
  }
}

// Fallback summary generation
const fallbackSummary = async (session) => {
  const totalScore = session.answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
  const averageScore = totalScore / session.answers.length
  
  const strengths = identifyStrengths(session)
  const areasForImprovement = identifyImprovementAreas(session)
  
  return {
    overallScore: Math.round(averageScore),
    summary: generateSummaryText(session, averageScore, strengths, areasForImprovement),
    strengths,
    areasForImprovement,
    recommendation: generateRecommendation(averageScore),
    reasoning: `Based on an average score of ${Math.round(averageScore)}/100`
  }
}

const identifyStrengths = (session) => {
  const strengths = []
  const scores = session.questions.map(q => q.score || 0)
  
  if (scores.filter(s => s >= 80).length >= 2) {
    strengths.push("Strong technical knowledge")
  }
  
  if (scores.filter(s => s >= 70).length >= 4) {
    strengths.push("Consistent performance across questions")
  }
  
  if (session.questions.some(q => q.score >= 90)) {
    strengths.push("Excellent problem-solving skills")
  }
  
  return strengths.length > 0 ? strengths : ["Good communication skills"]
}

const identifyImprovementAreas = (session) => {
  const areas = []
  const scores = session.questions.map(q => q.score || 0)
  
  if (scores.filter(s => s < 50).length >= 2) {
    areas.push("Technical depth and detail")
  }
  
  if (scores.filter(s => s < 60).length >= 3) {
    areas.push("Time management and organization")
  }
  
  if (session.questions.some(q => (q.score || 0) < 40)) {
    areas.push("Specific examples and concrete solutions")
  }
  
  return areas.length > 0 ? areas : ["Continue building on current strengths"]
}

const generateSummaryText = (session, averageScore, strengths, areasForImprovement) => {
  const candidateName = session.name || "The candidate"
  
  let summary = `${candidateName} completed the technical interview with an overall score of ${Math.round(averageScore)}/100. `
  
  if (averageScore >= 80) {
    summary += "The performance was excellent, demonstrating strong technical knowledge and problem-solving abilities. "
  } else if (averageScore >= 70) {
    summary += "The performance was good, showing solid understanding of the concepts. "
  } else if (averageScore >= 50) {
    summary += "The performance was satisfactory, with room for improvement in technical depth. "
  } else {
    summary += "The performance needs improvement in several areas. "
  }
  
  if (strengths.length > 0) {
    summary += `Key strengths include: ${strengths.join(", ")}. `
  }
  
  if (areasForImprovement.length > 0) {
    summary += `Areas for improvement: ${areasForImprovement.join(", ")}. `
  }
  
  return summary
}

const generateRecommendation = (averageScore) => {
  if (averageScore >= 85) {
    return "Strong hire - Excellent candidate with outstanding technical skills"
  } else if (averageScore >= 70) {
    return "Hire - Good candidate with solid technical foundation"
  } else if (averageScore >= 50) {
    return "Consider - Candidate shows potential but needs development"
  } else {
    return "Not recommended - Significant gaps in technical knowledge"
  }
}
