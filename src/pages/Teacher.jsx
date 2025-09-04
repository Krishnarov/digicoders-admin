import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Edit2, Trash2, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  TextField,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function Teacher() {
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    expertise: [],
  });
  const [editId, setEditId] = useState(null);
  const [teachers, setTeachers] = useState([]);

  // 🔹 Fetch all teachers
  const getAllTeachers = async () => {
    try {
      const res = await axios.get("/teachers");
      console.log(res);

      setTeachers(res.data.teachers || []); // backend se teachers return hote hain
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || error.message);
    }
  };

  useEffect(() => {
    getAllTeachers();
  }, []);

  // 🔹 Table Columns
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
    { label: "Teacher Name", accessor: "name" },
    { label: "Phone", accessor: "phone" },
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
  const toggleStatus = async (data) => {
    try {
      setLoading(`status-${data._id}`);
      const res = await axios.patch(`/teachers/${data._id}`, {
        isActive: !data.isActive,
      });
      // console.log(res);
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
      getAllTeachers();
    }
  };
  // 🔹 Handle Edit
  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      phone: row.phone,
      expertise: row.expertise || [],
    });
    setEditId(row._id);
    setOpen(true);
  };

  // 🔹 Handle Delete
  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/teachers/${id}`);

      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error deleting teacher:", error);
    } finally {
      setLoading("");
      getAllTeachers();
    }
  };

  // 🔹 Submit Form (Create / Update Teacher)
  const handleSubmit = async () => {
    try {
      setLoading("Save");
      let res;
      if (editId) {
        res = await axios.patch(`/teachers/${editId}`, formData);
      } else {
        res = await axios.post("/teachers/create", formData);
      }
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      getAllTeachers();
      handleClose();
    }
  };

  // 🔹 Close Modal
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", phone: "", expertise: [] });
    setEditId(null);
  };

  // 🔹 Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
   
      <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              Teachers
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
            Add New Teacher
          </Button>
        </div>

        {/* DataTable */}
        <DataTable columns={columns} data={teachers} loading={loading} />

        {/* Modal */}
        <CustomModal
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          title={editId ? "Edit Teacher" : "Add New Teacher"}
          submitText={editId ? "Update" : "Create"}
          loading={loading}
        >
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Teacher Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              required
            />
            <TextField
              label="Phone Number"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              required
            />

       
          </Stack>
        </CustomModal>
      </div>
 
  );
}

export default Teacher;
