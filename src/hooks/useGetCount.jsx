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
};

export default useGetCount;
