import React from 'react'

const TopNav = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                AI Interview Assistant
              </h1>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => onTabChange('interviewee')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'interviewee'
                    ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Interviewee
              </button>
              
              <button
                onClick={() => onTabChange('interviewer')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'interviewer'
                    ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Interviewer
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {activeTab === 'interviewee' ? 'Take Interview' : 'View Results'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopNav
