import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../redux/slice/authSlice.jsx";
import {
  useLoginMutation,
  useRefreshTokenMutation,
} from "../redux/authAPI.jsx";
import Cookies from "js-cookie";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isLoggedIn, loading, error } = useSelector(
    (state) => state.auth
  );

  const [loginMutation] = useLoginMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const response = await loginMutation(credentials).unwrap();

      // Token ko cookies me store karo
      Cookies.set("token", response.token, {
        expires: 7,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      }); 

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );

      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      dispatch(loginFailure(error.data?.message || "Login failed"));
      return { success: false, error: error.data?.message };
    }
  };

  const logoutUser = () => {
    dispatch(logout());
    Cookies.remove("token"); // Logout par token remove karo
    navigate("/");
  };

  const refreshToken = async () => {
    try {
      const response = await refreshTokenMutation().unwrap();
      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );
      return true;
    } catch (error) {
      dispatch(logout());
      return false;
    }
  };

  return {
    user,
    token,
    isLoggedIn,
    loading,
    error,
    login,
    logout: logoutUser,
    refreshToken,
  };
};
