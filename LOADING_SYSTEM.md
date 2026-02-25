# ERP Loading System Documentation

## Overview
This document explains the standardized loading system implemented across the ERP project. All components use consistent loading states and toast notifications.

## Components

### 1. LoadingComponents.jsx
Contains all loading-related components for consistent UI.

#### ButtonLoader
Generic button with loading state:
```jsx
import { ButtonLoader } from '../components/LoadingComponents';

<ButtonLoader 
  loading={isLoading} 
  loadingText="Saving..." 
  className="btn-primary"
  onClick={handleSave}
>
  Save Data
</ButtonLoader>
```

#### ActionButton
For specific actions (Accept, Reject, Delete, etc.):
```jsx
import { ActionButton } from '../components/LoadingComponents';
import { Check, X } from 'lucide-react';

<ActionButton
  className="px-2 py-1 rounded-md hover:bg-green-100 transition-colors border text-green-600"
  onClick={() => handleAccept(row._id)}
  loading={buttonLoading}
  loadingKey={`Accept-${row._id}`}
  currentLoadingKey={actionLoading}
  icon={Check}
  size={20}
/>
```

#### TableSkeleton
For data table loading states:
```jsx
import { TableSkeleton } from '../components/LoadingComponents';

// In DataTable component
{loading ? (
  <TableSkeleton columns={columns} rows={10} />
) : (
  // actual data rows
)}
```

#### PageLoader
Full page loading overlay:
```jsx
import { PageLoader } from '../components/LoadingComponents';

{isPageLoading && <PageLoader message="Loading dashboard..." />}
```

#### CardSkeleton
For dashboard cards and similar components:
```jsx
import { CardSkeleton } from '../components/LoadingComponents';

{loading ? (
  <CardSkeleton count={8} />
) : (
  // actual cards
)}
```

#### LoadingOverlay
For section-specific loading:
```jsx
import { LoadingOverlay } from '../components/LoadingComponents';

<LoadingOverlay loading={isLoading} message="Updating data...">
  <div>Your content here</div>
</LoadingOverlay>
```

### 2. Toast Utilities (utils/toast.js)
Centralized toast notifications using react-hot-toast.

#### Basic Usage:
```jsx
import { showSuccess, showError, showWarning, showInfo } from '../utils/toast';

// Success message
showSuccess("Data saved successfully!");

// Error message
showError("Failed to save data");

// Warning
showWarning("Please check your input");

// Info
showInfo("Processing your request");
```

#### API Response Handling:
```jsx
import { handleApiResponse, handleApiError } from '../utils/toast';

try {
  const response = await axios.post('/api/data', data);
  handleApiResponse(response, "Data created successfully");
} catch (error) {
  handleApiError(error, "Failed to create data");
}
```

#### Async Operations with Toast:
```jsx
import { withToast } from '../utils/toast';

const saveData = async () => {
  await withToast(
    () => axios.post('/api/data', data),
    "Saving data...",
    "Data saved successfully!",
    "Failed to save data"
  );
};
```

### 3. Loading Hooks (hooks/useLoading.js)

#### useLoading Hook:
```jsx
import { useLoading } from '../hooks/useLoading';

const MyComponent = () => {
  const { loading, loadingKey, startLoading, stopLoading, isLoading } = useLoading();

  const handleAction = async (id) => {
    try {
      startLoading(`action-${id}`);
      await performAction(id);
    } finally {
      stopLoading();
    }
  };

  return (
    <button disabled={isLoading(`action-${id}`)}>
      {isLoading(`action-${id}`) ? 'Loading...' : 'Click me'}
    </button>
  );
};
```

#### useMultipleLoading Hook:
```jsx
import { useMultipleLoading } from '../hooks/useLoading';

const MyComponent = () => {
  const { setLoading, isLoading } = useMultipleLoading();

  const handleAccept = async (id) => {
    try {
      setLoading(`accept-${id}`, true);
      await acceptItem(id);
    } finally {
      setLoading(`accept-${id}`, false);
    }
  };

  return (
    <button disabled={isLoading(`accept-${id}`)}>
      Accept
    </button>
  );
};
```

## Implementation Examples

### 1. Button Actions (Accept/Reject/Delete)
```jsx
import { ActionButton } from '../components/LoadingComponents';
import { showSuccess, handleApiError } from '../utils/toast';
import { useLoading } from '../hooks/useLoading';
import { Check, X } from 'lucide-react';

const MyComponent = () => {
  const [actionLoading, setActionLoading] = useState('');
  const { loading: buttonLoading, startLoading, stopLoading } = useLoading();

  const handleAccept = async (id) => {
    try {
      setActionLoading(`Accept-${id}`);
      startLoading(`Accept-${id}`);
      const response = await axios.patch(`/api/accept/${id}`);
      
      if (response.data.success) {
        showSuccess("Item accepted successfully");
        // Refresh data
      }
    } catch (error) {
      handleApiError(error, "Error accepting item");
    } finally {
      setActionLoading('');
      stopLoading();
    }
  };

  return (
    <ActionButton
      className="px-2 py-1 rounded-md hover:bg-green-100 transition-colors border text-green-600"
      onClick={() => handleAccept(row._id)}
      loading={buttonLoading}
      loadingKey={`Accept-${row._id}`}
      currentLoadingKey={actionLoading}
      icon={Check}
      size={20}
    />
  );
};
```

### 2. Data Table with Skeleton Loading
```jsx
import DataTable from '../components/DataTable';
import { TableSkeleton } from '../components/LoadingComponents';

const MyTableComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      // ... other props
    />
  );
};
```

### 3. Page with Loading States
```jsx
import { PageLoader, CardSkeleton } from '../components/LoadingComponents';
import { showSuccess, handleApiError } from '../utils/toast';

const Dashboard = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        await fetchDashboardData();
        showSuccess("Dashboard loaded successfully");
      } catch (error) {
        handleApiError(error, "Error loading dashboard");
      } finally {
        setPageLoading(false);
        setCardsLoading(false);
      }
    };

    loadData();
  }, []);

  if (pageLoading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  return (
    <div>
      {cardsLoading ? (
        <CardSkeleton count={8} />
      ) : (
        // Actual dashboard cards
      )}
    </div>
  );
};
```

## Best Practices

### 1. Consistent Loading States
- Always use the provided loading components
- Use ActionButton for all action buttons (Accept, Reject, Delete, etc.)
- Use TableSkeleton for data tables
- Use PageLoader for full page loading

### 2. Toast Notifications
- Use showSuccess for successful operations
- Use showError for errors
- Use handleApiError for API error handling
- Use withToast for async operations with loading states

### 3. Optimistic Updates
- For add/delete operations, update UI immediately
- Show loading state only for the specific item being modified
- Don't reload entire table for single item operations

### 4. Error Handling
- Always use try-catch blocks
- Use handleApiError for consistent error messages
- Log errors to console for debugging

### 5. Loading Keys
- Use unique loading keys for each action: `Accept-${id}`, `Delete-${id}`
- This allows multiple items to have independent loading states

## Migration Guide

### From Old Pattern:
```jsx
// OLD
const [loading, setLoading] = useState(false);

<button disabled={loading}>
  {loading ? <Loader2 className="animate-spin" /> : 'Save'}
</button>
```

### To New Pattern:
```jsx
// NEW
import { ButtonLoader } from '../components/LoadingComponents';
import { useLoading } from '../hooks/useLoading';

const { loading, startLoading, stopLoading } = useLoading();

<ButtonLoader loading={loading} loadingText="Saving...">
  Save
</ButtonLoader>
```

## Setup Requirements

1. Install react-toastify if not already installed:
```bash
npm install react-toastify
```

2. Add ToastContainer to your main.jsx (already done):
```jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// In your app
<ToastContainer />
```

3. Import and use the components as needed in your pages.

## File Structure
```
src/
├── components/
│   └── LoadingComponents.jsx
├── hooks/
│   └── useLoading.js
├── utils/
│   └── toast.js
└── pages/
    ├── AcceptFee.jsx (updated)
    ├── NewFee.jsx (updated)
    └── AllStudentReg.jsx (updated)
```

This system ensures consistent loading states and user feedback across the entire ERP application.