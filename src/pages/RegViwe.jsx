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
  Phone as PhoneIcon
} from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, Chip, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import axiosInstance from "../axiosInstance";

function RegView() {
  const param = useParams();
  const [feeData, setFeeData] = useState([]);
  const [studentData, setStudentData] = useState({});
  const [loading, setLoading] = useState("loading");
  const [reminderDialog, setReminderDialog] = useState({ open: false, type: '', message: '' });
  const [customMessage, setCustomMessage] = useState('');

  const fetchStudentData = async () => {
    try {
      const res = await axiosInstance.get(`/registration/user/?id=${param.id}`);
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
    // Set default message based on type
    let defaultMessage = '';
    
    if (type === 'whatsapp') {
      defaultMessage = `Dear ${studentData.studentName}, this is a reminder about your pending fee of ₹${studentData.dueAmount} for ${studentData.training?.name} training. Please complete the payment at your earliest convenience.`;
    } else if (type === 'sms') {
      defaultMessage = `Fee Reminder: ${studentData.studentName}, your pending fee is ₹${studentData.dueAmount} for ${studentData.training?.name}. Kindly make the payment soon.`;
    } else if (type === 'email') {
      defaultMessage = `Dear ${studentData.studentName},\n\nThis is a reminder that you have a pending fee of ₹${studentData.dueAmount} for the ${studentData.training?.name} training program.\n\nPlease complete the payment at your earliest convenience.\n\nBest regards,\nTraining Department`;
    }
    
    setCustomMessage(defaultMessage);
    setReminderDialog({ open: true, type });
  };

  const confirmSendReminder = async () => {
    try {
      // API call to send reminder
      const payload = {
        studentId: studentData._id,
        type: reminderDialog.type,
        message: customMessage
      };
      
      const response = await axiosInstance.post('/reminders/send', payload);
      
      if (response.data.success) {
        alert(`Reminder sent successfully via ${reminderDialog.type}`);
      } else {
        alert('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error sending reminder');
    } finally {
      setReminderDialog({ open: false, type: '', message: '' });
    }
  };

  const columns = [
    {
      label: "Actions",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip
            title={<span className="font-bold ">View</span>}
            placement="top"
          >
            <button className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600">
              <Eye size={20} />
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
      filter: true,
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
      filter: true,
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {studentData.studentName}
              </h1>
              <p className="text-gray-600">Student ID: {studentData?.userid}</p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(studentData?.status)}
          </div>
        </div>
        
        {/* Reminder Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outlined"
            startIcon={<MessageSquare />}
            onClick={() => handleSendReminder('whatsapp')}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            Send WhatsApp Reminder
          </Button>
          <Button
            variant="outlined"
            startIcon={<PhoneIcon />}
            onClick={() => handleSendReminder('sms')}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Send SMS Reminder
          </Button>
          <Button
            variant="outlined"
            startIcon={<MailIcon />}
            onClick={() => handleSendReminder('email')}
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
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 break-all">{studentData?.email}</p>
            </div>
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
            <div>
              <label className="text-sm font-medium text-gray-500">
                Alternate Mobile
              </label>
              <p className="text-gray-900">{studentData?.alternateMobile || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                College
              </label>
              <p className="text-gray-900">{studentData?.collegeName}</p>
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
                Branch Name
              </label>
              <p className="text-gray-900">{studentData?.branch?.name}</p>
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
                Paid Amount
              </label>
              <p className="text-green-600 font-semibold">
                ₹{studentData?.paidAmount?.toLocaleString()}
              </p>
            </div>
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
                Discount
              </label>
              <p className="text-gray-900">₹{studentData?.discount?.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Final Fee
              </label>
              <p className="text-gray-900">₹{studentData?.finalFee?.toLocaleString()}</p>
            </div>
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
              <div className="mt-1">
                {getStatusBadge(studentData.status)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                HR Name
              </label>
              <p className="text-gray-900">{studentData?.hrName?.name || "N/A"}</p>
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
              <p className="text-gray-900 font-mono text-sm">
                {studentData?._id}
              </p>
            </div>
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
            <div>
              <label className="text-sm font-medium text-gray-500">
                Transaction Date
              </label>
              <p className="text-gray-900">
                {formatDate(studentData.txnDateTime)}
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
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {studentData?.remark || "No remarks"}
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
      </div>
      
      {/* Payment History Table */}
      <div className="mt-6">
        <DataTable columns={columns} data={feeData} loading={loading} />
      </div>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialog.open} onClose={() => setReminderDialog({ open: false, type: '', message: '' })}>
        <DialogTitle>
          Send {reminderDialog.type.charAt(0).toUpperCase() + reminderDialog.type.slice(1)} Reminder
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
            rows={4}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialog({ open: false, type: '', message: '' })}>
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