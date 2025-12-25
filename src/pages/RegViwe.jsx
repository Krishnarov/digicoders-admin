import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  Users,
  Printer,
  Eye,
  MessageSquare,
  Mail as MailIcon,
  Phone as PhoneIcon,
  FileText,
  Home,
  Briefcase,
  Award,
  ShieldCheck,
  Camera,
  FileCheck,
  MapPin,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Avatar,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { toast } from "react-toastify";

function RegView() {
  const param = useParams();
  const [feeData, setFeeData] = useState([]);
  const [studentData, setStudentData] = useState({});
  const [batchData, setBatchData] = useState([]);
  const [loading, setLoading] = useState("loading");
  const [reminderDialog, setReminderDialog] = useState({
    open: false,
    type: "",
    message: "",
  });
  const [customMessage, setCustomMessage] = useState("");

  const fetchStudentData = async () => {
    try {
      const res = await axiosInstance.get(`/registration/user?id=${param.id}`);
      setStudentData(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("");
    }
  };

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`/fee/${param.id}/history`);
      setFeeData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStudentData();
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSimpleDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      accepted: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      paid: "bg-green-100 text-green-800 border-green-200",
      partial: "bg-orange-100 text-orange-800 border-orange-200",
      pending: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const handleSendReminder = (type) => {
    let defaultMessage = "";

    if (type === "whatsapp") {
      defaultMessage = `Dear ${studentData.studentName}, this is a reminder about your pending fee of ₹${studentData.dueAmount} for ${studentData.training?.name} training. Please complete the payment at your earliest convenience.`;
    } else if (type === "sms") {
      defaultMessage = `Fee Reminder: ${studentData.studentName}, your pending fee is ₹${studentData.dueAmount} for ${studentData.training?.name}. Kindly make the payment soon.`;
    } else if (type === "email") {
      defaultMessage = `Dear ${studentData.studentName},

We hope you are doing well. This is a gentle reminder from DigiCoders technologies pvt ltd. Training & Placement Cell regarding your pending fee of ₹${
        studentData.dueAmount
      } for the **${studentData.training?.name}** training program.

📌 Training Details:
- Training Program: ${studentData.training?.name}
- Duration: ${studentData.training?.duration || "N/A"}
- Start Date: ${studentData.training?.startDate || "N/A"}
- Mode: ${studentData.training?.mode || "Online/Offline"}

Your timely payment will help us ensure uninterrupted access to training sessions, study materials, and mentorship support.

👉 Please complete your payment at the earliest to continue availing all the benefits of the program.

If you have already completed the payment, kindly ignore this message.

Best regards,  
**Digicoders Training Department**  
support@digicoders.in | www.digicoders.in`;
    }

    setCustomMessage(defaultMessage);
    setReminderDialog({ open: true, type });
  };

  const confirmSendReminder = async () => {
    try {
      const payload = {
        studentId: studentData._id,
        type: reminderDialog.type,
        message: customMessage,
      };

      const response = await axiosInstance.post("/reminders/send", payload);

      if (response.data.success) {
        toast.success(`Reminder sent successfully via ${reminderDialog.type}`);
      } else {
        alert("Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Error sending reminder");
    } finally {
      setReminderDialog({ open: false, type: "", message: "" });
    }
  };

  const columns = [
    {
      label: "Actions",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
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
    { label: "Receipt No", accessor: "receiptNo" },
    {
      label: "Payment Date",
      accessor: "paymentDate",
      Cell: ({ row }) => formatDate(row.paymentDate),
    },
    {
      label: "Amount",
      accessor: "amount",
      Cell: ({ row }) => `₹${row.amount}`,
    },
    {
      label: "Payment Type",
      accessor: "paymentType",
    },
    {
      label: "Mode",
      accessor: "mode",
      Cell: ({ row }) => (
        <Chip label={row.mode} variant="outlined" size="small" />
      ),
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
  ];

  const handlePrint = (payment) => {
    window.open(`/receipt/${payment._id}`, "_blank");
  };

  if (loading === "loading") {
    return (
      <div className="h-96 flex items-center justify-center">Loading...</div>
    );
  }

  // Document download functions
  const downloadDocument = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-sm md:max-w-7xl mx-auto px-2">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {studentData.profilePhoto?.url ? (
                <Avatar
                  src={`${import.meta.env.VITE_BASE_URI}${studentData.profilePhoto.url}`}
                  alt={studentData.studentName}
                  sx={{ width: 64, height: 64 }}
                  className="border-2 border-blue-200"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
              {studentData.photoSummited && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {studentData.studentName}
              </h1>
              <p className="text-gray-600">Student ID: {studentData?.userid}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {studentData.gender === "female" ? "👩" : "👨"} {studentData.gender?.charAt(0).toUpperCase() + studentData.gender?.slice(1)}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  DOB: {formatSimpleDate(studentData.dateOfBirth)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div>{getStatusBadge(studentData?.status)}</div>
            <Button
              variant="outlined"
              component={Link}
              to={`/update-student/${studentData._id}`}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              size="small"
            >
              Update Student
            </Button>
          </div>
        </div>

        {/* Reminder Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outlined"
            startIcon={<MessageSquare />}
            onClick={() => handleSendReminder("whatsapp")}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            Send WhatsApp Reminder
          </Button>
          <Button
            variant="outlined"
            startIcon={<PhoneIcon />}
            onClick={() => handleSendReminder("sms")}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Send SMS Reminder
          </Button>
          <Button
            variant="outlined"
            startIcon={<MailIcon />}
            onClick={() => handleSendReminder("email")}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Send Email Reminder
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Student Name
                </label>
                <p className="text-gray-900">{studentData?.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Father's Name
                </label>
                <p className="text-gray-900">{studentData?.fatherName}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 break-all">{studentData?.email}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Mobile
                </label>
                <p className="text-gray-900">{studentData?.mobile}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  WhatsApp
                </label>
                <p className="text-gray-900">{studentData?.whatshapp || "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Alternate Mobile
                </label>
                <p className="text-gray-900">
                  {studentData?.alternateMobile || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Gender
                </label>
                <p className="text-gray-900 capitalize">{studentData?.gender}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Date of Birth
              </label>
              <p className="text-gray-900">
                {formatSimpleDate(studentData.dateOfBirth)}
              </p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Address Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Address
              </label>
              <p className="text-gray-900">{studentData?.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  District
                </label>
                <p className="text-gray-900">{studentData?.district}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Pincode
                </label>
                <p className="text-gray-900">{studentData?.pincode}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                College Name
              </label>
              <p className="text-gray-900">{studentData?.collegeName?.name}</p>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Guardian Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Guardian Relation
              </label>
              <p className="text-gray-900">{studentData?.guardianRelation}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Guardian Mobile
              </label>
              <p className="text-gray-900">{studentData?.guardianMobile}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Mobile Verification
              </label>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.guardianMobileVerification ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">
                  {studentData?.guardianMobileVerification ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Academic Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Education
              </label>
              <p className="text-gray-900">{studentData?.education?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Higher Education
              </label>
              <p className="text-gray-900">{studentData?.higherEducation}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Qualification
              </label>
              <p className="text-gray-900">{studentData?.lastQualification}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Academic Year
              </label>
              <p className="text-gray-900">{studentData?.eduYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Technology
              </label>
              <p className="text-gray-900">{studentData?.technology?.name}</p>
            </div>
          </div>
        </div>

        {/* Training Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Briefcase className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Training Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Training Program
              </label>
              <p className="text-gray-900">{studentData?.training?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Duration
              </label>
              <p className="text-gray-900">{studentData?.training?.duration}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Joining Date
              </label>
              <p className="text-gray-900">
                {formatSimpleDate(studentData?.joiningData)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Branch Name
              </label>
              <p className="text-gray-900">{studentData?.branch?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Batch Information
              </label>
              <div className="space-y-1">
                {studentData?.batch?.map((b, index) => (
                  <div key={b._id} className="flex items-center gap-2">
                    <span className="text-gray-900">{b.batchName}</span>
                    <span className="text-sm text-gray-500">
                      ({formatSimpleDate(b.startDate)})
                    </span>
                  </div>
                )) || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Details
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Payment Status
              </label>
              <div className="mt-1">
                {getPaymentStatusBadge(studentData?.trainingFeeStatus)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Fee
                </label>
                <p className="text-gray-900 text-lg font-semibold">
                  ₹{studentData?.totalFee?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Discount
                </label>
                <p className="text-gray-900">
                  ₹{studentData?.discount?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Final Fee
                </label>
                <p className="text-gray-900">
                  ₹{studentData?.finalFee?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Paid Amount
                </label>
                <p className="text-green-600 font-semibold">
                  ₹{studentData?.paidAmount?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Due Amount
              </label>
              <p className="text-red-600 font-semibold">
                ₹{studentData?.dueAmount?.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Reg Amount
              </label>
              <p className="text-blue-600 font-semibold">
                ₹{studentData?.amount?.toLocaleString()}
              </p>
            </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment Method
                </label>
                <p className="text-gray-900 capitalize">
                  {studentData?.paymentMethod}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  UPI ID
                </label>
                <p className="text-gray-900">
                  {studentData?.qrcode?.upi || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Transaction ID
                </label>
                <p className="text-gray-900">{studentData?.tnxId || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Transaction Status
                </label>
                <p className="text-gray-900">{studentData?.tnxStatus || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents & Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Documents & Status
            </h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.aadharCardUploded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">Aadhar Card</span>
                {studentData?.aadharCard?.url && (
                  <Button
                    size="small"
                    onClick={() => downloadDocument(studentData.aadharCard.url, 'AadharCard')}
                    className="text-xs"
                  >
                    View
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.cvUploded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">CV</span>
                {studentData?.cv?.url && (
                  <Button
                    size="small"
                    onClick={() => downloadDocument(studentData.cv.url, 'CV')}
                    className="text-xs"
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.photoSummited ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">Photo Submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.hardForm ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">Hard Form</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.certificateIssued ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">Certificate Issued</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.idCardIssued ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">ID Card Issued</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.tSartIssued ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">T-Shirt Issued</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${studentData?.placementStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-900">Placement Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Placement Information
            </h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Job Need
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${studentData?.isJobNeed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-900">
                    {studentData?.isJobNeed ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Joined
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${studentData?.isJoin ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-900">
                    {studentData?.isJoin ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">
                Place in Company
              </label>
              <p className="text-gray-900">{studentData?.placeInCompany || "N/A"}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">
                Interviewed Companies
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {studentData?.interviewInCompanines?.map((company, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm">
                    {company}
                  </span>
                )) || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Registration Details
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Registration Status
              </label>
              <div className="mt-1">{getStatusBadge(studentData.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                HR Name
              </label>
              <p className="text-gray-900">
                {studentData?.hrName?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Registered By
              </label>
              <p className="text-gray-900">{studentData?.registeredBy?.name}</p>
              <p className="text-sm text-gray-500">
                {studentData?.registeredBy?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Verified By
              </label>
              <p className="text-gray-900">{studentData?.verifiedBy?.name}</p>
              <p className="text-sm text-gray-500">
                {studentData?.verifiedBy?.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Registration Date
              </label>
              <p className="text-gray-900">
                {formatDate(studentData.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Updated
              </label>
              <p className="text-gray-900">
                {formatDate(studentData.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              System Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Student ID
              </label>
              <p className="text-gray-900 font-mono">{studentData?.userid}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                System ID
              </label>
              <p className="text-gray-900 font-mono text-sm break-all">
                {studentData?._id}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Login Status
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      studentData?.isLogin ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-gray-900">
                    {studentData?.isLogin ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Status
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      studentData?.isStatus ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-gray-900">
                    {studentData?.isStatus ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Transaction Date
              </label>
              <p className="text-gray-900">
                {formatDate(studentData.txnDateTime)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Login
              </label>
              <p className="text-gray-900">
                {studentData?.loginAt
                  ? formatDate(studentData.loginAt)
                  : "Never logged in"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Logout
              </label>
              <p className="text-gray-900">
                {studentData.logoutAt
                  ? formatDate(studentData.logoutAt)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Additional Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Remarks
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md min-h-[80px]">
                {studentData?.remark || "No remarks"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                QR Code Name
              </label>
              <p className="text-gray-900">{studentData?.qrcode?.name || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment History
        </h2>
        <DataTable columns={columns} data={feeData} loading={loading} />
      </div>

      {/* Reminder Dialog */}
      <Dialog
        open={reminderDialog.open}
        onClose={() =>
          setReminderDialog({ open: false, type: "", message: "" })
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Send{" "}
          {reminderDialog.type.charAt(0).toUpperCase() +
            reminderDialog.type.slice(1)}{" "}
          Reminder
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={7}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setReminderDialog({ open: false, type: "", message: "" })
            }
          >
            Cancel
          </Button>
          <Button onClick={confirmSendReminder} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RegView;