import axios from "axios";
import { store } from "./store/store.jsx"; // redux store ka path
import { logout, loginSuccess } from "./redux/slice/authSlice.jsx"; // logout action

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  withCredentials: true, // IMPORTANT for cookie transfer
});

// ✅ Request Interceptor → LocalStorage se token uthao aur header me bhejo
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Agar 401 aaya → logout + redirect
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
