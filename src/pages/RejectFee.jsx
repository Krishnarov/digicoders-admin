import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home,
  ChevronRight,
  Eye,
  Check,
  X,
  Printer,
  Trash2,
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
import { useSelector } from "react-redux";
import useGetFee from "../hooks/useGetFee";
import { toast } from "react-toastify";
import { Close } from "@mui/icons-material";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

function RejectFee() {
  const defaultFilters = useMemo(() => ({ status: "rejected" }), []);
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
  } = useGetFee(defaultFilters);
  const [actionLoading, setActionLoading] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);

  const columns = [
    {
      label: "Actions",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          {/* <Tooltip
            title={<span className="font-bold ">View</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              onClick={() => handleView(row)}
            >
              <Eye size={20} />
            </button>
          </Tooltip> */}
          <DeleteConfirmationModal
            id={row._id}
            itemName={row.receiptNo}
            loading={loading}
            onConfirm={() => handleDeleta(row._id)}
          >
            <Tooltip
              title={<span className="font-bold ">Delete</span>}
              placement="top"
            >
              <button className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600">
                {loading === `deleting-${row._id}` ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
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
          label={row.tnxStatus}
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
      Cell: ({ row }) => row.registrationId?.studentName || "N/A",
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
      filterKey: "paymentMethod",
    },
    {
      label: "Payment Type",
      accessor: "paymentType",
      sortable: true,
      filter: true,
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
          {row.qrcode?.name}
        </div>
      ),
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
    },
    {
      label: "Remark",
      accessor: "remark",
    },
  ];

  // Handler functions
  const handleSearch = useCallback(
    (searchTerm) => {
      updateFilters({ search: searchTerm });
    },
    [updateFilters]
  );

  const handleFilter = useCallback(
    (newFilters) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

  const handleSort = useCallback(
    (column, order) => {
      updateFilters({ sortBy: column, sortOrder: order });
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (page) => {
      updatePagination({ page });
    },
    [updatePagination]
  );

  const handleRowsPerPageChange = useCallback(
    (limit) => {
      updatePagination({ limit, page: 1 });
    },
    [updatePagination]
  );

  const handleQrView = (row) => {

      setSelectedQrCode(row);
      setQrModalOpen(true);

  };
  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedQrCode(null);
  };
  const handleView = (row) => {
    setSelectedPayment(row);
    setViewModalOpen(true);
  };


  const handleDeleta = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/fee/delete/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error accepting payment:", error);
    } finally {
      setLoading(false);
      fetchFee();
    }
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedPayment(null);
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
    <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Rejected Fee Payments
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
        data={feeData}
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

      {/* View Payment Details Modal */}
      <CustomModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        title="Payment Details"
        hideSubmitButton={true}
        maxWidth="md"
      >
        {selectedPayment && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Information */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.registrationId?.studentName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.registrationId?.fatherName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.registrationId?.mobile || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.registrationId?.email || "N/A"}
                  </p>
                </div>
              </div>

              {/* College Information */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.registrationId?.collegeName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.registrationId?.userid || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt No
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.receiptNo}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedPayment.paymentDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedPayment.paymentType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedPayment.mode}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Installment No
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.installmentNo}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Chip
                    label={selectedPayment.status}
                    color={
                      selectedPayment.status === "accepted"
                        ? "success"
                        : selectedPayment.status === "rejected"
                        ? "error"
                        : "warning"
                    }
                    variant="outlined"
                    size="small"
                  />
                </div>
              </div>
            </div>

            {/* Amount Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-sm text-gray-900">
                  ₹{selectedPayment.amount}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Fee
                </label>
                <p className="text-sm text-gray-900">
                  ₹{selectedPayment.totalFee}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Amount
                </label>
                <p className="text-sm text-gray-900">
                  ₹{selectedPayment.paidAmount}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Amount
                </label>
                <p className="text-sm text-gray-900">
                  ₹{selectedPayment.dueAmount}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedPayment.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Updated At
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedPayment.updatedAt)}
                </p>
              </div>
            </div>

            {/* Remark */}
            {selectedPayment.remark && (
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <p className="text-sm text-gray-900">
                  {selectedPayment.remark}
                </p>
              </div>
            )}
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
              {/* <p className="mt-4 text-gray-600">Scan this QR code for payment</p> */}
            </>
          ) : (
            <p className="text-gray-500">No QR code available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RejectFee;
