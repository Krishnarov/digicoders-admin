
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  Key,
  Save
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  MenuItem,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function Employee() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    email: "",
    password: "",
    role: "",
    branch: user?.role === "Admin" ? user?.branch : ""
  });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);

  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({});

  // Permission Modal State
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [employeePermissions, setEmployeePermissions] = useState([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Get branches based on user role
  const fetchBranches = async () => {
    try {
      const res = await axios.get("/branches");
      if (res.data.success) {
        let filteredBranches = res.data.data.filter((item) => item.isActive) || [];

        if (user?.role === "Admin" && user?.branch) {
          filteredBranches = filteredBranches.filter(branch =>
            branch._id === user.branch
          );
        }

        setBranches(filteredBranches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to fetch branches");
    }
  };

  // Memoized fetch function for employees
  const getAllEmployees = useCallback(async (search = "", newFilters = {}, sortBy = "", sortOrder = "") => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      Object.keys(newFilters).forEach((key) => {
        if (newFilters[key] && newFilters[key] !== "All") {
          params.append(key, newFilters[key]);
        }
      });

      if (sortBy && sortOrder) {
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
      }

      params.append("page", pagination.page);
      params.append("limit", pagination.limit);

      const res = await axios.get(`/auth/getall?${params.toString()}`);
      if (res.data.success) {
        let filteredEmployees = res.data.data || [];

        if (user?.role === "Admin") {
          filteredEmployees = filteredEmployees.filter(emp =>
            emp.branch?._id === user.branch
          );
        }

        setEmployees(filteredEmployees);
        setPagination(prev => ({
          ...prev,
          total: filteredEmployees.length,
          pages: Math.ceil(filteredEmployees.length / pagination.limit),
        }));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error(error.response?.data?.message || "Failed to fetch employees");
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit, user]);

  // Fetch all permissions
  const fetchAllPermissions = async () => {
    try {
      setPermissionLoading(true);
      const response = await axios.get('/permissions/all');


      if (response.data.success) {
        setPermissions(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to fetch permissions");
    } finally {
      setPermissionLoading(false);
    }
  };

  // Fetch employee permissions
  const fetchEmployeePermissions = async (employeeId) => {
    try {
      const response = await axios.get(`/permissions/employee/${employeeId}`);


      if (response.data.success) {
        const empPerms = response.data.data?.permissions || [];
        setEmployeePermissions(empPerms.map(p => p._id));
      }
    } catch (error) {
      console.error("Error fetching employee permissions:", error);
      toast.error("Failed to fetch employee permissions");
    }
  };

  // Open permission modal
  const handleOpenPermissionModal = async (employee) => {

    setSelectedEmployee(employee);
    setPermissionModalOpen(true);
    await fetchAllPermissions();
    await fetchEmployeePermissions(employee._id);
  };

  // Close permission modal
  const handleClosePermissionModal = () => {
    setPermissionModalOpen(false);
    setSelectedEmployee(null);
    setEmployeePermissions([]);
  };

  // Toggle permission selection
  const handlePermissionToggle = (permissionId) => {
    setEmployeePermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Save permissions
  const handleSavePermissions = async () => {
    try {
      setSavingPermissions(true);

      const response = await axios.post('/permissions/assign', {
        employeeId: selectedEmployee._id,
        permissionIds: employeePermissions
      });



      if (response.data.success) {
        toast.success(response.data.message || "Permissions updated successfully");
        handleClosePermissionModal();
      }
    } catch (error) {
      console.error("Error saving permissions:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update permissions");
    } finally {
      setSavingPermissions(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBranches();
    getAllEmployees();
  }, [user]);

  const columns = useMemo(() => [
    {
      label: "Action",
      accessor: "action",
      sortable: false,
      show: true,
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip title="Edit" placement="top">
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
              onClick={() => handleEdit(row)}
              disabled={user?.role === "Admin" && row.role === "Admin"}
            >
              <Edit2 size={20} />
            </button>
          </Tooltip>

          {user?.role !== "Admin" || row.role !== "Admin" ? (
            <DeleteConfirmationModal
              id={row._id}
              itemName={row.name}
              onConfirm={() => handleDelete(row._id)}
              loading={loading}
            >
              <Tooltip title="Delete" placement="top">
                <button
                  className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                  disabled={loading === `deleting-${row._id}`}
                >
                  {loading === `deleting-${row._id}` ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </Tooltip>
            </DeleteConfirmationModal>
          ) : null}

          {/* Permission Button - Only for Employee role */}
          {row.role === "Employee" && (
            <Tooltip title="Manage Permissions">
              <button
                className="px-2 py-1 rounded-md hover:bg-purple-100 transition-colors border text-purple-600"
                onClick={() => handleOpenPermissionModal(row)}
              >
                <Key size={20} />
              </button>
            </Tooltip>
          )}
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
      FilterComponent: ({ value, onChange }) => {
        const roleOptions = user?.role === "Admin"
          ? ["All", "Employee"]
          : ["All", "Super Admin", "Admin", "Employee"];

        return (
          <select
            value={value || "All"}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {roleOptions.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        );
      },
    },
    {
      label: "Branch",
      accessor: "branch.name",
      sortable: true,
      filter: false,
      Cell: ({ row }) => row.branch?.name || "No Branch",
    },
    {
      label: "Profile Image",
      accessor: "image",
      sortable: false,
      Cell: ({ row }) =>
        row.image?.url ? (
          <img
            src={`${import.meta.env.VITE_BASE_URI || ""}${row.image.url}`}
            alt="Profile"
            className="h-12 w-12 object-cover rounded-full"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/48";
            }}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-xs">No Image</span>
          </div>
        ),
    },
    {
      label: "Status",
      accessor: "isActive",
      sortable: true,
      filter: true,
      FilterComponent: ({ value, onChange }) => (
        <select
          value={value || "All"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="All">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      ),
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className={`ml-2 text-sm font-medium ${row.isActive ? "text-green-600" : "text-red-600"}`}>
            {row.isActive ? "Active" : "Inactive"}
          </span>
          {user?.role !== "Admin" || row.role !== "Admin" ? (
            <button
              onClick={() => toggleStatus(row)}
              disabled={loading === `status-${row._id}`}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${row.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md flex items-center justify-center ${row.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
              >
                {loading === `status-${row._id}` && (
                  <Loader2 className="animate-spin w-3 h-3" />
                )}
              </span>
            </button>
          ) : null}
        </div>
      ),
    },
  ], [loading, user]);

  const handleEdit = (row) => {
    setFormData({
      name: row.name || "",
      email: row.email || "",
      password: "",
      role: row.role || "",
      branch: row.branch?._id || user?.branch || "",
      image: null,
    });

    if (row.image?.url) {
      setPreview(`${import.meta.env.VITE_BASE_URI || ""}${row.image.url}`);
    } else {
      setPreview(null);
    }

    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/auth/delete/${id}`);

      if (res.data.success) {
        toast.success(res.data.message || "Employee deleted successfully");
        getAllEmployees();
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error.response?.data?.message || "Failed to delete employee");
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
      toast.error(error.response?.data?.message || "Failed to update status");
      console.error("Error toggling status:", error);
    } finally {
      setLoading("");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!editId && !formData.password.trim()) {
      toast.error("Password is required for new employees");
      return;
    }

    if (user?.role === "Admin" && formData.role !== "Employee") {
      toast.error("Admin can only create Employee role");
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
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Failed to save employee");
    } finally {
      setLoading("");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      image: null,
      email: "",
      password: "",
      role: "",
      branch: user?.role === "Admin" ? user?.branch : ""
    });
    setPreview(null);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast.error("Please select an image file");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }

        setFormData(prev => ({ ...prev, image: file }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (name === "role") {
      if (user?.role === "Admin" && value !== "Employee") {
        toast.error("Admin can only create Employee role");
        return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreview(null);
  };

  // Group permissions by category for display
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});
  }, [permissions]);

  const canAddEmployee = user?.role === "Super Admin" || user?.role === "Admin";

  return (
    <div className="max-w-sm md:max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            {user?.role === "Admin" ? "My Branch Employees" : "Manage Employees"}
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

        {canAddEmployee && (
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add New Employee
          </Button>
        )}
      </div>

      {/* Info Box for Admin */}
      {/* {user?.role === "Admin" && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Admin Access Information</h3>
          <p className="text-blue-700">
            You can only manage employees in your branch and assign them specific permissions.
          </p>
        </div>
      )} */}

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={employees}
        loading={tableLoading}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        pages={pagination.pages}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
      />

      {/* Permission Modal */}
      <Dialog
        open={permissionModalOpen}
        onClose={handleClosePermissionModal}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <div className="flex items-center gap-2">
            <Key size={24} />
            <span>Manage Permissions - {selectedEmployee?.name}</span>
          </div>
        </DialogTitle>

        <DialogContent dividers>
          {permissionLoading ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress />
            </div>
          ) : (
            <>
              {/* Employee Info */}
              <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Employee Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedEmployee?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedEmployee?.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Role:</strong> {selectedEmployee?.role}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Branch:</strong> {selectedEmployee?.branch?.name || "No Branch"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Permissions Selection */}
              <Typography variant="h6" gutterBottom>
                Select Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select the permissions you want to assign to this employee.
                The employee will only see menu items they have permission for.
              </Typography>

              {Object.keys(groupedPermissions).length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Key size={48} sx={{ color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No permissions available. Please contact Super Admin.
                  </Typography>
                </Box>
              ) : (
                Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <Card key={category} sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{
                        fontWeight: 'bold',
                        color: 'primary.main',
                        textTransform: 'uppercase'
                      }}>
                        {category.replace(/_/g, ' ')}
                      </Typography>
                      <Grid container spacing={2}>
                        {categoryPermissions.map(permission => (
                          <Grid item xs={12} sm={6} md={4} key={permission._id}>
                            <Card
                              variant="outlined"
                              sx={{
                                height: '100%',
                                borderColor: employeePermissions.includes(permission._id) ? 'primary.main' : 'grey.300'
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={employeePermissions.includes(permission._id)}
                                      onChange={() => handlePermissionToggle(permission._id)}
                                      color="primary"
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {permission.name.replace(/_/g, ' ')}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {permission.description}
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{ width: '100%', m: 0 }}
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Selected Permissions Count */}
              {employeePermissions.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    <strong>{employeePermissions.length}</strong> permission(s) selected
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClosePermissionModal}
            color="inherit"
            disabled={savingPermissions}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            color="primary"
            startIcon={savingPermissions ? <CircularProgress size={20} /> : <Save size={20} />}
            disabled={savingPermissions || permissionLoading}
          >
            {savingPermissions ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Add/Edit Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editId ? "Edit Employee" : "Add New Employee"}
        submitText={editId ? "Update" : "Create"}
        loading={loading === "Save"}
        submitDisabled={loading === "Save"}
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
            disabled={user?.role === "Admin" && editId}
          >
            <MenuItem value="">
              <em>- Select Role -</em>
            </MenuItem>
            {/* {user?.role === "Admin" && (
              <MenuItem value="Employee">Employee</MenuItem>
            )} */}

            <MenuItem value="Super Admin">Super Admin</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Employee">Employee</MenuItem>


          </TextField>

          <TextField
            select
            label="Branch *"
            name="branch"
            fullWidth
            value={formData.branch}
            onChange={handleChange}
            variant="outlined"
            required={formData.role !== "Super Admin"}
            disabled={user?.role === "Admin"}
          >
            <MenuItem value="">
              <em>- Select Branch -</em>
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.name}
              </MenuItem>
            ))}
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
              <div className="mt-4 relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover border rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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