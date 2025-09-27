import { combineReducers } from '@reduxjs/toolkit'
import sessionsSlice from '../features/sessionsSlice'
import uiSlice from '../features/uiSlice'

export const rootReducer = combineReducers({
  sessions: sessionsSlice,
  ui: uiSlice,
})
