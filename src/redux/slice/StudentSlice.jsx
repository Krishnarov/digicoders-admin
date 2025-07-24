import { createSlice } from '@reduxjs/toolkit';
const studentSlice = createSlice({
  name: 'student',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    setStudent: (state,action) => {
      state.data=action.payload
    },
  },
});

export const { setStudent } = studentSlice.actions;
export default studentSlice.reducer;