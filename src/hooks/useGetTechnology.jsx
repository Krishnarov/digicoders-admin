import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../axiosInstance.jsx";
import {
  setTechnology,
  setTechnologyLoading,
  setTechnologyPagination,
  setTechnologyFilters,
  setTechnologySearch,
  setTechnologySort,
} from "../redux/slice/technologySlice.jsx";

const useGetTechnology = () => {
  const dispatch = useDispatch();
  const techState = useSelector((state) => state.technology);

  const fetchTechnology = useCallback(
    async ({
      page = techState.pagination.page,
      limit = techState.pagination.limit,
      search = techState.search,
      sortBy = techState.sort.sortBy,
      sortOrder = techState.sort.sortOrder,
      filters = techState.filters,
      forceRefresh = false,
    } = {}) => {
      try {
        dispatch(setTechnologyLoading(true));

        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        if (search?.trim()) {
          params.append("search", search);
        }

        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "All") {
            params.append(key, value);
          }
        });

        // const cacheBuster = forceRefresh ? `&_=${Date.now()}` : "";
        const url = `/technology/getAll?${params.toString()}`;

        const res = await axios.get(url, { withCredentials: true });

        if (res.data?.success) {
          dispatch(setTechnology(res.data.data || []));
          dispatch(
            setTechnologyPagination({
              page: res.data.pagination?.currentPage || page,
              limit: res.data.pagination?.limit || limit,
              total: res.data.pagination?.totalRecords || 0,
              totalPages: res.data.pagination?.totalPages || 0,
            })
          );

          dispatch(setTechnologyFilters(filters));
          dispatch(setTechnologySearch(search));
          dispatch(setTechnologySort({ sortBy, sortOrder }));
        }
      } catch (error) {
        console.error("Fetch technology error:", error);
      } finally {
        dispatch(setTechnologyLoading(false));
      }
    },
    [dispatch, techState]
  );


  /* helpers */
  const changePage = useCallback(
    (page) => fetchTechnology({ page }),
    [fetchTechnology]
  );

  const changeLimit = useCallback(
    (limit) => fetchTechnology({ page: 1, limit }),
    [fetchTechnology]
  );

  const changeSearch = useCallback(
    (search) => fetchTechnology({ page: 1, search }),
    [fetchTechnology]
  );

  const changeSort = useCallback(
    (sortBy, sortOrder) =>
      fetchTechnology({ page: 1, sortBy, sortOrder }),
    [fetchTechnology]
  );

  const changeFilters = useCallback(
    (filters) => fetchTechnology({ page: 1, filters }),
    [fetchTechnology]
  );

  const refreshTechnology = useCallback(
    () => fetchTechnology({ forceRefresh: true }),
    [fetchTechnology]
  );

  return {
    fetchTechnology,
    refreshTechnology,
    changePage,
    changeLimit,
    changeSearch,
    changeSort,
    changeFilters,
    techState,
  };
};

export default useGetTechnology;
