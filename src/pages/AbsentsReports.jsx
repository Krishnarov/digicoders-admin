import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home,
  ChevronRight,
  Calendar,
  User,
  BookOpen,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Eye
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
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert
} from "@mui/material";
import DataTable from '../components/DataTable';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';
import { format, parseISO, differenceInDays } from 'date-fns';

function AbsentsReports() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalAbsentStudents: 0,
    averageAbsentDays: 0,
    mostAbsentStudent: null,
    highestAbsentDays: 0
  });
  const [filters, setFilters] = useState({
    batch: '',
    student: '',
    fromDate: '',
    toDate: '',
    minAbsentDays: ''
  });
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(false);

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

  // Fetch absent reports
  const fetchAbsentReports = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = {};
      if (filters.batch) params.batchId = filters.batch;
      if (filters.student) params.studentId = filters.student;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.minAbsentDays) params.minAbsentDays = filters.minAbsentDays;

      const response = await axios.get('/attendance/absent-reports', { params });

      if (response.data.success) {
        setReports(response.data.data || []);
        setStats(response.data.stats || {
          totalAbsentStudents: 0,
          averageAbsentDays: 0,
          mostAbsentStudent: null,
          highestAbsentDays: 0
        });
      }
    } catch (error) {
      console.error('Error fetching absent reports:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch absent reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch student details
  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`/attendance/student/${studentId}/absent-details`);
      if (response.data.success) {
        setSelectedStudent(response.data.data);
        setStudentDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to fetch student details');
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchAbsentReports();
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
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => fetchStudentDetails(row.studentId)}
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
            <div className="text-xs text-gray-500">{row.registrationId || row.studentId}</div>
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
          <BookOpen size={14} className="text-gray-400" />
          <span>{row.batchName}</span>
        </div>
      )
    },
    {
      label: 'Total Days',
      accessor: 'totalDays',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-center">
          <span className="font-bold text-lg">{row.totalDays}</span>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      label: 'Present Days',
      accessor: 'presentDays',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-center">
          <span className="font-bold text-green-600 text-lg">{row.presentDays}</span>
          <div className="text-xs text-gray-500">days</div>
        </div>
      )
    },
    {
      label: 'Absent Days',
      accessor: 'absentDays',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-center">
          <span className="font-bold text-red-600 text-lg">{row.absentDays}</span>
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
        if (percentage < 50) color = 'error';
        else if (percentage < 75) color = 'warning';

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{percentage.toFixed(1)}%</span>
              <span>{row.presentDays}/{row.totalDays}</span>
            </div>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={color}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </div>
        );
      }
    },
    {
      label: 'Last Present',
      accessor: 'lastPresentDate',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-sm">
          {row.lastPresentDate ? (
            <>
              <div>{format(parseISO(row.lastPresentDate), 'dd MMM yyyy')}</div>
              <div className="text-xs text-gray-500">
                {differenceInDays(new Date(), parseISO(row.lastPresentDate))} days ago
              </div>
            </>
          ) : (
            <span className="text-gray-400">No record</span>
          )}
        </div>
      )
    },
    {
      label: 'Last Absent',
      accessor: 'lastAbsentDate',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-sm">
          {row.lastAbsentDate ? (
            <>
              <div>{format(parseISO(row.lastAbsentDate), 'dd MMM yyyy')}</div>
              <div className="text-xs text-gray-500">
                {row.consecutiveAbsentDays > 1 ?
                  `${row.consecutiveAbsentDays} consecutive days` :
                  'Today'
                }
              </div>
            </>
          ) : (
            <span className="text-gray-400">No record</span>
          )}
        </div>
      )
    },
    {
      label: 'Status',
      accessor: 'attendanceStatus',
      sortable: true,
      Cell: ({ row }) => {
        const percentage = row.attendancePercentage || 0;
        let status = 'Good';
        let color = 'success';

        if (percentage < 50) {
          status = 'Poor';
          color = 'error';
        } else if (percentage < 75) {
          status = 'Average';
          color = 'warning';
        }

        return (
          <Chip
            label={status}
            color={color}
            size="small"
            variant="outlined"
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
    fetchAbsentReports();
  };

  const handleResetFilters = () => {
    setFilters({
      batch: '',
      student: '',
      fromDate: '',
      toDate: '',
      minAbsentDays: ''
    });
  };

  const exportToExcel = () => {
    // Implement export functionality
    toast.info('Export feature coming soon');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Absent Students Reports</h1>
            <div className="flex items-center text-gray-600">
              <Home className="w-4 h-4 mr-1" />
              <ChevronRight className="w-3 h-3 mx-1" />
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span className="text-gray-800 font-medium">Absent Reports</span>
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
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Total Absent Students
                  </Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {stats.totalAbsentStudents}
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Average Absent Days
                  </Typography>
                  <Typography variant="h4" className="font-bold text-orange-700">
                    {stats.averageAbsentDays.toFixed(1)}
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Most Absent Student
                  </Typography>
                  <Typography variant="h6" className="font-bold text-purple-700 truncate">
                    {stats.mostAbsentStudent?.studentName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" className="text-purple-600">
                    {stats.highestAbsentDays} days
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" variant="body2">
                    Report Generated
                  </Typography>
                  <Typography variant="h6" className="font-bold text-blue-700">
                    {format(new Date(), 'dd MMM yyyy')}
                  </Typography>
                  <Typography variant="body2" className="text-blue-600">
                    {format(new Date(), 'hh:mm a')}
                  </Typography>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-700" />
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

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Min Absent Days"
                value={filters.minAbsentDays}
                onChange={(e) => handleFilterChange('minAbsentDays', e.target.value)}
                placeholder="e.g., 5"
              />
            </Grid>

            <Grid item xs={12}>
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

      {/* DataTable */}

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


      {/* Student Details Dialog */}
      <Dialog
        open={studentDetailsOpen}
        onClose={() => setStudentDetailsOpen(false)}
        maxWidth="md"
        fullWidth
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
                    <h2 className="text-xl font-bold">Absent Details</h2>
                    <p className="text-blue-100 text-sm">
                      {selectedStudent.studentName} - {selectedStudent.batchName}
                    </p>
                  </div>
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="p-6">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="mb-3">
                    <CardContent>
                      <Typography variant="h6" className="font-bold mb-3">
                        Attendance Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-700">
                              {selectedStudent.totalDays}
                            </div>
                            <div className="text-sm text-gray-600">Total Days</div>
                          </div>
                        </Grid>
                        <Grid item xs={6}>
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-700">
                              {selectedStudent.presentDays}
                            </div>
                            <div className="text-sm text-gray-600">Present Days</div>
                          </div>
                        </Grid>
                        <Grid item xs={6}>
                          <div className="text-center p-2 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-700">
                              {selectedStudent.absentDays}
                            </div>
                            <div className="text-sm text-gray-600">Absent Days</div>
                          </div>
                        </Grid>
                        <Grid item xs={6}>
                          <div className="text-center p-2 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-700">
                              {selectedStudent.attendancePercentage?.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Attendance %</div>
                          </div>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" className="font-bold mb-3">
                        Recent Absent Dates
                      </Typography>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedStudent.absentDates?.length > 0 ? (
                          selectedStudent.absentDates.slice(0, 10).map((date, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span>{format(parseISO(date), 'dd MMM yyyy')}</span>
                              </div>
                              <Chip
                                label="Absent"
                                color="error"
                                size="small"
                                variant="outlined"
                              />
                            </div>
                          ))
                        ) : (
                          <Alert severity="info">No absent records found</Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {selectedStudent.consecutiveAbsentDays > 1 && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      <strong>Warning:</strong> This student has been absent for{' '}
                      {selectedStudent.consecutiveAbsentDays} consecutive days.
                      Last present on {selectedStudent.lastPresentDate ?
                        format(parseISO(selectedStudent.lastPresentDate), 'dd MMM yyyy') :
                        'N/A'}
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
              >
                Send Warning
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}

export default AbsentsReports;