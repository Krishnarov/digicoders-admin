import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  return {
    user: user ? JSON.parse(user) : null,
    token: token || null,
    isLoggedIn: !!token,
    loading: false,
    error: null,
    isTwoFactor: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isTwoFactor = false;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.error = null;
      state.isTwoFactor = false;

      // Save to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setTwoFactor: (state, action) => {
      state.loading = false;
      state.isTwoFactor = action.payload;
      state.error = null;
    },
    verifyOtpSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.error = null;
      state.isTwoFactor = false;

      // Save to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
      state.isTwoFactor = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      state.isTwoFactor = false;
      state.loading = false;

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  setTwoFactor,
  verifyOtpSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
  setAuthLoading
} = authSlice.actions;

export default authSlice.reducer;