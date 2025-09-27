# AI Interview Assistant

A comprehensive React-based interview simulation platform that provides AI-powered feedback and candidate assessment.

## 🚀 Features

### For Interviewees
- **Resume Upload**: Support for PDF and DOCX files with automatic parsing
- **Smart Form Filling**: Auto-extracts name, email, and phone number from resumes
- **Structured Interview**: 6 questions with varying difficulty levels (2 Easy, 2 Medium, 2 Hard)
- **Timer System**: Time limits for each question (Easy: 20s, Medium: 60s, Hard: 120s)
- **Auto-submit**: Automatic submission when time runs out
- **Real-time Feedback**: Instant scoring and performance analysis

### For Interviewers
- **Dashboard**: Comprehensive view of all candidates and their performance
- **Advanced Filtering**: Search and sort candidates by name, score, or date
- **Detailed Analysis**: Question-by-question breakdown with scoring metrics
- **Performance Insights**: Automated summaries highlighting strengths and areas for improvement

### Technical Features
- **Persistent State**: Uses IndexedDB for local storage and session persistence
- **Cross-tab Sync**: BroadcastChannel API for real-time synchronization between tabs
- **Resume Session**: Welcome back modal for continuing interrupted interviews
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Clean, professional interface with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18 with JavaScript (no TypeScript)
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Storage**: IndexedDB via LocalForage
- **Resume Processing**: PDF.js for PDF parsing, Mammoth for DOCX
- **Cross-tab Communication**: BroadcastChannel API

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/ph03iA/Crisp.git
cd Crisp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

### Taking an Interview
1. Navigate to the **Interviewee** tab
2. Upload your resume (PDF or DOCX)
3. Complete any missing information if prompted
4. Answer all 6 questions within the time limits
5. Review your final score and feedback

### Reviewing Candidates
1. Switch to the **Interviewer** tab
2. Browse all completed interviews
3. Use search and filters to find specific candidates
4. Click "View Details" to see comprehensive analysis

## 📊 Scoring System

The application uses a rule-based scoring algorithm that evaluates:

- **Answer Length**: Word count and comprehensiveness
- **Keyword Matching**: Relevance to the question topic
- **Time Efficiency**: How well candidates manage time constraints
- **Overall Performance**: Aggregate scoring across all questions

Each question is scored out of 10 points, with a maximum total of 60 points.

## 🔧 Project Structure

```
src/
├── api/                    # Question bank and scoring logic
├── app/                    # Redux store configuration
├── components/             # React components
│   ├── IntervieweeChat/   # Interview taking interface
│   ├── InterviewerDashboard/ # Results dashboard
│   ├── ResumeUploader/    # File upload and parsing
│   └── Shared/            # Common components
├── features/              # Redux slices
├── types/                 # JSDoc type definitions
└── utils/                 # Utility functions
```

## 🌟 Key Features Implementation

### Resume Parsing
- PDF text extraction using PDF.js
- DOCX parsing with Mammoth.js
- Regex-based field extraction for name, email, phone
- Fallback manual entry for missing fields

### Interview Flow
- Dynamic question generation from predefined pools
- Real-time timer with visual progress indicators
- Automatic progression and submission handling
- Session persistence across page refreshes

### Scoring Algorithm
- Multi-factor evaluation (length, keywords, timing)
- Difficulty-adjusted scoring
- Automated performance summaries
- Strength and weakness identification

## 🚀 Deployment

Build the application for production:

```bash
npm run build
```

The build files will be generated in the `build/` directory, ready for deployment to any static hosting service.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ph03iA/Crisp/issues).

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for better interview experiences
