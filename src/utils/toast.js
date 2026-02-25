import toast from 'react-hot-toast';

// Success toast
export const showSuccess = (message) => {
  toast.success(message);
};

// Error toast
export const showError = (message) => {
  toast.error(message);
};

// Loading toast
export const showLoading = (message = "Loading...") => {
  return toast.loading(message);
};

// Promise toast - automatically handles loading, success, and error
export const showPromise = (promise, messages = {}) => {
  return toast.promise(promise, {
    loading: messages.loading || 'Processing...',
    success: (data) => messages.success || data?.message || 'Success!',
    error: (err) => messages.error || err?.response?.data?.message || err?.message || 'Failed!',
  });
};

// API call with promise toast
export const apiWithToast = async (apiCall, messages = {}) => {
  return toast.promise(
    apiCall,
    {
      loading: messages.loading || 'Processing...',
      success: (response) => {
        return messages.success || response?.data?.message || 'Success!';
      },
      error: (error) => {
        return messages.error || error?.response?.data?.message || error?.message || 'Failed!';
      },
    }
  );
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};