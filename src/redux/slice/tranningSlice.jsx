import { createSlice } from "@reduxjs/toolkit";
const tranningSlice = createSlice({
  name: "tranning",
  initialState: {
    data: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
  },
  reducers: {
    setTranning: (state, action) => {
      // Check if payload has data property (new structure) or is just the array (old structure)
      if (Array.isArray(action.payload)) {
        state.data = [...action.payload];
      } else {
        state.data = [...action.payload.data];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      }
    },
  },
});

export const { setTranning } = tranningSlice.actions;
export default tranningSlice.reducer;