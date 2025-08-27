
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux"
import { setFee } from "../redux/slice/feeSlice.jsx";
import axios from "../axiosInstance.jsx";

const useGetFee = () => {
    const dispatch = useDispatch()

    const fetchFee = useCallback(async () => {
        try {
            const res = await axios.get("/fee",{withCredentials:true})
            // console.log(res);
            
            if (res.data) {
                dispatch(setFee(res.data.data))
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch])

    useEffect(() => {
        fetchFee()
    }, [fetchFee])
    return fetchFee;
}

export default useGetFee