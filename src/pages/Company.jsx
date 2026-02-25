import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  Building2,
  Phone,
  Smartphone,
  User,
  Globe,
} from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { showSuccess, showError, apiWithToast } from "../utils/toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

function Company() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mobile: "",
    contactNumber: "",
    contactPersonName: "",
    address: "",
    city: "",
    state: "",
    website: "",
    industry: "",
    description: "",
  });

  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({});

  // Memoized fetch function for companies
  const fetchCompanies = useCallback(async (search = "", newFilters = {}, sortBy = "", sortOrder = "") => {
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

      const res = await axios.get(`/companies?${params.toString()}`);
      if (res.data.success) {
        setData(res.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total || 0,
          pages: res.data.pages || 1,
        }));
      }
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to fetch companies");
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchIndustries = useCallback(async () => {
    try {
      const res = await axios.get("/industries?limit=100&isActive=true");
      if (res.data.success) {
        setIndustries(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching industries:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCompanies();
    fetchIndustries();
  }, [fetchCompanies, fetchIndustries]);

  const columns = [
    {
      label: "Action",
      accessor: "action",
      sortable: false,
      show: true,
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip title={<span className="font-bold">Edit</span>} placement="top">
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
              onClick={() => handleEdit(row)}
              disabled={loading === `status-${row.id || row._id}`}
            >
              <Edit2 size={20} />
            </button>
          </Tooltip>

          <DeleteConfirmationModal
            id={row.id || row._id}
            itemName={row.name}
            onConfirm={() => handleDelete(row.id || row._id)}
            loading={loading === `deleting-${row.id || row._id}`}
          >
            <Tooltip title={<span className="font-bold">Delete</span>} placement="top">
              <button
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                disabled={loading === `deleting-${row.id || row._id}` || loading === `status-${row.id || row._id}`}
              >
                {loading === `deleting-${row.id || row._id}` ? (
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
      label: "Company Name",
      accessor: "name",
      sortable: true
    },
    {
      label: "Email",
      accessor: "email",
      sortable: true,
      filter: true,
    },
    {
      label: "Contact Person",
      accessor: "contactPersonName",
      sortable: true,
      filter: true,
      Cell: ({ row }) => row.contactPersonName || "N/A"
    },
    {
      label: "Industry",
      accessor: "industry",
      sortable: true,
      filter: true,
    },
    {
      label: "Phone",
      accessor: "phone",
      sortable: true,
      filter: true,
      Cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.phone || "N/A"}</span>
          {row.mobile && <span className="text-xs text-gray-500">M: {row.mobile}</span>}
        </div>
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
            disabled={loading === `status-${row.id || row._id}`}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${row.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${row.isActive ? "translate-x-6" : "translate-x-1"
                }`}
            >
              {loading === `status-${row.id || row._id}` && (
                <Loader2 className="animate-spin w-4 h-4" />
              )}
            </span>
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (row) => {
    setEditId(row.id || row._id);
    setFormData({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      mobile: row.mobile || "",
      contactNumber: row.contactNumber || "",
      contactPersonName: row.contactPersonName || "",
      address: row.address || "",
      city: row.city || "",
      state: row.state || "",
      website: row.website || "",
      industry: row.industry || "",
      description: row.description || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(`deleting-${id}`);
    try {
      const res = await axios.delete(`/companies/${id}`);
      if (res.data.success) {
        showSuccess(res.data.message || "Company deleted successfully");
        fetchCompanies();
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message);
      console.error("Error deleting company:", error);
    } finally {
      setLoading("");
    }
  };

  const toggleStatus = async (company) => {
    try {
      const companyId = company.id || company._id;
      setLoading(`status-${companyId}`);
      const res = await axios.patch(`/companies/${companyId}/status`, {
        isActive: !company.isActive,
      });
      if (res.data.success) {
        showSuccess(res.data.message || "Status updated successfully");
        fetchCompanies();
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message);
      console.error("Error toggling status:", error);
    } finally {
      setLoading("");
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showError("Please fill all required fields (Name, Email, Phone)");
      return;
    }

    try {
      setLoading("Save");
      let res;
      if (editId) {
        res = await axios.put(`/companies/${editId}`, formData);
      } else {
        res = await axios.post("/companies", formData);
      }
      if (res.data.success) {
        showSuccess(res.data.message || "Operation completed successfully");
        fetchCompanies();
        handleClose();
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      setLoading("");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      mobile: "",
      contactNumber: "",
      contactPersonName: "",
      address: "",
      city: "",
      state: "",
      website: "",
      industry: "",
      description: "",
    });
    setEditId(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle search from DataTable
  const handleSearch = useCallback(
    (searchTerm) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchCompanies(searchTerm, filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchCompanies, filters, sortConfig]
  );

  // Handle sort from DataTable
  const handleSort = useCallback(
    (column, order) => {
      setSortConfig({ sortBy: column, sortOrder: order });
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchCompanies("", filters, column, order);
    },
    [fetchCompanies, filters]
  );

  // Handle filter from DataTable
  const handleFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchCompanies("", newFilters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchCompanies, sortConfig]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      setPagination((prev) => ({ ...prev, page }));
      fetchCompanies("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchCompanies, filters, sortConfig]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (limit) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      fetchCompanies("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchCompanies, filters, sortConfig]
  );

  const industryOptions = industries.map(ind => ind.name);
  if (industryOptions.length === 0) {
    industryOptions.push(
      "Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Manufacturing",
      "Retail",
      "Hospitality",
      "Other"
    );
  }

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Companies
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
          startIcon={<Building2 size={20} />}
          disabled={tableLoading}
        >
          {tableLoading ? "Loading..." : "Add New Company"}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={data}
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
        loading={loading === "Save"}
        onSubmit={handleSubmit}
        title={editId ? "Edit Company" : "Add New Company"}
        submitText={editId ? "Update" : "Create"}
        maxWidth="md"
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Company Name *"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            autoFocus
            required
            disabled={loading === "Save"}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Email *"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              required
              disabled={loading === "Save"}
              InputProps={{
                startAdornment: <span className="mr-2 text-gray-400">@</span>,
              }}
            />

            <TextField
              label="Phone *"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              required
              disabled={loading === "Save"}
              InputProps={{
                startAdornment: <Phone className="w-4 h-4 mr-2 text-gray-400" />,
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Mobile"
              name="mobile"
              fullWidth
              value={formData.mobile}
              onChange={handleChange}
              variant="outlined"
              disabled={loading === "Save"}
              InputProps={{
                startAdornment: <Smartphone className="w-4 h-4 mr-2 text-gray-400" />,
              }}
            />

            <TextField
              label="Contact Number"
              name="contactNumber"
              fullWidth
              value={formData.contactNumber}
              onChange={handleChange}
              variant="outlined"
              disabled={loading === "Save"}
              InputProps={{
                startAdornment: <Phone className="w-4 h-4 mr-2 text-gray-400" />,
              }}
            />
          </div>

          <TextField
            label="Contact Person Name"
            name="contactPersonName"
            fullWidth
            value={formData.contactPersonName}
            onChange={handleChange}
            variant="outlined"
            disabled={loading === "Save"}
            InputProps={{
              startAdornment: <User className="w-4 h-4 mr-2 text-gray-400" />,
            }}
          />

          <TextField
            label="Address"
            name="address"
            fullWidth
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
            variant="outlined"
            disabled={loading === "Save"}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="City"
              name="city"
              fullWidth
              value={formData.city}
              onChange={handleChange}
              variant="outlined"
              disabled={loading === "Save"}
            />

            <TextField
              label="State"
              name="state"
              fullWidth
              value={formData.state}
              onChange={handleChange}
              variant="outlined"
              disabled={loading === "Save"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Website"
              name="website"
              fullWidth
              value={formData.website}
              onChange={handleChange}
              variant="outlined"
              disabled={loading === "Save"}
              InputProps={{
                startAdornment: <Globe className="w-4 h-4 mr-2 text-gray-400" />,
              }}
            />

            <TextField
              select
              label="Industry"
              name="industry"
              variant="outlined"
              value={formData.industry || ""}
              onChange={handleChange}
              fullWidth
              disabled={loading === "Save"}
            >
              <MenuItem value="">
                <em>- Select Industry -</em>
              </MenuItem>
              {industryOptions.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            inputProps={{ maxLength: 500 }}
            helperText={`${formData.description.length}/500 characters`}
            disabled={loading === "Save"}
          />
        </Stack>
      </CustomModal>
    </div>
  );
}

export default Company;