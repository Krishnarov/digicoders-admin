import { createSlice } from '@reduxjs/toolkit';
const educationSlice = createSlice({
  name: 'education',
  initialState: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalRecords: 0,
      limit: 10
    }
  },
  reducers: {
    setEducation: (state, action) => {
      // Check structure of payload
      if (action.payload.data && action.payload.pagination) {
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      } else {
        // Fallback for legacy or direct array
        state.data = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      }
    },
  },
});

export const { setEducation } = educationSlice.actions;
export default educationSlice.reducer;