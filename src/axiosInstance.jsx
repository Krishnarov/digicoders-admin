import axios from "axios";
import { store } from "./store/store.jsx"; // redux store ka path
import { logout } from "./redux/slice/authSlice.jsx"; // logout action

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  // withCredentials: true, // taaki cookie backend ko mile
});

// har response ke liye ye run hoga
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout()); // redux state reset
      // window.location.href = "/"; // login page par redirect
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
