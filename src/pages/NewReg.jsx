import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Eye, Check, X } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, Chip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import useGetTechnology from "../hooks/useGetTechnology";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";

function NewReg() {
  const students = useSelector((state) => state.student.data).filter((data)=>data.status==="new");
  const fetchTechnology = useGetTechnology();
  useGetStudents();

  useEffect(() => {
    fetchTechnology();
  }, []);

  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const columns = [
    { label: "ID", accessor: "userid", filter: false },
    { label: "Student Name", accessor: "studentName", filter: true },
    { label: "Mobile", accessor: "mobile", filter: true },
    { label: "College Name", accessor: "collegeName", filter: true },
    { label: "Edu Year", accessor: "eduYear", filter: true },
    {
      label: "Training",
      accessor: "training.name",
      filter: true,
      Cell: ({ row }) => row.training?.name || 'N/A'
    },
    {
      label: "Technology",
      accessor: "technology.name",
      filter: true,
      Cell: ({ row }) => row.technology?.name || 'N/A'
    },
    {
      label: "Payment Status",
      accessor: "paymentStatus",
      Cell: ({ row }) => (
        <Chip 
          label={row.paymentStatus} 
          color={row.paymentStatus === 'completed' ? 'success' : 'warning'}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      label: "Status",
      accessor: "status",
      Cell: ({ row }) => (
        <Chip 
          label={row.status} 
          color={
            row.status === 'accepted' ? 'success' : 
            row.status === 'rejected' ? 'error' : 'warning'
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
            color="success"
            startIcon={<Check size={16} />}
            onClick={() => handleAccept(row._id)}
            disabled={row.status === 'accepted'}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<X size={16} />}
            onClick={() => handleReject(row._id)}
            disabled={row.status === 'rejected'}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const handleView = (row) => {
    setSelectedStudent(row);
    setViewModalOpen(true);
  };

  const handleAccept = async (id) => {
    try {
      setLoading(true);
      await axios.patch(`/registration/status/${id}`, {
        status: 'accepted',
        acceptStatus: 'accepted'
      });
      // Refresh student data
      useGetStudents();
    } catch (error) {
      console.error("Error accepting registration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoading(true);
      await axios.patch(`/registration/status/${id}`, {
        status: 'rejected',
        acceptStatus: 'rejected'
      });
      // Refresh student data
      useGetStudents();
    } catch (error) {
      console.error("Error rejecting registration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedStudent(null);
  };

  // Format date to Indian format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              New Registration
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
          data={students} 
          loading={loading} 
          pagination
          search
        />

        {/* View Student Details Modal */}
        <CustomModal
          open={viewModalOpen}
          onClose={handleViewModalClose}
          title="Student Registration Details"
          hideSubmitButton={true}
          maxWidth="md"
        >
          {selectedStudent && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <p className="text-sm text-gray-900 font-medium">{selectedStudent.userid}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Name
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.fatherName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.mobile}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Mobile
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.alternateMobile || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Name
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.collegeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education Year
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.eduYear}</p>
                  </div>
                </div>
              </div>

              {/* Training Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Training Program
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.training?.name || 'N/A'} ({selectedStudent.training?.duration || 'N/A'})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technology
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.technology?.name || 'N/A'} ({selectedStudent.technology?.duration || 'N/A'})
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">{selectedStudent.paymentType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Fee
                  </label>
                  <p className="text-sm text-gray-900">₹{selectedStudent.totalFee}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid Amount
                  </label>
                  <p className="text-sm text-gray-900">₹{selectedStudent.paidAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Amount
                  </label>
                  <p className="text-sm text-gray-900">₹{selectedStudent.dueAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <Chip 
                    label={selectedStudent.paymentStatus} 
                    color={selectedStudent.paymentStatus === 'completed' ? 'success' : 'warning'}
                    variant="outlined"
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Status
                  </label>
                  <Chip 
                    label={selectedStudent.status} 
                    color={
                      selectedStudent.status === 'accepted' ? 'success' : 
                      selectedStudent.status === 'rejected' ? 'error' : 'warning'
                    }
                    variant="outlined"
                    size="small"
                  />
                </div>
              </div>

              {/* Coupon Information */}
              {selectedStudent.couponCode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code
                    </label>
                    <p className="text-sm text-gray-900">{selectedStudent.couponCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Discount
                    </label>
                    <p className="text-sm text-gray-900">₹{selectedStudent.couponDiscount}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedStudent.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedStudent.txnDateTime)}
                  </p>
                </div>
              </div>

              {/* Remark */}
              {selectedStudent.remark && (
                <div className="pt-3 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remark
                  </label>
                  <p className="text-sm text-gray-900">{selectedStudent.remark}</p>
                </div>
              )}
            </div>
          )}
        </CustomModal>
      </div>
    </div>
  );
}

export default NewReg;