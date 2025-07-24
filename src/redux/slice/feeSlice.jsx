import { createSlice } from '@reduxjs/toolkit';
const feeSlice = createSlice({
  name: 'fee',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFee: (state,action) => {
      state.data=action.payload
    },
  },
});

export const { setFee } = feeSlice.actions;
export default feeSlice.reducer;