
import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  ChevronRight,
  Eye,
  Printer,
  Filter,
  XCircle,
  Edit2,
  Calendar,
  Download,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Chip,
  Tooltip,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Box,
  Typography,
  Badge,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";
import { Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { format } from "date-fns";

function RegReport() {
  const {
    fetchStudents,
    changePage,
    changeLimit,
    changeSort,
    changeFilters,
    changeSearch,
    clearAllFilters,
    currentState,
  } = useGetStudents();

  const {
    data: students,
    pagination,
    loading,
    filters,
    searchTerm,
  } = currentState;
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const [branches, setBranches] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [hrNames, setHrNames] = useState([]);

  // Initial fetch with default filters for accepted registrations
  useEffect(() => {
    fetchStudents({
      forceRefresh: true,
    });
  }, []);

  // Fetch filter options
  const getAllFilterOptions = async () => {
    try {
      // Get branches
      const branchesRes = await axios.get("/branches");
      if (branchesRes.data.success) {
        setBranches(branchesRes.data.data.filter((b) => b.isActive));
      }
      // Get HR names
      const hrRes = await axios.get("/hr");


      if (hrRes.data.success) {
        setHrNames(hrRes.data.data.filter((h) => h.isActive));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    getAllFilterOptions();
  }, []);

  const handlePrint = (student) => {
    window.open(`/receipt/${student._id}`, "_blank");
  };

  const handleEdit = (row) => {
    window.open(`/update-student/${row._id}`, "_blank");
  };

  const handleQrView = (row) => {
    if (row.qrcode?.image?.url) {
      setSelectedQrCode(row.qrcode.image.url);
      setQrModalOpen(true);
    }
  };

  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedQrCode(null);
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Link to={`/reg-student/${row._id}`} target="_blank">
            <Tooltip
              title={<span className="font-bold">View</span>}
              placement="top"
            >
              <button className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600">
                <Eye size={20} />
              </button>
            </Tooltip>
          </Link>
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
            title={<span className="font-bold">Print</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-purple-100 transition-colors border text-purple-600"
              onClick={() => handlePrint(row)}
            >
              <Printer size={20} />
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      label: "Tra Fee Status",
      accessor: "trainingFeeStatus",
      sortable: true,
      filter: false,
      filterKey: "trainingFeeStatus",
      filterOptions: [
        { label: "Full Paid", value: "full paid" },
        { label: "Partial Paid", value: "partial paid" },
        { label: "Pending", value: "pending" },
      ],
      Cell: ({ row }) => (
        <Chip
          label={row.trainingFeeStatus || "pending"}
          color={row.trainingFeeStatus === "full paid" ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      label: "Tnx Status",
      accessor: "tnxStatus",
      sortable: true,
      filter: false,
      filterKey: "tnxStatus",
      filterOptions: [
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
      ],
      Cell: ({ row }) => (
        <Chip
          label={row.tnxStatus || "pending"}
          color={row.tnxStatus === "paid" ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      label: "Enroll ID",
      accessor: "userid",
      sortable: true,
    },
    {
      label: "Student Name",
      accessor: "studentName",
      sortable: true,
    },
    {
      label: "Father Name",
      accessor: "fatherName",
      sortable: true,
    },
    {
      label: "Mobile",
      accessor: "mobile",
      sortable: true,
    },
    {
      label: "College Name",
      accessor: "collegeName",
      sortable: true,
      filter: false,
      filterKey: "collegeName",
      filterOptions: colleges.map((c) => ({ label: c.name, value: c._id })),
      Cell: ({ row }) => <span>{row.collegeName?.name || "-"}</span>,
    },
    {
      label: "Technology",
      accessor: "technology",
      sortable: true,
      filter: false,
      filterKey: "technology",
      filterOptions: technologies.map((t) => ({ label: t.name, value: t._id })),
      Cell: ({ row }) => <span>{row.technology?.name || "-"}</span>,
    },
    {
      label: "Amount",
      accessor: "amount",
      sortable: true,
      Cell: ({ row }) => `₹${row.amount || 0}`,
    },
    {
      label: "Total Fee",
      accessor: "totalFee",
      sortable: true,
      Cell: ({ row }) => `₹${row.totalFee || 0}`,
    },
    {
      label: "Paid Amount",
      accessor: "paidAmount",
      sortable: true,
      Cell: ({ row }) => `₹${row.paidAmount || 0}`,
    },
    {
      label: "Due Amount",
      accessor: "dueAmount",
      sortable: true,
      Cell: ({ row }) => `₹${row.dueAmount || 0}`,
    },
    {
      label: "Branch",
      accessor: "branch.name",
      filter: true,
      filterKey: "branch",
      filterOptions: branches.map((b) => ({
        label: b.name,
        value: b._id,
      })),
      sortable: true,
      Cell: ({ row }) => row.branch?.name || "N/A",
    },
    {
      label: "Payment Method",
      accessor: "paymentMethod",
      sortable: true,
      filter: false,
      filterKey: "paymentMethod",
      filterOptions: [
        { label: "Cash", value: "cash" },
        { label: "Online", value: "online" },
        { label: "Cheque", value: "cheque" },
      ],
    },
    {
      label: "Reg Date",
      accessor: "createdAt",
      sortable: true,
      Cell: ({ row }) => <span>{formatDate(row.createdAt)}</span>,
    },
    {
      label: "Hr Name",
      accessor: "hrName.name",
      sortable: true,
      filter: true,
      filterKey: "hrName",
      filterOptions: hrNames.map((h) => ({ label: h.name, value: h._id })),
      Cell: ({ row }) => row.hrName?.name || "N/A",
    },
    {
      label: "QR Code",
      accessor: "qrcode",
      Cell: ({ row }) => (
        <div
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[120px]"
          onClick={() => handleQrView(row)}
          title={row.qrcode?.name || "View QR"}
        >
          {row.qrcode?.name || (row.qrcode?.image?.url ? "View QR" : "N/A")}
        </div>
      ),
    },
  ];

  // Calculate totals for current filtered data
  const calculateTotals = () => {
    const totals = {
      totalStudents: students.length,
      totalAmount: students.reduce(
        (sum, student) => sum + (student.amount || 0),
        0
      ),
      totalFee: students.reduce(
        (sum, student) => sum + (student.totalFee || 0),
        0
      ),
      totalPaid: students.reduce(
        (sum, student) => sum + (student.paidAmount || 0),
        0
      ),
      totalDue: students.reduce(
        (sum, student) => sum + (student.dueAmount || 0),
        0
      ),
    };

    return totals;
  };

  const totals = calculateTotals();

  // Get user-applied filters (excluding default status)
  const getUserAppliedFilters = () => {
    const userFilters = { ...filters };
    // Remove default status filter
    delete userFilters.status;

    return Object.entries(userFilters)
      .filter(([key, value]) => value && value !== "" && value !== "All")
      .map(([key, value]) => ({ key, value }));
  };

  const appliedFilters = getUserAppliedFilters();
  const appliedFiltersCount = appliedFilters.length;

  // Export to Excel function
  const handleExportExcel = async () => {
    try {
      const params = { ...filters };
      params.limit = 10000; // Get all records
      params.page = 1;

      const res = await axios.get("/registration/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `registration-report-${format(new Date(), "dd-MM-yyyy")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
      console.error(error);
    }
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Registrations Reports
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

        {/* Action Buttons */}
        <Box className="flex items-center gap-2">
          <Button
            variant="contained"
            size="small"
            startIcon={<Download size={16} />}
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700"
          >
            Export
          </Button>

          {/* {appliedFiltersCount > 0 && (
            <Badge badgeContent={appliedFiltersCount} color="primary" className="mr-2">
              <Filter size={20} />
            </Badge>
          )} */}

          {appliedFiltersCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<XCircle size={16} />}
              onClick={clearAllFilters}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </div>

      {/* Summary Cards */}
      <Grid
        container
        className="mb-4"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        {[
          {
            title: "Total Registrations",
            value: totals.totalStudents,
            color: "blue",
            sub: "In current filter",
          },
          {
            title: "Total Amount",
            value: `₹${totals.totalAmount.toLocaleString()}`,
            color: "green",
            sub: "Total registration amount",
          },
          {
            title: "Total Paid",
            value: `₹${totals.totalPaid.toLocaleString()}`,
            color: "purple",
            sub: "Amount received",
          },
          {
            title: "Total Due",
            value: `₹${totals.totalDue.toLocaleString()}`,
            color: "orange",
            sub: "Pending amount",
          },
        ].map((item, i) => (
          <Grid
            key={i}
            item
            sx={{ width: "23%" }} // 👈 important
          >
            <Paper
              className={`p-3 border-l-4 border-${item.color}-500 shadow-sm`}
            >
              <Typography variant="subtitle2" className="text-gray-600">
                {item.title}
              </Typography>
              <Typography
                variant="h5"
                className={`font-bold text-${item.color}-600`}
              >
                {item.value}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {item.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Active Filters Display */}
      {/* {(appliedFiltersCount > 0 || searchTerm) && (
        <Box className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={18} className="text-blue-600" />
            <Typography variant="subtitle2" className="text-blue-800">
              Active Filters:
            </Typography>
          </div>
          <div className="flex flex-wrap gap-2">

            <Chip
              label="Status: accepted"
              color="success"
              size="small"
            />
            

            {filters.startDate && filters.endDate && (
              <Chip
                label={`Date: ${formatDisplayDate(filters.startDate)} - ${formatDisplayDate(filters.endDate)}`}
                onDelete={() => {
                  changeFilters({ startDate: "", endDate: "" });
                }}
                color="info"
                variant="outlined"
                size="small"
              />
            )}
            

            {appliedFilters.map(({ key, value }) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  changeFilters(newFilters);
                }}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
            

            {searchTerm && (
              <Chip
                label={`Search: ${searchTerm}`}
                onDelete={() => changeSearch("")}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
          </div>
        </Box>
      )} */}

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={students}
        loading={loading}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        onPageChange={changePage}
        onLimitChange={changeLimit}
        onSortChange={changeSort}
        onFilterChange={changeFilters}
        onSearch={changeSearch}
        showDateFilter={true} // Enable date filter for this page
        filters={filters} // Pass current filters to DataTable
        clearAllFilters={clearAllFilters}
      />

      {/* QR Code Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={handleQrModalClose}
        maxWidth="xs"
        fullWidth
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">QR Code</h2>
          <IconButton onClick={handleQrModalClose}>
            <Close />
          </IconButton>
        </div>
        <DialogContent className="flex flex-col items-center justify-center p-6">
          {selectedQrCode ? (
            <img
              src={`${import.meta.env.VITE_BASE_URI}${selectedQrCode}`}
              alt="QR Code"
              className="w-72 h-72 object-contain border rounded-lg"
            />
          ) : (
            <p className="text-gray-500">No QR code available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RegReport;
