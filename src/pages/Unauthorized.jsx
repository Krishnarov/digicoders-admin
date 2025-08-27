import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Home, Shield } from '@mui/icons-material';

function Unauthorized() {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-gradient-to-br  flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
              <Lock className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-lg text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
          
          <div className="mt-8 bg-red-50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Why am I seeing this?</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Your account doesn't have the necessary permissions to view this content. Please contact your administrator if you believe this is an error.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex justify-center">
              <button
                onClick={handleGoToDashboard}
                className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="mr-2" />
                Go to Dashboard
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => window.history.back()}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition duration-200"
              >
                Or go back to previous page
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact support@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;