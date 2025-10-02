import React, { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSearchQuery, setSortBy, toggleSortOrder } from '../../features/uiSlice'
import CandidateRow from './CandidateRow'
import CandidateDetail from './CandidateDetail'
import { listCandidates, getCandidate } from '../../api/backend'

const InterviewerTab = () => {
  const dispatch = useDispatch()
  const { searchQuery, sortBy, sortOrder } = useSelector(state => state.ui)
  const { sessions } = useSelector(state => state.sessions)
  const [serverCandidates, setServerCandidates] = useState([])
  const [serverSession, setServerSession] = useState(null)
  const [selectedSessionId, setSelectedSessionId] = useState(null)

  const refreshServerCandidates = async () => {
    try {
      const res = await listCandidates()
      setServerCandidates(res.candidates || [])
    } catch {
      setServerCandidates([])
    }
  }

  useEffect(() => {
    refreshServerCandidates()
  }, [])

  // Refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshServerCandidates()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const filteredAndSortedSessions = useMemo(() => {
    // Merge local sessions and server candidates for listing
    const merged = [
      ...Object.values(sessions),
      ...serverCandidates.map(c => ({
        id: c.sessionId,
        name: c.name,
        email: c.email,
        finalScore: c.score,
        status: 'finished',
        startedAt: ''
      }))
    ]
    let sessionsList = merged

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      sessionsList = sessionsList.filter(session => 
        (session.name?.toLowerCase().includes(query)) ||
        (session.email?.toLowerCase().includes(query))
      )
    }

    // Sort sessions
    sessionsList.sort((a, b) => {
      let compareValue = 0
      
      switch (sortBy) {
        case 'name':
          compareValue = (a.name || '').localeCompare(b.name || '')
          break
        case 'score':
          compareValue = (a.finalScore || 0) - (b.finalScore || 0)
          break
        case 'startedAt':
          compareValue = new Date(a.startedAt || 0) - new Date(b.startedAt || 0)
          break
        default:
          compareValue = 0
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return sessionsList
  }, [sessions, serverCandidates, searchQuery, sortBy, sortOrder])

  const handleSort = (field) => {
    if (sortBy === field) {
      dispatch(toggleSortOrder())
    } else {
      dispatch(setSortBy(field))
    }
  }

  const selectedSession = selectedSessionId ? (sessions[selectedSessionId] || serverSession) : null

  useEffect(() => {
    if (selectedSessionId && !sessions[selectedSessionId]) {
      (async () => {
        try {
          const detail = await getCandidate(serverCandidates.find(c => c.sessionId === selectedSessionId)?.id)
          const s = detail.session
          setServerSession({
            id: s.id,
            name: s.candidate?.name,
            email: s.candidate?.email,
            phone: '',
            resumeFileName: '',
            answers: s.answers.map(a => {
              console.log('Server answer data:', a)
              return {
                questionId: a.questionId,
                answer: a.answer,
                timeUsed: a.timeUsed,
                selectedIndex: a.selectedIndex,
                isCorrect: a.isCorrect,
                score: 0,
                feedback: '',
                keywords: []
              }
            }),
            currentQuestionIndex: s.questions.length,
            status: 'finished',
            startedAt: '',
            questions: s.questions,
            finalScore: detail.candidate?.score,
            summary: detail.candidate?.summary
          })
        } catch {
          setServerSession(null)
        }
      })()
    }
  }, [selectedSessionId, sessions, serverCandidates])

  if (selectedSession) {
    return (
      <div>
        <button
          onClick={() => setSelectedSessionId(null)}
          className="mb-6 inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <CandidateDetail session={selectedSession} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-lg font-bold text-white leading-tight drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                Interview Dashboard
              </span>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              View and analyze candidate interview results
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="pl-10 pr-4 py-2 w-full border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
            </div>
          </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-white/90 font-bold drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
            {filteredAndSortedSessions.length} candidates
          </span>
          <div className="text-xs text-white/70">
            {filteredAndSortedSessions.filter(s => s.status === 'finished').length} completed
          </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        {filteredAndSortedSessions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-lg font-bold text-white leading-tight drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                No candidates yet!
              </span>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              {searchQuery ? 'No candidates match your search.' : 'Interview sessions will appear here once candidates complete them.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === 'name' && (
                        <svg 
                          className={`w-4 h-4 ml-1 transform ${sortOrder === 'asc' ? '' : 'rotate-180'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th
                    onClick={() => handleSort('score')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    <div className="flex items-center">
                      Score
                      {sortBy === 'score' && (
                        <svg 
                          className={`w-4 h-4 ml-1 transform ${sortOrder === 'asc' ? '' : 'rotate-180'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort('startedAt')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'startedAt' && (
                        <svg 
                          className={`w-4 h-4 ml-1 transform ${sortOrder === 'asc' ? '' : 'rotate-180'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedSessions.map((session) => (
                  <CandidateRow 
                    key={session.id} 
                    session={session} 
                    onView={() => setSelectedSessionId(session.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewerTab
