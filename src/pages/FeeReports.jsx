
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
import { showSuccess, showError, apiWithToast } from "../utils/toast";
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
  const [overallStats, setOverallStats] = useState({
    totalRecords: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
  });
  
  // Local state for filter inputs
  const [localFilters, setLocalFilters] = useState({
    branch: "",
    batch: "",
    paymentType: "",
    mode: "",
    tnxStatus: "",
    qrcode: "",
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
      qrcode: filters.qrcode || "",
      search: filters.search || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    });
  }, [filters]);

  // Fetch overall stats on mount
  useEffect(() => {
    const fetchOverallStats = async () => {
      try {
        const res = await axios.get("/fee", {
          params: { limit: 100000, page: 1 },
        });
        if (res.data.success) {
          const allData = res.data.data;
          setOverallStats({
            totalRecords: res.data.pagination.total,
            totalAmount: allData.reduce((sum, item) => sum + (item.amount || 0), 0),
            totalPaid: allData.reduce((sum, item) => sum + (item.paidAmount || 0), 0),
            totalDue: allData.reduce((sum, item) => sum + (item.dueAmount || 0), 0),
          });
        }
      } catch (error) {
        console.error("Error fetching overall stats:", error);
      }
    };
    fetchOverallStats();
  }, []);

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
      qrcode: "",
      search: "",
      startDate: "",
      endDate: "",
    });
  };

  // Export to CSV
  const handleExportExcel = async () => {
    try {
      const params = { ...filters, limit: 100000, page: 1 };
      const res = await axios.get("/fee", { params });
      
      if (!res.data.success || !res.data.data.length) {
        showError("No data to export");
        return;
      }

      const data = res.data.data;
      
      // CSV headers
      const headers = [
        "Receipt No",
        "Student Name",
        "Mobile",
        "Branch",
        "Batch",
        "Payment Date",
        "Amount",
        "Payment Type",
        "Payment Mode",
        "Total Fee",
        "Discount",
        "Final Fee",
        "Due Amount",
        "Paid Amount",
        "QR Code",
        "Transaction ID",
        "Transaction Status",
        "Remark"
      ];

      // CSV rows
      const rows = data.map(row => [
        row.receiptNo || "-",
        row.registration?.studentName || "-",
        row.registration?.mobile || "-",
        row.registration?.branch?.name || "-",
        row.registration?.batch?.name || "-",
        row.paymentDate ? format(new Date(row.paymentDate), "dd-MM-yyyy HH:mm") : "-",
        row.amount || 0,
        row.paymentType || "-",
        row.mode || "-",
        row.totalFee || 0,
        row.discount || 0,
        row.finalFee || 0,
        row.dueAmount || 0,
        row.paidAmount || 0,
        row.qrcode?.name || "-",
        row.tnxId || "-",
        row.tnxStatus || "-",
        row.remark || "-"
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `fee-report-${format(new Date(), "dd-MM-yyyy")}.csv`;
      link.click();

      showSuccess("Report exported successfully");
    } catch (error) {
      showError("Failed to export report");
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

  console.log("Filter Options:", filterOptions);

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
      filter: true,
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
      accessor: "registration.studentName",
      Cell: ({ row }) => row.registration?.studentName || "-",
      filter: false,
      filterKey: "studentName",
    },
    {
      label: "Mobile",
      accessor: "registration.mobile",
      Cell: ({ row }) => row.registration?.mobile || "N/A",
      filter: false,
    },
    {
      label: "Branch",
      accessor: "registration.branch.name",
      Cell: ({ row }) => row.registration?.branch?.name || "N/A",
      filter: true,
      filterKey: "branch",
      filterOptions: filterOptions.branches?.map(b => ({
        value: b._id,
        label: b.name
      })) || [],
    },
    {
      label: "Batch",
      accessor: "registration.batch.name",
      Cell: ({ row }) => row.registration?.batch?.name || "N/A",
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
      filter: true,
      filterKey: "paymentType",
      filterOptions: filterOptions.paymentTypes || [],
    },
    { 
      label: "Payment mode", 
      accessor: "mode",
      filter: true,
      filterKey: "mode",
      filterOptions: filterOptions.modes || [],
    },
    { label: "Total Fee", accessor: "totalFee", filter: false },
    { label: "Discount", accessor: "discount", filter: false },
    { label: "Final Fee", accessor: "finalFee", filter: false },
    { label: "Due Amount", accessor: "dueAmount", filter: false },
    { label: "Paid Amount", accessor: "paidAmount", filter: false },
    {
      label: "QR Code",
      accessor: "qrcode.name",
      Cell: ({ row }) => row.qrcode?.name || "-",
      filter: true,
      filterKey: "qrcode",
      filterOptions: filterOptions.qrcodes?.map(q => ({
        value: q._id,
        label: q.name
      })) || [],
    },
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

      {/* Summary Cards - Overall Stats */}
      <div className="flex justify-around gap-4 mb-4 w-full">
        {[
          {
            title: "Total Fee Records",
            value: overallStats.totalRecords,
            color: "blue",
            sub: "All records",
          },
          {
            title: "Total Amount",
            value: `₹${overallStats.totalAmount.toLocaleString()}`,
            color: "green",
            sub: "All transactions",
          },
          {
            title: "Total Paid",
            value: `₹${overallStats.totalPaid.toLocaleString()}`,
            color: "purple",
            sub: "Total received",
          },
          {
            title: "Total Due",
            value: `₹${overallStats.totalDue.toLocaleString()}`,
            color: "orange",
            sub: "Total pending",
          },
        ].map((item, i) => (
          <Paper key={i} className={`p-4 border-l-4 border-${item.color}-500 shadow-sm flex-1`}>
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
        ))}
      </div>

      {/* Summary Cards - Filtered Stats */}
      {appliedFiltersCount > 0 && (
        <div className="flex justify-around gap-4 mb-4 w-full">
          {[
            {
              title: "Filtered Records",
              value: totals.totalStudents,
              color: "blue",
              sub: "In current filter",
            },
            {
              title: "Filtered Amount",
              value: `₹${totals.totalAmount.toLocaleString()}`,
              color: "green",
              sub: "Filtered transactions",
            },
            {
              title: "Filtered Paid",
              value: `₹${totals.totalPaid.toLocaleString()}`,
              color: "purple",
              sub: "Filtered received",
            },
            {
              title: "Filtered Due",
              value: `₹${totals.totalDue.toLocaleString()}`,
              color: "orange",
              sub: "Filtered pending",
            },
          ].map((item, i) => (
            <Paper key={`filtered-${i}`} className={`p-4 border-l-4 border-${item.color}-400 shadow-sm bg-${item.color}-50 flex-1`}>
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
          ))}
        </div>
      )}

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