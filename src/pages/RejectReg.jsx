import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Eye,
  Trash,
  Trash2,
  Loader2,
} from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, TextField, Chip, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function RejectReg() {
  const rejectedStudents = useSelector((state) => state.student.data).filter(
    (student) => student.status === "rejected"
  );
  const fetchStudents = useGetStudents();

  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    studentName: "",
    fatherName: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    collegeName: "",
    eduYear: "",
    remark: "",
  });

  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Link to={`/reg-student/${row._id}`}>
          <Tooltip
            title={<span className="font-bold ">View</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              // onClick={() => handleView(row)}
            >
              <Eye size={20} />
            </button>
          </Tooltip>
          </Link>
          <DeleteConfirmationModal
            id={row.id}
            itemName={row.userid}
            onConfirm={() => handleDelete(row._id)}
            loading={loading}
          >
            <Tooltip
              title={<span className="font-bold ">Delete</span>}
              placement="top"
            >
              <button className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600">
                {loading === `deleting-${row._id}` ? (
                  <Loader2 size={20} className="animate-spin" />
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
      label: "Tra Fee Status",
      accessor: "trainingFeeStatus",
      Cell: ({ row }) => (
        <Chip
          label={row.trainingFeeStatus}
          color={row.trainingFeeStatus === "full paid" ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
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
    },
    { label: "Enroll ID", accessor: "userid", filter: false },
    { label: "Student Name", accessor: "studentName", filter: false },
    { label: "Father Name", accessor: "fatherName", filter: false },
    { label: "Mobile", accessor: "mobile", filter: false },
    { label: "Whatshapp", accessor: "whatshapp", filter: false },
    { label: "AlternateMobile", accessor: "alternateMobile", filter: false },
    { label: "College Name", accessor: "collegeName", filter: true },
    { label: "Edu Year", accessor: "eduYear", filter: true },
    {
      label: "Tranning",
      accessor: "training.name",
      Cell: ({ row }) => <span>{row.training.name}</span>,
      filter: true,
      show: true,
    },
    {
      label: "Technology",
      accessor: "technology.name",
      Cell: ({ row }) => <span>{row.technology.name}</span>,
      filter: true,
      show: true,
    },
    {
      label: "Education",
      accessor: "education.name",
      Cell: ({ row }) => <span>{row.education.name}</span>,
      filter: true,
      show: true,
    },
    { label: "Amount", accessor: "amount", filter: false, show: true },
    { label: "TotalFee", accessor: "totalFee", filter: false, show: true },
    { label: "Discount", accessor: "discount", filter: false, show: true },
    { label: "FinalFee", accessor: "finalFee", filter: false, show: true },
    { label: "PaidAmount", accessor: "paidAmount", filter: false, show: true },
    { label: "DueAmount", accessor: "dueAmount", filter: false, show: true },
    {
      label: "Branch",
      accessor: "branch.name",
      Cell: ({ row }) => <span>{row.branch.name}</span>,
      filter: true,
      show: true,
    },
    {
      label: "Hr Name",
      accessor: "hrName",
      Cell: ({ row }) => <span>{row.hrName?.name}</span>,
      filter: false,
      show: true,
    },
    {
      label: "Payment Method",
      accessor: "paymentMethod",
      filter: true,
      show: true,
    },
    {
      label: "Reg Date",
      accessor: "createdAt",
      Cell: ({ row }) => <span>{formatDate(row.createdAt)}</span>,
      filter: false,
      show: true,
    },
    {
      label: "Qr code",
      accessor: "qrcode.name",

      filter: false,
      show: true,
    },
    { label: "Remark", accessor: "remark", filter: false, show: true },
  ];
  // Format date to Indian format
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
  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/registration/user/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || "successfull");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
    } finally {
      fetchStudents();
      setLoading(false);
    }
  };
  const handleView = (row) => {
    setSelectedStudent(row);
    setViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedStudent(null);
  };

  useEffect(() => {
    fetchStudents(); // Initial fetch when component mounts
  }, [fetchStudents]);
  return (

      <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              Rejected Registrations
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
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
            <span className="font-semibold">
              Total Rejected: {rejectedStudents.length}
            </span>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={rejectedStudents}
          loading={loading}
        />

        {/* View Student Details Modal */}
        <CustomModal
          open={viewModalOpen}
          onClose={handleViewModalClose}
          title="Student Registration Details"
          hideSubmitButton={true}
        >
          {selectedStudent && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.userid}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.studentName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.fatherName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.mobile}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Mobile
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.alternateMobile || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.collegeName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Year
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.eduYear}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Training
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.training?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technology
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.technology?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.paymentType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <p className="text-sm text-gray-900">
                    ₹{selectedStudent.amount}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <Chip
                    label={selectedStudent.paymentStatus}
                    color={
                      selectedStudent.paymentStatus === "success"
                        ? "success"
                        : "warning"
                    }
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
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>

              {selectedStudent.couponCode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedStudent.couponCode}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Discount
                    </label>
                    <p className="text-sm text-gray-900">
                      ₹{selectedStudent.couponDiscount}
                    </p>
                  </div>
                </div>
              )}

              {selectedStudent.remark && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remark
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedStudent.remark}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedStudent.createdAt).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedStudent.txnDateTime).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CustomModal>

      </div>

  );
}

export default RejectReg;
