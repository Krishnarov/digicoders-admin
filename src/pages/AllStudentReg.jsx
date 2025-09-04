import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Edit2, Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  TextField,
  Chip,
  Tooltip,
  Dialog,
  IconButton,
  DialogContent,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";
import { Close } from "@mui/icons-material";

function AllStudentReg() {
  const allstudents = useSelector((state) => state.student.data);
  useGetStudents();

  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
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
              <button className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600">
                <Eye size={20} />
              </button>
            </Tooltip>
          </Link>
          <Tooltip
            title={<span className="font-bold ">Edit</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
              onClick={() => handleEdit(row)}
            >
              <Edit2 size={20} />
            </button>
          </Tooltip>
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
      accessor: "qrcode",
      Cell: ({ row }) => (
        <div
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
          onClick={() => handleQrView(row)}
        >
          {row.qrcode?.name}
        </div>
      ),
      filter: false,
      show: true,
    },
    { label: "Remark", accessor: "remark", filter: false, show: true },
  ];

  const handleQrView = (row) => {
    if (row.qrcode && row.qrcode.image && row.qrcode.image.url) {
      setSelectedQrCode(row.qrcode.image.url);
      setQrModalOpen(true);
    }
  };
  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedQrCode(null);
  };
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
  const handleView = (row) => {
    setSelectedStudent(row);
    setViewModalOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedStudent(row);
    setEditFormData({
      studentName: row.studentName || "",
      fatherName: row.fatherName || "",
      email: row.email || "",
      mobile: row.mobile || "",
      alternateMobile: row.alternateMobile || "",
      collegeName: row.collegeName || "",
      eduYear: row.eduYear || "",
      remark: row.remark || "",
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.patch(
        `/registration/update/${selectedStudent._id}`,
        editFormData,
        {
          withCredentials: true,
        }
      );
      handleEditClose();
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedStudent(null);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedStudent(null);
    setEditFormData({
      studentName: "",
      fatherName: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      collegeName: "",
      eduYear: "",
      remark: "",
    });
  };

  const handleEditChange = (e) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (

      <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              All Registerd Student
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
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <span className="font-semibold">
              Total Registerd: {allstudents.length}
            </span>
          </div>
        </div>

        {/* DataTable */}
        <DataTable columns={columns} data={allstudents} loading={loading} />

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

        {/* Edit Student Modal */}
        <CustomModal
          open={editModalOpen}
          onClose={handleEditClose}
          onSubmit={handleEditSubmit}
          title="Edit Student Information"
          submitText="Update"
        >
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Student Name"
              name="studentName"
              fullWidth
              value={editFormData.studentName}
              onChange={handleEditChange}
              variant="outlined"
            />
            <TextField
              label="Father Name"
              name="fatherName"
              fullWidth
              value={editFormData.fatherName}
              onChange={handleEditChange}
              variant="outlined"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              value={editFormData.email}
              onChange={handleEditChange}
              variant="outlined"
            />
            <TextField
              label="Mobile"
              name="mobile"
              fullWidth
              value={editFormData.mobile}
              onChange={handleEditChange}
              variant="outlined"
            />
            <TextField
              label="Alternate Mobile"
              name="alternateMobile"
              fullWidth
              value={editFormData.alternateMobile}
              onChange={handleEditChange}
              variant="outlined"
            />
            <TextField
              label="College Name"
              name="collegeName"
              fullWidth
              value={editFormData.collegeName}
              onChange={handleEditChange}
              variant="outlined"
            />
            <TextField
              label="Education Year"
              name="eduYear"
              fullWidth
              value={editFormData.eduYear}
              onChange={handleEditChange}
              variant="outlined"
            />
            <TextField
              label="Remark"
              name="remark"
              fullWidth
              multiline
              rows={3}
              value={editFormData.remark}
              onChange={handleEditChange}
              variant="outlined"
            />
          </Stack>
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
                  src={selectedQrCode}
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

export default AllStudentReg;
