import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  Download,
  Edit2,
  Trash2,
  Loader2,
  Plus
} from "lucide-react";
import {
  Card,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,

  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "../axiosInstance";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";
import Select from "react-select";

function AssignmentGrading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [markData, setMarkData] = useState({
    marks: "",
    remarks: ""
  });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/assignments/${id}`);
      if (res.data.success) {
        setAssignment(res.data.assignment);

        // If there's only one batch, select it automatically
        if (res.data.assignment.batches?.length === 1) {
          setSelectedBatch(res.data.assignment.batches[0]._id);
          fetchStudents(res.data.assignment.batches[0]._id);
        }

        // Load existing submissions
        loadSubmissions(res.data.assignment);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch assignment");
      console.error("Error fetching assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = (assignmentData) => {
    const submissionsMap = {};
    assignmentData.submissions?.forEach(sub => {
      submissionsMap[sub.student._id] = sub;
    });
    setSubmissions(submissionsMap);
  };

  const fetchStudents = async (batchId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/batches/${batchId}`);

      if (res.data.success) {
        setStudents(res.data.batch.students || []);

        // Pre-populate grades with existing submission data
        const gradesMap = {};
        res.data.batch.students.forEach(student => {
          if (submissions[student._id]) {
            gradesMap[student._id] = submissions[student._id].marks || "";
          } else {
            gradesMap[student._id] = "";
          }
        });
        setGrades(gradesMap);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch students");
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (opt) => {
    const batchId = opt?.value || "";
    setSelectedBatch(batchId);
    if (batchId) {
      fetchStudents(batchId);
    }
  };

  const batchOptions = React.useMemo(
    () =>
      assignment?.batches?.map((batch) => ({
        value: batch._id,
        label: batch.batchName,
      })),
    [assignment]
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

  const handleGradeChange = (studentId, value) => {
    // Validate that the grade is a number between 0 and maxMarks
    if (value === "" || (Number(value) >= 0 && Number(value) <= assignment.maxMarks)) {
      setGrades(prev => ({
        ...prev,
        [studentId]: value
      }));
    }
  };

  const saveGrades = async () => {
    try {
      setSaving(true);

      // Prepare grades data
      const gradesData = Object.entries(grades).map(([studentId, marks]) => ({
        studentId,
        marks: marks === "" ? null : Number(marks)
      }));

      const res = await axios.post(`/assignments/${id}/grade`, {
        batchId: selectedBatch,
        grades: gradesData
      });

      if (res.data.success) {
        toast.success("Grades saved successfully");
        // Update submissions with new data
        loadSubmissions(res.data.assignment || assignment);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save grades");
      console.error("Error saving grades:", error);
    } finally {
      setSaving(false);
    }
  };

  const downloadSubmission = (studentId) => {
    const submission = submissions[studentId];
    if (submission && submission.submissionFiles && submission.submissionFiles.length > 0) {
      // Open the first submission file in a new tab
      window.open(submission.submissionFiles[0].url, "_blank");
    } else {
      toast.info("No submission file available for this student");
    }
  };

  // Open mark modal for a specific student
  const openMarkModal = (student) => {
    setSelectedStudent(student);
    const submission = submissions[student._id];
    setMarkData({
      marks: submission?.marks || "",
      remarks: submission?.remarks || ""
    });
    setMarkModalOpen(true);
  };

  // Save mark for individual student
  const saveIndividualMark = async () => {
    try {
      setSaving(true);

      const res = await axios.post(`/assignments/${id}/grade`, {
        batchId: selectedBatch,
        grades: [{
          studentId: selectedStudent._id,
          marks: markData.marks === "" ? null : Number(markData.marks),
          remarks: markData.remarks
        }]
      });

      if (res.data.success) {
        toast.success("Mark saved successfully");
        setMarkModalOpen(false);
        // Update submissions with new data
        loadSubmissions(res.data.assignment || assignment);
        // Update grades state
        setGrades(prev => ({
          ...prev,
          [selectedStudent._id]: markData.marks
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save mark");
      console.error("Error saving mark:", error);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for DataTable
  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip
            title={<span className="font-bold">Add Marks</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-green-100 transition-colors border text-green-600"
              onClick={() => openMarkModal(row)}
            >
              <Plus size={20} />
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      label: "Student Name",
      accessor: "studentName",
      // Cell: ({ row }) => (
      //   <div className="font-medium">{row.studentName}</div>
      // )
    },
    { label: "Email", accessor: "email" },
    {
      label: "Submission",
      accessor: "submission",
      Cell: ({ row }) => {
        const submission = submissions[row._id];
        const hasSubmitted = !!submission;

        return (
          <div>
            {hasSubmitted ? (
              <Tooltip title="Download submission">
                <IconButton
                  size="small"
                  onClick={() => downloadSubmission(row._id)}
                >
                  <Download size={18} />
                </IconButton>
              </Tooltip>
            ) : (
              <Chip
                label="Not submitted"
                size="small"
                color="default"
                variant="outlined"
              />
            )}
          </div>
        );
      }
    },
    {
      label: "Marks",
      accessor: "marks",
      Cell: ({ row }) => {
        const submission = submissions[row._id];
        const hasSubmitted = !!submission;

        return (
          <TextField
            type="number"
            size="small"
            value={grades[row._id] || ""}
            onChange={(e) => handleGradeChange(row._id, e.target.value)}
            inputProps={{
              min: 0,
              max: assignment?.maxMarks || 100,
              step: 0.5
            }}
            disabled={!hasSubmitted}
            sx={{ width: 100 }}
          />
        );
      }
    },
    {
      label: "Status",
      accessor: "status",
      Cell: ({ row }) => {
        const submission = submissions[row._id];
        const hasSubmitted = !!submission;
        const isGraded = hasSubmitted && submission.graded;

        return (
          <div>
            {hasSubmitted ? (
              isGraded ? (
                <Chip
                  icon={<CheckCircle size={16} />}
                  label="Graded"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<XCircle size={16} />}
                  label="Pending"
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )
            ) : (
              <Chip
                label="Not submitted"
                size="small"
                color="default"
                variant="outlined"
              />
            )}
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LinearProgress className="w-64" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Alert severity="error">Assignment not found</Alert>
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Grade Assignment
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
            <Link
              to="/assignments"
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              Assignments
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-blue-600">Grade</span>
          </nav>
        </div>

        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/assignments")}
        >
          Back to Assignments
        </Button>
      </div>

      {/* Assignment Info */}
      <Card className="p-6 mb-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{assignment.title}</h2>
        <p className="text-gray-600 mb-4">{assignment.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-700">Max Marks: {assignment.maxMarks}</span>
          </div>

          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-700">
              Batches: {assignment.batches?.map(b => b.batchName).join(", ")}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-gray-700">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Batch Selection */}
      <Card className="p-6 mb-6 shadow-md">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Select Batch</label>
          <Select
            options={batchOptions}
            placeholder="Select Batch"
            value={batchOptions?.find((opt) => opt.value === selectedBatch) || null}
            onChange={handleBatchChange}
            styles={getSelectStyles()}
            classNamePrefix="react-select"
          />
        </div>
      </Card>

      {/* Students List for Grading */}
      {selectedBatch && (
        <Card className="p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Students in Selected Batch
            </h2>

            <Button
              variant="contained"
              startIcon={<Save size={20} />}
              onClick={saveGrades}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save All Grades"}
            </Button>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No students in this batch</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={students}
              loading={loading}
              title="Student List"
            />
          )}
        </Card>
      )}

      {/* Add Mark Modal */}
      <Dialog
        open={markModalOpen}
        onClose={() => setMarkModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Marks for {selectedStudent?.name}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              label="Marks"
              type="number"
              fullWidth
              value={markData.marks}
              onChange={(e) => setMarkData({ ...markData, marks: e.target.value })}
              inputProps={{
                min: 0,
                max: assignment.maxMarks,
                step: 0.5
              }}
              variant="outlined"
            />

            <TextField
              label="Remarks"
              multiline
              rows={3}
              fullWidth
              value={markData.remarks}
              onChange={(e) => setMarkData({ ...markData, remarks: e.target.value })}
              variant="outlined"
              placeholder="Add any comments or feedback for the student..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={saveIndividualMark}
            variant="contained"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Marks"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AssignmentGrading;