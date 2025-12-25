import React, { useCallback, useEffect, useState } from "react";
import {
  Home,
  ChevronRight,
  Search,
  X,
  Loader2,
} from "lucide-react";
import axios from "../axiosInstance";
import { toast } from "react-toastify";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

function PayFee() {
  const [formData, setFormData] = useState({
    registrationId: "",
    amount: 0,
    paymentType: "installment",
    mode: "cash",
    image: null,
    remark: "",
    studentName: "",
    tnxStatus: "paid",
    dueAmount: 0,
    searchTerm: "",
    qrcode: null,
    tnxId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [qrcodes, setQrcodes] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      handleInputChange("image", file);
    }
  };

  const getAllQrCodes = useCallback(async () => {
    try {
      const res = await axios.get("/qrcode");
      setQrcodes(res.data.data);
    } catch (error) {
      toast.error(error.response.data.message || error.message);
      console.error("Error fetching QR codes:", error);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await getAllQrCodes();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [getAllQrCodes]);

  const handleQrView = () => {
    if (formData.qrcode) {
      const selectedQr = qrcodes.find((qr) => qr._id === formData.qrcode);
      if (selectedQr && selectedQr.image && selectedQr.image.url) {
        setSelectedQrCode(selectedQr.image.url);
        setQrModalOpen(true);
      } else {
        toast.error("QR code not found or image not available");
      }
    } else {
      toast.error("Please select a QR code first");
    }
  };

  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedQrCode(null);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    if (!formData.registrationId) {
      toast.error("Please select a student first");
      return setIsLoading(false);
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "image" && formData[key]) {
          formDataToSend.append("image", formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const res = await axios.post(`/fee`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      if (res.data.success) {
        toast.success(res.data.message || "Payment successful");
        setTimeout(() => {
          window.open(`/receipt/${res.data.id}`, "_blank");
        }, 1500);
      }
      
      // Reset form after successful payment
      setFormData({
        registrationId: "",
        paymentType: "installment",
        amount: 0,
        mode: "cash",
        remark: "",
        studentName: "",
        dueAmount: 0,
        searchTerm: formData.searchTerm,
        qrcode: null,
        tnxId: "",
        image: null,
      });
      setSelectedImage(null);
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message || error.message || "Payment failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const searchStudent = async () => {
    if (!formData.searchTerm.trim()) {
      toast.error("Please enter student userId, mobile, or email");
      return;
    }

    setSearchLoading(true);
    try {
      const res = await axios.get(
        `/registration/get/user/${formData.searchTerm}`
      );

      if (res.data.data) {
        if (Array.isArray(res.data.data)) {
          if (res.data.data.length === 1) {
            const enrollment = res.data.data[0];
            setFormData((prev) => ({
              ...prev,
              registrationId: enrollment._id,
              studentName: enrollment.studentName,
              amount: enrollment.dueAmount || 0,
              dueAmount: enrollment.dueAmount || 0,
            }));
            toast.success("Student found!");
          } else {
            setStudentEnrollments(res.data.data);
            setShowEnrollmentsModal(true);
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            registrationId: res.data.data._id,
            studentName: res.data.data.studentName,
            amount: res.data.data.dueAmount || 0,
            dueAmount: res.data.data.dueAmount || 0,
          }));
          toast.success("Student found!");
        }
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message ||
          error.message ||
          "Error searching for student"
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const selectEnrollment = (enrollment) => {
    setFormData((prev) => ({
      ...prev,
      registrationId: enrollment._id,
      studentName: enrollment.studentName,
      amount: enrollment.dueAmount || 0,
      dueAmount: enrollment.dueAmount || 0,
    }));
    setShowEnrollmentsModal(false);
    toast.success("Enrollment selected!");
  };

  return (
    <div className=" max-w-sm md:max-w-6xl mx-auto  px-2 ">
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center text-gray-600 mb-4 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-500 pr-5">
              Fee Payment
            </h1>

            <div className="flex items-center ">
              <Home className="w-5 h-5 text-blue-600" />
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-gray-800">Dashboard</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Student (UserId, Mobile or Email)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter UserId, mobile or email"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.searchTerm}
                    onChange={(e) =>
                      handleInputChange("searchTerm", e.target.value)
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") searchStudent();
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={searchStudent}
                  disabled={searchLoading}
                  className={`px-6 py-3 rounded-md font-medium ${
                    searchLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-colors duration-200 flex items-center`}
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                placeholder="Student Name"
                className="w-full uppercase px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.studentName}
                disabled
                onChange={(e) =>
                  handleInputChange("studentName", e.target.value)
                }
              />
            </div>
            {/* Amount To Pay Now */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount To Pay Now
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>
            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentType"
                    value="installment"
                    checked={formData.paymentType === "installment"}
                    onChange={(e) =>
                      handleInputChange("paymentType", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Training / Installment Fee
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.mode}
                onChange={(e) => handleInputChange("mode", e.target.value)}
              >
                <option value="">--- select payment mode ---</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>

            {/* QR code selection */}
            {formData.mode === "online" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payment Account *
                </label>
                <select
                  className={`w-full px-4 py-3 border  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.qrcode}
                  onChange={(e) => handleInputChange("qrcode", e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">-- Select Payment Account --</option>
                  {qrcodes
                    .filter((data) => data.isActive)
                    .map((data) => (
                      <option key={data._id} value={data._id}>
                        {data.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            
            {/* Transaction ID / UTR */}
            {formData.mode === "online" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID / UTR No.
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">
                    UTR
                  </span>
                  <input
                    type="number"
                    className={`w-full pl-12 px-4 py-3 border  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    value={formData.tnxId}
                    onChange={(e) => handleInputChange("tnxId", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            {formData.mode === "online" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Screenshot
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {selectedImage && (
                  <p className="mt-2 text-sm text-green-600">
                    {selectedImage.name}
                  </p>
                )}
              </div>
            )}

            {/* Remark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remark
              </label>
              <textarea
                placeholder="Enter Remark"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                value={formData.remark}
                onChange={(e) => handleInputChange("remark", e.target.value)}
              />
            </div>
            
            {/* QR code display */}
            {formData.mode === "online" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scan & Pay
                </label>
                <span
                  className="border rounded-full p-2  cursor-pointer hover:bg-gray-50 text-xs"
                  onClick={() => handleQrView(true)}
                >
                  Show Qr code
                </span>
              </div>
            )}
          </div>

          {/* Register Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleRegister}
              className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-lg"
            >
              {isLoading ? (
                <span className="flex">
                  <Loader2 className="animate-spin mr-2" /> Pay Now ...
                </span>
              ) : (
                "Pay Now"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enrollments Modal */}
      {showEnrollmentsModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold">Select Enrollment</h3>
              <button
                onClick={() => setShowEnrollmentsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4 text-gray-600">
                This student has multiple enrollments. Please select one to
                continue:
              </p>
              <div className="space-y-3">
                {studentEnrollments.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    onClick={() => selectEnrollment(enrollment)}
                    className="p-4 border border-gray-300 shadow rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {enrollment.userid || "Unknown Course"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Name: {enrollment?.studentName || "Unknown Batch"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tranning :{" "}
                          {enrollment?.training?.name || "Unknown Batch"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          Due: ₹{enrollment.dueAmount || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(enrollment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
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

export default PayFee;