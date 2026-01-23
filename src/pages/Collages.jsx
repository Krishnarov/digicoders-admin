import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  X,
  Building2,
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
  Chip,
  OutlinedInput,
  Box,

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
import Select from "react-select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    state: "",
    address: "",
    course: [],
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



  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`/course`);
      if (response.data.success) {
        setCourses(response.data.courses || response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error.response?.data?.message || "Failed to fetch courses");
    }
  }, []);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchCollegeNames();
    fetchCourses()
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
      filter: false,
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
      filter: false,
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
      filterOptions: courses.map((course) => course.name),
      Cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(row.course) ? row.course.map((c, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
              {c}
            </span>
          )) : row.course}
        </div>
      )
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
      filter: false,
      filterOptions: ["Active", "Inactive"],
      Cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}>
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row)}
            disabled={loading}
            className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${row.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
          >
            <span
              className={`inline-block w-3 h-3 transform transition-transform rounded-full bg-white ${row.isActive ? "translate-x-5" : "translate-x-1"
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
      // Ensure course is always an array for multi-select
      course: Array.isArray(row.course) ? row.course : (row.course ? [row.course] : []),
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
      course: [],
      tpoNo1: "",
      tpoNo2: "",
      hodNo: "",
    });
    setEditId(null);
  };

  const courseOptions = useMemo(
    () => courses.map((course) => ({ value: course.name, label: course.name })),
    [courses]
  );

  const getSelectStyles = (hasError) => ({
    control: (base, state) => ({
      ...base,
      borderColor: hasError ? "red" : base.borderColor,
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
        : base.boxShadow,
      "&:hover": {
        borderColor: hasError ? "red" : "#a0aec0",
      },
      borderRadius: "0.375rem",
      padding: "2px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  });

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
      {/* View Modal */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <Building2 className="text-blue-600" size={22} />
            <span className="text-lg font-semibold">College Details</span>
          </div>
          <IconButton onClick={() => setViewOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent className="bg-gray-50">
          {viewData && (
            <div className="space-y-6 py-4">

              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="College Name" value={viewData.name} />
                  <DetailItem label="District" value={viewData.district} />
                  <DetailItem label="State" value={viewData.state} />
                  <DetailItem
                    label="Course"
                    value={
                      Array.isArray(viewData.course)
                        ? viewData.course.join(", ")
                        : viewData.course
                    }
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="TPO Contact 1" value={viewData.tpoNo1 || "N/A"} />
                  <DetailItem label="TPO Contact 2" value={viewData.tpoNo2 || "N/A"} />
                  <DetailItem label="HOD Contact" value={viewData.hodNo || "N/A"} />
                  <DetailItem
                    label="Status"
                    value={
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                  ${viewData.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {viewData.isActive ? "Active" : "Inactive"}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Address
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {viewData.address || "No address provided"}
                </p>
              </div>
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Course</label>
            <Select
              isMulti
              options={courseOptions}
              placeholder="Select Course"
              value={courseOptions.filter((opt) => formData.course.includes(opt.value))}
              onChange={(selectedOptions) =>
                setFormData((prev) => ({
                  ...prev,
                  course: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
                }))
              }
              styles={getSelectStyles()}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
          </div>
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