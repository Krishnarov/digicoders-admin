
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux"
import axios from "../axiosInstance.jsx";
import { setEducation } from "../redux/slice/educationSlice.jsx";

const useGetEducations = () => {
    const dispatch = useDispatch()

    const fetchEducation = useCallback(async () => {
        try {
            const res = await axios.get("/education")
            // console.log(res);
            
            if (res.data) {
                dispatch(setEducation(res.data.data))
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch])

    useEffect(() => {
        fetchEducation()
    }, [fetchEducation])
    return fetchEducation
}

export default useGetEducations