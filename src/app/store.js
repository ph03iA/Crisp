import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import localForage from 'localforage'
import { rootReducer } from './rootReducer'

// Configure localForage for IndexedDB storage
localForage.config({
  driver: localForage.INDEXEDDB,
  name: 'ai-interview-assistant',
  version: 1.0,
  storeName: 'interview_data',
  description: 'Storage for interview sessions and app state'
});

const persistConfig = {
  key: 'root',
  storage: localForage,
  whitelist: ['sessions', 'ui'], // Persist both sessions and UI state
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
})

export const persistor = persistStore(store)
