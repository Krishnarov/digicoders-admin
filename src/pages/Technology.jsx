import React, { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Edit2, Trash2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, Select, TextField } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import useGetTechnology from "../hooks/useGetTechnology";
import { useSelector } from "react-redux";

function Technology() {
  const data = useSelector((state) => state.technology.data);
  const fetchTechnology = useGetTechnology();
  useEffect(() => {
    fetchTechnology();
  }, []);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", duration: "" , price: ""});
  const [editId, setEditId] = useState(null);
  
  const columns = [
    { label: "ID", accessor: "id", filter: false },
    { label: "Technology Name", accessor: "name", filter: true },
    { label: "Training Type", accessor: "duration", filter: true },
    { label: "Price", accessor: "price", filter: true },
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
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${
                row.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ),
      filter: true,
    },
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<Edit2 size={16} />}
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (row) => {
    setFormData({ name: row.name, duration: row.duration });
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/technology/delete/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error deleting technology:", error);
    } finally {
      fetchTechnology();
    }
  };

  const toggleStatus = async (id) => {
    try {
      const item = data.find((item) => item._id === id);
      const newStatus = !item.isActive;

      await axios.put(
        `/technology/updateStatus/${id}`,
        {
          isActive: newStatus,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      fetchTechnology();
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.patch(`/technology/update/${editId}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post("/technology/create", formData, {
          withCredentials: true,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      fetchTechnology();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", duration: "" });
    setEditId(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-gray-50  py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              Technology
            </h1>
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="w-5 h-5 text-blue-600 mr-1" />
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
              <span>Dashboard</span>
            </Link>
          </div>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add New Technology
          </Button>
        </div>

        {/* DataTable */}
        <DataTable columns={columns} data={data} loading={loading} />

        {/* Modal */}
        <CustomModal
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          title={editId ? "Edit Technology" : "Add New Technology"}
          submitText={editId ? "Update" : "Create"}
        >
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Technology Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              autoFocus
            />
            <TextField
              select
              label="Duration"
              name="duration"
              variant="outlined"
              value={formData.duration || ""}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">
                <em>- Select Duration -</em>
              </MenuItem>
              <MenuItem value="45 days">45 days</MenuItem>
              <MenuItem value="28 days">28 days</MenuItem>
              <MenuItem value="6 months">6 months</MenuItem>
            </TextField>
             <TextField
              label="Price"
              name="price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
              variant="outlined"
              autoFocus
            />
          </Stack>
        </CustomModal>
      </div>
    </div>
  );
}

export default Technology;
