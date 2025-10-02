// Client-side API wrapper - imports from client-side utilities
export { uploadResume } from '../utils/clientParser.js';
export { 
  health, 
  startInterview, 
  submitAnswer as submitAnswerApi, 
  finishInterview, 
  generateOptions, 
  getCandidates as listCandidates, 
  getCandidate 
} from '../utils/clientAPI.js';
