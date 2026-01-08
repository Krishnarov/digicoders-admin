import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  FormControl,
  Checkbox,
  Typography,
  Alert,
  Snackbar,
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Home,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Loader2,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DataTable from "../components/DataTable";

function Attendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState({
    fetching: false,
    submitting: false,
    checking: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [existingAttendanceId, setExistingAttendanceId] = useState(null);
  const [todayAttendanceExists, setTodayAttendanceExists] = useState(false);

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
    const notMarked = students.length - (present + absent);

    return {
      present,
      absent,
      notMarked,
      total: students.length
    };
  }, [attendance, students.length]);

  // Filter and Sort students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((s) =>
        s.studentName?.toLowerCase().includes(lowerTerm)
      );
    }

    return result.sort(
      (a, b) => a.studentName?.localeCompare(b.studentName) || 0
    );
  }, [students, searchTerm]);


  // Fetch active batches
  const fetchBatches = async () => {
    try {
      const res = await axios.get("/batches");
      if (res.data.success) {
        setBatches(res.data.batches.filter((item) => item.isActive) || []);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Check if attendance exists for today
  const checkTodayAttendance = useCallback(async (batchId) => {
    try {
      setLoading(prev => ({ ...prev, checking: true }));
      const res = await axios.get(`/attendance/batch/${batchId}/today`);

      if (res.data.success && res.data.exists) {
        setTodayAttendanceExists(true);
        setExistingAttendanceId(res.data.data._id);
        return res.data.data;
      } else {
        setTodayAttendanceExists(false);
        setExistingAttendanceId(null);
        return null;
      }
    } catch (error) {
      console.error("Error checking today's attendance:", error);
      setTodayAttendanceExists(false);
      setExistingAttendanceId(null);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, checking: false }));
    }
  }, []);

  // Load existing attendance data properly
  const loadExistingAttendance = useCallback((attendanceData, studentsList) => {
    const attendanceObj = {};

    // Initialize all students as Absent first
    studentsList.forEach(student => {
      attendanceObj[student._id] = "Absent";
    });

    // Then update with existing attendance data
    if (attendanceData && attendanceData.records) {
      attendanceData.records.forEach(record => {
        // Handle both populated student object and studentId string
        const studentId = record.studentId?._id || record.studentId;
        if (studentId && attendanceObj.hasOwnProperty(studentId)) {
          attendanceObj[studentId] = record.status || "Absent";
        }
      });
    }

    setAttendance(attendanceObj);
  }, []);

  // Fetch students when batch is selected
  const fetchStudents = useCallback(async (batchId) => {
    try {
      setLoading(prev => ({ ...prev, fetching: true }));

      // Fetch batch details
      const batchRes = await axios.get(`/batches/${batchId}`);
      const batchStudents = batchRes.data.batch.students || [];
      setStudents(batchStudents);

      // Check if attendance exists for today
      const existingAttendance = await checkTodayAttendance(batchId);

      if (existingAttendance) {
        // Load existing attendance
        loadExistingAttendance(existingAttendance, batchStudents);

        setSnackbar({
          open: true,
          message: "Today's attendance found. You can update it.",
          severity: "info",
        });
      } else {
        // No existing attendance, initialize all as Absent
        const initialAttendance = {};
        batchStudents.forEach((student) => {
          initialAttendance[student._id] = "Absent";
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setSnackbar({
        open: true,
        message: "Error fetching students data",
        severity: "error",
      });
    } finally {
      setLoading(prev => ({ ...prev, fetching: false }));
    }
  }, [checkTodayAttendance, loadExistingAttendance]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleBatchChange = useCallback(async (event, newValue) => {
    const batch = newValue;
    setSelectedBatch(batch);

    if (batch && batch._id) {
      await fetchStudents(batch._id);
    } else {
      setStudents([]);
      setAttendance({});
      setTodayAttendanceExists(false);
      setExistingAttendanceId(null);
    }
  }, [fetchStudents]);

  const markAttendance = useCallback((studentId, status) => {
    const newAttendance = {
      ...attendance,
      [studentId]: status,
    };
    setAttendance(newAttendance);
  }, [attendance]);

  const markAll = useCallback((status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  }, [students]);

  // Get attendance status for a student
  const getStudentStatus = useCallback((studentId) => {
    return attendance[studentId] || "Absent";
  }, [attendance]);

  // Submit or Update attendance
  const submitAttendance = async () => {
    try {
      setLoading(prev => ({ ...prev, submitting: true }));

      // Prepare records array - include ALL students
      const records = students.map((student) => ({
        studentId: student._id,
        status: getStudentStatus(student._id)
      }));

      const presents = records.filter(r => r.status === "Present").length;
      const absents = records.filter(r => r.status === "Absent").length;
      const total = students.length;

      const attendanceData = {
        batchId: selectedBatch._id,
        date: currentDateTime,
        records,
        presents,
        absents,
        total
      };

      let res;
      if (todayAttendanceExists && existingAttendanceId) {
        // Update existing attendance
        res = await axios.put(`/attendance/${existingAttendanceId}`, attendanceData);
      } else {
        // Create new attendance
        res = await axios.post("/attendance", attendanceData);
      }

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: res.data.message ||
            (todayAttendanceExists ? "Attendance updated successfully!" : "Attendance submitted successfully!"),
          severity: "success",
        });

        // Refresh the data
        await fetchStudents(selectedBatch._id);
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);

      if (error.response?.data?.message?.includes("already exists")) {
        setSnackbar({
          open: true,
          message: "Attendance already exists. Try refreshing to load existing data.",
          severity: "warning",
        });
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Error submitting attendance. Please try again.",
          severity: "error",
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  // Refresh existing attendance
  const refreshAttendance = async () => {
    if (selectedBatch && selectedBatch._id) {
      await fetchStudents(selectedBatch._id);
    }
  };

  const studentColumns = [
    {
      label: "Attendance",
      accessor: "select",
      Cell: ({ row }) => {
        const studentStatus = getStudentStatus(row._id);
        const isPresent = studentStatus === "Present";

        return (
          <div className="flex flex-col items-center space-y-1">
            <Checkbox
              checked={isPresent}
              onChange={(e) =>
                markAttendance(row._id, e.target.checked ? "Present" : "Absent")
              }
              color="success"
              className="!p-1"
              disabled={loading.fetching}
            />
            <span
              className={`text-xs font-medium ${isPresent ? "text-green-600" : "text-red-600"}`}
            >
              {isPresent ? "Present" : "Absent"}
            </span>
          </div>
        );
      },
    },
    {
      label: "Student Name",
      accessor: "studentName",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base font-medium">
          {row.studentName}
        </span>
      ),
    },
    {
      label: "Due Amount",
      accessor: "dueAmount",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base">
          ₹{row.dueAmount || 0}
        </span>
      ),
    },
    {
      label: "Join Date",
      accessor: "createdAt",
      Cell: ({ row }) => (
        <span className="text-sm md:text-base">
          {new Date(row.createdAt).toLocaleDateString('en-IN')}
        </span>
      ),
    },
  ];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
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

      {/* Status Banner */}
      {todayAttendanceExists && (
        <Box className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <Typography variant="body1" className="text-blue-800 font-medium">
                Attendance already marked for today. You can update it.
              </Typography>
            </div>
            <Button
              size="small"
              startIcon={<RefreshCw size={16} />}
              onClick={refreshAttendance}
              disabled={loading.checking}
            >
              {loading.checking ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </Box>
      )}

      {/* Batch Selection and Date/Time */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="w-full lg:max-w-md">
            <Autocomplete
              options={batches}
              getOptionLabel={(option) => option.batchName || ""}
              value={selectedBatch}
              onChange={handleBatchChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Batch"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={loading.fetching}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading.fetching && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              fullWidth
            />
          </div>

          <div className="text-center lg:text-right w-full lg:w-auto">
            <div className="flex items-center justify-center lg:justify-end gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              <Typography className="!font-semibold !text-lg md:!text-xl">
                {formattedDate}
              </Typography>
            </div>
            <div className="flex items-center justify-center lg:justify-end gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <Typography className="!text-gray-600 !text-sm md:!text-base">
                {formattedTime}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Students DataTable */}
      <div className="w-full">
        {selectedBatch ? (
          students.length > 0 ? (
            <>
              <DataTable
                columns={studentColumns}
                data={filteredAndSortedStudents}
                loading={loading.fetching}
                pagination={false}
                search
                onSearch={setSearchTerm}
              />

              {/* Attendance Summary Cards */}
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
                    {attendanceCounts.absent}
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
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => markAll("Present")}
                    disabled={students.length === 0 || loading.fetching}
                    size="small"
                    startIcon={<UserCheck size={16} />}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => markAll("Absent")}
                    disabled={students.length === 0 || loading.fetching}
                    size="small"
                    startIcon={<UserX size={16} />}
                  >
                    Mark All Absent
                  </Button>
                </div>

                <Button
                  variant="contained"
                  color={todayAttendanceExists ? "warning" : "primary"}
                  onClick={submitAttendance}
                  disabled={loading.submitting || loading.fetching || students.length === 0}
                  size="medium"
                  startIcon={
                    loading.submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading.submitting
                    ? "Submitting..."
                    : todayAttendanceExists
                      ? "Update Attendance"
                      : "Submit Attendance"}
                </Button>
              </div>
            </>
          ) : !loading.fetching ? (
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <div className="text-lg md:text-xl text-gray-600 mb-2">
                No students found in this batch.
              </div>
              <div className="text-sm text-gray-500">
                Please select a different batch or add students to this batch.
              </div>
            </div>
          ) : null
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <div className="text-lg md:text-xl text-gray-600 mb-2">
              Please select a batch to mark attendance
            </div>
            <div className="text-sm text-gray-500">
              Choose a batch from the dropdown above to get started.
            </div>
          </div>
        )}
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Attendance;