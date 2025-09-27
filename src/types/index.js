// Type definitions using JSDoc for better IDE support

/**
 * @typedef {Object} Answer
 * @property {string} questionId
 * @property {string} text
 * @property {number} timeTakenSec
 * @property {number} [score]
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} text
 * @property {'Easy'|'Medium'|'Hard'} difficulty
 * @property {number} timeLimit - in seconds
 * @property {string[]} [keywords]
 */

/**
 * @typedef {Object} Session
 * @property {string} id
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [resumeFileName]
 * @property {Answer[]} answers
 * @property {number} currentQuestionIndex
 * @property {string} [startedAt]
 * @property {'in-progress'|'paused'|'finished'} status
 * @property {number} [finalScore]
 * @property {string} [summary]
 * @property {Question[]} questions
 */

/**
 * @typedef {Object} RootState
 * @property {Object} sessions
 * @property {Object.<string, Session>} sessions.sessions
 * @property {string} [sessions.currentSessionId]
 * @property {Object} ui
 * @property {'interviewee'|'interviewer'} ui.activeTab
 * @property {boolean} ui.showWelcomeBack
 * @property {string} ui.searchQuery
 * @property {'name'|'score'|'startedAt'} ui.sortBy
 * @property {'asc'|'desc'} ui.sortOrder
 */

/**
 * @typedef {Object} ResumeData
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} text
 */

// Export empty object for imports
export {}
