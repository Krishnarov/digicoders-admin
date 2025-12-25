import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Users,
  Download,
  Loader2,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import useGetStudents from "../hooks/useGetStudent";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function Batchs() {
  const [loading, setLoading] = useState({
    table: false,
    save: false,
    delete: null,
    status: null,
    export: null,
  });
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    batchName: "",
    branch: "",
    startDate: "",
    teacher: "",
    students: [],
  });
  const [editId, setEditId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  
  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({});

  // 🔹 Memoized fetch function for batches
  const getAllBatches = useCallback(async (search = "", newFilters = {}, sortBy = "", sortOrder = "") => {
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

      const res = await axios.get(`/batches?${params.toString()}`);
      if (res.data.success) {
        setBatches(res.data.batches || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total || 0,
          pages: res.data.pages || 1,
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to load batches");
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // 🔹 Fetch teachers
  const getAllTeachers = useCallback(async () => {
    try {
      const res = await axios.get("/teachers");
      if (res.data.success) {
        setTeachers(res.data.teachers.filter((item) => item.isActive) || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to load teachers");
      console.error(error);
    }
  }, []);

  // 🔹 Fetch branches
  const getAllBranches = useCallback(async () => {
    try {
      const res = await axios.get("/branches");
      if (res.data.success) {
        setBranches(res.data.data.filter((b) => b.isActive) || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to load branches");
      console.error(error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setTableLoading(true);
        await Promise.all([
          getAllBatches(),
          getAllTeachers(),
          getAllBranches(),

        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setTableLoading(false);
      }
    };
    
    loadAllData();
  }, [getAllBatches, getAllTeachers, getAllBranches, ]);

  // 🔹 Table Columns
  const columns = [
    {
      label: "Action",
      accessor: "action",
      sortable: false,
      show: true,
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Link to={`/addstuinbatch/${row._id}`}>
            <Tooltip
              title={<span className="font-bold">Manage Students</span>}
              placement="top"
            >
              <button
                className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading.delete === row._id || loading.status === row._id}
              >
                <Users size={20} />
              </button>
            </Tooltip>
          </Link>
          <Tooltip
            title={<span className="font-bold">Edit</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleEdit(row)}
              disabled={loading.delete === row._id || loading.status === row._id}
            >
              <Edit2 size={20} />
            </button>
          </Tooltip>
          <Tooltip
            title={<span className="font-bold">Excel Export</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => exportToExcel(row)}
              disabled={loading.export === row._id}
            >
              {loading.export === row._id ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Download size={20} />
              )}
            </button>
          </Tooltip>
          <DeleteConfirmationModal
            id={row._id}
            itemName={row.batchName}
            onConfirm={() => handleDelete(row._id)}
            loading={loading.delete === row._id}
          >
            <Tooltip
              title={<span className="font-bold">Delete</span>}
              placement="top"
            >
              <button 
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading.delete === row._id || loading.status === row._id}
              >
                {loading.delete === row._id ? (
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
      label: "Batch Name", 
      accessor: "batchName",
      sortable: true,
      Cell: ({ row }) => <span className="font-medium">{row.batchName}</span>
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
      label: "Start Date",
      accessor: "startDate",
      sortable: true,
      Cell: ({ row }) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A",
    },
    {
      label: "Teacher",
      accessor: "teacher.name",
      filterKey:"teacher",
      sortable: true,
      filter: true,
      filterOptions: teachers.map((t)=>({
        label:t.name,
        value:t._id
      })),
      Cell: ({ row }) => row.teacher?.name || "Unassigned",
    },
    {
      label: "Students Count",
      accessor: "students",
      sortable: true,
      Cell: ({ row }) => (
        <Chip 
          label={row.students?.length || 0} 
          color={row.students?.length > 0 ? "primary" : "default"} 
          size="small" 
        />
      ),
    },
    {
      label: "Status",
      accessor: "isActive",
      sortable: true,
      filter: true,
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className={`ml-2 text-sm font-medium ${row.isActive ? "text-green-600" : "text-gray-600"}`}>
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row)}
            disabled={loading.status === row._id}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none disabled:opacity-50 ${
              row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${
                row.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
            {loading.status === row._id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      ),
    },
  ];

  const exportToExcel = async (batch) => {
    try {
      setLoading(prev => ({ ...prev, export: batch._id }));
      
      // Students ko format karo
      const studentData = batch.students.map((student, index) => ({
        "S.No": index + 1,
        Name: student.studentName,
        Email: student.email || "N/A",
        Phone: student.mobile || "N/A",
        "Father Name": student.fatherName || "N/A",
        Technology: student.technology?.name || "N/A",
        "Due Amount": student.dueAmount ?? 0,
      }));

      // Workbook create karo
      const wb = XLSX.utils.book_new();

      // Students sheet add karo
      const wsStudents = XLSX.utils.json_to_sheet(studentData);
      XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

      // File generate karo
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, `${batch.batchName.replace(/\s+/g, '_')}_Students.xlsx`);
      
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export Excel file");
    } finally {
      setLoading(prev => ({ ...prev, export: null }));
    }
  };

  const toggleStatus = async (batch) => {
    try {
      setLoading(prev => ({ ...prev, status: batch._id }));
      const res = await axios.patch(`/batches/updatestatus/${batch._id}`);
      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");
        // Refresh data immediately
        await getAllBatches();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to update status");
      console.error("Error toggling status:", error);
    } finally {
      setLoading(prev => ({ ...prev, status: null }));
    }
  };

  // 🔹 Edit Batch
  const handleEdit = (row) => {
    setFormData({
      batchName: row.batchName,
      branch: row.branch?._id || "",
      startDate: row.startDate?.split("T")[0] || "",
      teacher: row.teacher?._id || "",
      students: row.students || [],
    });
    setEditId(row._id);
    setOpen(true);
  };

  // 🔹 Delete Batch
  const handleDelete = async (id) => {
    try {
      setLoading(prev => ({ ...prev, delete: id }));
      const res = await axios.delete(`/batches/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || "Deleted successfully");
        // Refresh data immediately after delete
        await getAllBatches();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete");
      console.error("Error deleting batch:", error);
    } finally {
      setLoading(prev => ({ ...prev, delete: null }));
    }
  };

  // 🔹 Submit Form (Create/Update)
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setLoading(prev => ({ ...prev, save: true }));
      
      // Validate form data
      if (!formData.batchName.trim()) {
        toast.error("Please enter batch name");
        return;
      }
      if (!formData.branch) {
        toast.error("Please select branch");
        return;
      }
      if (!formData.startDate) {
        toast.error("Please select start date");
        return;
      }

      let res;
      const submitData = {
        ...formData,
        batchName: formData.batchName.trim()
      };

      if (editId) {
        res = await axios.put(`/batches/${editId}`, submitData);
      } else {
        res = await axios.post("/batches/create", submitData);
      }
      
      if (res.data.success) {
        toast.success(res.data.message || "Saved successfully");
        // Refresh data immediately after save
        await getAllBatches();
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // 🔹 Close Modal
  const handleClose = () => {
    setOpen(false);
    setFormData({
      batchName: "",
      branch: "",
      startDate: "",
      teacher: "",
      students: [],
    });
    setEditId(null);
    setIsSubmitting(false);
  };

  const handleOpen = () => {
    setOpen(true);
    setFormData({
      batchName: "",
      branch: "",
      startDate: "",
      teacher: "",
      students: [],
    });
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle search from DataTable
  const handleSearch = useCallback(
    (searchTerm) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllBatches(searchTerm, filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllBatches, filters, sortConfig]
  );

  // Handle sort from DataTable
  const handleSort = useCallback(
    (column, order) => {
      setSortConfig({ sortBy: column, sortOrder: order });
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllBatches("", filters, column, order);
    },
    [getAllBatches, filters]
  );

  // Handle filter from DataTable
  const handleFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllBatches("", newFilters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllBatches, sortConfig]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      setPagination((prev) => ({ ...prev, page }));
      getAllBatches("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllBatches, filters, sortConfig]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (limit) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      getAllBatches("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllBatches, filters, sortConfig]
  );

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Batches
          </h1>
          <Link
            to="/dashboard"
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-5 h-5 text-blue-600 mr-1" />
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            <span className="text-gray-800">Dashboard</span>
          </Link>
        </div>
        <Button
          variant="contained"
          onClick={handleOpen}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={tableLoading}
        >
          {tableLoading ? "Loading..." : "Add New Batch"}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={batches}
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

      {/* Add/Edit Batch Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editId ? "Edit Batch" : "Add New Batch"}
        submitText={editId ? "Update" : "Create"}
        loading={loading.save}
        submitDisabled={isSubmitting}
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Batch Name *"
            name="batchName"
            fullWidth
            value={formData.batchName}
            onChange={handleChange}
            variant="outlined"
            required
            error={!formData.batchName.trim()}
            helperText={!formData.batchName.trim() ? "Batch name is required" : ""}
            disabled={loading.save}
          />

          {/* Branch Dropdown */}
          <FormControl fullWidth required error={!formData.branch}>
            <InputLabel>Branch *</InputLabel>
            <Select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              label="Branch *"
              disabled={loading.save}
            >
              {branches.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
            {!formData.branch && (
              <div className="text-red-500 text-xs mt-1 ml-4">
                Branch is required
              </div>
            )}
          </FormControl>

          {/* Start Date */}
          <TextField
            type="date"
            label="Start Date *"
            name="startDate"
            fullWidth
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            error={!formData.startDate}
            helperText={!formData.startDate ? "Start date is required" : ""}
            disabled={loading.save}
            inputProps={{
              min: getTodayDate()
            }}
          />

          {/* Teacher Dropdown */}
          <FormControl fullWidth>
            <InputLabel>Assign Teacher</InputLabel>
            <Select
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              label="Assign Teacher"
              disabled={loading.save}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {teachers.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </CustomModal>
    </div>
  );
}

export default Batchs;