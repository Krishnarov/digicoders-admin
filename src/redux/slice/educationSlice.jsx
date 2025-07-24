import { createSlice } from '@reduxjs/toolkit';
const educationSlice = createSlice({
  name: 'education',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    setEducation: (state,action) => {
      state.data=action.payload
    },
  },
});

export const { setEducation } = educationSlice.actions;
export default educationSlice.reducer;