import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Eye, Check, X, Printer } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, Chip, Tooltip, Dialog, DialogContent, IconButton } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import useGetTechnology from "../hooks/useGetTechnology";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";
import useGetCount from "../hooks/useGetCount";
import { Close } from "@mui/icons-material";

function NewReg() {
  const students = useSelector((state) => state.student.data).filter(
    (data) => data.status === "new"
  );
  const fetchTechnology = useGetTechnology();
  const fetchStudents = useGetStudents();
  const fetchCount = useGetCount();
 
  useEffect(() => {
    fetchTechnology();
    fetchStudents();
  }, []);

  const [loading, setLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  
  const handlePrint = (student) => {
    window.open(`/receipt/${student._id}`, "_blank");
  };
  
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

  const columns = [
    {
      label: "Actions",
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
            title={<span className="font-bold ">Accept</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-green-100 transition-colors border text-green-600"
              onClick={() => handleAccept(row._id)}
              disabled={row.status === "accepted"}
            >
              <Check size={20} />
            </button>
          </Tooltip>
          <Tooltip
            title={<span className="font-bold ">Reject</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
              onClick={() => handleReject(row._id)}
              disabled={row.status === "rejected"}
            >
              <X size={20} />
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


  const handleAccept = async (id) => {
    try {
      setLoading(true);
      await axios.patch(`/registration/status/${id}`, {
        status: "accepted",
        acceptStatus: "accepted",
      });
      // Refresh student data
      await fetchStudents();
      await fetchCount()
    } catch (error) {
      console.error("Error accepting registration:", error);
    } finally {
      setLoading(false);
      fetchStudents();
    }
  };

  const handleReject = async (id) => {
    try {
      setLoading(true);
      await axios.patch(`/registration/status/${id}`, {
        status: "rejected",
        acceptStatus: "rejected",
      });
      // Refresh student data
      useGetStudents();
      await fetchCount()
    } catch (error) {
      console.error("Error rejecting registration:", error);
    } finally {
      setLoading(false);
      fetchStudents();
    }
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
console.log(students);

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
    </div>
  );
}

export default NewReg;