import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Mail,
  Phone,
  User,
  Briefcase,
  Search,
  MoreVertical,
  LucideBuilding,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { toast } from "react-toastify";
import DataTable from "../components/DataTable";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Menu,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
} from "@mui/material";

function JobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    mode: "online",
    location: "",
  });
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/applications`);


      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setViewModalOpen(true);
  };

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setInterviewModalOpen(true);
  };

  const handleChangeStatus = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status); // Set current status as default
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const res = await axios.patch(
        `/applications/${selectedApplication._id}/status`,
        {
          status: newStatus,
        }
      );
      if (res.data.success) {
        toast.success("Status updated successfully");
        setStatusModalOpen(false);
        fetchApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleScheduleInterviewSubmit = async () => {
    try {
      const res = await axios.patch(
        `/applications/${selectedApplication._id}/schedule-interview`,
        interviewData
      );
      if (res.data.success) {
        toast.success("Interview scheduled successfully");
        setInterviewModalOpen(false);
        setInterviewData({
          date: "",
          time: "",
          mode: "online",
          location: "",
        });
        fetchApplications();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to schedule interview"
      );
    }
  };
  const [iFrame, setiframe] = useState(null);
  const handleDownloadCV = (cvUri) => {
    setiframe(cvUri);
    // if (cvUri) {
    //   window.open(cvUri, "_blank");
    // } else {
    //   toast.error("CV not available for download");
    // }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Applied: { color: "default", label: "Applied" },
      verified: { color: "primary", label: "Verified" },
      rejected: { color: "error", label: "Rejected" },
      interview_scheduled: { color: "warning", label: "Interview Scheduled" },
      completed: { color: "success", label: "Completed" },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status || "Pending",
    };

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  // Helper function to safely get company name
  const getCompanyName = (job) => {
    if (!job || !job.company) return "N/A";
    // Check if company is an object with a name property
    if (typeof job.company === "object" && job.company.name) {
      return job.company.name;
    }
    // If it's a string, return it directly
    if (typeof job.company === "string") {
      return job.company;
    }
    return "N/A";
  };

  const filteredApplications = applications.filter((application) => {
    const companyName = getCompanyName(application.job);
    const matchesSearch =
      (application.student?.studentName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (application.job?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleSelectedStatus = async (row) => {
    try {

      
      const res = await axios.patch(`/applications/${row._id}/status`, {
        status: "selected",
      });
      if (res.data.success) {
        toast.success("Status updated successfully");
        setStatusModalOpen(false);
        fetchApplications();
      }
    } catch (error) {
      console.log(error);
      
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };
  const handleRejectStatus = async (row) => {
    try {
      const res = await axios.patch(`/applications/${row._id}/status`, {
        status: "rejected",
      });
      if (res.data.success) {
        toast.success("Status updated successfully");
        setStatusModalOpen(false);
        fetchApplications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };
  const columns = [
    {
      label: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconButton size="small" onClick={() => handleViewDetails(row)}>
            <Eye size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => handleScheduleInterview(row)}>
            <Calendar size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => handleSelectedStatus(row)}>
            <CheckCircle size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => handleRejectStatus(row)}>
            <XCircle size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDownloadCV(row.cv?.uri)}
          >
            <Download size={16} />
          </IconButton>
        </div>
      ),
    },
    {
      label: "Student",
      accessor: "student",
      Cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar sx={{ width: 32, height: 32 }}>
            {row.student?.profilePhoto?.url ? (
              <img
                src={`${import.meta.env.VITE_BASE_URI}${row.student.profilePhoto.url}`}
                alt={row.student.studentName}
              />
            ) : (
              row.student?.studentName?.charAt(0) || "S"
            )}
          </Avatar>
          <div>
            <div className="font-medium text-sm">
              {row.student?.studentName || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              {row.student?.course || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Job Details",
      accessor: "job",
      Cell: ({ row }) => {
        const companyName = getCompanyName(row.job);
        return (
          <div>
            <div className="font-medium text-sm">{row.job?.title || "N/A"}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <LucideBuilding size={12} />
              {companyName}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={12} />
              {row.job?.location || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      label: "Applied On",
      accessor: "createdAt",
      Cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      label: "Status",
      accessor: "status",
      Cell: ({ row }) => getStatusChip(row.status),
    },
    {
      label: "Cover Letter",
      accessor: "coverLetter",
      Cell: ({ row }) => (
        <div className="text-sm">
          {row.coverLetter ? (
            <span title={row.coverLetter}>
              {row.coverLetter.length > 30
                ? `${row.coverLetter.substring(0, 30)}...`
                : row.coverLetter}
            </span>
          ) : (
            "No cover letter"
          )}
        </div>
      ),
    },
    {
      label: "Interview",
      accessor: "interview",
      Cell: ({ row }) =>
        row.interview?.date ? (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(row.interview.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {row.interview.time}
            </div>
            <div className="text-xs capitalize">{row.interview.mode}</div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Not scheduled</span>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Job Applications
          </h1>
          <nav className="flex items-center text-sm text-gray-600">
            <Link
              to="/dashboard"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-800">Applications</span>
          </nav>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Applied">Applied</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="interview_scheduled">
                Interview Scheduled
              </MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredApplications}
        loading={loading}
        pagination
        itemsPerPage={10}
      />

      {/* Application Details Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Student Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span>
                        {selectedApplication.student?.studentName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span>{selectedApplication.student?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span>
                        {selectedApplication.student?.mobile || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-gray-500" />
                      <span>
                        {selectedApplication.student?.course || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Job Information
                  </h3>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {selectedApplication.job?.title || "N/A"}
                    </div>
                    <div className="text-gray-600">
                      {getCompanyName(selectedApplication.job)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} />
                      {selectedApplication.job?.location || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Cover Letter
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  {selectedApplication.coverLetter ||
                    "No cover letter provided."}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">CV</h3>
                {selectedApplication.cv?.uri ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Download size={16} />}
                      onClick={() =>
                        handleDownloadCV(selectedApplication.cv.uri)
                      }
                    >
                      Download CV
                    </Button>
                    <Typography variant="body2" color="textSecondary">
                      Click to download the applicant's CV
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="error">CV not available</Typography>
                )}
              </div>

              {selectedApplication.interview && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Interview Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span>
                        {new Date(
                          selectedApplication.interview.date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <span>{selectedApplication.interview.time || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Mode:</span>
                      <span className="capitalize">
                        {selectedApplication.interview.mode || "N/A"}
                      </span>
                    </div>
                    {selectedApplication.interview.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span>{selectedApplication.interview.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Interview Modal */}
      <Dialog
        open={interviewModalOpen}
        onClose={() => {
          setInterviewModalOpen(false);
          setInterviewData({
            date: "",
            time: "",
            mode: "online",
            location: "",
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Schedule Interview for {selectedApplication?.student?.studentName}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-4">
            <TextField
              label="Interview Date"
              type="date"
              fullWidth
              value={interviewData.date}
              onChange={(e) =>
                setInterviewData({ ...interviewData, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Interview Time"
              type="time"
              fullWidth
              value={interviewData.time}
              onChange={(e) =>
                setInterviewData({ ...interviewData, time: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Interview Mode</InputLabel>
              <Select
                value={interviewData.mode}
                label="Interview Mode"
                onChange={(e) =>
                  setInterviewData({ ...interviewData, mode: e.target.value })
                }
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
            {interviewData.mode === "offline" && (
              <TextField
                label="Location"
                fullWidth
                value={interviewData.location}
                onChange={(e) =>
                  setInterviewData({
                    ...interviewData,
                    location: e.target.value,
                  })
                }
                required
              />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterviewModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleScheduleInterviewSubmit}
            variant="contained"
            disabled={
              !interviewData.date ||
              !interviewData.time ||
              (interviewData.mode === "offline" && !interviewData.location)
            }
          >
            Schedule Interview
          </Button>
        </DialogActions>
      </Dialog>
      {/* {iframe && ( */}
      <Dialog
        open={iFrame}
        onClose={() => setiframe(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <iframe
            src={iFrame}
            width="100%"
            height="600px"
            style={{ border: "none" }}
          ></iframe>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setiframe(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default JobApplications;
