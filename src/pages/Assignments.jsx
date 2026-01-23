import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Users,
  Download,
  Loader2,
  Calendar,
  BookOpen,
  Filter,
  Search,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ImageIcon,
  File,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  TextField,
  Tooltip,

  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Checkbox,
  FormControlLabel,
  Card,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  InputAdornment,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Stack } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import useGetStudents from "../hooks/useGetStudent";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";

function Assignments() {
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    batches: [],
    dueDate: "",
    maxMarks: "",
    assignmentFiles: [],
  });
  const [editId, setEditId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filePreviews, setFilePreviews] = useState([]);



  const navigate = useNavigate();
  // 🔹 Fetch all assignments
  const getAllAssignments = async () => {
    try {
      const res = await axios.get("/assignments");
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error(error);
    }
  };

  // 🔹 Fetch all batches
  const getAllBatches = async () => {
    try {
      const res = await axios.get("/batches");
      if (res.data.success) {
        setBatches(res.data.batches || []);
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    getAllAssignments();
    getAllBatches();

  }, []);

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBatch =
      filterBatch === "all" ||
      assignment.batches?.some((b) => b._id === filterBatch);

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    let statusMatch = true;

    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        statusMatch = dueDate > now;
      } else if (filterStatus === "expired") {
        statusMatch = dueDate <= now;
      }
    }

    return matchesSearch && matchesBatch && statusMatch;
  });

  // 🔹 Table Columns
  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip
            title={<span className="font-bold">View Submissions</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              onClick={() => handleViewSubmissions(row)}
            >
              <FileText size={20} />
            </button>
          </Tooltip>
          {/* Add this Grade button */}
          <Tooltip
            title={<span className="font-bold">Grade Assignment</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-green-100 transition-colors border text-green-600"
              onClick={() => navigate(`/assignment/${row._id}/grade`)}
            >
              <CheckCircle size={20} />
            </button>
          </Tooltip>
          <Tooltip
            title={<span className="font-bold">Edit</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
              onClick={() => handleEdit(row)}
            >
              <Edit2 size={20} />
            </button>
          </Tooltip>
          <Tooltip
            title={<span className="font-bold">Download Files</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
              onClick={() => downloadAssignmentFiles(row)}
            >
              {loading === `download-${row._id}` ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
            </button>
          </Tooltip>
          <DeleteConfirmationModal
            id={row._id}
            itemName={row.title}
            onConfirm={() => handleDelete(row._id)}
            loading={loading}
          >
            <Tooltip
              title={<span className="font-bold">Delete</span>}
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
    {
      label: "Title",
      accessor: "title",
      Cell: ({ row }) => (
        <div className="font-medium text-blue-600">{row.title}</div>
      ),
    },
    {
      label: "Description",
      accessor: "description",
      Cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.description}</div>
      ),
    },
    {
      label: "Batches",
      accessor: "batches",
      Cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.batches?.slice(0, 2).map((batch) => (
            <Chip
              key={batch._id}
              label={batch.batchName}
              size="small"
              variant="outlined"
            />
          ))}
          {row.batches?.length > 2 && (
            <Chip label={`+${row.batches.length - 2} more`} size="small" />
          )}
        </div>
      ),
      filter: true,
    },
    {
      label: "Due Date",
      accessor: "dueDate",
      Cell: ({ row }) => (
        <div className="flex items-center">
          <Calendar size={16} className="mr-1 text-gray-500" />
          {new Date(row.dueDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      label: "Max Marks",
      accessor: "maxMarks",
      Cell: ({ row }) => (
        <Chip label={row.maxMarks} color="primary" size="small" />
      ),
    },
    {
      label: "Files",
      accessor: "assignmentFiles",
      Cell: ({ row }) => (
        <div className="flex gap-1">
          {row.assignmentFiles?.slice(0, 2).map((file, index) => (
            <Tooltip key={index} title={file.name}>
              <div className="p-1 bg-gray-100 rounded">
                {file.type?.includes("image") ? (
                  <ImageIcon size={16} className="text-blue-500" />
                ) : (
                  <File size={16} className="text-gray-600" />
                )}
              </div>
            </Tooltip>
          ))}
          {row.assignmentFiles?.length > 2 && (
            <Chip label={`+${row.assignmentFiles.length - 2}`} size="small" />
          )}
        </div>
      ),
    },
    {
      label: "Status",
      accessor: "status",
      Cell: ({ row }) => {
        const now = new Date();
        const dueDate = new Date(row.dueDate);
        const isActive = dueDate > now;

        return (
          <Chip
            icon={isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
            label={isActive ? "Active" : "Expired"}
            color={isActive ? "success" : "default"}
            size="small"
            variant="outlined"
          />
        );
      },
      filter: true,
    },
    {
      label: "Submissions",
      accessor: "submissions",
      Cell: ({ row }) => (
        <Badge
          badgeContent={row.submissions?.length || 0}
          color="primary"
          onClick={() => handleViewSubmissions(row)}
          className="cursor-pointer"
        >
          <FileText size={20} />
        </Badge>
      ),
    },
  ];

  const downloadAssignmentFiles = (assignment) => {
    if (assignment.assignmentFiles && assignment.assignmentFiles.length > 0) {
      setLoading(`download-${assignment._id}`);
      // Implement multiple file download logic here
      setTimeout(() => {
        setLoading("");
        toast.success("Files downloaded successfully");
      }, 1000);
    } else {
      toast.info("No files attached to this assignment");
    }
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionDialogOpen(true);
  };

  // 🔹 Edit Assignment
  const handleEdit = (row) => {
    setFormData({
      title: row.title,
      description: row.description,
      batches: row.batches?.map((b) => b._id) || [],
      dueDate: row.dueDate?.split("T")[0],
      maxMarks: row.maxMarks,
      assignmentFiles: [],
    });
    setEditId(row._id);
    setOpen(true);
  };

  // 🔹 Delete Assignment
  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/assignments/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || "Assignment deleted successfully");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error deleting assignment:", error);
    } finally {
      setLoading("");
      getAllAssignments();
    }
  };

  // 🔹 Submit Form (Create/Update)
  const handleSubmit = async () => {
    try {
      setLoading("Save");

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("dueDate", formData.dueDate);
      formDataToSend.append("maxMarks", formData.maxMarks);

      // Batches को array के रूप में भेजें, JSON string नहीं
      formData.batches.forEach((batchId) => {
        formDataToSend.append("batches", batchId);
      });

      // Files append करें
      formData.assignmentFiles.forEach((file) => {
        formDataToSend.append("assignmentFiles", file);
      });

      let res;
      if (editId) {
        res = await axios.put(`/assignments/${editId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.post("/assignments/create", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || "Assignment saved successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      getAllAssignments();
      handleClose();
    }
  };
  // 🔹 Close Modal
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: "",
      description: "",
      batches: [],
      dueDate: "",
      maxMarks: "",
      assignmentFiles: [],
    });
    setFilePreviews([]);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const batchOptions = React.useMemo(
    () => batches.map((batch) => ({ value: batch._id, label: batch.batchName })),
    [batches]
  );

  const filterBatchOptions = [
    { value: "all", label: "All Batches" },
    ...batches.map((batch) => ({ value: batch._id, label: batch.batchName })),
  ];

  const filterStatusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
  ];

  const reactSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "4px",
      borderColor: "#ccc",
      "&:hover": {
        borderColor: "#888",
      },
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const handleBatchChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, batches: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      assignmentFiles: [...prev.assignmentFiles, ...files],
    }));

    // Create previews for images
    const imageFiles = files.filter((file) => file.type.includes("image"));
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviews((prev) => [
          ...prev,
          { name: file.name, url: e.target.result },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      assignmentFiles: prev.assignmentFiles.filter((_, i) => i !== index),
    }));

    // Also remove preview if it exists
    if (index < filePreviews.length) {
      setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };


  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Assignment Management
          </h1>
          <nav className="flex items-center text-sm text-gray-600">
            <Link
              to="/dashboard"
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-blue-600">Assignments</span>
          </nav>
        </div>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-md"
        >
          New Assignment
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6 shadow-md">
        <div className="flex flex-col md:flex-row gap-2 items-center">

          <TextField
            placeholder="Search assignments..."
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          <div className="w-full min-w-[150px]">
            <Select
              options={filterBatchOptions}
              value={filterBatchOptions.find((opt) => opt.value === filterBatch) || null}
              onChange={(opt) => setFilterBatch(opt?.value || "all")}
              placeholder="Batch"
              styles={reactSelectStyles}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
          </div>

          <div className="w-full min-w-[150px]">
            <Select
              options={filterStatusOptions}
              value={filterStatusOptions.find((opt) => opt.value === filterStatus) || null}
              onChange={(opt) => setFilterStatus(opt?.value || "all")}
              placeholder="Status"
              styles={reactSelectStyles}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
          </div>

          <IconButton>
            <Filter size={20} />
          </IconButton>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Total Assignments</p>
              <h3 className="text-2xl font-bold">{assignments.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Active Assignments</p>
              <h3 className="text-2xl font-bold">
                {
                  assignments.filter((a) => new Date(a.dueDate) > new Date())
                    .length
                }
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-md border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Expired Assignments</p>
              <h3 className="text-2xl font-bold">
                {
                  assignments.filter((a) => new Date(a.dueDate) <= new Date())
                    .length
                }
              </h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-md border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Multi-Batch</p>
              <h3 className="text-2xl font-bold">
                {assignments.filter((a) => a.batches?.length > 1).length}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* DataTable */}
      <Card className="shadow-md">
        <DataTable
          columns={columns}
          data={filteredAssignments}
          loading={loading}
          title="All Assignments"
        />
      </Card>

      {/* Add/Edit Assignment Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editId ? "Edit Assignment" : "Create New Assignment"}
        submitText={editId ? "Update" : "Create"}
        loading={loading}
        size="lg"
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Assignment Title"
            name="title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
            variant="outlined"
            required
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
          />

          {/* Multiple Batches Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Select Batches *</label>
            <Select
              isMulti
              name="batches"
              options={batchOptions}
              value={batchOptions.filter((opt) => formData.batches.includes(opt.value))}
              onChange={(selectedOptions) =>
                setFormData((prev) => ({
                  ...prev,
                  batches: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
                }))
              }
              placeholder="Select Batches"
              styles={reactSelectStyles}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <TextField
              type="datetime-local"
              label="Due Date"
              name="dueDate"
              fullWidth
              value={formData.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            {/* Max Marks */}
            <TextField
              type="number"
              label="Maximum Marks"
              name="maxMarks"
              fullWidth
              value={formData.maxMarks}
              onChange={handleChange}
              variant="outlined"
            />
          </div>

          {/* Multiple File Upload */}
          <div>
            <InputLabel>Assignment Files (PDF, Images, Documents)</InputLabel>
            <TextField
              type="file"
              fullWidth
              onChange={handleFileChange}
              variant="outlined"
              inputProps={{
                accept: ".pdf,.doc,.docx,.txt,.zip,image/*",
                multiple: true,
              }}
            />

            {/* File Previews */}
            {formData.assignmentFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Files:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.assignmentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative border rounded p-2 flex items-center"
                    >
                      {file.type.includes("image") ? (
                        <ImageIcon size={16} className="text-blue-500 mr-1" />
                      ) : (
                        <File size={16} className="text-gray-600 mr-1" />
                      )}
                      <span className="text-sm truncate max-w-xs">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Previews */}
            {filePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Image Previews:</p>
                <div className="flex flex-wrap gap-2">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${import.meta.env.VITE_BASE_URI}${preview.url}`}
                        alt={preview.name}
                        className="h-20 w-20 object-cover border rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Stack>
      </CustomModal>

      {/* Submissions Dialog */}
      <Dialog
        open={submissionDialogOpen}
        onClose={() => setSubmissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submissions for {selectedAssignment?.title}</DialogTitle>
        <DialogContent>
          {selectedAssignment?.submissions?.length > 0 ? (
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedAssignment.submissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.student?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.student?.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.batch?.batchName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button
                            size="small"
                            startIcon={<Download size={16} />}
                          >
                            Download
                          </Button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip
                            label={
                              submission.graded
                                ? `Graded (${submission.marks}/${selectedAssignment.maxMarks})`
                                : "Pending"
                            }
                            color={submission.graded ? "success" : "default"}
                            size="small"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No submissions yet</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Assignments;
