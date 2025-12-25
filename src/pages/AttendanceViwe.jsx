import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Home,
  ChevronRight,
  Download,
  FilterAlt,
  CalendarMonth,
  Person,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AttendanceView() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

  const batchName =
    batches.find((batch) => batch._id === selectedBatch)?.batchName ||
    "Unknown";

  // Fetch batches
  const fetchBatches = async () => {
    try {
      const res = await axios.get("/batches");
      setBatches(res.data.batches.filter((item) => item.isActive) || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Fetch attendance data when batch is selected
  const fetchAttendanceData = async (batchId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/attendance/batch/${batchId}`);


      // Handle both array and object response formats
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setAttendanceData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (filters.startDate || filters.endDate) {
      applyDateFilters();
    } else {
      setFilteredData(attendanceData);
    }
  }, [filters, attendanceData]);

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    if (batchId) {
      fetchAttendanceData(batchId);
    } else {
      setAttendanceData([]);
      setFilteredData([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyDateFilters = () => {
    let filtered = [...attendanceData];

    if (filters.startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (item) => new Date(item.date) <= new Date(filters.endDate)
      );
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "" });
    setFilteredData(attendanceData);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Sort students alphabetically by name
  const sortStudentsAlphabetically = (records) => {
    return [...records].sort((a, b) => {
      const nameA = a.studentId?.studentName || "Unknown";
      const nameB = b.studentId?.studentName || "Unknown";

      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  };

 const exportToExcel = () => {
  if (filteredData.length === 0) return;

  // Group attendance by student
  const studentAttendanceMap = {};

  // Process each day's attendance
  filteredData.forEach((attendanceRecord) => {
    const dateObj = new Date(attendanceRecord.date);
    const formattedDate = dateObj
      .toLocaleDateString("en-GB") // 02/09/2025
      .replace(/\//g, "-");        // 02-09-2025

    attendanceRecord.records.forEach((record) => {
      const studentId = record.studentId?._id || "unknown";

      if (!studentAttendanceMap[studentId]) {
        studentAttendanceMap[studentId] = {
          studentName: record.studentId?.studentName || "Unknown",
          fatherName: record.studentId?.fatherName || "N/A",
          attendance: {},
        };
      }

      // Store attendance status for this full date
      studentAttendanceMap[studentId].attendance[formattedDate] =
        record.status;
    });
  });

  // Get all unique formatted dates
  const allDays = [
    ...new Set(
      filteredData.map((record) => {
        return new Date(record.date)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-");
      })
    ),
  ].sort((a, b) => {
    const [d1, m1, y1] = a.split("-").map(Number);
    const [d2, m2, y2] = b.split("-").map(Number);
    return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
  });

  // Prepare worksheet data
  const worksheetData = [
    [
      "",
      `Batch : ${batchName || "Unknown"} , Date : ${
        filters.startDate || "Start"
      } To ${filters.endDate || "End"}`,
    ],
    ["Student Name", "Father Name", ...allDays],
  ];

  // Convert student map to array and sort alphabetically
  const sortedStudents = Object.values(studentAttendanceMap).sort((a, b) => {
    if (sortOrder === "asc") {
      return a.studentName.localeCompare(b.studentName);
    } else {
      return b.studentName.localeCompare(a.studentName);
    }
  });

  // Add each student's data
  sortedStudents.forEach((student) => {
    const row = [student.studentName, student.fatherName];

    // Add attendance status for each day
    allDays.forEach((day) => {
      row.push(student.attendance[day] || "");
    });

    worksheetData.push(row);
  });

  // Create worksheet & workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Get date range for filename
  const dateRange =
    filters.startDate && filters.endDate
      ? `${filters.startDate}_to_${filters.endDate}`
      : "all_dates";

  saveAs(data, `attendance_${batchName}_${dateRange}.xlsx`);
};


  const getOverallStats = () => {
    const totalRecords = filteredData.reduce(
      (total, record) => total + (record.total || 0),
      0
    );
    const presentCount = filteredData.reduce(
      (total, record) => total + (record.presents || 0),
      0
    );
    const absentCount = filteredData.reduce(
      (total, record) => total + (record.absents || 0),
      0
    );

    return { totalRecords, presentCount, absentCount };
  };

  const stats = getOverallStats();

  return (
    
      <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 lg:mb-8 gap-3">
          <div className="flex items-center flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-3 md:pr-4 mr-3 md:mr-4">
              Attendance View
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

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <FormControl className="w-full md:max-w-xs">
                <InputLabel>Select Batch</InputLabel>
                <Select
                  value={selectedBatch}
                  onChange={handleBatchChange}
                  label="Select Batch"
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Select a batch</em>
                  </MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch._id} value={batch._id}>
                      {batch.batchName} ({batch.trainingType?.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Start Date"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                className="w-full md:max-w-xs"
                disabled={loading}
              />

              <TextField
                label="End Date"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                className="w-full md:max-w-xs"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <Button
                variant="outlined"
                color="secondary"
                onClick={clearFilters}
                disabled={loading}
                className="flex-1 md:flex-none"
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                onClick={toggleSortOrder}
                startIcon={
                  sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />
                }
                className="flex-1 md:flex-none"
              >
                Sort A-Z
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportToExcel}
                disabled={filteredData.length === 0 || loading}
                className="flex-1 md:flex-none"
              >
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Statistics Cards */}
        {selectedBatch && filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50">
              <CardContent className="text-center p-4">
                <Typography variant="h6" className="text-blue-600 mb-2">
                  Total Records
                </Typography>
                <Typography variant="h4" className="font-bold text-blue-800">
                  {stats.totalRecords}
                </Typography>
                <Typography variant="body2" className="text-blue-600 mt-1">
                  across {filteredData.length} days
                </Typography>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="text-center p-4">
                <Typography variant="h6" className="text-green-600 mb-2">
                  Total Present
                </Typography>
                <Typography variant="h4" className="font-bold text-green-800">
                  {stats.presentCount}
                </Typography>
                <Typography variant="body2" className="text-green-600 mt-1">
                  {stats.totalRecords > 0
                    ? `${Math.round(
                        (stats.presentCount / stats.totalRecords) * 100
                      )}% attendance`
                    : "0%"}
                </Typography>
              </CardContent>
            </Card>

            <Card className="bg-red-50">
              <CardContent className="text-center p-4">
                <Typography variant="h6" className="text-red-600 mb-2">
                  Total Absent
                </Typography>
                <Typography variant="h4" className="font-bold text-red-800">
                  {stats.absentCount}
                </Typography>
                <Typography variant="body2" className="text-red-600 mt-1">
                  {stats.totalRecords > 0
                    ? `${Math.round(
                        (stats.absentCount / stats.totalRecords) * 100
                      )}% absence`
                    : "0%"}
                </Typography>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardContent className="text-center p-4">
                <Typography variant="h6" className="text-purple-600 mb-2">
                  Attendance Days
                </Typography>
                <Typography variant="h4" className="font-bold text-purple-800">
                  {filteredData.length}
                </Typography>
                <Typography variant="body2" className="text-purple-600 mt-1">
                  records found
                </Typography>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Data */}
        {filteredData.length > 0 ? (
          <div className="space-y-6">
            {filteredData.map((attendanceRecord) => (
              <Paper
                key={attendanceRecord._id}
                className="p-4 md:p-6 shadow-md"
              >
                {/* Header with date and summary */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                  <div>
                    <Typography
                      variant="h6"
                      className="font-semibold text-gray-800"
                    >
                      {new Date(attendanceRecord.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-1">
                      Marked by: {attendanceRecord.attendBy?.name || "Unknown"}
                    </Typography>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Chip
                      icon={<Person className="w-4 h-4" />}
                      label={`Total: ${attendanceRecord.total}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Present: ${attendanceRecord.presents}`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`Absent: ${attendanceRecord.absents}`}
                      color="error"
                      variant="outlined"
                    />
                  </div>
                </div>

                {/* Students list */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Typography
                      variant="subtitle2"
                      className="font-medium text-gray-700"
                    >
                      Students Attendance:
                    </Typography>
                    <Chip
                      icon={
                        sortOrder === "asc" ? (
                          <ArrowUpward />
                        ) : (
                          <ArrowDownward />
                        )
                      }
                      label={`Sorted ${sortOrder === "asc" ? "A-Z" : "Z-A"}`}
                      size="small"
                      variant="outlined"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sortStudentsAlphabetically(attendanceRecord.records).map(
                      (record, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            record.status === "Present"
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <Typography
                                variant="body2"
                                className="font-medium"
                              >
                                {record.studentId?.studentName ||
                                  "Unknown Student"}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-gray-600"
                              >
                                {record.studentId?.fatherName || "N/A"}
                              </Typography>
                            </div>
                            <Chip
                              label={record.status}
                              color={
                                record.status === "Present"
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                              className="text-xs"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Paper>
            ))}
          </div>
        ) : selectedBatch ? (
          <Paper className="p-8 text-center shadow-md">
            <CalendarMonth className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              {filters.startDate || filters.endDate
                ? "No attendance records found for the selected date range"
                : "No attendance records found for this batch"}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {loading
                ? "Loading attendance data..."
                : "Try selecting a different date range or check back later."}
            </Typography>
          </Paper>
        ) : (
          <Paper className="p-8 text-center shadow-md">
            <CalendarMonth className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-600">
              Please select a batch to view attendance records
            </Typography>
          </Paper>
        )}
      </div>
    
  );
}

export default AttendanceView;
