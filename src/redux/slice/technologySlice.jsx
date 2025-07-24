import { createSlice } from '@reduxjs/toolkit';
const technologySlice = createSlice({
  name: 'technology',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    setTechnology: (state,action) => {
      state.data=action.payload
    },
  },
});

export const { setTechnology } = technologySlice.actions;
export default technologySlice.reducer;