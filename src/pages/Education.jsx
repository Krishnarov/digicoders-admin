import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Edit2, Trash2, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetEducations from "../hooks/useGetEducations";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function Education() {
  const educations = useSelector((state) => state.education.data);
  const fetchEducations = useGetEducations();

  useEffect(() => {
    fetchEducations();
  }, []);

  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
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
            id={row._id}
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
    { label: "Education Name", accessor: "name" },
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
    setFormData({ name: row.name });
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/education/${id}?action=delete`);
      fetchEducations();
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error deleting education:", error);
    } finally {
      setLoading("");
      fetchEducations();
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(`status-${id}`);
      const item = educations.find((item) => item._id === id);
      const res = await axios.put(`/education/${id}?action=update`, {
        isActive: !item.isActive,
      });
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
      fetchEducations();
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
      fetchEducations();
    }
  };

  const handleSubmit = async () => {
    try {
       setLoading("Save");
      let res;
      if (editId) {
        res = await axios.put(`/education/${editId}?action=update`, formData);
      } else {
        res = await axios.post("/education?action=add", formData);
      }
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      fetchEducations();
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "" });
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
              Education
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
            Add New Education
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={educations}
          loading={loading}
          onStatusToggle={toggleStatus}
        />

        {/* Modal */}
        <CustomModal
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          title={editId ? "Edit Education" : "Add New Education"}
          submitText={editId ? "Update" : "Create"}
          loading={loading}
        >
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Education Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              autoFocus
              required
            />
          </Stack>
        </CustomModal>
      </div>
     
  );
}

export default Education;
