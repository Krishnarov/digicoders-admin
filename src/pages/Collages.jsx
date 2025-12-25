import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function Collages() {
  const [collegeNames, setCollegeNames] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  
  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    state: "",
    address: "",
    course: "",
    tpoNo1: "",
    tpoNo2: "",
    hodNo: "",
  });
  const [editId, setEditId] = useState(null);

  // Fetch college names with all params
  const fetchCollegeNames = useCallback(async () => {
    try {
      setTableLoading(true);
      
      // Clean filters
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== "") {
          cleanFilters[key] = filters[key];
        }
      });

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...cleanFilters,
      };

      const response = await axios.get(`/college`, { params });
      
      if (response.data.success) {
        setCollegeNames(response.data.colleges || response.data.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || response.data.pagination?.totalRecords || 0,
          pages: response.data.pages || response.data.pagination?.totalPages || 1,
        }));
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
      toast.error(error.response?.data?.message || "Failed to fetch colleges");
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit, search, sortBy, sortOrder, filters]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchCollegeNames();
  }, [fetchCollegeNames]);

  const columns = [
    {
      label: "Action",
      accessor: "action",
      sortable: false,
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip title="View" placement="top">
            <button
              className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              onClick={() => handleView(row)}
            >
              <Eye size={20} />
            </button>
          </Tooltip>
          <Tooltip title="Edit" placement="top">
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
            <Tooltip title="Delete" placement="top">
              <button
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
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
      label: "College Name",
      accessor: "name",
      sortable: true,
      filter: true,
    },
    {
      label: "District",
      accessor: "district",
      sortable: true,
      filter: true,
    },
    {
      label: "State",
      accessor: "state",
      filter: true,
      sortable: true,
      filterOptions: [
        "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", 
        "Uttar Pradesh", "Gujarat", "Rajasthan", "Punjab"
      ]
    },
    {
      label: "Address",
      accessor: "address",
      sortable: true,
    },
    {
      label: "Course",
      accessor: "course",
      filter: true,
      sortable: true,
      filterOptions: ["B.Tech", "B.E", "MCA", "MBA", "B.Sc", "M.Tech"]
    },
    {
      label: "HOD Number",
      accessor: "hodNo",
      sortable: true,
    },
    {
      label: "TPO Contact 1",
      accessor: "tpoNo1",
      sortable: true,
    },
    {
      label: "TPO Contact 2",
      accessor: "tpoNo2",
      sortable: true,
    },
    {
      label: "Status",
      accessor: "isActive",
      sortable: true,
      filter: true,
      filterOptions: ["Active", "Inactive"],
      Cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row)}
            disabled={loading}
            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${
              row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-3 h-3 transform transition-transform rounded-full bg-white ${
                row.isActive ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ),
    },
  ];

  // Event handlers
  const handleView = (row) => {
    setViewData(row);
    setViewOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name || "",
      district: row.district || "",
      state: row.state || "",
      address: row.address || "",
      course: row.course || "",
      tpoNo1: row.tpoNo1 || "",
      tpoNo2: row.tpoNo2 || "",
      hodNo: row.hodNo || "",
    });
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await axios.delete(`/college/${id}`);
      if (res.data.success) {
        toast.success("College deleted successfully");
        fetchCollegeNames();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete college");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (row) => {
    try {
      setLoading(true);
      const endpoint = row.isActive ? "deactivate" : "reactivate";
      const res = await axios.patch(`/college/${row._id}/${endpoint}`);
      
      if (res.data.success) {
        toast.success("Status updated successfully");
        fetchCollegeNames();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("College name is required");
      return;
    }

    try {
      setLoading(true);
      const res = editId 
        ? await axios.put(`/college/${editId}`, formData)
        : await axios.post("/college", formData);
      
      if (res.data.success) {
        toast.success(editId ? "College updated" : "College created");
        fetchCollegeNames();
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: "",
      district: "",
      state: "",
      address: "",
      course: "",
      tpoNo1: "",
      tpoNo2: "",
      hodNo: "",
    });
    setEditId(null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // DataTable callbacks
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (column, order) => {
    setSortBy(column);
    setSortOrder(order);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilter = (newFilters) => {
    // Convert "Active"/"Inactive" to boolean for backend
    const processedFilters = { ...newFilters };
    if (processedFilters.isActive === "Active") processedFilters.isActive = true;
    if (processedFilters.isActive === "Inactive") processedFilters.isActive = false;
    
    setFilters(processedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleRowsPerPageChange = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Colleges
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
          Add New College
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={collegeNames}
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

      {/* View Modal */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span>College Details</span>
          <IconButton onClick={() => setViewOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {viewData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="College Name" value={viewData.name} />
                <DetailItem label="District" value={viewData.district} />
                <DetailItem label="State" value={viewData.state} />
                <DetailItem label="Course" value={viewData.course} />
                <DetailItem label="TPO Contact 1" value={viewData.tpoNo1} />
                <DetailItem label="TPO Contact 2" value={viewData.tpoNo2} />
                <DetailItem label="HOD Contact" value={viewData.hodNo} />
                <DetailItem 
                  label="Status" 
                  value={
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      viewData.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {viewData.isActive ? "Active" : "Inactive"}
                    </span>
                  } 
                />
              </div>
              <DetailItem label="Address" value={viewData.address} fullWidth />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editId ? "Edit College" : "Add New College"}
        submitText={editId ? "Update" : "Create"}
        loading={loading}
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="College Name *"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField
              label="State"
              name="state"
              fullWidth
              value={formData.state}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              label="District"
              name="district"
              fullWidth
              value={formData.district}
              onChange={handleChange}
              variant="outlined"
            />
          </div>
          <TextField
            label="Address"
            name="address"
            fullWidth
            multiline
            rows={2}
            value={formData.address}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            label="Course"
            name="course"
            fullWidth
            value={formData.course}
            onChange={handleChange}
            variant="outlined"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField
              label="TPO Contact 1"
              name="tpoNo1"
              fullWidth
              value={formData.tpoNo1}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              label="TPO Contact 2"
              name="tpoNo2"
              fullWidth
              value={formData.tpoNo2}
              onChange={handleChange}
              variant="outlined"
            />
          </div>
          <TextField
            label="HOD Contact"
            name="hodNo"
            fullWidth
            value={formData.hodNo}
            onChange={handleChange}
            variant="outlined"
          />
        </Stack>
      </CustomModal>
    </div>
  );
}

// Helper component for view modal
const DetailItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <label className="block text-sm font-medium text-gray-500 mb-1">
      {label}
    </label>
    <p className="text-gray-900">
      {value || "N/A"}
    </p>
  </div>
);

export default Collages;