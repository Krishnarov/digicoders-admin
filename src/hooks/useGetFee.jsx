// hooks/useGetFee.js
import { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFee } from "../redux/slice/feeSlice.jsx";
import axios from "../axiosInstance.jsx";

const useGetFee = (defaultStatus ={}) => {
  const dispatch = useDispatch();
  const feeData = useSelector((state) => state.fee.data);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  const [filters, setFilters] = useState({
    search: "",
    paymentType: "",
    mode: "",
    tnxStatus: "",
    branch: "",
    batch: "",
    minPaid: "",
    maxPaid: "",
    due: "",
    startDate: "",
    endDate: "",
   ...defaultStatus 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const isInitialMount = useRef(true);

  // Fetch fee data with current filters
  const fetchFee = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Combine current filters with custom filters
      const allFilters = {
        ...filters,
        ...customFilters,
      };

      // Remove empty params
      const params = {};
      Object.keys(allFilters).forEach((key) => {
        if (allFilters[key] !== "" && allFilters[key] !== undefined && allFilters[key] !== null) {
          params[key] = allFilters[key];
        }
      });

      // Add pagination params
      params.page = pagination.page;
      params.limit = pagination.limit;
      params.sortBy = "paymentDate";
      params.sortOrder = "desc";


      
      const res = await axios.get("/fee", { params });

      if (res.data.success) {
        dispatch(setFee(res.data.data || []));
        
        // Update pagination from response
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination?.total || 0,
          totalPages: res.data.pagination?.totalPages || 0,
        }));
        
        // Update filter options if available
        if (res.data.filters) {
          setFilterOptions(res.data.filters);
        }
      } else {
        dispatch(setFee([]));
      }
    } catch (err) {
      console.error("❌ Error fetching fee:", err);
      setError(err.message);
      dispatch(setFee([]));
    } finally {
      setLoading(false);
    }
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      paymentType: "",
      mode: "",
      tnxStatus: "",
      branch: "",
      batch: "",
      minPaid: "",
      maxPaid: "",
      due: "",
      startDate: "",
      endDate: "",
        ...defaultStatus,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Initial fetch on mount (skip on first render if it's a custom hook)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchFee();
    }
  }, []);

  // Fetch when filters or pagination changes
  useEffect(() => {
    if (!isInitialMount.current) {
      const timeoutId = setTimeout(() => {
        fetchFee();
      }, 300); // Debounce for 300ms
        
      return () => clearTimeout(timeoutId);
    }
  }, [filters, pagination.page, pagination.limit, fetchFee]);

  return {
    feeData,
    loading,
    error,
    pagination,
    filters,
    filterOptions,
    fetchFee,
    updateFilters,
    updatePagination,
    clearFilters,
    setFilters,
    setPagination,
  };
};

export default useGetFee;