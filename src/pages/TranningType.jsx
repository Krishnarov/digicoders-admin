import React, { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Home, ChevronRight, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { debounce } from "lodash";
import useGetTranning from "../hooks/useGetTranning";
import { useSelector } from "react-redux";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function TrainingType() {
  const data = useSelector((state) => state.tranning.data);
  const paginationData = useSelector((state) => state.tranning.pagination); // Access pagination from Redux
  const fetchTranningData = useGetTranning();

  const [loading, setLoading] = useState({
    table: false,
    save: false,
    delete: null,
    status: null
  });
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", duration: "" });
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durations, setDurations] = useState([]);

  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ column: "createdAt", order: "desc" });

  // Sync Redux pagination total with local state if needed, or just use Redux state.
  // Using local state for control (page/limit inputs) and Redux for display/total.
  useEffect(() => {
    if (paginationData) {
      setPagination(prev => ({
        ...prev,
        total: paginationData.total || 0,
        page: paginationData.page || prev.page, // optionally sync page if server adjusts it
      }));
    }
  }, [paginationData]);


  const loadData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, table: true }));
      // Execute the hook function with params
      await fetchTranningData({
        page: pagination.page,
        limit: pagination.limit,
        search: search,
        sortBy: sortConfig.column,
        sortOrder: sortConfig.order,
        ...filters
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load training data");
    } finally {
      setLoading(prev => ({ ...prev, table: false }));
    }
  }, [fetchTranningData, pagination.page, pagination.limit, search, sortConfig, filters]);

  // Fetch data when dependencies change
  // Note: useGetTranning hook usually auto-runs on mount without params (legacy).
  // We want to run it with params.
  // The hook does: useEffect(() => { fetchTranning() }, [fetchTranning]) which runs it without params.
  // This might cause a double fetch or a "get all" then "get page 1".
  // Since we can't easily change the hook's auto-effect without affecting others easily (unless we add a prop to hook),
  // we'll just live with the initial "get all" (which sets data) and then our useEffect here will override it with "get page 1".
  // Ideally, we optimize the hook later.
  useEffect(() => {
    loadData();
  }, [loadData]);


  // Optimized debounce function for form
  const debouncedHandleChange = useCallback(
    debounce((name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }, 300),
    []
  );

  const fetchDurations = async () => {
    try {
      const response = await axios.get("/duration"); // API endpoint
      if (response.data.success) {
        setDurations(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch durations");
      }
    } catch (error) {
      console.error("Error fetching durations:", error);
      toast.error(error.response?.data?.message || "Failed to load duration data");
    }
  };

  useEffect(() => {
    fetchDurations();
  }, []);

  const handleImmediateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    debouncedHandleChange(name, value);
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      duration: row.duration?._id,
    });
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(prev => ({ ...prev, delete: id }));
      const res = await axios.delete(`/training/delete/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        // Refresh data immediately after delete
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete");
    } finally {
      setLoading(prev => ({ ...prev, delete: null }));
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(prev => ({ ...prev, status: id }));
      const item = data.find((item) => item._id === id);
      const newStatus = !item.isActive;

      const res = await axios.patch(
        `/training/update/${id}`,
        {
          isActive: newStatus,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");
        // Refresh data immediately after status change
        await loadData();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update status");
    } finally {
      setLoading(prev => ({ ...prev, status: null }));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setLoading(prev => ({ ...prev, save: true }));

      // Validate form data
      if (!formData.name.trim()) {
        toast.error("Please enter training name");
        return;
      }
      if (!formData.duration) {
        toast.error("Please select duration");
        return;
      }

      let res;
      if (editId) {
        // Update existing
        res = await axios.patch(`/training/update/${editId}`, formData, {
          withCredentials: true,
        });
      } else {
        // Create new
        res = await axios.post("/training/create", formData, {
          withCredentials: true,
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || "Saved successfully");
        // Refresh data immediately after save
        await loadData();
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", duration: "" });
    setEditId(null);
  };

  const handleOpen = () => {
    setOpen(true);
    setFormData({ name: "", duration: "" });
    setEditId(null);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Handle sort change
  const handleSort = (column, order) => {
    setSortConfig({ column, order });
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
  };
  console.log(durations);

  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip
            title={<span className="font-bold">Edit</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
              onClick={() => handleEdit(row)}
            >
              <Edit2 size={20} />
            </button>
          </Tooltip>
          <DeleteConfirmationModal
            id={row._id}
            itemName={row.name}
            onConfirm={() => handleDelete(row._id)}
            loading={loading.delete === row._id}
          >
            <Tooltip
              title={<span className="font-bold">Delete</span>}
              placement="top"
            >
              <button
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading.delete === row._id}
              >
                {loading.delete === row._id ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
        </div>
      ),
    },
    {
      label: "Training Name",
      accessor: "name",
    },
    {
      label: "Duration",
      accessor: "duration.name",
      filter: false,
    },
    {
      label: "Status",
      accessor: "isActive",
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className={`ml-2 text-sm font-medium ${row.isActive ? "text-green-600" : "text-gray-600"}`}>
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row._id)}
            disabled={loading.status === row._id}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none disabled:opacity-50 ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${row.isActive ? "translate-x-6" : "translate-x-1"}`}
            />
            {loading.status === row._id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      ),
      filter: false,
      sortable: true,
      filterOptions: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" }
      ],
      filterKey: "status"
    },
  ];



  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center text-gray-600 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-500 pr-5">
              Training Type
            </h1>
            <Link
              to="/dashboard"
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              <Home className="w-5 h-5 text-blue-600" />
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-gray-800">Dashboard</span>
            </Link>
          </div>
          <div>
            <Button
              variant="contained"
              onClick={handleOpen}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New
            </Button>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={data}
        loading={loading.table}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onLimitChange={handleRowsPerPageChange}
        onSortChange={handleSort}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        filters={filters}
        pagination={true}
        search={true}
        filter={true}
        sort={true}
      />

      {/* Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        loading={loading.save}
        title={editId ? "Edit Training" : "Add New Training"}
        submitText={editId ? "Update" : "Create"}
        submitDisabled={isSubmitting}
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Training Name"
            name="name"
            fullWidth
            value={formData?.name}
            onChange={handleImmediateChange}
            variant="outlined"
            autoFocus
            required
            helperText={!formData.name.trim() ? "Training name is required" : ""}
            disabled={loading.save}
          />

          <FormControl fullWidth>
            <InputLabel id="duration-label">Duration *</InputLabel>
            <Select
              labelId="duration-label"
              label="Duration"
              name="duration"
              value={formData?.duration}
              onChange={handleImmediateChange}
              variant="outlined"

              disabled={loading.save}
            >
              {durations.map((d) => (
                <MenuItem value={d._id} key={d._id}>{d.name}</MenuItem>
              ))}

            </Select>
            {!formData.duration && (
              <div className="text-red-500 text-xs mt-1 ml-4">
                Duration is required
              </div>
            )}
          </FormControl>
        </Stack>
      </CustomModal>
    </div>
  );
}

export default TrainingType;

