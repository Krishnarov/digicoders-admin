import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import useGetTechnology from "../hooks/useGetTechnology";
import useGetTranning from "../hooks/useGetTranning";
import axios from "../axiosInstance";
import useGetEducations from "../hooks/useGetEducations";
import axiosInstance from "../axiosInstance";

function AddStudent() {
  const admin = useSelector((state) => state.auth.user);

  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({
    success: null,
    message: "",
  });

  // Fetch data from Redux store and hooks
  const Trainings = useSelector((state) => state.tranning.data);
  const fetchTranningData = useGetTranning();
  const Technologies = useSelector((state) => state.technology.data);
  const fetchTechnology = useGetTechnology();
  const Edication = useSelector((state) => state.education.data);
  const fetchEducation = useGetEducations();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchTranningData(),
          fetchTechnology(),
          fetchEducation(),
          fetchCollegeNames(),
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const [collegeNames, setCollegeNames] = useState([]);

  const [TechnologiesData, setTechnologiesData] = useState([]);

  const fetchCollegeNames = async () => {
    try {
      const response = await axios.get("/college");
      setCollegeNames(response.data.data);
    } catch (error) {
      console.error("Error fetching college names:", error);
    }
  };

  const [formData, setFormData] = useState({
    mobile: "",
    studentName: "",
    training: "",
    technology: "",
    education: "",
    eduYear: "",
    fatherName: "",
    email: "",
    alternateMobile: "",
    collegeName: "",
    paymentType: "registration",
    amount: 0,
    totalFee: 0,
    paymentMethod: "cash",
    // paymentStatus: "pending",
    remark: "",
    couponCode: "",
    discountApplied: false,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.mobile || formData.mobile.length !== 10) {
      newErrors.mobile = "Valid 10-digit mobile number is required";
    }

    if (!formData.studentName) {
      newErrors.studentName = "Student name is required";
    }

    if (!formData.training) {
      newErrors.training = "Training selection is required";
    }

    if (!formData.technology) {
      newErrors.technology = "Technology selection is required";
    }

    if (!formData.education) {
      newErrors.education = "Education selection is required";
    }

    if (!formData.eduYear) {
      newErrors.eduYear = "Education year is required";
    }

    if (!formData.fatherName) {
      newErrors.fatherName = "Father's name is required";
    }

    if (!formData.collegeName) {
      newErrors.collegeName = "College name is required";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.alternateMobile && formData.alternateMobile.length !== 10) {
      newErrors.alternateMobile = "Alternate mobile must be 10 digits";
    }

    if (!formData.amount || isNaN(formData.amount)) {
      newErrors.amount = "Valid amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchtechnologybytrainingid = async (trainingid) => {
    try {
      if (!trainingid) {
        setTechnologiesData([]);
        return;
      }

      const res = await axios.get(
        `/technology/getByTrainingDuration/${trainingid}`
      );
      setTechnologiesData(res.data.data);

      // Find the selected training to get its duration
      const selectedTraining = Trainings.find((t) => t._id === trainingid);
      if (selectedTraining) {
        let amount = 500; // default amount
        if (selectedTraining.duration === "45 days") {
          amount = 1000;
        } else if (selectedTraining.duration === "6 months") {
          amount = 2000;
        }

        setFormData((prev) => ({
          ...prev,
          amount: amount.toString(),
          technology: "", // Reset technology when training changes
          discountApplied: false, // Reset discount when training changes
        }));
      }
    } catch (error) {
      console.log("fetchtechnologybytype", error, trainingid);
      setTechnologiesData([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // When training changes, fetch corresponding technologies
    if (field === "training") {
      fetchtechnologybytrainingid(value);
    }
  };

  const handleApplyCoupon = () => {
    if (!formData.couponCode) return;

    // Example coupon logic - replace with your actual validation
    if (formData.couponCode === "DISCOUNT10") {
      const discountAmount = Math.min(100, formData.amount * 0.1); // 10% discount up to 100
      const newAmount = Math.max(0, formData.amount - discountAmount);

      setFormData((prev) => ({
        ...prev,
        amount: newAmount.toString(),
        discountApplied: true,
      }));

      setRegistrationStatus({
        success: true,
        message: "Coupon applied successfully!",
      });
    } else {
      setRegistrationStatus({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setRegistrationStatus({ success: null, message: "" });
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      mobile: "",
      studentName: "",
      training: "",
      technology: "",
      education: "",
      eduYear: "",
      fatherName: "",
      email: "",
      alternateMobile: "",
      collegeName: "",
      paymentType: "registration",
      amount: 0,
      totalFee: 0,
      // paymentStatus: "pending",
      remark: "",
      paymentMethod: "cash",
      couponCode: "",
      discountApplied: false,
    });
    setErrors({});
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setRegistrationStatus({ success: null, message: "" });

    const registrationData = {
      training: formData.training,
      technology: formData.technology,
      education: formData.education,
      eduYear: formData.eduYear,
      studentName: formData.studentName,
      fatherName: formData.fatherName,
      email: formData.email || undefined, // Make optional
      mobile: formData.mobile,
      alternateMobile: formData.alternateMobile || undefined, // Make optional
      collegeName: formData.collegeName,
      paymentType: formData.paymentType,
      amount: Number(formData.amount),
      totalFee: Number(formData.totalFee),
      registeredBy: admin.id,
      paymentMethod: formData.paymentMethod,
      // paymentStatus: formData.paymentStatus,
      remark: formData.remark || undefined,
      password: formData.mobile, // Using mobile as password
      couponCode: formData.couponCode || undefined,
    };

    try {
      const res = await axios.post(`/registration/register`, registrationData);
      console.log("Registration response:", res.data);
      setRegistrationStatus({
        success: true,
        message: "Student registered successfully!",
      });

      // Reset form after successful registration
      resetForm();
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationStatus({
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
      fetchEducation();

      // Clear message after 5 seconds
      setTimeout(() => {
        setRegistrationStatus({ success: null, message: "" });
      }, 5000);
    }
  };

  const getRegStu = async () => {
    try {
      const res = await axiosInstance.get(
        `/registration/get/user/${formData.mobile}`
      );
      if (res.data && res.data.data) {
        const stu = res.data.data;
        // console.log(stu);
        if (stu.training) {
          await fetchtechnologybytrainingid(stu.training);
        }
        setFormData((prev) => ({
          ...prev,
          studentName: stu.studentName || "",
          fatherName: stu.fatherName || "",
          email: stu.email || "",
          alternateMobile: stu.alternateMobile || "",
          collegeName: stu.collegeName || "",
          education: stu.education,
          eduYear: stu.eduYear || "",
          training: stu.training,
          technology: stu.technology,
          totalFee: stu.totalFee || "",
          paymentType: stu.paymentType || "registration",
          paymentMethod: stu.paymentMethod || "cash",
          // paymentStatus: stu.paymentStatus || "pending",
          remark: stu.remark || "",
          couponCode: stu.couponCode || "",
          discountApplied: stu.discountApplied || false,
        }));
      } else {
        resetForm();
      }
    } catch (error) {
      console.log(error);
      // resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 pt-6">
          <div className="flex items-center text-gray-600 mb-4 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-500 pr-5">
              Add Student
            </h1>

            <div className="flex items-center">
              <Home className="w-5 h-5 text-blue-600" />
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-gray-800">Dashboard</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {registrationStatus.message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              registrationStatus.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {registrationStatus.success ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {registrationStatus.message}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Mobile Number *
              </label>
              <input
                type="number"
                placeholder="Enter 10-digit mobile number"
                className={`w-full px-4 py-3 border ${
                  errors.mobile ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                maxLength="10"
                onBlur={() => getRegStu()}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                placeholder="Enter Student Name"
                className={`w-full px-4 py-3 border ${
                  errors.studentName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.studentName}
                onChange={(e) =>
                  handleInputChange("studentName", e.target.value)
                }
              />
              {errors.studentName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.studentName}
                </p>
              )}
            </div>

            {/* Choose Training */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Training *
              </label>
              <select
                className={`w-full px-4 py-3 border ${
                  errors.training ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.training}
                onChange={(e) => handleInputChange("training", e.target.value)}
                disabled={isLoading}
              >
                <option value="">-Choose Training-</option>
                {Trainings?.map((item, index) => (
                  <option value={item._id} key={index}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.training && (
                <p className="mt-1 text-sm text-red-600">{errors.training}</p>
              )}
            </div>

            {/* Choose Technology */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Technology *
              </label>
              <select
                className={`w-full px-4 py-3 border ${
                  errors.technology ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.technology}
                onChange={(e) =>
                  handleInputChange("technology", e.target.value)
                }
                // disabled={!formData.training || isLoading}
              >
                <option value="">-Choose Technology-</option>
                {TechnologiesData?.map((tech, index) => (
                  <option key={index} value={tech._id}>
                    {tech.name}
                  </option>
                ))}
              </select>
              {errors.technology && (
                <p className="mt-1 text-sm text-red-600">{errors.technology}</p>
              )}
            </div>

            {/* Select Your Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Education *
              </label>
              <select
                className={`w-full px-4 py-3 border ${
                  errors.education ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                disabled={isLoading}
              >
                <option value="">-Select Your Education-</option>
                {Edication?.map((tech, index) => (
                  <option key={index} value={tech._id}>
                    {tech.name}
                  </option>
                ))}
              </select>
              {errors.education && (
                <p className="mt-1 text-sm text-red-600">{errors.education}</p>
              )}
            </div>

            {/* Select eduyear */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Year *
              </label>
              <select
                className={`w-full px-4 py-3 border ${
                  errors.eduYear ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.eduYear}
                onChange={(e) => handleInputChange("eduYear", e.target.value)}
                disabled={isLoading}
              >
                <option value="">-Select Year-</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              {errors.eduYear && (
                <p className="mt-1 text-sm text-red-600">{errors.eduYear}</p>
              )}
            </div>

            {/* Student Father's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Father's Name *
              </label>
              <input
                type="text"
                placeholder="Enter Student Father's Name"
                className={`w-full px-4 py-3 border ${
                  errors.fatherName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.fatherName}
                onChange={(e) =>
                  handleInputChange("fatherName", e.target.value)
                }
              />
              {errors.fatherName && (
                <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
              )}
            </div>

            {/* Student Email ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Email ID (Optional)
              </label>
              <input
                type="email"
                placeholder="Enter Student Email ID"
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Student Alternate Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Alternate Mobile (Optional)
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit alternate mobile"
                className={`w-full px-4 py-3 border ${
                  errors.alternateMobile ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.alternateMobile}
                onChange={(e) =>
                  handleInputChange("alternateMobile", e.target.value)
                }
                maxLength="10"
              />
              {errors.alternateMobile && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.alternateMobile}
                </p>
              )}
            </div>

            {/* Student College Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student College Name *
              </label>
              <input
                type="text"
                list="collegeNames"
                placeholder="Enter Student College Name"
                className={`w-full px-4 py-3 border ${
                  errors.collegeName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.collegeName}
                onChange={(e) =>
                  handleInputChange("collegeName", e.target.value)
                }
              />
              <datalist id="collegeNames">
                {collegeNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
              {errors.collegeName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.collegeName}
                </p>
              )}
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Fee Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  className={`w-full pl-8 px-4 py-3 border ${
                    errors.totalFee ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.totalFee}
                  onChange={(e) =>
                    handleInputChange("totalFee", e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>
              {errors.totalFee && (
                <p className="mt-1 text-sm text-red-600">{errors.totalFee}</p>
              )}
              {formData.discountApplied && (
                <p className="mt-1 text-sm text-green-600">Discount applied!</p>
              )}
            </div>
            {/* Amount To Pay Now */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount To Pay Now *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  className={`w-full pl-8 px-4 py-3 border ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
              {formData.discountApplied && (
                <p className="mt-1 text-sm text-green-600">Discount applied!</p>
              )}
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
                    value="registration"
                    checked={formData.paymentType === "registration"}
                    onChange={(e) =>
                      handleInputChange("paymentType", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Registration Fee
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
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Full Fee</span>
                </label>
              </div>
            </div>
            {/* Payment paymentMethod */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === "cash"}
                    onChange={(e) =>
                      handleInputChange("paymentMethod", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Cash</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === "online"}
                    onChange={(e) =>
                      handleInputChange("paymentMethod", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Online</span>
                </label>
              </div>
            </div>
            {/* Payment Status */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.paymentStatus}
                onChange={(e) =>
                  handleInputChange("paymentStatus", e.target.value)
                }
                disabled={isLoading}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div> */}

            {/* Tnx ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tnx ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.tnxId}
                onChange={(e) => handleInputChange("tnxId", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Tnx Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tnx Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.tnxPassword}
                onChange={(e) =>
                  handleInputChange("tnxPassword", e.target.value)
                }
                disabled={isLoading}
              />
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
                disabled={isLoading}
              />
            </div>
            {/* Discount Coupon Code */}
            <div className="md:col-span-2">
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
                  disabled={isLoading || formData.discountApplied}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={
                    isLoading ||
                    formData.discountApplied ||
                    !formData.couponCode
                  }
                  className={`px-6 py-3 rounded-md transition-colors duration-200 font-medium ${
                    isLoading ||
                    formData.discountApplied ||
                    !formData.couponCode
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {isLoading ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-8 gap-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isLoading}
              className="px-8 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium text-lg"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={isLoading}
              className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 font-medium text-lg flex items-center justify-center min-w-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                "Register Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
