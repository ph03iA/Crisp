import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeTab: 'interviewee',
  showWelcomeBack: false,
  searchQuery: '',
  sortBy: 'startedAt',
  sortOrder: 'desc',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },

    setShowWelcomeBack: (state, action) => {
      state.showWelcomeBack = action.payload
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },

    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },

    setSortOrder: (state, action) => {
      state.sortOrder = action.payload
    },

    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
    },
  },
})

export const {
  setActiveTab,
  setShowWelcomeBack,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
} = uiSlice.actions

export default uiSlice.reducer
