import React, { useState, useEffect } from 'react';
import { Check, X, Edit, Trash2, Plus } from 'lucide-react';
import { 
  ActionButton, 
  ButtonLoader, 
  PageLoader, 
  CardSkeleton, 
  LoadingOverlay,
  InlineLoader 
} from '../components/LoadingComponents';
import { 
  showSuccess, 
  showError, 
  apiWithToast
} from '../utils/toast';
import { useLoading, useMultipleLoading } from '../hooks/useLoading';
import DataTable from '../components/DataTable';

// Example component demonstrating all loading patterns
const LoadingExamplePage = () => {
  const [pageLoading, setPageLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [data, setData] = useState([]);

  // Using custom hooks
  const { loading: saveLoading, startLoading: startSave, stopLoading: stopSave } = useLoading();
  const { setLoading: setMultipleLoading, isLoading } = useMultipleLoading();

  // Mock data
  const mockData = [
    { _id: '1', name: 'John Doe', status: 'active', email: 'john@example.com' },
    { _id: '2', name: 'Jane Smith', status: 'pending', email: 'jane@example.com' },
    { _id: '3', name: 'Bob Johnson', status: 'inactive', email: 'bob@example.com' },
  ];

  // Table columns
  const columns = [
    {
      label: 'Actions',
      accessor: 'action',
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <ActionButton
            className="px-2 py-1 rounded-md hover:bg-green-100 transition-colors border text-green-600"
            onClick={() => handleAccept(row._id)}
            loading={isLoading(`accept-${row._id}`)}
            loadingKey={`accept-${row._id}`}
            currentLoadingKey={actionLoading}
            icon={Check}
            size={16}
          />
          <ActionButton
            className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
            onClick={() => handleReject(row._id)}
            loading={isLoading(`reject-${row._id}`)}
            loadingKey={`reject-${row._id}`}
            currentLoadingKey={actionLoading}
            icon={X}
            size={16}
          />
          <ActionButton
            className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
            onClick={() => handleEdit(row._id)}
            loading={isLoading(`edit-${row._id}`)}
            loadingKey={`edit-${row._id}`}
            currentLoadingKey={actionLoading}
            icon={Edit}
            size={16}
          />
          <ActionButton
            className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
            onClick={() => handleDelete(row._id)}
            loading={isLoading(`delete-${row._id}`)}
            loadingKey={`delete-${row._id}`}
            currentLoadingKey={actionLoading}
            icon={Trash2}
            size={16}
          />
        </div>
      ),
    },
    { label: 'Name', accessor: 'name', sortable: true },
    { label: 'Email', accessor: 'email', sortable: true },
    { 
      label: 'Status', 
      accessor: 'status', 
      Cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === 'active' ? 'bg-green-100 text-green-800' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
  ];

  // Simulate API calls
  const simulateApiCall = (delay = 2000) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: { success: true, message: 'Operation successful' } }), delay);
    });
  };

  // Action handlers
  const handleAccept = async (id) => {
    try {
      setActionLoading(`accept-${id}`);
      setMultipleLoading(`accept-${id}`, true);
      await simulateApiCall(1500);
      showSuccess(`Item ${id} accepted successfully`);
      // Update data optimistically
      setData(prev => prev.map(item => 
        item._id === id ? { ...item, status: 'active' } : item
      ));
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error accepting item");
    } finally {
      setActionLoading('');
      setMultipleLoading(`accept-${id}`, false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(`reject-${id}`);
      setMultipleLoading(`reject-${id}`, true);
      await simulateApiCall(1500);
      showError(`Item ${id} rejected`);
      // Update data optimistically
      setData(prev => prev.map(item => 
        item._id === id ? { ...item, status: 'inactive' } : item
      ));
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error rejecting item");
    } finally {
      setActionLoading('');
      setMultipleLoading(`reject-${id}`, false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setActionLoading(`edit-${id}`);
      setMultipleLoading(`edit-${id}`, true);
      await simulateApiCall(1000);
      showError(`Edit mode for item ${id}`);
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error editing item");
    } finally {
      setActionLoading('');
      setMultipleLoading(`edit-${id}`, false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(`delete-${id}`);
      setMultipleLoading(`delete-${id}`, true);
      await simulateApiCall(1500);
      showSuccess(`Item ${id} deleted successfully`);
      // Remove from data optimistically
      setData(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error deleting item");
    } finally {
      setActionLoading('');
      setMultipleLoading(`delete-${id}`, false);
    }
  };

  const handleSave = async () => {
    try {
      startSave();
      await simulateApiCall(2000);
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error saving data");
    } finally {
      stopSave();
    }
  };

  const handleAddNew = async () => {
    await apiWithToast(
      simulateApiCall(1500),
      {
        loading: 'Adding new item...',
        success: 'Item added successfully!',
        error: 'Failed to add item'
      }
    );
    
    // Add new item optimistically
    const newItem = {
      _id: Date.now().toString(),
      name: `New User ${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      status: 'pending'
    };
    setData(prev => [...prev, newItem]);
  };

  // Demo functions
  const loadPageData = async () => {
    setPageLoading(true);
    await simulateApiCall(2000);
    setPageLoading(false);
  };

  const loadCards = async () => {
    setCardsLoading(true);
    await simulateApiCall(1500);
    setCardsLoading(false);
  };

  const loadTable = async () => {
    setTableLoading(true);
    await simulateApiCall(1000);
    setData(mockData);
    setTableLoading(false);
  };

  const loadSection = async () => {
    setSectionLoading(true);
    await simulateApiCall(1500);
    setSectionLoading(false);
  };

  useEffect(() => {
    loadTable();
  }, []);

  if (pageLoading) {
    return <PageLoader message="Loading example page..." />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Loading System Examples</h1>

      {/* Button Examples */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Button Loading Examples</h2>
        <div className="flex gap-4 flex-wrap">
          <ButtonLoader
            loading={saveLoading}
            loadingText="Saving..."
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
          >
            Save Data
          </ButtonLoader>

          <ButtonLoader
            loading={false}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleAddNew}
          >
            <Plus size={16} className="mr-2" />
            Add New Item
          </ButtonLoader>

          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
            onClick={loadCards}
          >
            {cardsLoading ? <InlineLoader className="mr-2" /> : null}
            Load Cards
          </button>
        </div>
      </section>

      {/* Card Loading Examples */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Card Loading Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardsLoading ? (
            <CardSkeleton count={4} />
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-lg">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">1,234</p>
                <p className="text-sm text-gray-500">+12% from last month</p>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-lg">Active Sessions</h3>
                <p className="text-3xl font-bold text-green-600">567</p>
                <p className="text-sm text-gray-500">+5% from last month</p>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-lg">Pending Items</h3>
                <p className="text-3xl font-bold text-yellow-600">89</p>
                <p className="text-sm text-gray-500">-3% from last month</p>
              </div>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-semibold text-lg">Completed</h3>
                <p className="text-3xl font-bold text-purple-600">2,345</p>
                <p className="text-sm text-gray-500">+8% from last month</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Loading Overlay Example */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Loading Overlay Example</h2>
        <LoadingOverlay loading={sectionLoading} message="Updating section...">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Section Content</h3>
            <p className="text-gray-600 mb-4">
              This section demonstrates the loading overlay component. 
              Click the button below to see it in action.
            </p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={loadSection}
            >
              Load Section Data
            </button>
          </div>
        </LoadingOverlay>
      </section>

      {/* Data Table Example */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Table with Action Buttons</h2>
        <div className="mb-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={loadTable}
          >
            Reload Table
          </button>
        </div>
        <DataTable
          columns={columns}
          data={data}
          loading={tableLoading}
          pagination={false}
          search={false}
          filter={false}
        />
      </section>

      {/* Toast Examples */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Toast Notification Examples</h2>
        <div className="flex gap-4 flex-wrap">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => showSuccess('This is a success message!')}
          >
            Success Toast
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => showError('This is an error message!')}
          >
            Error Toast
          </button>
          <button
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            onClick={() => showError('This is a warning message!')}
          >
            Warning Toast
          </button>
        </div>
      </section>
    </div>
  );
};

export default LoadingExamplePage;