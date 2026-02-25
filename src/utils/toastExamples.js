// Example: How to use react-hot-toast with API calls

import { apiWithToast, showSuccess, showError } from '../utils/toast';
import axios from 'axios';

// Example 1: Simple API call with toast
export const handleRegistration = async (formData) => {
  try {
    const response = await apiWithToast(
      axios.post('/api/registration', formData),
      {
        loading: 'Registering student...',
        success: 'Student registered successfully!',
        // error message will be taken from API response automatically
      }
    );
    return response.data;
  } catch (error) {
    // Error already shown in toast
    throw error;
  }
};

// Example 2: Using API response message
export const handleUpdate = async (id, data) => {
  try {
    const response = await apiWithToast(
      axios.put(`/api/registration/${id}`, data),
      {
        loading: 'Updating...',
        // success message will come from response.data.message
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Example 3: Delete with confirmation
export const handleDelete = async (id) => {
  try {
    await apiWithToast(
      axios.delete(`/api/registration/${id}`),
      {
        loading: 'Deleting...',
        success: 'Deleted successfully!',
        error: 'Failed to delete!',
      }
    );
  } catch (error) {
    throw error;
  }
};

// Example 4: Login
export const handleLogin = async (credentials) => {
  try {
    const response = await apiWithToast(
      axios.post('/api/login', credentials),
      {
        loading: 'Logging in...',
        success: 'Login successful!',
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Example 5: File upload
export const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiWithToast(
      axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      {
        loading: 'Uploading file...',
        success: 'File uploaded successfully!',
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Example 6: Bulk operations
export const handleBulkDelete = async (ids) => {
  try {
    await apiWithToast(
      axios.post('/api/bulk-delete', { ids }),
      {
        loading: `Deleting ${ids.length} items...`,
        success: `${ids.length} items deleted successfully!`,
      }
    );
  } catch (error) {
    throw error;
  }
};

// Example 7: Payment verification
export const verifyPayment = async (paymentId) => {
  try {
    const response = await apiWithToast(
      axios.post('/api/verify-payment', { paymentId }),
      {
        loading: 'Verifying payment...',
        success: 'Payment verified successfully!',
        error: 'Payment verification failed!',
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Example 8: Send OTP
export const sendOTP = async (mobile) => {
  try {
    await apiWithToast(
      axios.post('/api/send-otp', { mobile }),
      {
        loading: 'Sending OTP...',
        success: 'OTP sent successfully!',
      }
    );
  } catch (error) {
    throw error;
  }
};

// Example 9: Without promise (manual control)
export const manualToast = async (data) => {
  try {
    const response = await axios.post('/api/endpoint', data);
    showSuccess(response.data.message || 'Success!');
    return response.data;
  } catch (error) {
    showError(error.response?.data?.message || 'Failed!');
    throw error;
  }
};
