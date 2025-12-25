import { createSlice } from "@reduxjs/toolkit";

const technologySlice = createSlice({
  name: "technology",
  initialState: {
    data: [],
    loading: false,
    error: null,

    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },

    search: "",
    filters: {},

    sort: {
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  },

  reducers: {
    setTechnology: (state, action) => {
      state.data = action.payload;
    },

    setTechnologyLoading: (state, action) => {
      state.loading = action.payload;
    },

    setTechnologyError: (state, action) => {
      state.error = action.payload;
    },

    setTechnologyPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },

    setTechnologySearch: (state, action) => {
      state.search = action.payload;
    },

    setTechnologyFilters: (state, action) => {
      state.filters = action.payload;
    },

    setTechnologySort: (state, action) => {
      state.sort = action.payload;
    },

    resetTechnology: (state) => {
      state.data = [];
      state.search = "";
      state.filters = {};
      state.pagination.page = 1;
    },
  },
});

export const {
  setTechnology,
  setTechnologyLoading,
  setTechnologyError,
  setTechnologyPagination,
  setTechnologySearch,
  setTechnologyFilters,
  setTechnologySort,
  resetTechnology,
} = technologySlice.actions;

export default technologySlice.reducer;
