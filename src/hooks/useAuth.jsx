import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../redux/slice/authSlice.jsx";
import Cookies from "js-cookie";
import axios from "../axiosInstance.jsx";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn, loading, error } = useSelector(
    (state) => state.auth
  );

  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const res = await axios.post("/auth/login", credentials);
      console.log(res);
      
      dispatch(loginSuccess({ user: res.data.user }));
      navigate("/dashboard");
      return { success: true };
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || "Login failed"));
      console.log(err);
      
      return { success: false };
    }
  };

  const logoutUser = async () => {
    await axios.post("/auth/logout");
    dispatch(logout());
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken"); 
    
   // Remove cookies properly
    
    navigate("/");
  };



  return {
    user,
    isLoggedIn,
    loading,
    error,
    login,
    logout: logoutUser,
  };
};
