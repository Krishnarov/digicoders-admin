
import React, { useState, useEffect } from "react";
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
  X,
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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { toast } from "react-toastify";
import { format } from "date-fns";
import useGetFee from "../hooks/useGetFee";

function FeeReports() {
  const {
    feeData: students,
    loading,
    error,
    pagination,
    filters,
    filterOptions,
    fetchFee,
    updateFilters,
    updatePagination,
    clearFilters,
    setFilters,
    setPagination,
  } = useGetFee();

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  
  // Local state for filter inputs
  const [localFilters, setLocalFilters] = useState({
    branch: "",
    batch: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  // Sync local filters with hook filters
  useEffect(() => {
    setLocalFilters({
      branch: filters.branch || "",
      batch: filters.batch || "",
      paymentType: filters.paymentType || "",
      mode: filters.mode || "",
      tnxStatus: filters.tnxStatus || "",
      search: filters.search || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    });
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Apply filter with debounce for search
    if (field === 'search') {
      setTimeout(() => {
        updateFilters({ [field]: value });
      }, 500);
    } else {
      updateFilters({ [field]: value });
    }
  };

  // Handle date filter changes
  const handleDateFilter = (type, date) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    handleFilterChange(type, formattedDate);
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = {
      totalStudents: students.length,
      totalAmount: students.reduce((sum, student) => sum + (student.amount || 0), 0),
      totalFee: students.reduce((sum, student) => sum + (student.totalFee || 0), 0),
      totalPaid: students.reduce((sum, student) => sum + (student.paidAmount || 0), 0),
      totalDue: students.reduce((sum, student) => sum + (student.dueAmount || 0), 0),
    };
    return totals;
  };

  const totals = calculateTotals();

  // Get user-applied filters count
  const getAppliedFiltersCount = () => {
    let count = 0;
    Object.keys(localFilters).forEach(key => {
      if (localFilters[key] && localFilters[key] !== "") {
        count++;
      }
    });
    return count;
  };

  const appliedFiltersCount = getAppliedFiltersCount();

  // Clear all filters
  const clearAllFilters = () => {
    clearFilters();
    setLocalFilters({
      branch: "",
      batch: "",
      paymentType: "",
      mode: "",
      tnxStatus: "",
      search: "",
      startDate: "",
      endDate: "",
    });
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      const params = { ...filters };
      params.limit = 10000; // Get all records
      params.page = 1;

      const res = await axios.get("/fee/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `fee-report-${format(new Date(), "dd-MM-yyyy")}.xlsx`
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

  const handlePrint = (student) => {
    window.open(`/receipt/${student._id}`, "_blank");
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

  // Columns configuration
  const columns = [
    {
      label: "Actions",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip title="Print" placement="top">
            <button
              className="px-2 py-1 rounded-md hover:bg-purple-100 transition-colors border text-purple-600"
              onClick={() => handlePrint(row)}
            >
              <Printer size={20} />
            </button>
          </Tooltip>
        </div>
      ),
      filter: false,
    },
    {
      label: "Tnx Status",
      accessor: "tnxStatus",
      Cell: ({ row }) => (
        <Chip
          label={row.tnxStatus}
          color={row.tnxStatus === "paid" ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
      filter: false,
      filterKey: "tnxStatus",
      filterOptions: filterOptions.tnxStatuses || [],
    },
    { 
      label: "Receipt No", 
      accessor: "receiptNo",
      filter: false,
      filterKey: "receiptNo",
    },
    {
      label: "Student Name",
      accessor: "registrationId.studentName",
      Cell: ({ row }) => row.registrationId?.studentName || "N/A",
      filter: false,
      filterKey: "studentName",
    },
    {
      label: "Mobile",
      accessor: "registrationId.mobile",
      Cell: ({ row }) => row.registrationId?.mobile || "N/A",
      filter: false,
    },
    {
      label: "Branch",
      accessor: "registrationId.branch.name",
      Cell: ({ row }) => row.registrationId?.branch?.name || "N/A",
      filter: true,
      filterKey: "branch",
      filterOptions: filterOptions.branches?.map(b => ({
        value: b._id,
        label: b.name
      })) || [],
    },
    {
      label: "Batch",
      accessor: "registrationId.batch.name",
      Cell: ({ row }) => row.registrationId?.batch?.name || "N/A",
      filter: true,
      filterKey: "batch",
      filterOptions: filterOptions.batches?.map(b => ({
        value: b._id,
        label: b.name
      })) || [],
    },
    {
      label: "Payment Date",
      accessor: "paymentDate",
      Cell: ({ row }) => formatDate(row.paymentDate),
      filter: false,
    },
    {
      label: "Amount",
      accessor: "amount",
      Cell: ({ row }) => `₹${row.amount}`,
      filter: false,
    },
    {
      label: "Payment Type",
      accessor: "paymentType",
      filter: false,
      filterKey: "paymentType",
      filterOptions: filterOptions.paymentTypes || [],
    },
    { 
      label: "Payment mode", 
      accessor: "mode",
      filter: false,
      filterKey: "mode",
      filterOptions: filterOptions.modes || [],
    },
    { label: "Total Fee", accessor: "totalFee", filter: false },
    { label: "Discount", accessor: "discount", filter: false },
    { label: "Final Fee", accessor: "finalFee", filter: false },
    { label: "Due Amount", accessor: "dueAmount", filter: false },
    { label: "Paid Amount", accessor: "paidAmount", filter: false },
    {
      label: "Tnx ID",
      accessor: "tnxId",
      Cell: ({ row }) => (
        <div
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
          onClick={() => handleQrView(row)}
        >
          {row.tnxId || "N/A"}
        </div>
      ),
      filter: false,
    },
    {
      label: "Remark",
      accessor: "remark",
      filter: false,
    },
  ];

  // Handler functions for DataTable
  const changePage = (newPage) => {
    updatePagination({ page: newPage });
  };

  const changeLimit = (newLimit) => {
    updatePagination({ limit: newLimit, page: 1 });
  };

  const changeSort = (column, order) => {
    // Implement sort logic if needed

  };

  const changeFilters = (newFilters) => {
    updateFilters(newFilters);
  };

  const changeSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Fee Reports
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

          {appliedFiltersCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<XCircle size={16} />}
              onClick={clearAllFilters}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear Filters ({appliedFiltersCount})
            </Button>
          )}
        </Box>
      </div>

      {/* Summary Cards */}
      <Grid container spacing={2} className="mb-4">
        {[
          {
            title: "Total Fee Records",
            value: totals.totalStudents,
            color: "blue",
            sub: "In current filter",
          },
          {
            title: "Total Amount",
            value: `₹${totals.totalAmount.toLocaleString()}`,
            color: "green",
            sub: "Total transaction amount",
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
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper className={`p-4 border-l-4 border-${item.color}-500 shadow-sm`}>
              <Typography variant="subtitle2" className="text-gray-600">
                {item.title}
              </Typography>
              <Typography variant="h6" className={`font-bold text-${item.color}-600`}>
                {item.value}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {item.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

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
        showDateFilter={true}
        filters={filters}
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
            <X />
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

export default FeeReports;