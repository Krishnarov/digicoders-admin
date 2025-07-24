import React, { useState } from "react";
import { Home, ChevronRight, Search, User, Mail, Phone } from "lucide-react";
import axios from "../axiosInstance";
import { toast } from "react-toastify";

function PayFee() {
  const [formData, setFormData] = useState({
    registrationId: "",
    paymentType: "full",
    amount: 0,
    mode: "cash",
    remark: "",
    couponCode: "",
    studentName: "",
    dueAmount: 0,
    searchTerm: "",
  });
  console.log("PayFee Form Data:", formData);
  
  const [searchLoading, setSearchLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    console.log("PayFee:", formData);

    try {
      const res = await axios.post(`/fee`, formData);
      console.log(res);
      toast.success("Payment successful!");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Payment failed");
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
        setFormData((prev) => ({
          ...prev,
          registrationId: res.data.data._id,
          studentName: res.data.data.studentName,
          amount: res.data.data.dueAmount || 0,
          dueAmount: res.data.data.dueAmount || 0,
        }));
        toast.success("Student found!");
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error searching for student");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className=" bg-gray-50 ">
      <div className="max-w-6xl mx-auto">
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
                    Installment Fee
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={formData.paymentType === "full"}
                    onChange={(e) =>
                      handleInputChange("paymentType", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Full Fee</span>
                </label>
              </div>
            </div>

            {/* Amount To Pay Now */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount To Pay Now
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.paymentType === "full" ? formData.dueAmount : formData.amount}
                disabled={formData.paymentType === "full"}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.mode}
                onChange={(e) => handleInputChange("mode", e.target.value)}
              >
                <option value="">---select---</option>
                <option value="cash">cash</option>
                <option value="online">online</option>
                <option value="cheque">cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                 Discount Coupon Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.couponCode}
                  onChange={(e) =>
                    handleInputChange("couponCode", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
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
          </div>

          {/* Register Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleRegister}
              className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-lg"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayFee;