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

  // Optimized debounce function
  const debouncedHandleChange = useCallback(
    debounce((name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }, 300),
    []
  );

  const handleImmediateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    debouncedHandleChange(name, value);
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      duration: row.duration,
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
        await fetchTranningData();
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
        await fetchTranningData();
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
        await fetchTranningData();
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
      accessor: "duration",
      filter: true,
    },
    {
      label: "Status",
      accessor: "isActive",
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className="ml-2 text-sm font-medium text-gray-700">
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row._id)}
            disabled={loading.status === row._id}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-50 ${
              row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${
                row.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
            {loading.status === row._id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin w-3 h-3 text-white" />
              </div>
            )}
            <span className="sr-only">
              {row.isActive ? "Active" : "Inactive"}
            </span>
          </button>
        </div>
      ),
      filter: true,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(prev => ({ ...prev, table: true }));
        await fetchTranningData();
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load training data");
      } finally {
        setLoading(prev => ({ ...prev, table: false }));
      }
    };
    
    loadData();
  }, []);

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
      <DataTable columns={columns} data={data} loading={loading.table} />

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
            error={!formData.name.trim()}
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
              error={!formData.duration}
              disabled={loading.save}
            >
              <MenuItem value="">
                <em>- Select Duration -</em>
              </MenuItem>
              <MenuItem value="45 days">45 days</MenuItem>
              <MenuItem value="28 days">28 days</MenuItem>
              <MenuItem value="6 months">6 months</MenuItem>
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