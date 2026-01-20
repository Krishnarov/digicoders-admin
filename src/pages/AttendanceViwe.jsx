
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  FormControl,
  InputLabel,

  MenuItem,
  Paper,
  TextField,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tabs,
  Tab,
  Divider,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Select from "react-select";
import {
  Home,
  ChevronRight,
  Download,
  FilterAlt,
  CalendarMonth,
  Person,
  ArrowUpward,
  ArrowDownward,
  Search,
  Clear,
  BarChart,
  PieChart,
  TrendingUp,
  People,
  Today,
  DateRange,
  Refresh,
  Visibility,
  VisibilityOff,
  Sort,
  Close,
  CheckCircle,
  Cancel,
  Warning,
  Group,
  School,
  CalendarToday,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Custom DataTable Component
import DataTable from "../components/DataTable";

function AttendanceView() {
  // State Management
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState({
    batches: false,
    attendance: false,
    export: false,
  });

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filtering
  const [searchTerm, setSearchTerm] = useState("");

  // Date Range Filter
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Chart Data States
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [overallChartData, setOverallChartData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalDays: 0,
    averageAttendance: 0,
    bestDay: { date: "", attendance: 0 },
    worstDay: { date: "", attendance: 0 },
    totalStudents: 0,
    totalPresent: 0,
    totalAbsent: 0,
  });

  // Modal States
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    data: null,
    students: [],
    presentStudents: [],
    absentStudents: [],
  });

  // Fetch batches on component mount
  useEffect(() => {
    fetchBatches();
    fetchOverallChartData();
  }, []);

  // Fetch attendance data when batch or filters change
  useEffect(() => {
    if (selectedBatch) {
      fetchAttendanceData();
    }
  }, [selectedBatch, dateRange, pagination.page, pagination.limit]);

  // Process data for charts when attendance data changes
  useEffect(() => {
    if (attendanceData.length > 0) {
      processChartData();
    }
  }, [attendanceData]);

  // Fetch active batches
  const fetchBatches = async () => {
    try {
      setLoading((prev) => ({ ...prev, batches: true }));
      const res = await axios.get("/batches");
      if (res.data.success) {
        setBatches(res.data.batches.filter((item) => item.isActive) || []);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading((prev) => ({ ...prev, batches: false }));
    }
  };

  // Fetch overall chart data for all batches
  const fetchOverallChartData = async () => {
    try {
      const res = await axios.get("/attendance/overall-chart");


      if (res.data.success) {
        setOverallChartData(res.data.data || []);
      } else {
        // If no API, generate sample data for all batches
        generateSampleOverallData();
      }
    } catch (error) {
      console.error("Error fetching overall chart data:", error);
      generateSampleOverallData();
    }
  };

  // Generate sample data for overall chart
  const generateSampleOverallData = () => {
    const sampleData = [];
    const batchNames = ["Batch A", "Batch B", "Batch C", "Batch D", "Batch E"];

    for (let i = 0; i < batchNames.length; i++) {
      const attendance = Math.floor(Math.random() * 30) + 70; // 70-100%
      sampleData.push({
        name: batchNames[i],
        attendance: attendance,
        students: Math.floor(Math.random() * 20) + 20, // 20-40 students
        present: Math.floor((attendance / 100) * 30), // 30 days
        absent: 30 - Math.floor((attendance / 100) * 30),
      });
    }
    setOverallChartData(sampleData);
  };

  // Fetch attendance data with pagination
  const fetchAttendanceData = async () => {
    try {
      setLoading((prev) => ({ ...prev, attendance: true }));

      const params = {
        batchId: selectedBatch,
        page: pagination.page,
        limit: pagination.limit,
      };

      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      const res = await axios.get(`/attendance/batch/${selectedBatch}`, {
        params,
      });

      if (res.data.success) {
        const data = res.data.data || [];
        setAttendanceData(data);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination?.totalRecords || 0,
          totalPages: res.data.pagination?.totalPages || 0,
        }));
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoading((prev) => ({ ...prev, attendance: false }));
    }
  };

  // Process data for charts and statistics
  const processChartData = () => {
    // For the selected batch, we'll process all data (not just current page)
    // You might need to fetch all data for chart processing or use aggregated API
    const allAttendanceData = attendanceData; // This is just current page data

    // For demo purposes, using current page data
    if (allAttendanceData.length > 0) {
      const dailyData = allAttendanceData
        .map((record) => ({
          date: new Date(record.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          fullDate: record.date,
          present: record.presents || 0,
          absent: record.absents || 0,
          total: record.total || 0,
          percentage: record.total
            ? Math.round((record.presents / record.total) * 100)
            : 0,
          records: record.records || [],
        }))
        .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

      setDailyAttendance(dailyData);

      // For student performance, you might need to fetch all records separately
      // This is simplified version
      const studentMap = new Map();

      allAttendanceData.forEach((record) => {
        record.records?.forEach((rec) => {
          const studentId = rec.studentId?._id || rec.studentId || "unknown";
          const studentName = rec.studentId?.studentName || "Unknown";
          const fatherName = rec.studentId?.fatherName || "";
          const enrollmentNo = rec.studentId?.enrollmentNo || "";

          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              id: studentId,
              name: studentName,
              fatherName,
              enrollmentNo,
              presentCount: 0,
              absentCount: 0,
              totalDays: 0,
              attendanceRecords: [],
            });
          }

          const student = studentMap.get(studentId);
          student.totalDays++;
          student.attendanceRecords.push({
            date: record.date,
            status: rec.status,
          });

          if (rec.status === "Present") {
            student.presentCount++;
          } else {
            student.absentCount++;
          }
        });
      });

      const studentPerformanceData = Array.from(studentMap.values())
        .map((student) => ({
          id: student.id,
          name: student.name,
          fatherName: student.fatherName,
          enrollmentNo: student.enrollmentNo,
          attendance: student.totalDays
            ? Math.round((student.presentCount / student.totalDays) * 100)
            : 0,
          present: student.presentCount,
          absent: student.absentCount,
          total: student.totalDays,
          attendanceRecords: student.attendanceRecords,
        }))
        .sort((a, b) => b.attendance - a.attendance);

      setStudentPerformance(studentPerformanceData);

      // Summary Statistics
      if (dailyData.length > 0) {
        const totalPresent = dailyData.reduce(
          (sum, day) => sum + day.present,
          0
        );
        const totalAbsent = dailyData.reduce((sum, day) => sum + day.absent, 0);
        const totalPossible = dailyData.reduce((sum, day) => sum + day.total, 0);
        const bestDay = dailyData.reduce(
          (best, day) => (day.percentage > best.percentage ? day : best),
          dailyData[0]
        );
        const worstDay = dailyData.reduce(
          (worst, day) => (day.percentage < worst.percentage ? day : worst),
          dailyData[0]
        );

        setSummaryStats({
          totalDays: dailyData.length,
          averageAttendance: totalPossible
            ? Math.round((totalPresent / totalPossible) * 100)
            : 0,
          bestDay: { date: bestDay.date, attendance: bestDay.percentage },
          worstDay: { date: worstDay.date, attendance: worstDay.percentage },
          totalStudents: studentMap.size,
          totalPresent,
          totalAbsent,
        });
      }
    }
  };

  // Handle batch selection
  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    // Reset pagination when batch changes
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  };

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
    // Reset to first page when filter changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const batchOptions = useMemo(
    () => [
      { value: "", label: "All Batches" },
      ...batches.map((batch) => ({
        value: batch._id,
        label: `${batch.batchName}${batch.trainingType?.name ? ` (${batch.trainingType.name})` : ""}`,
      })),
    ],
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
      padding: "1px",
      minHeight: "40px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  });

  const handleBatchSelectChange = (opt) => {
    const batchId = opt?.value || "";
    setSelectedBatch(batchId);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setDateRange({ startDate: "", endDate: "" });
    setSearchTerm("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // View student details for a specific date
  const viewStudentDetails = (dateData) => {
    const presentStudents = dateData.records?.filter(s => s.status === 'Present') || [];
    const absentStudents = dateData.records?.filter(s => s.status === 'Absent') || [];

    setDetailsModal({
      open: true,
      data: dateData,
      students: dateData.records || [],
      presentStudents,
      absentStudents,
    });
  };

  // Close modal
  const closeDetailsModal = () => {
    setDetailsModal({ open: false, data: null, students: [], presentStudents: [], absentStudents: [] });
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setLoading((prev) => ({ ...prev, export: true }));

      // For export, fetch all data without pagination
      const params = {
        batchId: selectedBatch,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        limit: 10000, // Large limit to get all data
      };

      const res = await axios.get(`/attendance/batch/${selectedBatch}`, {
        params,
      });

      let allData = [];
      if (res.data.success) {
        allData = res.data.data || [];
      } else {
        allData = Array.isArray(res.data) ? res.data : res.data.data || [];
      }

      if (allData.length === 0) return;

      // Group by student
      const studentMap = new Map();
      const allDates = new Set();

      allData.forEach((record) => {
        const dateStr = new Date(record.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        allDates.add(dateStr);

        record.records?.forEach((rec) => {
          const studentId = rec.studentId?._id || rec.studentId || "unknown";
          const studentName = rec.studentId?.studentName || "Unknown";
          const fatherName = rec.studentId?.fatherName || "N/A";
          const enrollmentNo = rec.studentId?.enrollmentNo || "";

          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              name: studentName,
              fatherName,
              enrollmentNo,
              attendance: {},
            });
          }

          const student = studentMap.get(studentId);
          student.attendance[dateStr] = rec.status;
        });
      });

      // Sort dates
      const sortedDates = Array.from(allDates).sort((a, b) => {
        const [d1, m1, y1] = a.split("/").map(Number);
        const [d2, m2, y2] = b.split("/").map(Number);
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
      });

      // Prepare worksheet data
      const worksheetData = [
        ["ATTENDANCE REPORT", "", "", ""],
        ["Batch:", batches.find((b) => b._id === selectedBatch)?.batchName || "Unknown", "", ""],
        ["Date Range:", `${dateRange.startDate || "Start"} to ${dateRange.endDate || "End"}`, "", ""],
        ["Generated:", new Date().toLocaleDateString("en-IN"), "", ""],
        [], // Empty row
        ["Enrollment No", "Student Name", "Father Name", ...sortedDates, "Total Present", "Attendance %"],
      ];

      // Add student rows
      studentMap.forEach((student) => {
        let presentCount = 0;
        const row = [student.enrollmentNo, student.name, student.fatherName];

        sortedDates.forEach((date) => {
          const status = student.attendance[date] || "-";
          row.push(status);
          if (status === "Present") presentCount++;
        });

        const totalDays = sortedDates.length;
        const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

        row.push(presentCount);
        row.push(`${percentage}%`);

        worksheetData.push(row);
      });

      // Summary row
      worksheetData.push([]);
      worksheetData.push(["SUMMARY", "", "", ""]);
      worksheetData.push(["Total Students:", studentMap.size, "", ""]);
      worksheetData.push(["Total Days:", sortedDates.length, "", ""]);
      worksheetData.push(["Average Attendance:", `${summaryStats.averageAttendance}%`, "", ""]);

      // Create workbook
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

      // Auto-size columns
      const wscols = [
        { wch: 15 }, // Enrollment No
        { wch: 25 }, // Student Name
        { wch: 25 }, // Father Name
        ...sortedDates.map(() => ({ wch: 12 })), // Date columns
        { wch: 15 }, // Total Present
        { wch: 15 }, // Attendance %
      ];
      worksheet["!cols"] = wscols;

      // Generate and download
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const batchName = batches.find((b) => b._id === selectedBatch)?.batchName || "batch";
      const fileName = `attendance_${batchName}_${new Date().toISOString().split("T")[0]}.xlsx`;
      saveAs(data, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setLoading((prev) => ({ ...prev, export: false }));
    }
  };

  // Get selected batch name
  const selectedBatchName = batches.find((b) => b._id === selectedBatch)?.batchName || "";

  // DataTable columns for attendance
  const attendanceColumns = useMemo(() => [
    {
      accessor: "date",
      label: "Date",
      sortable: true,
      Cell: ({ row }) => (
        <div>
          <Typography variant="body2" className="font-medium">
            {new Date(row.date).toLocaleDateString("en-IN", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {new Date(row.date).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </div>
      ),
    },
    {
      accessor: "attendBy.name",
      label: "Marked By",
      Cell: ({ row }) => (
        <Typography variant="body2">
          {row.attendBy?.name || "Unknown"}
        </Typography>
      ),
    },
    {
      accessor: "total",
      label: "Total Students",
      align: "center",
      Cell: ({ row }) => (
        <Chip
          icon={<Group />}
          label={row.total || 0}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      accessor: "presents",
      label: "Present",
      align: "center",
      Cell: ({ row }) => (
        <Chip
          icon={<CheckCircle />}
          label={row.presents || 0}
          size="small"
          color="success"
        />
      ),
    },
    {
      accessor: "absents",
      label: "Absent",
      align: "center",
      Cell: ({ row }) => (
        <Chip
          icon={<Cancel />}
          label={row.absents || 0}
          size="small"
          color="error"
        />
      ),
    },
    {
      accessor: "percentage",
      label: "Attendance %",
      align: "center",
      Cell: ({ row }) => {
        const attendancePercent = row.total
          ? Math.round((row.presents / row.total) * 100)
          : 0;
        return (
          <Box className="inline-flex items-center gap-2">
            <Typography
              variant="body2"
              className={`font-bold ${attendancePercent >= 80
                ? "text-green-600"
                : attendancePercent >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
                }`}
            >
              {attendancePercent}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={attendancePercent}
              className="w-16"
              color={
                attendancePercent >= 80
                  ? "success"
                  : attendancePercent >= 60
                    ? "warning"
                    : "error"
              }
            />
          </Box>
        );
      },
    },
    {
      accessor: "action",
      label: "Actions",
      align: "center",
      Cell: ({ row }) => {
        const dayData = {
          date: row.date,
          records: row.records || [],
          present: row.presents || 0,
          absent: row.absents || 0,
        };
        return (
          <Button
            size="small"
            variant="contained"
            startIcon={<Visibility />}
            onClick={() => viewStudentDetails(dayData)}
          >
            View Details
          </Button>
        );
      },
    },
  ], []);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Attendance Analytics
          </h1>
          <nav className="flex items-center text-sm text-gray-600">
            <Link to="/dashboard" className="flex items-center hover:text-blue-600 transition-colors">
              <Home className="w-4 h-4 mr-1" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-800 font-medium">Attendance View</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAttendanceData} disabled={loading.attendance}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportToExcel}
            disabled={!selectedBatch || attendanceData.length === 0 || loading.export}
            size="small"
          >
            {loading.export ? "Exporting..." : "Export Excel"}
          </Button>
        </div>
      </div>

      {/* Always Visible Line Chart - Overall Attendance */}
      <Paper className="p-4 mb-6 shadow-lg rounded-xl">
        <Typography variant="h6" className="mb-4 font-bold">
          Overall Attendance Trend
          {selectedBatchName && ` - ${selectedBatchName}`}
        </Typography>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={selectedBatch ? dailyAttendance : overallChartData}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) => {
                  if (selectedBatch) return value;
                  return value.length > 10 ? value.substring(0, 10) + '...' : value;
                }}
              />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip
                formatter={(value, name) => [
                  name === "attendance" || name === "percentage" ? `${value}%` : value,
                  name === "attendance" || name === "percentage" ? "Attendance %" :
                    name.charAt(0).toUpperCase() + name.slice(1),
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedBatch ? "percentage" : "attendance"}
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ stroke: "#8884d8", strokeWidth: 2, r: 4 }}
                name="Attendance %"
              />
              {!selectedBatch && (
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Total Students"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Typography variant="caption" className="text-gray-500 mt-2">
          {selectedBatch
            ? `Showing attendance trend for ${selectedBatchName}`
            : "Showing overall attendance trend for all batches"}
        </Typography>
      </Paper>

      {/* Filters Section */}
      <Paper className="p-4 mb-6 shadow-lg rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Batch Selector */}
          <div className="flex flex-col gap-1 col-span-1">
            <Select
              options={batchOptions}
              placeholder="Select Batch"
              value={batchOptions.find((opt) => opt.value === selectedBatch) || null}
              onChange={handleBatchSelectChange}
              styles={getSelectStyles()}
              classNamePrefix="react-select"
              isDisabled={loading.batches}
            />
          </div>

          {/* Date Range */}
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />

          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outlined" startIcon={<FilterAlt />} onClick={clearFilters} size="small">
              Clear Filters
            </Button>
          </div>
        </div>


      </Paper>

      {/* Summary Cards - Show only when batch is selected */}
      {selectedBatch && attendanceData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="caption">
                    Total Students
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {summaryStats.totalStudents}
                  </Typography>
                </div>
                <Group className="text-blue-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="caption">
                    Avg Attendance
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {summaryStats.averageAttendance}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={summaryStats.averageAttendance}
                    className="mt-2"
                    color={
                      summaryStats.averageAttendance >= 80
                        ? "success"
                        : summaryStats.averageAttendance >= 60
                          ? "warning"
                          : "error"
                    }
                  />
                </div>
                <TrendingUp className="text-green-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="caption">
                    Total Present
                  </Typography>
                  <Typography variant="h5" className="font-bold text-green-600">
                    {summaryStats.totalPresent}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    {summaryStats.totalDays} days
                  </Typography>
                </div>
                <CheckCircle className="text-green-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="caption">
                    Total Absent
                  </Typography>
                  <Typography variant="h5" className="font-bold text-red-600">
                    {summaryStats.totalAbsent}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    {summaryStats.totalDays} days
                  </Typography>
                </div>
                <Cancel className="text-red-500 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Data Table - Show only when batch is selected */}
      {selectedBatch && (
        <>
          {/* Daily Attendance Table */}
          <Paper className="shadow-lg rounded-xl overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <Typography variant="h6" className="font-bold">
                Daily Attendance Records - {selectedBatchName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Click on "View Details" to see student-wise attendance
              </Typography>
            </div>

            <DataTable
              columns={attendanceColumns}
              data={attendanceData}
              loading={loading.attendance}
              pagination={true}
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              showDateFilter={false}
              filters={dateRange}
              onFilterChange={(filters) => {
                setDateRange(filters);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              emptyMessage={
                <div className="p-8 text-center">
                  <CalendarMonth className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <Typography variant="h6" className="text-gray-600 mb-2">
                    No attendance records found
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    Try adjusting your filters or check back later.
                  </Typography>
                </div>
              }
            />
          </Paper>
        </>
      )}

      {/* Student Details Modal */}
      <Dialog
        open={detailsModal.open}
        onClose={closeDetailsModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center bg-gray-50">
          <div>
            <Typography variant="h6">Attendance Details</Typography>
            <Typography variant="body2" color="textSecondary">
              {detailsModal.data?.date ? new Date(detailsModal.data.date).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : ""} - {selectedBatchName}
            </Typography>
          </div>
          <IconButton onClick={closeDetailsModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers className="p-0">
          <div className="border-b flex gap-5">

            <Badge badgeContent={detailsModal.presentStudents.length} color="success">
              Present Students
            </Badge>


            <Badge badgeContent={detailsModal.absentStudents.length} color="error">
              Absent Students
            </Badge>

            <Badge badgeContent={detailsModal.students.length} color="primary">
              All Students
            </Badge>

          </div>

          <div className="p-4">
            {/* Present Students Table */}
            <div className="mb-6">
              <Typography variant="subtitle1" className="font-bold text-green-700 mb-2">
                Present Students ({detailsModal.presentStudents.length})
              </Typography>
              {detailsModal.presentStudents.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Father Name</TableCell>
                        {/* <TableCell>Enrollment No</TableCell> */}
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailsModal.presentStudents.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar sx={{ width: 32, height: 32 }} className="bg-green-100 text-green-800">
                                {student.studentId?.studentName?.charAt(0) || "?"}
                              </Avatar>
                              <Typography variant="body2">
                                {student.studentId?.studentName || "Unknown"}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {student.studentId?.fatherName || "N/A"}
                            </Typography>
                          </TableCell>
                          {/* <TableCell>
                            <Typography variant="body2">
                              {student.studentId?.enrollmentNo || "N/A"}
                            </Typography>
                          </TableCell> */}
                          <TableCell>
                            <Chip
                              icon={<CheckCircle />}
                              label="Present"
                              color="success"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography className="text-center py-4 text-gray-500">
                  No present students for this date
                </Typography>
              )}
            </div>

            <Divider className="my-4" />

            {/* Absent Students Table */}
            <div>
              <Typography variant="subtitle1" className="font-bold text-red-700 mb-2">
                Absent Students ({detailsModal.absentStudents.length})
              </Typography>
              {detailsModal.absentStudents.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Father Name</TableCell>
                        {/* <TableCell>Enrollment No</TableCell> */}
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailsModal.absentStudents.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar sx={{ width: 32, height: 32 }} className="bg-red-100 text-red-800">
                                {student.studentId?.studentName?.charAt(0) || "?"}
                              </Avatar>
                              <Typography variant="body2">
                                {student.studentId?.studentName || "Unknown"}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {student.studentId?.fatherName || "N/A"}
                            </Typography>
                          </TableCell>
                          {/* <TableCell>
                            <Typography variant="body2">
                              {student.studentId?.enrollmentNo || "N/A"}
                            </Typography>
                          </TableCell> */}
                          <TableCell>
                            <Chip
                              icon={<Cancel />}
                              label="Absent"
                              color="error"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography className="text-center py-4 text-gray-500">
                  No absent students for this date
                </Typography>
              )}
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDetailsModal}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Export this day's attendance
              console.log('Export day attendance');
            }}
          >
            Export This Day
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AttendanceView;