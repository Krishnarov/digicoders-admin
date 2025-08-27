import { createSlice } from '@reduxjs/toolkit';
const countSlice = createSlice({
  name: 'count',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCounts: (state,action) => {
      state.data=action.payload
    },
  },
});

export const { setCounts } = countSlice.actions;
export default countSlice.reducer;