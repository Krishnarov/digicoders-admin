
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginStart,
  loginSuccess,
  setTwoFactor,
  verifyOtpSuccess,
  loginFailure,
  logout,
  updateUser,
  setAuthLoading,
} from "../redux/slice/authSlice.jsx";
import axios from "axios";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const authState = useSelector((state) => state.auth);
  const { user, isLoggedIn, loading, error, isTwoFactor, token } = authState;

  const login = async (credentials) => {
    try {
      dispatch(loginStart());


      const res = await axios.post(
        `${import.meta.env.VITE_BASE_API}/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000,
        }
      );



      if (res.data.success) {
        // Check if 2FA is required
        if (res.data.isTwoFactor) {
          dispatch(setTwoFactor(true));
          return {
            isTwoFactor: true,
            success: true,
            data: res.data,
            message: "OTP sent to your email"
          };
        } else {
          // Regular login success
          const userData = res.data.user || res.data.data?.user;
          const authToken = res.data.token || res.data.accessToken;

          if (!userData || !authToken) {
            throw new Error("Invalid login response from server");
          }

          dispatch(loginSuccess({
            user: userData,
            token: authToken,
          }));

          // Navigate to dashboard
          navigate("/dashboard");

          return {
            success: true,
            data: res.data,
            message: "Login successful"
          };
        }
      } else {
        // Login failed
        dispatch(loginFailure(res.data.message || "Login failed"));
        return {
          success: false,
          message: res.data.message
        };
      }
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = "Login failed. Please try again.";

      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Other errors
        errorMessage = err.message;
      }

      dispatch(loginFailure(errorMessage));
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const verifyOtp = async (otp) => {
    try {
      dispatch(setAuthLoading(true));

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_API}/auth/verify-otp`,
        { otp },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        dispatch(verifyOtpSuccess({
          user: res.data.user,
          token: res.data.token,
        }));

        navigate("/dashboard");
        return { success: true, data: res.data };
      } else {
        dispatch(loginFailure(res.data.message));
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "OTP verification failed";
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    }
  };

  const logoutUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_BASE_API}/auth/logout`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      navigate("/");
    }
  };

  const checkAuth = async () => {
    try {
      dispatch(setAuthLoading(true));
      const token = localStorage.getItem('token');

      if (!token) {
        dispatch(logout());
        return false;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_API}/auth/verify-token`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        dispatch(updateUser(res.data.user));
        return true;
      } else {
        dispatch(logout());
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch(logout());
      return false;
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const updateProfile = async (data) => {
    try {
      dispatch(setAuthLoading(true));
      const token = localStorage.getItem('token');

      const res = await axios.put(
        `${import.meta.env.VITE_BASE_API}/auth/update/${user._id}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        dispatch(updateUser(res.data.data));
        return { success: true, data: res.data };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed"
      };
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return {
    // State
    user,
    isLoggedIn,
    loading,
    error,
    isTwoFactor,
    token,

    // Actions
    login,
    verifyOtp,
    logout: logoutUser,
    checkAuth,
    updateProfile,
  };
};