
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux"
import axios from "../axiosInstance.jsx";
import { setStudent } from "../redux/slice/StudentSlice.jsx";

const useGetStudents = () => {
    const dispatch = useDispatch()

    const fetchStudents = useCallback(async () => {
        try {
            const res = await axios.get("/registration/all",{withCredentials:true})
            // console.log(res);
            
            if (res.data) {
                dispatch(setStudent(res.data.data))
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])
    return fetchStudents
}

export default useGetStudents