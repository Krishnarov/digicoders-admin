
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../axiosInstance.jsx";
import {
  setStudent,
  setPagination,
  setLoading,
  setFilters,
  setSearchTerm,
  setSortConfig,
  clearFilters,
} from "../redux/slice/StudentSlice.jsx";

const useGetStudents = (defaultFilters = {}) => {
  const dispatch = useDispatch();
  const studentState = useSelector((state) => state.student);

  const fetchStudents = useCallback(
    async ({
      page = studentState.pagination.page,
      limit = studentState.pagination.limit,
      search = studentState.searchTerm,
      sortBy = studentState.sortConfig.sortBy,
      sortOrder = studentState.sortConfig.sortOrder,
      filters = studentState.filters,
      forceRefresh = false,
      mergeWithDefaults = true,
    } = {}) => {
      try {
        dispatch(setLoading(true));

        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
        
        // Add search if provided
        if (search && search.trim()) {
          params.append("search", search);
        }

        // Merge filters with defaults if needed
        let finalFilters = { ...filters };
        if (mergeWithDefaults && Object.keys(defaultFilters).length > 0) {
          finalFilters = { ...defaultFilters, ...filters };
        }

        // Add all filters to params
        Object.keys(finalFilters).forEach((key) => {
          if (finalFilters[key] && finalFilters[key] !== "All") {
            // Handle date filters
            if (key === 'startDate' || key === 'endDate') {
              params.append(key, finalFilters[key]);
            } else {
              // Remove .name suffix if present
              const paramKey = key.includes(".") ? key.split(".")[0] : key;
              params.append(paramKey, finalFilters[key]);
            }
          }
        });

        // Only force refresh if explicitly requested
        const cacheBuster = forceRefresh ? `&_=${Date.now()}` : '';
        const url = `/registration/all?${params.toString()}${cacheBuster}`;



        const res = await axios.get(url, {
          withCredentials: true,
        });

        if (res.data?.success) {
          dispatch(setStudent(res.data.data || []));
          dispatch(
            setPagination({
              page: res.data.pagination?.currentPage || 1,
              limit: res.data.pagination?.limit || limit,
              total: res.data.pagination?.totalRecords || 0,
              totalPages: res.data.pagination?.totalPages || 0,
            })
          );
          // Store only user-applied filters (not merged ones)
          dispatch(setFilters(filters));
          dispatch(setSearchTerm(search));
          dispatch(setSortConfig({ sortBy, sortOrder }));
        }
      } catch (error) {
        console.error("Fetch students error:", error);
        // Don't reset state on error, keep previous data
      } finally {
        dispatch(setLoading(false));
      }
    },
    [[
  dispatch,
  studentState.pagination.page,
  studentState.pagination.limit,
  studentState.searchTerm,
  studentState.sortConfig.sortBy,
  studentState.sortConfig.sortOrder,
  studentState.filters,
  defaultFilters
]
]
  );

  // Helper functions for common operations
  const refreshStudents = useCallback(() => {
    fetchStudents({ forceRefresh: true });
  }, [fetchStudents]);

  const changePage = useCallback((newPage) => {
    fetchStudents({ page: newPage });
  }, [fetchStudents]);

  const changeLimit = useCallback((newLimit) => {
    fetchStudents({ page: 1, limit: newLimit });
  }, [fetchStudents]);

  const changeSort = useCallback((column, order) => {
    fetchStudents({ page: 1, sortBy: column, sortOrder: order });
  }, [fetchStudents]);

  // IMPORTANT: This handles filter changes from DataTable
  const handleFilterChange = useCallback((newFilters) => {
    // For RegReport page, we need to merge with default status filter
    const userFilters = { ...newFilters };
    
    // Remove status from user filters if it's same as default
    if (defaultFilters.status && userFilters.status === defaultFilters.status) {
      delete userFilters.status;
    }
    
    fetchStudents({ 
      page: 1, 
      filters: userFilters,
      mergeWithDefaults: true 
    });
  }, [fetchStudents, defaultFilters]);

  const changeSearch = useCallback((searchTerm) => {
    fetchStudents({ page: 1, search: searchTerm });
  }, [fetchStudents]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
    // Keep default filters, clear only user filters
    fetchStudents({ 
      page: 1, 
      filters: {},
      mergeWithDefaults: true 
    });
  }, [dispatch, fetchStudents]);

  // Get current merged filters (for display)
  const getMergedFilters = useCallback(() => {
    return { ...defaultFilters, ...studentState.filters };
  }, [defaultFilters, studentState.filters]);

  return {
    // Main fetch function
    fetchStudents,
    
    // Helper functions
    refreshStudents,
    changePage,
    changeLimit,
    changeSort,
    changeFilters: handleFilterChange, // Use the custom handler
    changeSearch,
    clearAllFilters,
    
    // Current state with merged filters
    currentState: {
      ...studentState,
      filters: getMergedFilters(),
    },
  };
};

export default useGetStudents;