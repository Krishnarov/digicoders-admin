import React, { useState, useCallback, useMemo } from "react";
import {
  Home,
  ChevronRight,
  Eye,
  Check,
  X,
  Printer,
  Loader2,
  XCircle,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import useGetFee from "../hooks/useGetFee";
import { toast } from "react-toastify";
import { Close } from "@mui/icons-material";

function NewFee() {
  // Use custom hook for fee data with default status "new"
  const defaultFilters = useMemo(() => ({ status: "new" }), []);
  const {
    feeData,
    loading: tableLoading,
    error,
    pagination,
    filters,
    filterOptions,
    updateFilters,
    updatePagination,
    clearFilters,
  } = useGetFee(defaultFilters); // Pass default status as "new"

  const [actionLoading, setActionLoading] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);

  // Handle search from DataTable
  const handleSearch = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  // Handle filter from DataTable
  const handleFilter = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  // Handle sort from DataTable
  const handleSort = useCallback((column, order) => {
    updateFilters({ sortBy: column, sortOrder: order });
  }, [updateFilters]);

  // Handle page change from DataTable
  const handlePageChange = useCallback((page) => {
    updatePagination({ page });
  }, [updatePagination]);

  // Handle rows per page change from DataTable
  const handleRowsPerPageChange = useCallback((limit) => {
    updatePagination({ limit, page: 1 });
  }, [updatePagination]);

  // Handle QR view
  const handleQrView = (qrCodeUrl) => {
    if (qrCodeUrl) {
      setSelectedQrCode(qrCodeUrl);
      setQrModalOpen(true);
    }
  };

  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedQrCode(null);
  };

  // Handle view payment
  const handleView = (row) => {
    setSelectedPayment(row);
    setViewModalOpen(true);
  };

  // Handle accept payment
  const handleAccept = async (id) => {
    try {
      setActionLoading(`Accept-${id}`);
      const res = await axios.patch(`/fee/status/${id}`, {
        status: "accepted",
      });
      if (res.data.success) {
        toast.success(res.data.message || "Payment accepted successfully");
        // Refresh data
        updateFilters({}); // This will trigger a refetch
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error accepting payment:", error);
    } finally {
      setActionLoading("");
    }
  };

  // Handle reject payment
  const handleReject = async (id) => {
    try {
      setActionLoading(`Reject-${id}`);
      const res = await axios.patch(`/fee/status/${id}`, {
        status: "rejected",
      });
      if (res.data.success) {
        toast.success(res.data.message || "Payment rejected successfully");
        // Refresh data
        updateFilters({});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error rejecting payment:", error);
    } finally {
      setActionLoading("");
    }
  };

  // Handle print receipt
  const handlePrint = (payment) => {
    window.open(`/receipt/${payment._id}`, "_blank");
  };

  // Handle view modal close
  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedPayment(null);
  };

  // Format date
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
  const capitalizeFirst = (text = "") =>
    text.charAt(0).toUpperCase() + text.slice(1);

  // Define columns for DataTable
  const columns = [
    {
      label: "Actions",
      accessor: "action",
      sortable: false,
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          {/* <Tooltip title={<span className="font-bold">View</span>} placement="top">
            <button
              className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              onClick={() => handleView(row)}
            >
              <Eye size={20} />
            </button>
          </Tooltip> */}
          <Tooltip title={<span className="font-bold">Accept</span>} placement="top">
            <button
              className="px-2 py-1 rounded-md hover:bg-green-100 transition-colors border text-green-600"
              onClick={() => handleAccept(row._id)}
              disabled={row.status === "accepted"}
            >
              {actionLoading === `Accept-${row._id}` ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
            </button>
          </Tooltip>
          <Tooltip title={<span className="font-bold">Reject</span>} placement="top">
            <button
              className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
              onClick={() => handleReject(row._id)}
              disabled={row.status === "rejected"}
            >
              {actionLoading === `Reject-${row._id}` ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <X size={20} />
              )}
            </button>
          </Tooltip>
          <Tooltip title={<span className="font-bold">Print</span>} placement="top">
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
      label: "Tnx Status",
      accessor: "tnxStatus",
      filter: false,
      sortable: true,
      Cell: ({ row }) => (
        <Chip
          label={capitalizeFirst(row.tnxStatus)}
          color={row.tnxStatus === "paid" ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      label: "Receipt No",
      accessor: "receiptNo",
      sortable: true,
    },
    {
      label: "Enroll ID",
      accessor: "registrationId.userid",
      sortable: true,
    },
    {
      label: "Student Name",
      accessor: "registrationId.studentName",
      sortable: true,
      Cell: ({ row }) => capitalizeFirst(row.registrationId?.studentName || "N/A"),
    },
    {
      label: "Amount",
      accessor: "amount",
      sortable: true,
    },
    {
      label: "Total Fee",
      accessor: "totalFee",
      sortable: true,
    },
    {
      label: "Discount Fee",
      accessor: "discount",
      sortable: true,
    },
    {
      label: "Final Fee",
      accessor: "finalFee",
      sortable: true,
    },
    {
      label: "Paid Amount",
      accessor: "paidAmount",
      sortable: true,
    },
    {
      label: "Due Amount",
      accessor: "dueAmount",
      sortable: true,
    },
    {
      label: "Payment mode",
      accessor: "mode",
      sortable: true,
      filter: true,
      Cell: ({ row }) => capitalizeFirst(row.mode || "N/A"),
      filterKey: "paymentMethod",
    },
    {
      label: "Payment Type",
      accessor: "paymentType",
      sortable: true,
      filter: true,
      Cell: ({ row }) => capitalizeFirst(row.paymentType)
    },
    {
      label: "QR Code",
      accessor: "qrcode",
      sortable: false,
      Cell: ({ row }) => (
        <div
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
          onClick={() => handleQrView(row.qrcode?.image?.url)}
          title={row.qrcode?.name || "View QR"}
        >
          {capitalizeFirst(row.qrcode?.name)}
        </div>
      )
    },
    {
      label: "Transaction ID",
      accessor: "tnxId",
      sortable: true,
      Cell: ({ row }) => (
        <div
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
          onClick={() => handleQrView(row?.image?.url)}
          title={row.tnxId || "N/A"}
        >
          {row.tnxId}
        </div>
      ),
    },
    {
      label: "Payment Date",
      accessor: "paymentDate",
      sortable: true,
      Cell: ({ row }) => formatDate(row.paymentDate),
    },
    {
      label: "Mobile",
      accessor: "registrationId.mobile",
      sortable: true,
      Cell: ({ row }) => row.registrationId?.mobile || "N/A",
    },
    {
      label: "Whatshapp",
      accessor: "registrationId.whatshapp",
      sortable: true,
    },
    {
      label: "Alternate Mobile",
      accessor: "registrationId.alternateMobile",
      sortable: true,
    },
    {
      label: "Email",
      accessor: "registrationId.email",
      sortable: true,
    },
    {
      label: "Father Name",
      accessor: "registrationId.fatherName",
      sortable: true,
      Cell: ({ row }) => capitalizeFirst(row.registrationId?.fatherName || "N/A"),
    },
    {
      label: "Remark",
      accessor: "remark",
    },

  ];
  // Get user-applied filters (excluding default filters)
  const getUserAppliedFilters = () => {
    const userFilters = { ...filters };
    // Remove default filters
    Object.keys(defaultFilters).forEach((key) => {
      delete userFilters[key];
    });

    return Object.entries(userFilters)
      .filter(([key, value]) => value && value !== "All")
      .map(([key, value]) => ({ key, value }));
  };

  const appliedFilters = getUserAppliedFilters();
  const appliedFiltersCount = appliedFilters.length;


  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            New Fee Payments
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
        {/* Applied Filters Badge */}
        <Box className="flex items-center gap-2">
          {appliedFiltersCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<XCircle size={16} />}
              onClick={clearFilters}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </div>

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={feeData} // Use feeData directly (already filtered by hook)
        loading={tableLoading}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleRowsPerPageChange}
        onSortChange={handleSort}
        onFilterChange={handleFilter}
        onSearch={handleSearch}
        filters={filters}
        filterOptions={filterOptions}
        onClearFilters={clearFilters}
      />

      {/* View Payment Details Modal (same as before) */}
      <CustomModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        title="Payment Details"
        hideSubmitButton={true}
        maxWidth="md"
      >
        {selectedPayment && (
          <div className="space-y-4 mt-4">
            {/* ... (same modal content as before) ... */}
          </div>
        )}
      </CustomModal>

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
            <>
              <img
                src={`${import.meta.env.VITE_BASE_URI}${selectedQrCode}`}
                alt="QR Code"
                className="w-72 h-72 object-contain border rounded-lg"
              />
            </>
          ) : (
            <p className="text-gray-500">No QR code available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NewFee;