import React, { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Home, ChevronRight } from "lucide-react";
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

function TrainingType() {
  const data = useSelector((state) => state.tranning.data);
  const fetchTranningData = useGetTranning();

  // const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", duration: "" });
  const [editId, setEditId] = useState(null);

  // Debounced handleChange for smoother typing
  const handleChange = debounce((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, 100);

  // Immediate update for better UX
  const handleImmediateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await axios.delete(`/training/delete/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      fetchTranningData();
    }
  };

  const toggleStatus = async (id) => {
    try {
      const item = data.find((item) => item._id === id);
      const newStatus = !item.isActive;

      await axios.patch(
        `/training/update/${id}`,
        {
          isActive: newStatus,
        },
        {
          withCredentials: true,
        }
      );

      fetchTranningData()
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        // Update existing
        await axios.patch(`/training/update/${editId}`, formData, {
          withCredentials: true,
        });
      } else {
        // Create new
        await axios.post("/training/create", formData, {
          withCredentials: true,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      fetchTranningData();
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
          {/* <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<Edit2 size={16} />}
            onClick={() => handleEdit(row)}
            className="flex items-center gap-1"
          >
            Edit
          </Button> */}
          <Tooltip
            title={<span className="font-bold ">Edit</span>}
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
            id={row.id}
            itemName={row.name}
            onConfirm={() => handleDelete(row._id)}
            loading={loading}
          >
            <Tooltip
              title={<span className="font-bold ">Delete</span>}
              placement="top"
            >
              <button
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                disabled={row.status === "rejected"}
              >
                <Trash2 size={20} />
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
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${
                row.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
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
    fetchTranningData(); // ✅ sirf ek baar
  }, []);
  return (
    <div className="bg-gray-50 ">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
        <DataTable columns={columns} data={data} loading={loading} />

        {/* Modal */}
        <CustomModal
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          title={editId ? "Edit Training" : "Add New Training"}
          submitText={editId ? "Update" : "Create"}
        >
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Training Name"
              name="name"
              fullWidth
              value={formData?.name}
              onChange={handleImmediateChange}
              onBlur={handleChange}
              variant="outlined"
              autoFocus
            />

            <TextField
              select
              label="Duration"
              name="duration"
              fullWidth
              value={formData?.duration}
              onChange={handleImmediateChange}
              onBlur={handleChange}
              variant="outlined"
            >
              <MenuItem value="">
                <em>- Select Duration -</em>
              </MenuItem>
              <MenuItem value="45 days">45 days</MenuItem>
              <MenuItem value="28 days">28 days</MenuItem>
              <MenuItem value="6 months">6 months</MenuItem>
            </TextField>
          </Stack>
        </CustomModal>
      </div>
    </div>
  );
}

export default TrainingType;
