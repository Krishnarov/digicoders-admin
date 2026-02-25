/**
 * REACT HOT TOAST - QUICK REFERENCE
 * ==================================
 */

import { apiWithToast, showSuccess, showError } from './utils/toast';

// ✅ RECOMMENDED: API calls with automatic toast
const handleSubmit = async () => {
  await apiWithToast(
    axios.post('/api/endpoint', data),
    {
      loading: 'Processing...',
      success: 'Done!',
      error: 'Failed!'
    }
  );
};

// ✅ Simple success/error
showSuccess('Success message');
showError('Error message');

// ✅ API response message (automatic)
await apiWithToast(
  axios.post('/api/endpoint', data),
  {
    loading: 'Processing...',
    // success/error will use API response message
  }
);

// ✅ In React component
const MyComponent = () => {
  const handleClick = async () => {
    try {
      const response = await apiWithToast(
        axios.post('/api/register', formData),
        {
          loading: 'Registering...',
          success: 'Registered!',
        }
      );
      // Handle success
      navigate('/dashboard');
    } catch (error) {
      // Error already shown in toast
    }
  };

  return <button onClick={handleClick}>Submit</button>;
};

// ✅ Multiple operations
const handleBulk = async () => {
  for (const item of items) {
    await apiWithToast(
      axios.post('/api/process', item),
      {
        loading: `Processing ${item.name}...`,
        success: `${item.name} done!`,
      }
    );
  }
};

/**
 * MIGRATION CHECKLIST
 * ===================
 * 
 * ❌ OLD (react-toastify):
 * import { toast } from 'react-toastify';
 * showSuccess('Message');
 * 
 * ✅ NEW (react-hot-toast):
 * import { showSuccess } from './utils/toast';
 * showSuccess('Message');
 * 
 * ❌ OLD (manual loading):
 * const id = toast.loading('Loading...');
 * try {
 *   await api();
 *   toast.update(id, { render: 'Success', type: 'success', isLoading: false });
 * } catch {
 *   toast.update(id, { render: 'Error', type: 'error', isLoading: false });
 * }
 * 
 * ✅ NEW (automatic):
 * await apiWithToast(api(), {
 *   loading: 'Loading...',
 *   success: 'Success',
 *   error: 'Error'
 * });
 */
