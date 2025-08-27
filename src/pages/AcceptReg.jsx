import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Edit2, Eye, Printer } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, TextField, Chip, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack, width } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";

function AcceptReg() {
  const acceptedStudents = useSelector((state) => state.student.data).filter(
    (student) => student.status === "accepted"
  );
  const featchStudent = useGetStudents();
  const navigate = useNavigate(); 

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

  useEffect(() => {
    featchStudent();
  }, []);
  const columns = [
    {
      label: "Action",
      accessor: "action",
      width: "20%",
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
          <Tooltip
            title={<span className="font-bold ">Print</span>}
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
    { label: "ID", accessor: "userid", filter: false},
    { label: "Student_Name", accessor: "studentName", filter: false },
    { label: "Father_Name", accessor: "fatherName", filter: false },
    { label: "Mobile", accessor: "mobile", filter: false },
    { label: "Whatshapp", accessor: "whatshapp", filter: false },
    { label: "AlternateMobile", accessor: "alternateMobile", filter: false },
    { label: "College_Name", accessor: "collegeName", filter: true },
    { label: "Edu_Year", accessor: "eduYear", filter: true },
    { label: "Tranning", accessor: "training.name",Cell:({row})=>(<span>{row.training.name}</span>) , filter: true, show: true },
    { label: "Technology", accessor: "technology",Cell:({row})=>(<span>{row.technology.name}</span>) , filter: true, show: true },
    { label: "Education", accessor: "education", Cell:({row})=>(<span>{row.education.name}</span>) ,filter: true, show: true },
    { label: "TotalFee", accessor: "totalFee", filter: false, show: true },
    { label: "FinalFee", accessor: "finalFee", filter: false, show: true },
    { label: "DueAmount", accessor: "dueAmount", filter: false, show: true },
    { label: "PaidAmount", accessor: "paidAmount", filter: false, show: true },
    { label: "Amount", accessor: "amount", filter: false, show: true },
    { label: "Branch", accessor: "branch", Cell:({row})=>(<span>{row.branch.name}</span>) ,filter: true, show: true },
    { label: "Hr Name", accessor: "hrName", Cell:({row})=>(<span>{row.hrName?.name}</span>) ,filter: false, show: true },
    { label: "Payment Method", accessor: "paymentMethod", filter: false, show: true },
    { label: "Qr code", accessor: "qrcode", Cell:({row})=>(<span>{row.qrcode?.name}</span>) ,filter: false, show: true },
    { label: "Remark", accessor: "remark",filter: false, show: true },
  ];
// console.log(acceptedStudents);

  const handlePrint = (student) => {
    window.open(`/receipt/${student._id}`, "_blank");
  };
  const handleView = (row) => {
    setSelectedStudent(row);
    setViewModalOpen(true);
  };

  const handleEdit = (row) => {
     navigate(`/AddStudent/${row._id}`);
    // setSelectedStudent(row);

    // setEditFormData({
    //   studentName: row.studentName || "",
    //   fatherName: row.fatherName || "",
    //   email: row.email || "",
    //   mobile: row.mobile || "",
    //   alternateMobile: row.alternateMobile || "",
    //   collegeName: row.collegeName || "",
    //   eduYear: row.eduYear || "",
    //   remark: row.remark || "",
    // });
    // setEditModalOpen(true);
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
    } finally {
      featchStudent();
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
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              Accepted Registrations
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
              Total Accepted: {acceptedStudents.length}
            </span>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={acceptedStudents}
          loading={loading}
        />



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
      </div>
    </div>
  );
}

export default AcceptReg;
