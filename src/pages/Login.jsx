
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, OctagonPause } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    otp: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, verifyOtp, loading, error, isTwoFactor } = useAuth();



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isTwoFactor) {
      // Verify OTP
      const result = await verifyOtp(credentials.otp);
      if (result.success) {
        toast.success("OTP verified successfully!");
      } else {
        toast.error(result.message || "OTP verification failed");
      }
    } else {
      // Regular login
      const result = await login(credentials);


      if (result.isTwoFactor) {
        toast.info("OTP sent to your email. Please check and enter OTP.");
      } else if (result.success) {
        toast.success("Login successful!");
      } else {
        toast.error(result.message || "Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-18 h-18 rounded-full mb-4">
            <img src={`/img/digicoders.jpeg`} alt="DigiCoders" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isTwoFactor ? "Enter OTP" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">
            {isTwoFactor
              ? "Enter the OTP sent to your email"
              : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Only show email/password if not in 2FA mode */}
            {!isTwoFactor && (
              <>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChange={(e) =>
                        setCredentials({ ...credentials, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                      }
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* OTP Field (only show if 2FA is enabled) */}
            {isTwoFactor && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <OctagonPause className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={credentials.otp}
                    onChange={(e) =>
                      setCredentials({ ...credentials, otp: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Check your email for the OTP
                </p>
              </div>
            )}

            {/* Remember Me & Forgot Password (only in login mode) */}
            {!isTwoFactor && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isTwoFactor ? "Verifying OTP..." : "Signing in..."}
                </div>
              ) : (
                isTwoFactor ? "Verify OTP" : "Sign In"
              )}
            </button>

            {/* Back to login button (in 2FA mode) */}
            {isTwoFactor && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full text-blue-600 hover:text-blue-700 py-2 text-sm"
              >
                ← Back to login
              </button>
            )}
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;