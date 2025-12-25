import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  Briefcase,
  Search,
  UserPlus,
  Users,
  GrabIcon,
  Filter,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Avatar,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function Jobs() {
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [openBatchDialog, setOpenBatchDialog] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [batches, setBatches] = useState([]);

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [tempSelectedStudents, setTempSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    jobType: "full-time",
    location: "",
    salary: "",
    requirements: "",
    skills: [],
    applicationDeadline: "",
    vacancies: 1,
    status: "active",
  });

  const [editId, setEditId] = useState(null);
  
  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  
  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({});

  // Memoized fetch function for jobs
  const fetchJobs = useCallback(async (search = "", newFilters = {}, sortBy = "", sortOrder = "") => {
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
      params.append("status", "active"); // Default to active jobs

      const res = await axios.get(`/jobs?${params.toString()}`);
      if (res.data.success) {
        setJobs(res.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total || 0,
          pages: res.data.pages || 1,
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Fetch companies and batches on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setTableLoading(true);
        await Promise.all([
          fetchCompanies(),
          fetchBatches(),
          fetchJobs()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setTableLoading(false);
      }
    };
    
    loadData();
  }, [fetchJobs]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("/companies");
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch companies");
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get("/batches");
      if (res.data.success) {
        setBatches(res.data.batches);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch batches");
    }
  };

  const handleStudentSelect = (student) => {
    if (!selectedStudents.some((s) => s._id === student._id)) {
      setSelectedStudents([...selectedStudents, student]);
    }
    setSearchTerm("");
    setStudents([]);
  };

  const handleTempStudentSelect = (studentId) => {
    if (tempSelectedStudents.includes(studentId)) {
      setTempSelectedStudents(
        tempSelectedStudents.filter((id) => id !== studentId)
      );
    } else {
      setTempSelectedStudents([...tempSelectedStudents, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (tempSelectedStudents.length === students.length) {
      setTempSelectedStudents([]);
    } else {
      setTempSelectedStudents(students.map((student) => student._id));
    }
  };

  const addSelectedStudentsToJob = () => {
    const studentsToAdd = students.filter((student) =>
      tempSelectedStudents.includes(student._id)
    );

    setSelectedStudents([...selectedStudents, ...studentsToAdd]);
    setTempSelectedStudents([]);
    setOpenStudentDialog(false);
    setOpenBatchDialog(false);
  };

  const removeStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter((s) => s._id !== studentId));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim() || !formData.company || !formData.location || !formData.salary.trim()) {
      toast.error("Please fill all required fields (Title, Company, Location, Salary)");
      return;
    }

    try {
      setLoading("Save");
      let res;
      const submitData = {
        ...formData,
        assignedStudents: selectedStudents.map(student => student._id)
      };

      if (editId) {
        res = await axios.put(`/jobs/${editId}`, submitData);
      } else {
        res = await axios.post("/jobs", submitData);
      }
      
      if (res.data.success) {
        toast.success(res.data.message || "Job saved successfully");
        handleClose();
        fetchJobs();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save job");
    } finally {
      setLoading("");
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title || "",
      description: job.description || "",
      company: job.company?._id || "",
      jobType: job.jobType || "full-time",
      location: job.location || "",
      salary: job.salary || "",
      requirements: job.requirements || "",
      skills: job.skills || [],
      applicationDeadline: job.applicationDeadline
        ? job.applicationDeadline.split("T")[0]
        : "",
      vacancies: job.vacancies || 1,
      status: job.status || "active",
    });

    // Set assigned students if any
    if (job.assignedStudents && job.assignedStudents.length > 0) {
      setSelectedStudents(job.assignedStudents);
    }

    setEditId(job._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(`deleting-${id}`);
    try {
      const res = await axios.delete(`/jobs/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || "Job deleted successfully");
        fetchJobs();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    } finally {
      setLoading("");
    }
  };

  const toggleStatus = async (job) => {
    try {
      setLoading(`status-${job._id}`);
      const newStatus = job.status === "active" ? "inactive" : "active";

      const res = await axios.patch(`/jobs/${job._id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");
        fetchJobs();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading("");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      company: "",
      jobType: "full-time",
      location: "",
      salary: "",
      requirements: "",
      skills: [],
      applicationDeadline: "",
      vacancies: 1,
      status: "active",
    });
    setSelectedStudents([]);
    setEditId(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillsChange = (e, value) => {
    setFormData((prev) => ({ ...prev, skills: value }));
  };

  // Handle search from DataTable
  const handleSearch = useCallback(
    (searchTerm) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchJobs(searchTerm, filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchJobs, filters, sortConfig]
  );

  // Handle sort from DataTable
  const handleSort = useCallback(
    (column, order) => {
      setSortConfig({ sortBy: column, sortOrder: order });
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchJobs("", filters, column, order);
    },
    [fetchJobs, filters]
  );

  // Handle filter from DataTable
  const handleFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchJobs("", newFilters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchJobs, sortConfig]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      setPagination((prev) => ({ ...prev, page }));
      fetchJobs("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchJobs, filters, sortConfig]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (limit) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      fetchJobs("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [fetchJobs, filters, sortConfig]
  );

  const columns = [
    {
      label: "Action",
      accessor: "action",
      sortable: false,
      show: true,
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip
            title={<span className="font-bold">Add Students</span>}
            placement="top"
          >
            <Link
              to={`/student-assing-job/${row._id}`}
              className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              disabled={loading === `status-${row._id}`}
            >
              <UserPlus size={20} />
            </Link>
          </Tooltip>
          <Tooltip
            title={<span className="font-bold">Edit</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
              onClick={() => handleEdit(row)}
              disabled={loading === `status-${row._id}` || loading === `deleting-${row._id}`}
            >
              <Edit2 size={20} />
            </button>
          </Tooltip>

          <DeleteConfirmationModal
            id={row._id}
            itemName={row.title}
            onConfirm={() => handleDelete(row._id)}
            loading={loading === `deleting-${row._id}`}
          >
            <Tooltip
              title={<span className="font-bold">Delete</span>}
              placement="top"
            >
              <button 
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                disabled={loading === `deleting-${row._id}` || loading === `status-${row._id}`}
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
      label: "Job Title", 
      accessor: "title",
      sortable: true 
    },
    {
      label: "Company",
      accessor: "company",
      sortable: true,
      filter: true,
      Cell: ({ row }) => row.company?.name || "N/A",
    },
    { 
      label: "Location", 
      accessor: "location",
      sortable: true,
      filter: true,
    },
    { 
      label: "Type", 
      accessor: "jobType",
      sortable: true,
      filter: true,
    },
    { 
      label: "Salary", 
      accessor: "salary",
      sortable: true,
      filter: true,
    },
    {
      label: "Assigned Students",
      accessor: "assignedStudents",
      sortable: true,
      Cell: ({ row }) => (
        <Chip 
          label={row.assignedStudents?.length || 0} 
          color={row.assignedStudents?.length > 0 ? "primary" : "default"} 
          size="small" 
        />
      ),
    },
    {
      label: "Status",
      accessor: "status",
      sortable: true,
      filter: true,
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
            {row.status}
          </span>
          <button
            onClick={() => toggleStatus(row)}
            disabled={loading === `status-${row._id}`}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              row.status === "active" ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${
                row.status === "active" ? "translate-x-6" : "translate-x-1"
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

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Jobs
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
          startIcon={<Briefcase size={20} />}
          disabled={tableLoading}
        >
          {tableLoading ? "Loading..." : "Create New Job"}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={jobs}
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

      {/* Job Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        loading={loading === "Save"}
        onSubmit={handleSubmit}
        title={editId ? "Edit Job" : "Create New Job"}
        submitText={editId ? "Update" : "Create"}
        maxWidth="md"
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Job Title *"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            variant="outlined"
            autoFocus
            required
            disabled={loading === "Save"}
          />

          <TextField
            select
            label="Company *"
            name="company"
            variant="outlined"
            value={formData.company}
            onChange={handleChange}
            fullWidth
            required
            disabled={loading === "Save"}
          >
            <MenuItem value="">
              <em>- Select Company -</em>
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={company._id} value={company._id}>
                {company.name}
              </MenuItem>
            ))}
          </TextField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              select
              label="Job Type *"
              name="jobType"
              variant="outlined"
              value={formData.jobType}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading === "Save"}
            >
              <MenuItem value="full-time">Full Time</MenuItem>
              <MenuItem value="part-time">Part Time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="internship">Internship</MenuItem>
              <MenuItem value="remote">Remote</MenuItem>
            </TextField>

            <TextField
              label="Location *"
              name="location"
              fullWidth
              value={formData.location}
              onChange={handleChange}
              variant="outlined"
              required
              disabled={loading === "Save"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Salary *"
              name="salary"
              fullWidth
              value={formData.salary}
              onChange={handleChange}
              variant="outlined"
              required
              disabled={loading === "Save"}
            />

            <TextField
              label="Vacancies *"
              name="vacancies"
              type="number"
              fullWidth
              value={formData.vacancies}
              onChange={handleChange}
              variant="outlined"
              required
              inputProps={{ min: 1 }}
              disabled={loading === "Save"}
            />
          </div>

          <TextField
            label="Application Deadline"
            name="applicationDeadline"
            type="date"
            fullWidth
            value={formData.applicationDeadline}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            disabled={loading === "Save"}
          />

          <Autocomplete
            multiple
            options={[]}
            freeSolo
            value={formData.skills}
            onChange={handleSkillsChange}
            disabled={loading === "Save"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Required Skills"
                placeholder="Add skills..."
                variant="outlined"
              />
            )}
          />

          <TextField
            label="Requirements"
            name="requirements"
            fullWidth
            multiline
            rows={3}
            value={formData.requirements}
            onChange={handleChange}
            variant="outlined"
            disabled={loading === "Save"}
          />

          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            disabled={loading === "Save"}
          />

          <div className="flex items-center justify-between">
            <div>
              <Typography variant="subtitle1">Assigned Students</Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStudents.length} student(s) selected
              </Typography>
            </div>
            <Button
              variant="outlined"
              startIcon={<UserPlus size={18} />}
              onClick={() => setOpenBatchDialog(true)}
              disabled={loading === "Save"}
            >
              Add Students
            </Button>
          </div>

          {selectedStudents.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedStudents.map((student) => (
                <Chip
                  key={student._id}
                  avatar={<Avatar>{student.studentName?.charAt(0) || "S"}</Avatar>}
                  label={student.studentName || "Unknown"}
                  onDelete={() => removeStudent(student._id)}
                  variant="outlined"
                  disabled={loading === "Save"}
                />
              ))}
            </Box>
          )}
        </Stack>
      </CustomModal>
    </div>
  );
}

export default Jobs;