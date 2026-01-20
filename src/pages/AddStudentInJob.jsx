import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Checkbox,
  Typography,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
} from "@mui/material";
import { Home, ChevronRight, Users, UserPlus, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DataTable from "../components/DataTable";
import { toast } from "react-toastify";
import Select from "react-select";

function AddStudentInJob() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [tempSelectedStudents, setTempSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch batches and jobs on component mount
  useEffect(() => {
    fetchBatches();
    fetchJobs();
  }, []);

  // Fetch active batches
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/batches");
      if (res.data.success) {
        setBatches(res.data.batches || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/jobs");


      if (res.data.success) {
        setJobs(res.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students when batch is selected
  const fetchStudents = async (batchId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/batches/${batchId}`);
      const batchStudents = res.data.batch.students || [];
      setStudents(batchStudents);
      setTempSelectedStudents([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    if (batchId) {
      fetchStudents(batchId);
    } else {
      setStudents([]);
      setTempSelectedStudents([]);
    }
  };

  const handleJobChange = (opt) => {
    setSelectedJob(opt?.value || "");
  };

  const jobOptions = useMemo(
    () =>
      jobs.map((job) => ({
        value: job.id || job._id,
        label: `${job?.title} - ${job.company?.name || "N/A"}`,
      })),
    [jobs]
  );

  const batchOptions = useMemo(
    () =>
      batches.map((batch) => ({
        value: batch._id,
        label: `${batch.batchName} (${batch.branch?.name || "N/A"})`,
      })),
    [batches]
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

  const addSelectedStudentsToJob = async () => {
    if (!selectedJob) {
      toast.error("Please select a job first");
      return;
    }

    try {
      setLoading(true);
      const studentsToAdd = students.filter((student) =>
        tempSelectedStudents.includes(student._id)
      );

      // Add students to the job
      const res = await axios.put(`/jobs/${selectedJob}`, {
        assignedStudents: studentsToAdd.map((student) => student._id),
      });

      if (res.data.success) {
        toast.success(res.data.message || "Students added to job successfully");
        setSelectedStudents([...selectedStudents, ...studentsToAdd]);
        setTempSelectedStudents([]);
        setSnackbar({
          open: true,
          message: "Students added to job successfully!",
          severity: "success",
        });

        // Reset form
        setSelectedBatch("");
        setStudents([]);
        setSelectedJob("");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add students to job"
      );
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to add students to job",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter((s) => s._id !== studentId));
  };

  // Student table columns
  const studentColumns = [
    {
      label: "Select",
      accessor: "select",
      Cell: ({ row }) => (
        <Checkbox
          checked={tempSelectedStudents.includes(row._id)}
          onChange={() => handleTempStudentSelect(row._id)}
        />
      ),
    },
    {
      label: "Student",
      accessor: "name",
      Cell: ({ row }) => (
        <div className="flex items-center">
          <Avatar className="mr-3">{row.studentName?.charAt(0)}</Avatar>
          <div>
            <Typography variant="body1">{row.studentName}</Typography>
            <Typography variant="body2" color="textSecondary">
              {row.email || "N/A"}
            </Typography>
          </div>
        </div>
      ),
    },
    { label: "Course", accessor: "course" },
    { label: "Phone", accessor: "phone" },
  ];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Add Students to Job
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
      </div>

      {/* Job and Batch Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Select Job</label>
            <Select
              options={jobOptions}
              placeholder="- Select Job -"
              value={jobOptions.find((opt) => opt.value === selectedJob) || null}
              onChange={handleJobChange}
              styles={getSelectStyles()}
              classNamePrefix="react-select"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Select Batch</label>
            <Select
              options={batchOptions}
              placeholder="- Select Batch -"
              value={batchOptions.find((opt) => opt.value === selectedBatch) || null}
              onChange={(opt) => {
                const batchId = opt?.value || "";
                setSelectedBatch(batchId);
                if (batchId) {
                  fetchStudents(batchId);
                } else {
                  setStudents([]);
                  setTempSelectedStudents([]);
                }
              }}
              styles={getSelectStyles()}
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {selectedJob && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Job: {jobs.find((j) => j.id === selectedJob)?.title} -{" "}
              {jobs.find((j) => j._id === selectedJob)?.company?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently assigned students:{" "}
              {jobs.find((j) => j.id === selectedJob)?.assignedStudents
                ?.length || 0}
            </Typography>
            {jobs.find((j) => j.id === selectedJob)?.assignedStudents?.length !==
              0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  {/* <Typography variant="h6" gutterBottom>
                  Recently Added Students
                </Typography> */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {jobs.find((j) => j.id === selectedJob)?.assignedStudents?.map((student) => (
                      <Chip
                        key={student._id}
                        avatar={<Avatar>{student.studentName?.charAt(0)}</Avatar>}
                        label={student.studentName}
                        //   onDelete={() => removeStudent(student._id)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </div>
              )}
          </Box>
        )}
      </div>

      {/* Students DataTable */}
      {selectedBatch && students.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <Typography variant="h6" gutterBottom>
            Students in Selected Batch
          </Typography>

          <DataTable
            columns={studentColumns}
            data={students}
            loading={loading}
            showSearch={true}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex justify-between items-center mt-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={tempSelectedStudents.length === students.length}
                  indeterminate={
                    tempSelectedStudents.length > 0 &&
                    tempSelectedStudents.length < students.length
                  }
                  onChange={handleSelectAll}
                />
              }
              label="Select All"
            />

            <Button
              variant="contained"
              onClick={addSelectedStudentsToJob}
              disabled={tempSelectedStudents.length === 0 || !selectedJob}
              startIcon={<UserPlus size={18} />}
            >
              Add Selected ({tempSelectedStudents.length}) to Job
            </Button>
          </div>
        </div>
      )}

      {/* Selected Students Preview */}
      {selectedStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <Typography variant="h6" gutterBottom>
            Recently Added Students
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedStudents.map((student) => (
              <Chip
                key={student._id}
                avatar={<Avatar>{student.studentName?.charAt(0)}</Avatar>}
                label={student.studentName}
                onDelete={() => removeStudent(student._id)}
                variant="outlined"
              />
            ))}
          </Box>
        </div>
      )}

      {/* Empty States */}
      {selectedBatch && students.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No students found in this batch.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please select a different batch or add students to this batch first.
          </Typography>
        </div>
      )}

      {!selectedBatch && !selectedJob && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Select a Job and Batch
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please select a job and batch to start adding students.
          </Typography>
        </div>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AddStudentInJob;
