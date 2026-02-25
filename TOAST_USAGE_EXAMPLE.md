# React Hot Toast Usage Guide

## Installation
```bash
npm install
```

## Import
```javascript
import { showSuccess, showError, showPromise, apiWithToast } from './utils/toast';
```

## Usage Examples

### 1. Simple Success/Error Toast
```javascript
showSuccess("Registration successful!");
showError("Something went wrong!");
```

### 2. Promise Toast (Recommended for API calls)
```javascript
// Automatically shows loading, then success or error based on promise result
const handleSubmit = async () => {
  await showPromise(
    axios.post('/api/register', data),
    {
      loading: 'Registering...',
      success: 'Registration successful!',
      error: 'Registration failed!'
    }
  );
};
```

### 3. API with Toast (Best for API calls)
```javascript
const handleLogin = async () => {
  try {
    const response = await apiWithToast(
      axios.post('/api/login', credentials),
      {
        loading: 'Logging in...',
        success: 'Login successful!',
        error: 'Login failed!'
      }
    );
    // Handle success response
    console.log(response.data);
  } catch (error) {
    // Error already shown in toast
    console.error(error);
  }
};
```

### 4. Dynamic Success Message from API Response
```javascript
const handleUpdate = async () => {
  await apiWithToast(
    axios.put('/api/update', data),
    {
      loading: 'Updating...',
      // No success message - will use API response message
    }
  );
};
```

### 5. Multiple API Calls
```javascript
const handleBulkOperation = async () => {
  const promises = items.map(item => 
    apiWithToast(
      axios.post('/api/process', item),
      {
        loading: `Processing ${item.name}...`,
        success: `${item.name} processed!`,
      }
    )
  );
  
  await Promise.all(promises);
};
```

## Migration from react-toastify

### Before (react-toastify)
```javascript
import { toast } from 'react-toastify';

const handleSubmit = async () => {
  const toastId = toast.loading('Processing...');
  try {
    const response = await axios.post('/api/register', data);
    toast.update(toastId, {
      render: 'Success!',
      type: 'success',
      isLoading: false,
    });
  } catch (error) {
    toast.update(toastId, {
      render: 'Failed!',
      type: 'error',
      isLoading: false,
    });
  }
};
```

### After (react-hot-toast)
```javascript
import { apiWithToast } from './utils/toast';

const handleSubmit = async () => {
  await apiWithToast(
    axios.post('/api/register', data),
    {
      loading: 'Processing...',
      success: 'Success!',
      error: 'Failed!'
    }
  );
};
```

## Benefits
- ✅ Cleaner code
- ✅ Automatic loading/success/error handling
- ✅ Less boilerplate
- ✅ Promise-based API
- ✅ Better error handling
