import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { Home, ChevronRight, Users, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DataTable from "../components/DataTable";

function Attendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Current date and time
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = currentDateTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate real-time attendance counts
  const attendanceCounts = useMemo(() => {
    const present = Object.values(attendance).filter(
      (status) => status === "Present"
    ).length;
    const absent = Object.values(attendance).filter(
      (status) => status === "Absent"
    ).length;
    const notMarked = Object.values(attendance).filter(
      (status) => status === null
    ).length;

    return { present, absent, notMarked, total: students.length };
  }, [attendance, students.length]);

  // Sort students alphabetically by name
  const sortedStudents = useMemo(() => {
    return [...students].sort(
      (a, b) => a.studentName?.localeCompare(b.studentName) || 0
    );
  }, [students]);

  // Fetch active batches
  const fetchBatches = async () => {
    try {
      const res = await axios.get("/batches");
      console.log(res);
      if (res.data.success) {
        setBatches(res.data.batches.filter((item) => item.isActive) || []);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Load attendance data from localStorage
  const loadAttendanceFromStorage = () => {
    try {
      const savedData = localStorage.getItem("attendanceData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Check if the saved data is for the current date
        const today = new Date().toLocaleDateString("en-GB");
        if (parsedData.date === today) {
          setAttendance(parsedData.attendance || {});
          setSelectedBatch(parsedData.batchId || "");
          
          // Show notification that data was restored
          setSnackbar({
            open: true,
            message: "Previous attendance data restored from local storage.",
            severity: "info",
          });
          
          return parsedData.batchId;
        } else {
          // Clear old data if it's from a different date
          localStorage.removeItem("attendanceData");
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
    return null;
  };

  // Save attendance data to localStorage
  const saveAttendanceToStorage = (batchId, attendanceData) => {
    try {
      const dataToSave = {
        batchId,
        attendance: attendanceData,
        date: new Date().toLocaleDateString("en-GB"),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("attendanceData", JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  };

  // Clear attendance data from localStorage
  const clearAttendanceFromStorage = () => {
    try {
      localStorage.removeItem("attendanceData");
    } catch (error) {
      console.error("Error clearing data from localStorage:", error);
    }
  };

  // Fetch students when batch is selected
  const fetchStudents = async (batchId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/batches/${batchId}`);
      const batchStudents = res.data.batch.students || [];
      setStudents(batchStudents);

      // Initialize attendance status for all students as null
      const initialAttendance = {};
      batchStudents.forEach((student) => {
        initialAttendance[student._id] = null;
      });
      
      // Check if we have saved attendance data for this batch
      const savedBatchId = loadAttendanceFromStorage();
      if (savedBatchId === batchId) {
        // We've already loaded the saved data in loadAttendanceFromStorage
      } else {
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    
    // Load any saved attendance data on component mount
    const savedBatchId = loadAttendanceFromStorage();
    if (savedBatchId) {
      setSelectedBatch(savedBatchId);
      fetchStudents(savedBatchId);
    }
  }, []);

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    if (batchId) {
      fetchStudents(batchId);
    } else {
      setStudents([]);
      setAttendance({});
      clearAttendanceFromStorage();
    }
  };

  const markAttendance = (studentId, status) => {
    const newAttendance = {
      ...attendance,
      [studentId]: status,
    };
    setAttendance(newAttendance);
    
    // Save to localStorage whenever attendance is marked
    if (selectedBatch) {
      saveAttendanceToStorage(selectedBatch, newAttendance);
    }
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
    
    // Save to localStorage
    if (selectedBatch) {
      saveAttendanceToStorage(selectedBatch, newAttendance);
    }
  };

  const submitAttendance = async () => {
    try {
      setLoading(true);
      const attendanceData = {
        batchId: selectedBatch,
        absents: attendanceCounts.total - attendanceCounts.present,
        presents: attendanceCounts.present,
        total: attendanceCounts.total,
        date: currentDateTime,
        records: Object.keys(attendance).map((studentId) => ({
          studentId,
          status: attendance[studentId] || "Absent",
        })),
      };

      const res = await axios.post("/attendance", attendanceData);
      if(res.data.success){
        // Clear localStorage on successful submission
      clearAttendanceFromStorage();
      
      setSnackbar({
        open: true,
        message: "Attendance submitted successfully!",
        severity: "success",
      });
   
      }
     
      setSelectedBatch("");
      setStudents([]);
      setAttendance({});
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setSnackbar({
        open: true,
        message: "Error submitting attendance. Data saved locally. Please try again later.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const studentColumns = [
    {
      label: "Select",
      accessor: "select",
      Cell: ({ row }) => (
        <div className="flex flex-col items-center space-y-1">
          <Checkbox
            checked={attendance[row._id] === "Present"}
            onChange={(e) =>
              markAttendance(row._id, e.target.checked ? "Present" : "Absent")
            }
            color="success"
            className="!p-1"
          />
          <span
            className={`text-xs font-medium ${
              attendance[row._id] === "Present"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {attendance[row._id] === "Present" ? "Present" : "Absent"}
          </span>
        </div>
      ),
    },
    {
      label: "Name",
      accessor: "studentName",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base font-medium">
          {row.studentName}
        </span>
      ),
    },
    {
      label: "Father Name",
      accessor: "fatherName",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base">{row.fatherName}</span>
      ),
    },
  ];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
 
      <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 lg:mb-8 gap-3">
          <div className="flex items-center flex-wrap">
            <h1 className="text-sm md:text-xl sm:text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-3 md:pr-4 mr-3 md:mr-4">
              Attendance Marking
            </h1>
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm md:text-base"
            >
              <Home className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-1" />
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 text-gray-400" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Batch Selection and Date/Time */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <FormControl className="w-full lg:max-w-xs">
              <InputLabel className="!text-sm md:!text-base">
                Select Batch
              </InputLabel>
              <Select
                value={selectedBatch}
                onChange={handleBatchChange}
                label="Select Batch"
                className="!text-sm md:!text-base"
              >
                <MenuItem value="">
                  <span className="text-sm md:text-base">Select a batch</span>
                </MenuItem>
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    <span className="text-sm md:text-base">
                      {batch.batchName} ({batch.trainingType?.name })
                    </span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="text-center lg:text-right w-full lg:w-auto">
              <Typography className="!font-semibold !text-lg md:!text-xl">
                {formattedDate}
              </Typography>
              <Typography className="!text-gray-600 !text-sm md:!text-base">
                {formattedTime}
              </Typography>
            </div>
          </div>
        </div>

        {/* Students DataTable */}
        <div className="w-full">
          <DataTable
            columns={studentColumns}
            data={sortedStudents}
            loading={loading}
            showPagination={false}
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 mt-5">
            {/* Total Students Card */}
            <div className="bg-blue-50 rounded-lg shadow-sm p-3 md:p-4 text-center">
              <Users className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1 md:mb-2 text-blue-600" />
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-800">
                {attendanceCounts.total}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Total Students
              </div>
            </div>

            {/* Present Card */}
            <div className="bg-green-50 rounded-lg shadow-sm p-3 md:p-4 text-center">
              <UserCheck className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1 md:mb-2 text-green-600" />
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-700">
                {attendanceCounts.present}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Present</div>
            </div>

            {/* Absent Card */}
            <div className="bg-red-50 rounded-lg shadow-sm p-3 md:p-4 text-center">
              <UserX className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1 md:mb-2 text-red-600" />
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-red-700">
                {attendanceCounts.notMarked}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Absent</div>
            </div>

            {/* Not Marked Card */}
            {/* <div className="bg-gray-100 rounded-lg shadow-sm p-3 md:p-4 text-center">
              <Users className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto mb-1 md:mb-2 text-gray-600" />
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-700">
                {attendanceCounts.notMarked}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Not Marked</div>
            </div> */}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 mt-4 md:mt-6">
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => markAll("Present")}
                disabled={students.length === 0}
                size="small"
              >
                Mark All Present
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => markAll("Absent")}
                disabled={students.length === 0}
                size="small"
              >
                Mark All Absent
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => clearAttendanceFromStorage()}
                disabled={students.length === 0}
                size="small"
              >
                Clear
              </Button>
            </div>
            
            <button
              onClick={submitAttendance}
              disabled={loading || students.length === 0}
              className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium text-sm md:text-base transition-colors"
            >
              {loading ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
          
          {/* Local Storage Info */}
          {localStorage.getItem("attendanceData") && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Typography variant="body2" className="text-yellow-800">
                <strong>Note:</strong> Your attendance data is saved locally. 
                It will be automatically restored if you refresh the page or lose connection.
              </Typography>
            </div>
          )}
        </div>

        {/* Empty State */}
        {selectedBatch && students.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
            <div className="text-base md:text-lg text-gray-600">
              No students found in this batch.
            </div>
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

export default Attendance;