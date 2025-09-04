import React, { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Edit2, Trash2, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import useGetTechnology from "../hooks/useGetTechnology";
import { useSelector } from "react-redux";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function Technology() {
  const data = useSelector((state) => state.technology.data);
  const fetchTechnology = useGetTechnology();
  useEffect(() => {
    fetchTechnology();
  }, []);

  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
  });
  const [editId, setEditId] = useState(null);

  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
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
            {/* <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<Trash2 size={16} />}
            >
              {loading === `deleting-${row._id}` ? "Deleting..." : "Delete"}
            </Button> */}
            <Tooltip
              title={<span className="font-bold ">Delete</span>}
              placement="top"
            >
              <button
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                disabled={row.status === "rejected"}
              >
                {loading === `deleting-${row._id}` ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
        </div>
      ),
    },
    { label: "Technology Name", accessor: "name", filter: false },
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
            >
              {" "}
              {loading === `status-${row._id}` && (
                <Loader2 className="animate-spin w-4 h-4" />
              )}
            </span>
          </button>
        </div>
      ),
      filter: true,
    },
  ];

  const handleEdit = (row) => {
    setFormData({ name: row.name, duration: row.duration, price: row.price });
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(`deleting-${id}`);
    try {
      const res = await axios.delete(`/technology/delete/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error deleting technology:", error);
    } finally {
      fetchTechnology();
      setLoading("");
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(`status-${id}`);
      const item = data.find((item) => item._id === id);
      const newStatus = !item.isActive;

      const res = await axios.patch(
        `/technology/update/${id}`,
        {
          isActive: newStatus,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error toggling status:", error);
    } finally {
      fetchTechnology();
      setLoading("");
    }
  };

  const handleSubmit = async () => {
    try {
       setLoading("Save");
      let res;
      if (editId) {
        res = await axios.patch(`/technology/update/${editId}`, formData, {
          withCredentials: true,
        });
      } else {
        res = await axios.post("/technology/create", formData, {
          withCredentials: true,
        });
      }
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      handleClose();
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
 
      <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
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
          loading={loading}
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
    
  );
}

export default Technology;
