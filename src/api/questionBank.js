import { v4 as uuidv4 } from 'uuid'

const EASY_QUESTIONS = [
  {
    text: "Tell me about yourself and why you're interested in this role.",
    difficulty: 'Easy',
    timeLimit: 20,
    keywords: ['experience', 'skills', 'interest', 'passion', 'background']
  },
  {
    text: "What are your greatest strengths and how do they relate to this position?",
    difficulty: 'Easy',
    timeLimit: 20,
    keywords: ['strengths', 'skills', 'advantage', 'good at', 'excel']
  },
  {
    text: "Describe a typical day in your current or most recent role.",
    difficulty: 'Easy',
    timeLimit: 20,
    keywords: ['daily', 'routine', 'responsibilities', 'tasks', 'workflow']
  },
  {
    text: "What motivates you to do your best work?",
    difficulty: 'Easy',
    timeLimit: 20,
    keywords: ['motivation', 'drive', 'inspiration', 'passion', 'goal']
  }
]

const MEDIUM_QUESTIONS = [
  {
    text: "Describe a challenging project you worked on. What was your approach and what did you learn?",
    difficulty: 'Medium',
    timeLimit: 60,
    keywords: ['challenge', 'project', 'approach', 'solution', 'learned', 'overcome']
  },
  {
    text: "How do you handle working under pressure or tight deadlines?",
    difficulty: 'Medium',
    timeLimit: 60,
    keywords: ['pressure', 'deadline', 'stress', 'manage', 'prioritize', 'organize']
  },
  {
    text: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
    difficulty: 'Medium',
    timeLimit: 60,
    keywords: ['difficult', 'team', 'conflict', 'resolution', 'communication', 'collaboration']
  },
  {
    text: "Describe a situation where you had to learn a new technology or skill quickly. How did you approach it?",
    difficulty: 'Medium',
    timeLimit: 60,
    keywords: ['learn', 'technology', 'skill', 'quickly', 'adapt', 'approach']
  },
  {
    text: "How do you prioritize tasks when you have multiple competing deadlines?",
    difficulty: 'Medium',
    timeLimit: 60,
    keywords: ['prioritize', 'multiple', 'deadlines', 'manage', 'organize', 'time management']
  }
]

const HARD_QUESTIONS = [
  {
    text: "Design a system that can handle 1 million concurrent users. Walk me through your architecture decisions and trade-offs.",
    difficulty: 'Hard',
    timeLimit: 120,
    keywords: ['scalability', 'architecture', 'load balancing', 'database', 'caching', 'microservices', 'distributed']
  },
  {
    text: "You're leading a project that's behind schedule and over budget. The stakeholders are unhappy. How do you turn this around?",
    difficulty: 'Hard',
    timeLimit: 120,
    keywords: ['leadership', 'project management', 'stakeholders', 'problem solving', 'communication', 'strategy']
  },
  {
    text: "Explain how you would implement a real-time collaborative editing system like Google Docs. Consider conflict resolution and data consistency.",
    difficulty: 'Hard',
    timeLimit: 120,
    keywords: ['real-time', 'collaborative', 'conflict resolution', 'consistency', 'synchronization', 'operational transform']
  },
  {
    text: "You notice that a critical system in production is performing poorly. Walk me through your debugging and optimization process.",
    difficulty: 'Hard',
    timeLimit: 120,
    keywords: ['debugging', 'performance', 'optimization', 'monitoring', 'analysis', 'bottleneck']
  },
  {
    text: "Design a recommendation system for an e-commerce platform. How would you handle cold start problems and ensure relevance?",
    difficulty: 'Hard',
    timeLimit: 120,
    keywords: ['recommendation', 'algorithm', 'machine learning', 'cold start', 'relevance', 'data']
  }
]

export const generateQuestionSet = () => {
  // Get 2 easy, 2 medium, 2 hard questions
  const selectedEasy = EASY_QUESTIONS.slice(0, 2).map(q => ({ ...q, id: uuidv4() }))
  const selectedMedium = MEDIUM_QUESTIONS.slice(0, 2).map(q => ({ ...q, id: uuidv4() }))
  const selectedHard = HARD_QUESTIONS.slice(0, 2).map(q => ({ ...q, id: uuidv4() }))

  return [...selectedEasy, ...selectedMedium, ...selectedHard]
}

export const getRandomQuestions = (count = 6) => {
  const allQuestions = [
    ...EASY_QUESTIONS,
    ...MEDIUM_QUESTIONS,
    ...HARD_QUESTIONS
  ]

  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map(q => ({ ...q, id: uuidv4() }))
}
