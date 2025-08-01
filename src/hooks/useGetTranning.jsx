
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux"
import { setTranning } from "../redux/slice/tranningSlice.jsx";
import axios from "../axiosInstance.jsx";

const useGetTranning = () => {
    const dispatch = useDispatch()

    const fetchTranning = useCallback(async () => {
        try {
            const res = await axios.get("/training/getAll",{withCredentials:true})
            // console.log(res);
            if (res.status===200) {
               dispatch(setTranning(res.data.data))
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