
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux"
import { setTechnology } from "../redux/slice/technologySlice.jsx";
import axios from "../axiosInstance.jsx";

const useGetTechnology = () => {
    const dispatch = useDispatch()

    const fetchTechnology = useCallback(async () => {
        try {
            const res = await axios.get("/technology/getAll")
            // console.log(res);
            
            if (res.data) {
                dispatch(setTechnology(res.data.data))
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch])

    useEffect(() => {
        fetchTechnology()
    }, [fetchTechnology])
    return fetchTechnology
}

export default useGetTechnology