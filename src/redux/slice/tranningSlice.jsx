import { createSlice } from "@reduxjs/toolkit";
const tranningSlice = createSlice({
  name: "tranning",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    setTranning: (state, action) => {
      state.data = [...action.payload]; // force new reference
    },
  },
});

export const { setTranning } = tranningSlice.actions;
export default tranningSlice.reducer;
