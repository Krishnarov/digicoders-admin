import React, { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Edit2, Trash2, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function Employee() {
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    email: "",
    password: "",
    role: "",
    branch: ""
  });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [branchs, setBranch] = useState([]);

  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({});

  // Memoized fetch function for employees
  const getAllEmployees = useCallback(async (search = "", newFilters = {}, sortBy = "", sortOrder = "") => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();

      // Add search if provided
      if (search) {
        params.append("search", search);
      }

      // Add filters
      Object.keys(newFilters).forEach((key) => {
        if (newFilters[key] && newFilters[key] !== "All") {
          params.append(key, newFilters[key]);
        }
      });

      // Add sorting
      if (sortBy && sortOrder) {
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
      }

      // Add pagination params
      params.append("page", pagination.page);
      params.append("limit", pagination.limit);

      const res = await axios.get(`/auth/getall?${params.toString()}`);
      if (res.data.success) {
        setEmployees(res.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total || 0,
          pages: res.data.pages || 1,
        }));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Fetch active batches
  const fetchBranches = async () => {
    try {
      const res = await axios.get("/branches");
      console.log(res);

      if (res.data.success) {
        setBranch(res.data.data.filter((item) => item.isActive) || []);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };
  // Initial fetch
  useEffect(() => {
    getAllEmployees();
    fetchBranches()
  }, [getAllEmployees]);

  const columns = [
    {
      label: "Action",
      accessor: "action",
      sortable: false,
      show: true,
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
                disabled={loading === `deleting-${row._id}`}
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
    {
      label: "Name",
      accessor: "name",
      sortable: true
    },
    {
      label: "Email",
      accessor: "email",
      sortable: true
    },
    {
      label: "Role",
      accessor: "role",
      sortable: true,
      filter: true,
    },
    {
      label: "branch",
      accessor: "branch.name",
      sortable: true,
      filter: false,
    },
    {
      label: "Profile Image",
      accessor: "image",
      sortable: false,
      Cell: ({ row }) =>
        row.image?.url ? (
          <img
            src={`${import.meta.env.VITE_BASE_URI}${row.image.url}`}
            alt="Profile"
            className="h-12 w-12 object-cover rounded-full"
          />
        ) : (
          "No Image"
        ),
    },
    {
      label: "Status",
      accessor: "isActive",
      sortable: true,
      filter: true,
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className="ml-2 text-sm font-medium text-gray-700">
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row)}
            disabled={loading === `status-${row._id}`}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${row.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${row.isActive ? "translate-x-6" : "translate-x-1"
                }`}
            >
              {loading === `status-${row._id}` && (
                <Loader2 className="animate-spin w-4 h-4" />
              )}
            </span>
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (row) => {


    setFormData({
      name: row.name,
      email: row.email,
      password: "", // Don't prefill password for security
      role: row.role,
      branch: row.branch?._id,
      image: null,
    });
    setPreview(row.image?.url); // Set preview if image exists
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/auth/delete/${id}`);

      if (res.data.success) {
        toast.success(res.data.message || "Successfully deleted");
        getAllEmployees();
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading("");
    }
  };

  const toggleStatus = async (data) => {
    try {
      setLoading(`status-${data._id}`);
      const res = await axios.put(`/auth/update/${data._id}`, {
        isActive: !data.isActive,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");
        getAllEmployees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error toggling status:", error);
    } finally {
      setLoading("");
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!editId && !formData.password.trim()) {
      toast.error("Password is required for new employees");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("branch", formData.branch);

    if (formData.password) {
      formDataToSend.append("password", formData.password);
    }

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      setLoading("Save");
      let res;
      if (editId) {
        res = await axios.put(`/auth/update/${editId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.post("/auth/register", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        getAllEmployees();
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
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

  // Handle search from DataTable
  const handleSearch = useCallback(
    (searchTerm) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllEmployees(searchTerm, filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllEmployees, filters, sortConfig]
  );

  // Handle sort from DataTable
  const handleSort = useCallback(
    (column, order) => {
      setSortConfig({ sortBy: column, sortOrder: order });
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllEmployees("", filters, column, order);
    },
    [getAllEmployees, filters]
  );

  // Handle filter from DataTable
  const handleFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllEmployees("", newFilters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllEmployees, sortConfig]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      setPagination((prev) => ({ ...prev, page }));
      getAllEmployees("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllEmployees, filters, sortConfig]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (limit) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      getAllEmployees("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllEmployees, filters, sortConfig]
  );
  console.log(employees);

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
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
        mode="server"
        columns={columns}
        data={employees}
        loading={tableLoading}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onLimitChange={handleRowsPerPageChange}
        onSortChange={handleSort}
        onFilterChange={handleFilter}
        onSearch={handleSearch}
      />

      {/* Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editId ? "Edit Employee" : "Add New Employee"}
        submitText={editId ? "Update" : "Create"}
        loading={loading === "Save"}
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Name *"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            required
          />
          <TextField
            label="Email *"
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
            required={!editId}
            helperText={editId ? "Leave blank to keep current password" : "Required for new employee"}
          />
          <TextField
            select
            label="Role *"
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
          <TextField
            select
            label="Branch *"
            name="branch"
            fullWidth
            value={formData.branch}
            onChange={handleChange}
            variant="outlined"
            required
          >
            <MenuItem value="">
              <em>- Select branch -</em>
            </MenuItem>
            {branchs.map((branch) => (<MenuItem key={branch._id} value={branch._id}>{branch.name}</MenuItem>))}
            {/* <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Employee">Employee</MenuItem>
            <MenuItem value="Intern">Intern</MenuItem> */}
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
  );
}

export default Employee;