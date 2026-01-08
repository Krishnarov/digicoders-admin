
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux"
import axios from "../axiosInstance.jsx";
import { setEducation } from "../redux/slice/educationSlice.jsx";

const useGetEducations = () => {
    const dispatch = useDispatch()

    const fetchEducation = useCallback(async (params = {}) => {
        try {
            // Build query string from params
            const {
                page = 1,
                limit = 10,
                search = "",
                sortBy = "createdAt",
                sortOrder = "desc",
                ...filters
            } = params;

            const queryParams = new URLSearchParams({
                page,
                limit,
                sortBy,
                sortOrder,
            });

            if (search) queryParams.append("search", search);

            // Append other filters
            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== "All") {
                    queryParams.append(key, filters[key]);
                }
            });

            const res = await axios.get(`/education?${queryParams.toString()}`, { withCredentials: true })

            if (res.data && res.data.success) {
                dispatch(setEducation({
                    data: res.data.data,
                    pagination: res.data.pagination
                }))
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch])

    // Removed auto-useEffect to prevent unwanted initial fetches without params or double fetches.
    // The component will call this controlled.
    return fetchEducation
}

export default useGetEducations