import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Edit2, Trash2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetEducations from "../hooks/useGetEducations";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

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
            {/* <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<Trash2 size={16} />}
              // onClick={() => handleDelete(row._id)}
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
                <Trash2 size={20} />
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
        </div>
      ),
    },
    { label: "Education Name", accessor: "name",  },
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
  ];

  const handleEdit = (row) => {
    setFormData({ name: row.name });
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      await axios.delete(`/education/${id}?action=delete`);
      fetchEducations();
    } catch (error) {
      console.error("Error deleting education:", error);
    } finally {
      setLoading("");
      fetchEducations();
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      const item = educations.find((item) => item._id === id);
      await axios.put(`/education/${id}?action=update`, {
        isActive: !item.isActive,
      });
      fetchEducations();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
      fetchEducations();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editId) {
        await axios.put(`/education/${editId}?action=update`, formData);
      } else {
        await axios.post("/education?action=add", formData);
      }
      handleClose();
      fetchEducations();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      fetchEducations();
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
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
    </div>
  );
}

export default Education;
