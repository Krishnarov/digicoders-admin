


import { createSlice } from '@reduxjs/toolkit';

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
    filters: {},
    searchTerm: '',
    sortConfig: {
      sortBy: "createdAt",
      sortOrder: "desc"
    },
    // Cache for different filter states
    cache: {}
  },
  reducers: {
    setStudent: (state, action) => {
      state.data = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSortConfig: (state, action) => {
      state.sortConfig = { ...state.sortConfig, ...action.payload };
    },
    // Cache operations
    setCache: (state, action) => {
      const { key, data } = action.payload;
      state.cache[key] = {
        data,
        timestamp: Date.now()
      };
    },
    clearCache: (state) => {
      state.cache = {};
    },
    // Reset to initial state
    resetState: (state) => {
      state.data = [];
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      state.loading = false;
      state.error = null;
      state.filters = {};
      state.searchTerm = '';
      state.sortConfig = {
        sortBy: "createdAt",
        sortOrder: "desc"
      };
    }
  },
});

export const { 
  setStudent, 
  setPagination, 
  setLoading,
  setError,
  setFilters, 
  clearFilters,
  setSearchTerm,
  setSortConfig,
  setCache,
  clearCache,
  resetState
} = studentSlice.actions;

export default studentSlice.reducer;