

import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Eye, Check, X, Printer } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, Chip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetFee from "../hooks/useGetFee";

function RejectFee() {
  const fetchFee = useGetFee();
  const feeData = useSelector((state) => state.fee.data).filter((item) => item.status === "rejected");

  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  useEffect(() => {
    fetchFee();
  }, []);

  const columns = [
    { label: "Receipt No", accessor: "receiptNo", filter: true },
    { 
      label: "Student Name", 
      accessor: "registrationId.studentName", 
      Cell: ({ row }) => row.registrationId?.studentName || "N/A"
    },
    { 
      label: "Mobile", 
      accessor: "registrationId.mobile", 
      Cell: ({ row }) => row.registrationId?.mobile || "N/A"
    },
    { 
      label: "Payment Date", 
      accessor: "paymentDate",
      Cell: ({ row }) => formatDate(row.paymentDate)
    },
    { 
      label: "Amount", 
      accessor: "amount",
      Cell: ({ row }) => `₹${row.amount}`
    },
    {
      label: "Status",
      accessor: "status",
      Cell: ({ row }) => (
        <Chip
          label={row.status}
          color={
            row.status === "accepted"
              ? "success"
              : row.status === "rejected"
              ? "error"
              : "warning"
          }
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      label: "Actions",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<Eye size={16} />}
            onClick={() => handleView(row)}
          >
            View
          </Button>
         
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<X size={16} />}
            onClick={() => handleDeleta(row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleView = (row) => {
    setSelectedPayment(row);
    setViewModalOpen(true);
  };

  const handleDeleta = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/fee/delete/${id}`);
      fetchFee();
    } catch (error) {
      console.error("Error accepting payment:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={feeData}
          loading={loading}
          pagination
          search
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
      </div>
    </div>
  );
}

export default RejectFee;