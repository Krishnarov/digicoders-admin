import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Edit2, Trash2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

function Employee() {
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    image: null, 
    email: "", 
    password: "", 
    role: "" 
  });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [employees, setEmployees] = useState([]);

  const getAllEmployees = async () => {
    try {
      const res = await axios.get("/auth/getall");
      setEmployees(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllEmployees();
  }, []);

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
              <button className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600">
                <Trash2 size={20} />
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
        </div>
      ),
    },
    { label: "Name", accessor: "name" },
    { label: "Email ", accessor: "email" },
    { label: "Role ", accessor: "role" },
    {
      label: "Profile Image",
      accessor: "image",
      Cell: ({ row }) => (
        row.image?.url ? (
          <img 
            src={row.image.url} 
            alt="Profile" 
            className="h-12 w-12 object-cover rounded-full"
          />
        ) : "No Image"
      )
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
            onClick={() => toggleStatus(row)}
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
    setFormData({ 
      name: row.name, 
      email: row.email, 
      password: "", // Don't prefill password for security
      role: row.role, 
      image: null 
    });
    setPreview(row.image?.url); // Set preview if image exists
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      await axios.delete(`/auth/delete/${id}`);
      getAllEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setLoading("");
    }
  };

  const toggleStatus = async (data) => {
    try {
      setLoading(true);
      await axios.put(`/auth/update/${data._id}`, {
        isActive: !data.isActive,
      });
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
      getAllEmployees();
    }
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("role", formData.role);
    
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      setLoading(true);
      if (editId) {
        // For update, use the correct endpoint and method
        await axios.put(`/auth/update/${editId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // For create, use the register endpoint
        await axios.post("/auth/register", formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      getAllEmployees();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", image: null, email: "", password: "", role: "" });
    setPreview(null);
    setEditId(null);
  };

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreview(null);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              Manage Employee
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
            Add New Employee
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={employees}
          loading={loading}
        />

        {/* Modal */}
        <CustomModal
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          title={editId ? "Edit Employee" : "Add New Employee"}
          submitText={editId ? "Update" : "Create"}
          loading={loading}
        >
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              required={!editId} // Password required only for new employees
              helperText={editId ? "Leave blank to keep current password" : ""}
            />
            <TextField
              select
              label="Role"
              name="role"
              fullWidth
              value={formData.role}
              onChange={handleChange}
              variant="outlined"
              required
            >
              <MenuItem value="">
                <em>- Select Role -</em>
              </MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="Intern">Intern</MenuItem>
            </TextField>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />

              {preview && (
                <div className="mt-2 relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-32 object-contain border rounded"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -mt-2 -mr-2 hover:bg-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </Stack>
        </CustomModal>
      </div>
    </div>
  );
}

export default Employee;