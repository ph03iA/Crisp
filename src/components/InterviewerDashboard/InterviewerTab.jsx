import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSearchQuery, setSortBy, toggleSortOrder } from '../../features/uiSlice'
import CandidateRow from './CandidateRow'
import CandidateDetail from './CandidateDetail'

const InterviewerTab = () => {
  const dispatch = useDispatch()
  const { searchQuery, sortBy, sortOrder } = useSelector(state => state.ui)
  const { sessions } = useSelector(state => state.sessions)
  const [selectedSessionId, setSelectedSessionId] = useState(null)

  const filteredAndSortedSessions = useMemo(() => {
    let sessionsList = Object.values(sessions)

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
  }, [sessions, searchQuery, sortBy, sortOrder])

  const handleSort = (field) => {
    if (sortBy === field) {
      dispatch(toggleSortOrder())
    } else {
      dispatch(setSortBy(field))
    }
  }

  const selectedSession = selectedSessionId ? sessions[selectedSessionId] : null

  if (selectedSession) {
    return (
      <div>
        <button
          onClick={() => setSelectedSessionId(null)}
          className="mb-4 flex items-center text-primary-600 hover:text-primary-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Interview Dashboard
        </h1>
        <p className="text-gray-600">
          View and analyze candidate interview results
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-6">
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
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredAndSortedSessions.length} candidates
            </span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card overflow-hidden">
        {filteredAndSortedSessions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No candidates yet</h3>
            <p className="text-gray-500">
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
