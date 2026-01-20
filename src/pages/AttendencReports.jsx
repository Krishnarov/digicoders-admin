import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home,
  ChevronRight,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  FileText,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import DataTable from '../components/DataTable';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

function AttendencReports() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    bestAttendanceStudent: null,
    worstAttendanceStudent: null,
    totalPresentDays: 0,
    totalAbsentDays: 0
  });
  const [filters, setFilters] = useState({
    batch: '',
    student: '',
    month: format(new Date(), 'yyyy-MM'),
    fromDate: '',
    toDate: '',
    minAttendance: '',
    maxAttendance: ''
  });
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState([]);

  // Fetch all batches
  const fetchBatches = async () => {
    try {
      const response = await axios.get('/batches?status=active');
      if (response.data.success) {
        setBatches(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Fetch students based on batch
  const fetchStudents = async (batchId) => {
    try {
      if (!batchId) {
        setStudents([]);
        return;
      }
      const response = await axios.get(`/registration/batch/${batchId}/students`);
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch attendance reports
  const fetchAttendanceReports = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = {};
      if (filters.batch) params.batchId = filters.batch;
      if (filters.student) params.studentId = filters.student;
      if (filters.month) params.month = filters.month;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.minAttendance) params.minAttendance = filters.minAttendance;
      if (filters.maxAttendance) params.maxAttendance = filters.maxAttendance;

      const response = await axios.get('/attendance/reports', { params });

      if (response.data.success) {
        setReports(response.data.data || []);
        setStats(response.data.stats || {
          totalStudents: 0,
          averageAttendance: 0,
          bestAttendanceStudent: null,
          worstAttendanceStudent: null,
          totalPresentDays: 0,
          totalAbsentDays: 0
        });

        if (response.data.monthlyData) {
          setMonthlyData(response.data.monthlyData);
        }

        if (response.data.dailyAttendance) {
          setDailyAttendance(response.data.dailyAttendance);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance reports:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch attendance reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch student detailed report
  const fetchStudentReport = async (studentId) => {
    try {
      const response = await axios.get(`/attendance/student/${studentId}/detailed-report`, {
        params: { month: filters.month }
      });
      if (response.data.success) {
        setSelectedStudent(response.data.data);
        setStudentDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching student report:', error);
      toast.error('Failed to fetch student report');
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchAttendanceReports();
  }, []);

  useEffect(() => {
    if (filters.batch) {
      fetchStudents(filters.batch);
    }
  }, [filters.batch]);

  const columns = useMemo(() => [
    {
      label: 'Action',
      accessor: 'action',
      sortable: false,
      Cell: ({ row }) => (
        <Tooltip title="View Detailed Report">
          <IconButton
            size="small"
            onClick={() => fetchStudentReport(row.studentId)}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Eye size={18} />
          </IconButton>
        </Tooltip>
      )
    },
    {
      label: 'Student',
      accessor: 'studentName',
      sortable: true,
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 bg-blue-100 text-blue-600">
            {row.studentName?.charAt(0) || 'S'}
          </Avatar>
          <div>
            <div className="font-medium">{row.studentName}</div>
            <div className="text-xs text-gray-500">
              {row.registrationId || row.studentId}
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Batch',
      accessor: 'batchName',
      sortable: true,
      Cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <span>{row.batchName}</span>
        </div>
      )
    },
    {
      label: 'Working Days',
      accessor: 'workingDays',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-center">
          <span className="font-bold text-lg">{row.workingDays}</span>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      label: 'Present',
      accessor: 'presentDays',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle size={14} className="text-green-600" />
            <span className="font-bold text-green-600 text-lg">{row.presentDays}</span>
          </div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      label: 'Absent',
      accessor: 'absentDays',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <XCircle size={14} className="text-red-600" />
            <span className="font-bold text-red-600 text-lg">{row.absentDays}</span>
          </div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      label: 'Late',
      accessor: 'lateDays',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock size={14} className="text-yellow-600" />
            <span className="font-bold text-yellow-600 text-lg">{row.lateDays || 0}</span>
          </div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      label: 'Attendance %',
      accessor: 'attendancePercentage',
      sortable: true,
      Cell: ({ row }) => {
        const percentage = row.attendancePercentage || 0;
        let color = 'success';
        if (percentage < 75) color = 'error';
        else if (percentage < 85) color = 'warning';

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-bold">{percentage.toFixed(1)}%</span>
              <span className="text-gray-500">
                {row.presentDays}/{row.workingDays}
              </span>
            </div>
            <LinearProgress
              variant="determinate"
              value={percentage > 100 ? 100 : percentage}
              color={color}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <div className="text-xs text-gray-500 text-center">
              {percentage >= 85 ? 'Excellent' :
                percentage >= 75 ? 'Good' :
                  percentage >= 60 ? 'Average' : 'Poor'}
            </div>
          </div>
        );
      }
    },
    {
      label: 'Monthly Trend',
      accessor: 'monthlyTrend',
      sortable: false,
      Cell: ({ row }) => {
        const trend = row.monthlyTrend || [];
        return (
          <div className="flex items-center h-8">
            {trend.slice(0, 15).map((day, idx) => (
              <Tooltip key={idx} title={`${format(parseISO(day.date), 'dd MMM')}: ${day.status}`}>
                <div
                  className={`w-2 h-4 mx-px rounded-sm ${day.status === 'Present' ? 'bg-green-500' :
                    day.status === 'Absent' ? 'bg-red-500' :
                      day.status === 'Late' ? 'bg-yellow-500' :
                        'bg-gray-200'
                    }`}
                />
              </Tooltip>
            ))}
            {trend.length > 15 && (
              <span className="text-xs text-gray-500 ml-1">+{trend.length - 15}</span>
            )}
          </div>
        );
      }
    },
    {
      label: 'Last 7 Days',
      accessor: 'last7Days',
      sortable: false,
      Cell: ({ row }) => {
        const last7Days = row.last7Days || [];
        const presentCount = last7Days.filter(d => d === 'Present').length;
        return (
          <div className="text-center">
            <div className="font-bold">{presentCount}/7</div>
            <div className="text-xs text-gray-500">
              {((presentCount / 7) * 100).toFixed(0)}%
            </div>
          </div>
        );
      }
    },
    {
      label: 'Status',
      accessor: 'attendanceStatus',
      sortable: true,
      Cell: ({ row }) => {
        const percentage = row.attendancePercentage || 0;
        let status = 'Excellent';
        let color = 'success';

        if (percentage < 60) {
          status = 'Poor';
          color = 'error';
        } else if (percentage < 75) {
          status = 'Average';
          color = 'warning';
        } else if (percentage < 85) {
          status = 'Good';
          color = 'info';
        }

        return (
          <Chip
            label={status}
            color={color}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        );
      }
    }
  ], []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchAttendanceReports();
  };

  const handleResetFilters = () => {
    setFilters({
      batch: '',
      student: '',
      month: format(new Date(), 'yyyy-MM'),
      fromDate: '',
      toDate: '',
      minAttendance: '',
      maxAttendance: ''
    });
  };

  const exportToExcel = () => {
    // Implement export functionality
    toast.info('Export feature coming soon');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    if (!filters.month) return [];

    const [year, month] = filters.month.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));

    return eachDayOfInterval({ start, end });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
            <div className="flex items-center text-gray-600">
              <Home className="w-4 h-4 mr-1" />
              <ChevronRight className="w-3 h-3 mx-1" />
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span className="text-gray-800 font-medium">Attendance Reports</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<Filter size={18} />}
            onClick={handleApplyFilters}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Apply Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={exportToExcel}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Total Students
                  </Typography>
                  <Typography variant="h4" className="font-bold text-blue-700">
                    {stats.totalStudents}
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Avg. Attendance
                  </Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {stats.averageAttendance.toFixed(1)}%
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Present Days
                  </Typography>
                  <Typography variant="h4" className="font-bold text-purple-700">
                    {stats.totalPresentDays}
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Absent Days
                  </Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {stats.totalAbsentDays}
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Best Student
                  </Typography>
                  <Typography variant="body1" className="font-bold text-amber-700 truncate">
                    {stats.bestAttendanceStudent?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" className="text-amber-600">
                    {stats.bestAttendanceStudent?.percentage?.toFixed(1) || 0}%
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Worst Student
                  </Typography>
                  <Typography variant="body1" className="font-bold text-orange-700 truncate">
                    {stats.worstAttendanceStudent?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" className="text-orange-600">
                    {stats.worstAttendanceStudent?.percentage?.toFixed(1) || 0}%
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Card */}
      <Card className="mb-6 shadow-sm border">
        <CardContent className="p-4">
          <Typography variant="h6" className="font-bold mb-4 flex items-center gap-2">
            <Filter size={20} />
            Filter Options
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Batch</InputLabel>
                <Select
                  value={filters.batch}
                  label="Select Batch"
                  onChange={(e) => handleFilterChange('batch', e.target.value)}
                >
                  <MenuItem value="">All Batches</MenuItem>
                  {batches.map(batch => (
                    <MenuItem key={batch._id} value={batch._id}>
                      {batch.batchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={filters.student}
                  label="Select Student"
                  onChange={(e) => handleFilterChange('student', e.target.value)}
                  disabled={!filters.batch}
                >
                  <MenuItem value="">All Students</MenuItem>
                  {students.map(student => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.studentName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="month"
                label="Select Month"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From Date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To Date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Min Attendance %"
                value={filters.minAttendance}
                onChange={(e) => handleFilterChange('minAttendance', e.target.value)}
                placeholder="e.g., 75"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max Attendance %"
                value={filters.maxAttendance}
                onChange={(e) => handleFilterChange('maxAttendance', e.target.value)}
                placeholder="e.g., 100"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  className="border-gray-300"
                >
                  Reset Filters
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Card className="mb-6 shadow-sm border">
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem'
              }
            }}
          >
            <Tab label="Student Reports" icon={<Users size={18} />} iconPosition="start" />
            <Tab label="Monthly Overview" icon={<CalendarDays size={18} />} iconPosition="start" />
            <Tab label="Daily Attendance" icon={<Calendar size={18} />} iconPosition="start" />
          </Tabs>

          <div className="p-4">
            {activeTab === 0 && (
              <DataTable
                columns={columns}
                data={reports}
                loading={loading}
                page={1}
                limit={10}
                total={reports.length}
                onPageChange={() => { }}
                onLimitChange={() => { }}
                onSearch={() => { }}
                search={false}
                filter={false}
                showDateFilter={false}
              />
            )}

            {activeTab === 1 && monthlyData.length > 0 && (
              <div className="space-y-4">
                <Typography variant="h6" className="font-bold">
                  Monthly Attendance Overview - {format(new Date(filters.month + '-01'), 'MMMM yyyy')}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead className="bg-gray-50">
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="center">Total Students</TableCell>
                        <TableCell align="center">Present</TableCell>
                        <TableCell align="center">Absent</TableCell>
                        <TableCell align="center">Late</TableCell>
                        <TableCell align="center">Attendance %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyData.map((day, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            {format(parseISO(day.date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell align="center">{day.totalStudents}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={day.present}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={day.absent}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={day.late || 0}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <LinearProgress
                              variant="determinate"
                              value={day.percentage}
                              color={day.percentage >= 85 ? 'success' : day.percentage >= 75 ? 'warning' : 'error'}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" className="mt-1">
                              {day.percentage.toFixed(1)}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}

            {activeTab === 2 && dailyAttendance.length > 0 && (
              <div className="space-y-4">
                <Typography variant="h6" className="font-bold">
                  Daily Attendance Calendar - {format(new Date(filters.month + '-01'), 'MMMM yyyy')}
                </Typography>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-gray-600 p-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((date, index) => {
                    const dayData = dailyAttendance.find(d =>
                      format(parseISO(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    );
                    const isWeekendDay = isWeekend(date);

                    return (
                      <div
                        key={index}
                        className={`min-h-20 p-2 border rounded-lg ${isWeekendDay ? 'bg-gray-50' : 'bg-white'
                          } ${dayData ? 'border-blue-200' : 'border-gray-200'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-medium ${isWeekendDay ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                            {format(date, 'd')}
                          </span>
                          {dayData && (
                            <Chip
                              label={`${dayData.percentage?.toFixed(0) || 0}%`}
                              size="small"
                              color={
                                (dayData.percentage || 0) >= 85 ? 'success' :
                                  (dayData.percentage || 0) >= 75 ? 'warning' : 'error'
                              }
                            />
                          )}
                        </div>
                        {dayData ? (
                          <div className="mt-1 space-y-1">
                            <div className="text-xs">
                              <span className="text-green-600">✓ {dayData.present}</span>
                              <span className="mx-1">•</span>
                              <span className="text-red-600">✗ {dayData.absent}</span>
                            </div>
                            {dayData.late > 0 && (
                              <div className="text-xs text-yellow-600">
                                ⏰ {dayData.late} late
                              </div>
                            )}
                          </div>
                        ) : isWeekendDay ? (
                          <div className="text-xs text-gray-400 mt-2">Weekend</div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-2">No data</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog
        open={studentDetailsOpen}
        onClose={() => setStudentDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedStudent && (
          <>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-white/20">
                    {selectedStudent.studentName?.charAt(0) || 'S'}
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">Attendance Detailed Report</h2>
                    <p className="text-blue-100 text-sm">
                      {selectedStudent.studentName} - {selectedStudent.batchName}
                    </p>
                  </div>
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="p-6">
              <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Card variant="outlined" className="text-center p-3">
                        <Typography variant="h4" className="font-bold text-blue-700">
                          {selectedStudent.workingDays}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Working Days
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card variant="outlined" className="text-center p-3 bg-green-50">
                        <Typography variant="h4" className="font-bold text-green-700">
                          {selectedStudent.presentDays}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Present Days
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card variant="outlined" className="text-center p-3 bg-red-50">
                        <Typography variant="h4" className="font-bold text-red-700">
                          {selectedStudent.absentDays}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Absent Days
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Card variant="outlined" className="text-center p-3">
                        <Typography variant="h4" className="font-bold text-purple-700">
                          {selectedStudent.attendancePercentage?.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Attendance %
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Attendance Calendar */}
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" className="font-bold mb-3">
                        Monthly Attendance Calendar
                      </Typography>
                      <div className="grid grid-cols-7 gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                          <div key={day} className="text-center font-bold text-gray-500 text-sm p-1">
                            {day}
                          </div>
                        ))}
                        {selectedStudent.dailyAttendance?.map((day, index) => (
                          <Tooltip key={index} title={`${format(parseISO(day.date), 'dd MMM')}: ${day.status}`}>
                            <div className={`text-center p-1 rounded ${day.status === 'Present' ? 'bg-green-100 text-green-800' :
                              day.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                day.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-400'
                              }`}>
                              {format(parseISO(day.date), 'd')}
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                          <span>Present</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                          <span>Absent</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                          <span>Late</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                          <span>No Class</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Statistics */}
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" className="font-bold mb-3">
                        Statistics
                      </Typography>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Current Streak</span>
                            <span className="font-bold">
                              {selectedStudent.currentStreak || 0} days
                            </span>
                          </div>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((selectedStudent.currentStreak || 0) * 10, 100)}
                            color="success"
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Best Streak</span>
                            <span className="font-bold">
                              {selectedStudent.bestStreak || 0} days
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Last Absent</span>
                            <span className="font-bold">
                              {selectedStudent.lastAbsentDate ?
                                format(parseISO(selectedStudent.lastAbsentDate), 'dd MMM') :
                                'N/A'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Last Present</span>
                            <span className="font-bold">
                              {selectedStudent.lastPresentDate ?
                                format(parseISO(selectedStudent.lastPresentDate), 'dd MMM') :
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Detailed List */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" className="font-bold mb-3">
                        Detailed Attendance Records
                      </Typography>
                      <TableContainer className="max-h-60 overflow-y-auto">
                        <Table size="small">
                          <TableHead className="bg-gray-50">
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Day</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Time</TableCell>
                              <TableCell>Remarks</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStudent.detailedRecords?.map((record, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  {format(parseISO(record.date), 'dd MMM yyyy')}
                                </TableCell>
                                <TableCell>
                                  {format(parseISO(record.date), 'EEE')}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={record.status}
                                    size="small"
                                    color={
                                      record.status === 'Present' ? 'success' :
                                        record.status === 'Absent' ? 'error' :
                                          'warning'
                                    }
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  {record.time || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {record.remarks || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recommendations */}
                {selectedStudent.attendancePercentage < 75 && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      <strong>Attention Required:</strong> This student's attendance is below 75%.
                      Consider reaching out to understand the reasons for frequent absences.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions className="p-4 border-t">
              <Button
                onClick={() => setStudentDetailsOpen(false)}
                variant="outlined"
              >
                Close
              </Button>
              <Button
                variant="contained"
                className="bg-blue-600 hover:bg-blue-700"
                startIcon={<Download size={18} />}
              >
                Download Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default AttendencReports;