import { GoogleGenerativeAI } from '@google/generative-ai';
import { readJson, writeJson } from './clientStorage.js';

// Initialize Google AI
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI key missing. Set VITE_GOOGLE_API_KEY in environment.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Health check
export const health = () => ({ ok: true });

// Start interview: generate 6 AI questions using resume text and create a session
export const startInterview = async ({ name, email, resumeText }) => {
  const db = readJson();
  const sessionId = `s_${Date.now()}`;
  const difficulties = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard', 'Hard'];

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI key missing. Set VITE_GOOGLE_API_KEY in environment.');
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const baseContext = (resumeText || '').slice(0, 4000);
    
    const prompt = `You are an expert interviewer. Create RESUME-SPECIFIC multiple-choice questions strictly about FRONTEND or BACKEND topics that the candidate has experience with.
Use this resume context to ground every question (do not ask generic definitions; reference frameworks, libraries, tools, databases, cloud, patterns or accomplishments from the resume):\n${baseContext}
Return ONLY a JSON array of 6 items (no prose). Each item must be:
{"text":"...","difficulty":"Easy|Medium|Hard","keywords":["resume terms"],"domain":"frontend"|"backend","options":["...","...","...","..."],"correctIndex":0|1|2|3}
STRICT RULES:
- Exactly 6 items, exactly 4 concise options per item.
- Exactly 2 Easy, 2 Medium, 2 Hard.
- Question text <= 150 chars; options <= 80 chars.
- Each question must be directly related to technologies or work described in the resume and labeled domain as "frontend" or "backend".
- Options must be plausible; exactly one best answer (correctIndex).`;

    const raw = await model.generateContent(prompt).then(r => r.response.text());
    
    const extractJsonArray = (s) => {
      if (!s) return null;
      const clean = s.replace(/```[\s\S]*?```/g, (m) => m.replace(/```(json)?/g, '').replace(/```/g, ''));
      const start = clean.indexOf('[');
      const end = clean.lastIndexOf(']');
      if (start === -1 || end === -1 || end <= start) return null;
      return clean.slice(start, end + 1);
    };

    const jsonChunk = extractJsonArray(raw) || raw;
    const parsed = JSON.parse(jsonChunk);
    if (!Array.isArray(parsed) || parsed.length < 6) throw new Error('Invalid AI questions');

    const normalizeOptions = (q) => {
      if (Array.isArray(q.options)) return q.options.filter(Boolean).map(String);
      if (Array.isArray(q.choices)) return q.choices.filter(Boolean).map(String);
      if (Array.isArray(q.answers)) return q.answers.filter(Boolean).map(String);
      if (typeof q.options === 'string') {
        const lines = q.options.split(/\r?\n|;|\||,/).map(s => s.trim()).filter(Boolean);
        return lines;
      }
      if (typeof q.text === 'string' && /Options?:/i.test(q.text)) {
        const after = q.text.split(/Options?:/i)[1] || '';
        const lines = after.split(/\r?\n|;|\||,/).map(s => s.replace(/^\(?[A-Da-d][)\.]\s*/, '').trim()).filter(Boolean);
        return lines;
      }
      return [];
    };

    const tryGenerateOptions = async (questionText) => {
      const optPrompt = `Provide exactly 4 concise, mutually exclusive multiple-choice options for this question. Return ONLY JSON array of 4 strings, no prose. Question: ${questionText}`;
      const txt = await model.generateContent(optPrompt).then(r => r.response.text());
      const start = txt.indexOf('[');
      const end = txt.lastIndexOf(']');
      if (start === -1 || end === -1) return [];
      try { 
        const arr = JSON.parse(txt.slice(start, end + 1)); 
        return Array.isArray(arr) ? arr.slice(0, 4).map(String) : [];
      } catch { 
        return [];
      }
    };

    const mapped = [];
    for (let i = 0; i < 6; i++) {
      const q = parsed[i];
      let options = normalizeOptions(q).slice(0, 4);
      if (options.length < 4) {
        const regenerated = await tryGenerateOptions(q.text);
        if (regenerated.length === 4) options = regenerated;
      }
      mapped.push({
        id: `${i + 1}`,
        text: q.text,
        difficulty: q.difficulty,
        timeLimit: q.difficulty === 'Easy' ? 20 : q.difficulty === 'Medium' ? 60 : 120,
        keywords: Array.isArray(q.keywords) ? q.keywords : [],
        options,
        correctIndex: (typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3) ? q.correctIndex : undefined
      });
    }

    // Validate options
    if (mapped.some(q => !Array.isArray(q.options) || q.options.length !== 4)) throw new Error('AI did not return 4 options');

    const byDiff = {
      Easy: mapped.filter(q => q.difficulty === 'Easy').slice(0, 2),
      Medium: mapped.filter(q => q.difficulty === 'Medium').slice(0, 2),
      Hard: mapped.filter(q => q.difficulty === 'Hard').slice(0, 2)
    };
    if (byDiff.Easy.length < 2 || byDiff.Medium.length < 2 || byDiff.Hard.length < 2) throw new Error('AI did not produce required difficulties');
    const questions = [...byDiff.Easy, ...byDiff.Medium, ...byDiff.Hard];

    db.sessions[sessionId] = {
      id: sessionId,
      candidate: { name: name || '', email: email || '' },
      questions,
      answers: []
    };
    writeJson(db);
    return { sessionId, questions, aiUsed: true };
  } catch (e) {
    console.error('AI question generation failed:', e?.message || e);
    throw new Error('Failed to generate AI questions');
  }
};

// Submit answer for a question
export const submitAnswer = ({ sessionId, questionId, answer, timeUsed, selectedIndex }) => {
  console.log('Submit answer received:', { sessionId, questionId, answer, timeUsed, selectedIndex });
  if (!sessionId || !questionId) throw new Error('Missing sessionId or questionId');
  
  const db = readJson();
  const session = db.sessions[sessionId];
  if (!session) throw new Error('Session not found');
  
  const question = session.questions.find(q => q.id === String(questionId));
  if (!question) throw new Error('Question not found');
  
  console.log('Question details:', {
    questionId: question.id,
    options: question.options,
    correctIndex: question.correctIndex,
    selectedIndex,
    hasOptions: Array.isArray(question.options),
    correctIndexType: typeof question.correctIndex,
    selectedIndexType: typeof selectedIndex
  });

  session.answers = session.answers.filter(a => a.questionId !== String(questionId));
  let isCorrect;
  if (Array.isArray(question.options) && typeof question.correctIndex === 'number' && typeof selectedIndex === 'number') {
    isCorrect = Number(selectedIndex) === Number(question.correctIndex);
    console.log('Correctness calculation:', {
      selectedIndex: Number(selectedIndex),
      correctIndex: Number(question.correctIndex),
      isCorrect,
      comparison: `${Number(selectedIndex)} === ${Number(question.correctIndex)}`
    });
  } else {
    console.log('Cannot calculate correctness:', {
      hasOptions: Array.isArray(question.options),
      correctIndexType: typeof question.correctIndex,
      selectedIndexType: typeof selectedIndex,
      correctIndex: question.correctIndex,
      selectedIndex
    });
  }

  const answerData = {
    questionId: String(questionId),
    answer: answer || '',
    selectedIndex: typeof selectedIndex === 'number' ? Number(selectedIndex) : undefined,
    isCorrect: typeof isCorrect === 'boolean' ? isCorrect : undefined,
    timeUsed: Number(timeUsed) || 0
  };

  console.log('Storing answer data:', answerData);
  console.log('isCorrect type:', typeof isCorrect, 'value:', isCorrect);
  session.answers.push(answerData);
  writeJson(db);
  return { ok: true };
};

// Finish interview: Gemini-based summary if key present, else rule-based
export const finishInterview = async ({ sessionId }) => {
  const db = readJson();
  const session = db.sessions[sessionId];
  if (!session) throw new Error('Session not found');

  const ruleBasedScore = () => {
    // If MCQ correctness is available, use it; otherwise fall back to length-based heuristic
    const haveMcq = session.questions.some(q => typeof q.correctIndex === 'number');
    console.log('Scoring calculation:', {
      haveMcq,
      questions: session.questions.map(q => ({ id: q.id, correctIndex: q.correctIndex })),
      answers: session.answers.map(a => ({ questionId: a.questionId, isCorrect: a.isCorrect, selectedIndex: a.selectedIndex }))
    });
    
    if (haveMcq) {
      let correct = 0;
      let total = 0;
      session.questions.forEach(q => {
        const a = session.answers.find(ans => ans.questionId === q.id);
        if (typeof q.correctIndex === 'number') {
          total += 1;
          console.log(`Question ${q.id}: correctIndex=${q.correctIndex}, answer.isCorrect=${a?.isCorrect}, selectedIndex=${a?.selectedIndex}`);
          if (a && a.isCorrect === true) correct += 1;
        }
      });
      console.log(`MCQ scoring: ${correct}/${total} = ${Math.round((correct / total) * 100)}%`);
      if (total > 0) {
        return Math.round((correct / total) * 100);
      }
    }
    // Fallback: heuristic based on text length and difficulty
    let totalScore = 0;
    session.questions.forEach(q => {
      const ans = session.answers.find(a => a.questionId === q.id)?.answer || '';
      const len = ans.trim().length;
      const base = len > 200 ? 80 : len > 100 ? 65 : len > 30 ? 50 : 30;
      const diffBonus = q.difficulty === 'Hard' ? 15 : q.difficulty === 'Medium' ? 8 : 0;
      totalScore += Math.min(100, base + diffBonus);
    });
    return Math.round(totalScore / session.questions.length);
  };

  const respond = (overall, summary) => {
    const candidateId = `c_${Date.now()}`;
    const candidate = {
      id: candidateId,
      name: session.candidate.name || 'Unknown',
      email: session.candidate.email || '',
      score: overall,
      summary,
      sessionId
    };
    db.candidates.push(candidate);
    delete db.sessions[sessionId]; // Clean up session after finishing
    writeJson(db);
    return { candidate };
  };

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    const overall = ruleBasedScore();
    const summary = overall >= 80 ? 'Excellent performance.' : overall >= 60 ? 'Good performance.' : 'Needs improvement.';
    return respond(overall, summary);
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const lines = session.questions.map((q, i) => {
      const ans = session.answers.find(a => a.questionId === q.id)?.answer || 'No answer';
      return `Q${i + 1} (${q.difficulty}): ${q.text}\nA: ${ans}`;
    }).join('\n\n');
    const prompt = `You are an interviewer. Score 0-100 and summarize succinctly.\n${lines}\nReturn JSON {overallScore:number, summary:string}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const json = JSON.parse(text);
      const overall = Math.round(json.overallScore || ruleBasedScore());
      const summary = json.summary || 'Interview summary unavailable.';
      return respond(overall, summary);
    } catch {
      const overall = ruleBasedScore();
      const summary = overall >= 80 ? 'Excellent performance.' : overall >= 60 ? 'Good performance.' : 'Needs improvement.';
      return respond(overall, summary);
    }
  } catch (e) {
    const overall = ruleBasedScore();
    const summary = overall >= 80 ? 'Excellent performance.' : overall >= 60 ? 'Good performance.' : 'Needs improvement.';
    return respond(overall, summary);
  }
};

// Generate 4 MCQ options for a given question text
export const generateOptions = async ({ text }) => {
  if (!text) throw new Error('Missing text');
  
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) throw new Error('AI key missing');
  
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Provide exactly 4 concise, mutually exclusive multiple-choice options for this question. Return ONLY JSON array of 4 strings, no prose. Question: ${text}`;
    const raw = await model.generateContent(prompt).then(r => r.response.text());
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('Failed to parse options');
    let arr;
    try { 
      arr = JSON.parse(raw.slice(start, end + 1));
    } catch { 
      throw new Error('Invalid options JSON');
    }
    if (!Array.isArray(arr) || arr.length < 4) throw new Error('Insufficient options');
    return { options: arr.slice(0, 4).map(String) };
  } catch (e) {
    console.error('generate-options failed:', e?.message || e);
    throw new Error('Failed to generate options');
  }
};

// Dashboard endpoints
export const getCandidates = () => {
  const db = readJson();
  return { candidates: db.candidates };
};

export const getCandidate = (id) => {
  const db = readJson();
  const candidate = db.candidates.find(c => c.id === id);
  if (!candidate) throw new Error('Candidate not found');
  const session = db.sessions[candidate.sessionId];
  return { candidate, session };
};
