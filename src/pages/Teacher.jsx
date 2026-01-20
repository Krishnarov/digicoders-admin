import React, { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Edit2, Trash2, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  TextField,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
} from "@mui/material";
import Select from "react-select";
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
    branch: "",
  });
  const [editId, setEditId] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);

  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({});

  // Memoized fetch function for teachers
  const getAllTeachers = useCallback(async (search = "", newFilters = {}, sortBy = "", sortOrder = "") => {
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

      const res = await axios.get(`/teachers?${params.toString()}`);


      if (res.data.success) {
        setTeachers(res.data.teachers || []);
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

  // 🔹 Fetch branches
  const getAllBranches = async () => {
    try {
      const res = await axios.get("/branches");
      if (res.data.success) {
        setBranches(res.data.data.filter((b) => b.isActive));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error(error);
    }
  };

  // Initial fetch
  useEffect(() => {
    getAllTeachers();
    getAllBranches();
  }, [getAllTeachers]);

  // 🔹 Table Columns
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
      label: "Teacher Name",
      accessor: "name",
      sortable: true
    },
    {
      label: "Phone",
      accessor: "phone",
      sortable: true
    },
    {
      label: "Branch",
      accessor: "branch.name", // 👈 display ke liye
      filter: true,
      filterKey: "branch", // 👈 API ko objectId bhejne ke liye
      filterOptions: branches.map((b) => ({
        label: b.name,
        value: b._id,
      })),
      sortable: true,
      Cell: ({ row }) => row.branch?.name || "N/A",
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

  const toggleStatus = async (data) => {
    try {
      setLoading(`status-${data._id}`);
      const res = await axios.patch(`/teachers/${data._id}`, {
        isActive: !data.isActive,
      });

      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");
        getAllTeachers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error toggling status:", error);
    } finally {
      setLoading("");
    }
  };

  // 🔹 Handle Edit
  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      phone: row.phone,
      branch: row?.branch?._id || ""
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
        toast.success(res.data.message || "Teacher deleted successfully");
        getAllTeachers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error deleting teacher:", error);
    } finally {
      setLoading("");
    }
  };

  // 🔹 Submit Form (Create / Update Teacher)
  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading("Save");
      let res;
      if (editId) {
        res = await axios.patch(`/teachers/${editId}`, formData);
      } else {
        res = await axios.post("/teachers/create", formData);
      }

      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        getAllTeachers();
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Close Modal
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", phone: "", branch: "" });
    setEditId(null);
  };

  // 🔹 Handle Change
  const branchOptions = React.useMemo(
    () => [
      { value: "", label: "Select Branch" },
      ...branches.map((b) => ({ value: b._id, label: b.name })),
    ],
    [branches]
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle search from DataTable
  const handleSearch = useCallback(
    (searchTerm) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllTeachers(searchTerm, filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllTeachers, filters, sortConfig]
  );

  // Handle sort from DataTable
  const handleSort = useCallback(
    (column, order) => {
      setSortConfig({ sortBy: column, sortOrder: order });
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllTeachers("", filters, column, order);
    },
    [getAllTeachers, filters]
  );

  // Handle filter from DataTable
  const handleFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllTeachers("", newFilters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllTeachers, sortConfig]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      setPagination((prev) => ({ ...prev, page }));
      getAllTeachers("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllTeachers, filters, sortConfig]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (limit) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      getAllTeachers("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllTeachers, filters, sortConfig]
  );

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
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
      <DataTable
        mode="server"
        columns={columns}
        data={teachers}
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
        title={editId ? "Edit Teacher" : "Add New Teacher"}
        submitText={editId ? "Update" : "Create"}
        loading={loading === "Save"}
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Teacher Name *"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            required
          />
          <TextField
            label="Phone Number *"
            name="phone"
            fullWidth
            value={formData.phone}
            onChange={handleChange}
            variant="outlined"
            required
          />
          {/* Branch Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Branch</label>
            <Select
              options={branchOptions}
              placeholder="Select Branch"
              value={branchOptions.find((opt) => opt.value === formData.branch) || null}
              onChange={(opt) => setFormData((prev) => ({ ...prev, branch: opt?.value || "" }))}
              styles={getSelectStyles()}
              classNamePrefix="react-select"
            />
          </div>
        </Stack>
      </CustomModal>
    </div>
  );
}

export default Teacher;