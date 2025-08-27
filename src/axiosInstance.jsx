import axios from "axios";
import { store } from "./store/store.jsx"; // redux store ka path
import { logout, loginSuccess } from "./redux/slice/authSlice.jsx"; // logout action

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  withCredentials: true, // IMPORTANT for cookie transfer
});
// Request interceptor for token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = store.getState().auth.token;
//     // console.log(token);

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
// Automatically call refresh API on 401

// Agar 401 aaya → logout + redirect
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      // history.push("/"); // user ko login page par bhejna
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
