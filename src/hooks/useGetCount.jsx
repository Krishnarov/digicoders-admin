// src/hooks/useGetCount.js
import { useState, useEffect, useCallback } from "react";
import axios from "../axiosInstance"; // aapka axios setup
import { setCounts } from "../redux/slice/countSlice";
import { useDispatch } from "react-redux";

const useGetCount = () => {

 const dispatch = useDispatch()

    const fetchCounts = useCallback(async () => {
        try {
            const res = await axios.get("/counts",{withCredentials:true})
            // console.log(res);
            
            if (res.data) {
                dispatch(setCounts(res.data))
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch])

    useEffect(() => {
        fetchCounts()
    }, [fetchCounts])
    return fetchCounts




//   const [counts, setCounts] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const fetchCounts = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get("/counts");

//       setCounts(data || {});
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch counts");
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     fetchCounts();
//   }, []);

//   return { counts, loading, error,fetchCounts };
};

export default useGetCount;
