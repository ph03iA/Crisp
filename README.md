# AI Interview Assistant

A modern React-based interview platform with AI-powered resume analysis and automated interview generation.

## 🚀 Features

### For Candidates
- **Resume Upload**: Upload PDF/DOCX resumes with automatic parsing
- **AI-Generated Questions**: 6 personalized questions based on your resume
- **Timed Interview**: Questions with time limits (Easy: 20s, Medium: 60s, Hard: 120s)
- **Real-time Scoring**: Instant feedback and performance analysis
- **Results Dashboard**: View your interview results and AI summary

### For Interviewers
- **Candidate Dashboard**: View all completed interviews
- **Detailed Analysis**: Question-by-question breakdown with correct answers
- **Performance Insights**: AI-generated summaries and recommendations
- **Search & Filter**: Find candidates by name, score, or date

## 🛠️ Tech Stack

- **Frontend**: React 18, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI**: Google Gemini API for question generation and scoring
- **File Processing**: PDF.js, Mammoth.js for resume parsing
- **Storage**: JSON database with file uploads

## 📦 Quick Start

1. **Clone & Install**
```bash
git clone https://github.com/ph03iA/Crisp.git
cd Crisp
npm install
```

2. **Start Backend**
```bash
cd server
npm install
npm start
```

3. **Start Frontend**
```bash
npm run dev
```

4. **Open** [http://localhost:3001](http://localhost:3001)

## 🎯 How It Works

1. **Upload Resume** → AI extracts information and generates personalized questions
2. **Take Interview** → Answer 6 questions with time limits
3. **Get Results** → AI analyzes your performance and provides feedback
4. **Review Dashboard** → Interviewers can view all candidate results

## 🔧 Environment Setup

Create `.env.development` in the root directory:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```

## 📊 Key Features

- **Smart Resume Parsing**: Extracts name, email, phone automatically
- **AI Question Generation**: Creates relevant questions based on resume content
- **Multiple Choice Questions**: 4 options per question with correct answers
- **Real-time Scoring**: Immediate feedback during interview
- **Persistent Sessions**: Resume interviews after page refresh
- **Dark Theme**: Modern UI with smooth animations

## 🚀 Deployment

```bash
npm run build
```

Deploy the `dist/` folder to any static hosting service.

---

Built with ❤️ for better interview experiences