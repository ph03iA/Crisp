import React from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const CandidateRow = ({ session, onView }) => {
  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex px-2 py-1 text-xs font-medium rounded-full'
    
    switch (status) {
      case 'finished':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'in-progress':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'paused':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'finished':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'paused':
        return 'Paused'
      default:
        return 'Unknown'
    }
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return dayjs(dateString).format('MMM D, YYYY')
  }

  const formatRelativeTime = (dateString) => {
    if (!dateString) return ''
    return dayjs(dateString).fromNow()
  }

  const score = session.finalScore || 0
  const maxScore = 100 // AI scores are out of 100

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {(session.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {session.name || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500">
              ID: {session.id.substring(0, 8)}...
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{session.email || 'N/A'}</div>
        <div className="text-sm text-gray-500">{session.phone || 'N/A'}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        {session.status === 'finished' ? (
          <div>
            <div className={`text-lg font-semibold ${getScoreColor(score, maxScore)}`}>
              {score}/100
            </div>
            <div className="text-sm text-gray-500">
              AI Score
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Q{session.currentQuestionIndex + 1}/{session.questions?.length || 6}
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={getStatusBadge(session.status)}>
          {getStatusText(session.status)}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>{formatDate(session.startedAt)}</div>
        <div className="text-xs">{formatRelativeTime(session.startedAt)}</div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={onView}
          className="text-primary-600 hover:text-primary-900"
        >
          View Details
        </button>
      </td>
    </tr>
  )
}

export default CandidateRow
