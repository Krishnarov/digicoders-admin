
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux"
import { setTranning } from "../redux/slice/tranningSlice.jsx";
import axios from "../axiosInstance.jsx";

const useGetTranning = () => {
    const dispatch = useDispatch()

    const fetchTranning = useCallback(async (params = {}) => {
        try {
            const hasParams = Object.keys(params).length > 0;
            // Use params if provided, otherwise default getAll (which might be just /training/getAll)
            // But if we want to use the same endpoint for both, we need to be careful.
            // Assuming /training/getAll supports query params like ?page=1&limit=10 etc.

            const res = await axios.get("/training/getAll", {
                params: hasParams ? params : undefined,
                withCredentials: true
            })
            // console.log(res);
            if (res.status === 200) {
                // Determine if response has pagination info
                // If it's the new server-side pagination response, it likely has { data: [...], pagination: {...} }
                // or similar structure.
                // Based on previous step, we looked at `TrainingDuration` which seemingly returns 
                // { success: true, data: [...], pagination: { totalCount: ... } }

                if (res.data.pagination || hasParams) {
                    dispatch(setTranning({
                        data: res.data.data,
                        pagination: res.data.pagination || {
                            // fallback if no pagination object but we have data length
                            total: res.data.totalCount || res.data.data.length,
                            page: params.page || 1,
                            limit: params.limit || 10
                        }
                    }))
                } else {
                    // Legacy behavior for generic "get all"
                    dispatch(setTranning(res.data.data))
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch])

    useEffect(() => {
        fetchTranning()
    }, [fetchTranning])
    return fetchTranning
}

export default useGetTranning
