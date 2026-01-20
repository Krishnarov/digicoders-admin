import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../redux/slice/authSlice.jsx';

import technologyReducer from '../redux/slice/technologySlice.jsx';
import tranningReducer from '../redux/slice/tranningSlice.jsx';
import studentReducer from '../redux/slice/StudentSlice.jsx';
import educationReducer from '../redux/slice/educationSlice.jsx';
import feeReducer from '../redux/slice/feeSlice.jsx';
import countReducer from '../redux/slice/countSlice.jsx';

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isLoggedIn'], // Only persist these fields
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    technology: technologyReducer,
    tranning: tranningReducer,
    student: studentReducer,
    education: educationReducer,
    fee: feeReducer,
    count: countReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
});

export const persistor = persistStore(store);