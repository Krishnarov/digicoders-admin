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
import axioS from "axios";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn, loading, error } = useSelector(
    (state) => state.auth
  );

  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const res = await axioS.post(
        `${import.meta.env.VITE_BASE_API}/auth/login`,
        credentials
      );
      console.log(res);
      if (res.data.success) {
        dispatch(loginSuccess({ user: res.data.user }));
        navigate("/dashboard");
        localStorage.setItem("accessToken", res.data.accessToken); // ✅ fixed
        return { success: true };
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || "Login failed"));
      console.log(err);

      return { success: false };
    }
  };

  const logoutUser = async () => {
    await axios.post("/auth/logout");
    dispatch(logout());
    localStorage.removeItem("accessToken");
    Cookies.remove("accessToken");

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
