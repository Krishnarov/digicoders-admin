import React, { useState, useEffect, useCallback } from "react";

import {
  Home,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  ArrowLeft,
  Fullscreen,
} from "lucide-react";
import { useSelector } from "react-redux";
import axios from "../axiosInstance";
import Select from "react-select";
import { toast } from "react-toastify";

import useGetTranning from "../hooks/useGetTranning";
import useGetTechnology from "../hooks/useGetTechnology";
import useGetEducations from "../hooks/useGetEducations";
import fetchCounts from "../hooks/useGetCount";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
const AddStudent = () => {
  // Redux state
  const admin = useSelector((state) => state.auth.user);
  const Trainings = useSelector((state) => state.tranning.data);
  const Technologies = useSelector((state) => state.technology.data);
  const Edication = useSelector((state) => state.education.data);
  const students = useSelector((state) => state.student.data);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({
    success: null,
    message: "",
  });
  const [collegeNames, setCollegeNames] = useState([]);
  const [qrcodes, setQrcodes] = useState([]);
  const [hr, setHr] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [tags, setTags] = useState([]);
  const [TechnologiesData, setTechnologiesData] = useState([]);
  const [sameNum, setSame] = useState(false);
  const [EditId, setEditId] = useState("");
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);

  const searchParams = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mobile: "",
    whatshapp: "",
    studentName: "",
    training: "",
    technology: "",
    education: "",
    eduYear: "",
    fatherName: "",
    email: "",
    alternateMobile: "",
    hrName: "",
    branch: "",
    collegeName: "",
    totalFee: 0,
    discount: 0,
    discountRemark: "",
    finalFee: 0,
    amount: 0,
    dueFee: 0,
    paidFee: 0,
    paymentType: "registration",
    paymentMethod: "cash",
    qrcode: null,
    tnxId: "",
    remark: "",
    tag: "",
  });

  const [errors, setErrors] = useState({});

  // Custom hooks
  const fetchTranningData = useGetTranning();
  const fetchEducation = useGetEducations();

  // Check if we're in edit mode on component mount
  useEffect(() => {
    const editId = searchParams.id;
    if (editId) {
      setIsEditMode(true);
      setEditId(editId);
    }
  }, [searchParams]);

  // Calculate derived values
  useEffect(() => {
    if (isEditMode) {
      setFormData((prev) => ({
        ...prev,
        dueFee: prev.totalFee - prev.paidFee - prev.discount,
      }));
    }
    setFormData((prev) => ({
      ...prev,
      finalFee: prev.totalFee - prev.discount,
      dueFee: prev.totalFee - prev.discount - prev.amount,
    }));
  }, [formData.totalFee, formData.discount, formData.amount]);

  // Memoized options for react-select
  const trainingOptions = React.useMemo(
    () => Trainings?.map((item) => ({ value: item._id, label: item.name })),
    [Trainings]
  );

  const technologyOptions = React.useMemo(
    () => TechnologiesData?.map((tech) => ({ value: tech._id, label: tech.name })),
    [TechnologiesData]
  );

  const educationOptions = React.useMemo(
    () => Edication?.map((edu) => ({ value: edu._id, label: edu.name })),
    [Edication]
  );

  const yearOptions = [
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
    { value: "Passout", label: "Passout" },
  ];

  const hrOptions = React.useMemo(
    () =>
      hr
        .filter((data) => data.isActive)
        .map((data) => ({ value: data._id, label: data.name })),
    [hr]
  );

  const branchOptions = React.useMemo(
    () =>
      branchs
        .filter((data) => data.isActive)
        .map((data) => ({ value: data._id, label: data.name })),
    [branchs]
  );

  const qrOptions = React.useMemo(
    () =>
      qrcodes
        .filter((data) => data.isActive)
        .map((data) => ({ value: data._id, label: data.name })),
    [qrcodes]
  );

  const collegeOptions = React.useMemo(
    () =>
      collegeNames
        .filter((data) => data.isActive)
        .map((data) => ({
          value: data._id,
          label: data.name,
        })),
    [collegeNames]
  );

  const tagOptions = React.useMemo(
    () =>
      tags
        .filter((data) => data.isActive)
        .map((data) => ({ value: data._id, label: data.name })),
    [tags]
  );

  const getSelectStyles = (hasError) => ({
    control: (base, state) => ({
      ...base,
      borderColor: hasError ? "red" : base.borderColor,
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
        : base.boxShadow,
      "&:hover": {
        borderColor: hasError ? "red" : "#a0aec0",
      },
      padding: "2px",
      borderRadius: "0.375rem",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  });
  const handleQrView = () => {
    if (formData.qrcode) {
      // QR code ID से actual QR code data find करें
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

  // Data fetching functions
  const fetchCollegeNames = useCallback(async () => {
    try {
      const params = { limit: 1000 }
      const response = await axios.get("/college", { params });
      setCollegeNames(response.data.colleges);
    } catch (error) {
      console.error("Error fetching college names:", error);
    }
  }, []);

  const fetchHr = useCallback(async () => {
    try {
      const response = await axios.get("/hr");
      if (response.data.success) setHr(response.data.data);
    } catch (error) {
      console.error("Error fetching HR data:", error);
    }
  }, []);

  const getAllQrCodes = useCallback(async () => {
    try {
      const res = await axios.get("/qrcode");
      setQrcodes(res.data.data);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    }
  }, []);

  const fetchBranch = useCallback(async () => {
    try {
      const response = await axios.get("/branches");
      if (response.data.success) setBranchs(response.data.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await axios.get("/tags", { params: { isActive: "true", limit: 1000 } });
      if (response.data.success) setTags(response.data.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }, []);

  // Technology data fetching
  const fetchtechnologybytrainingid = useCallback(
    async (trainingid) => {
      try {
        if (!trainingid) {
          setTechnologiesData([]);
          return;
        }
        const res = await axios.get(
          `/technology/getByTrainingDuration/${trainingid}`
        );
        setTechnologiesData(res.data.data);

        const selectedTraining = Trainings.find((t) => t._id === trainingid);

        if (selectedTraining) {
          let amount = selectedTraining?.registrationAmount;

          setFormData((prev) => ({
            ...prev,
            amount: amount.toString(),
            technology: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching technologies:", error);
        setTechnologiesData([]);
      }
    },
    [Trainings]
  );

  const fetchtechnologybyId = useCallback(async (value) => {
    try {
      const res = await axios.get(`/technology/getById/${value}`);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, totalFee: res.data.data.price }));
      }
    } catch (error) {
      console.error("Error fetching technology by ID:", error);
    }
  }, []);

  // Function to load student data for editing
  const loadStudentData = useCallback(
    async (studentId) => {
      try {
        setIsLoading(true);
        // fetch from API
        const response = await axios.get(`/registration/user?id=${studentId}`);
        if (response.data.success) {
          populateFormData(response.data.data);
        } else {
          toast.error("Failed to load student data");
          navigate("/accepted");
        }
      } catch (error) {
        console.error("Error loading student data:", error);
        toast.error("Error loading student data");
        navigate("/accepted");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  // Function to populate form with student data
  const populateFormData = useCallback(
    (student) => {
      const newFormData = {
        mobile: student.mobile || "",
        whatshapp: student.whatshapp || "",
        studentName: student.studentName || "",
        training: student.training?._id || student.training || "",
        technology: student.technology?._id || student.technology || "",
        education: student.education?._id || student.education || "",
        eduYear: student.eduYear || "",
        fatherName: student.fatherName || "",
        email: student.email || "",
        alternateMobile: student.alternateMobile || "",
        hrName: student.hrName?._id || student.hrName || "",
        branch: student.branch?._id || student.branch || "",
        collegeName: student.collegeName || "",
        totalFee: student.totalFee || 0,
        discount: student.discount || 0,
        finalFee: student.finalFee || 0,
        amount: student.amount || 0,
        dueFee: student.dueAmount || 0,
        paidFee: student.paidAmount || 0,
        paymentType: student.paymentType || "registration",
        paymentMethod: student.paymentMethod || "cash",
        qrcode: student.qrcode?._id || student.qrcode || null,
        tnxId: student.tnxId || "",
        remark: student.remark || "",
        tag: student.tag?._id || student.tag || "",
      };

      setFormData(newFormData);

      // If technology is set, fetch the related technologies
      if (student.training) {
        fetchtechnologybytrainingid(student.training?._id || student.training);
      }
    },
    [fetchtechnologybytrainingid]
  );

  // Load student data when in edit mode
  useEffect(() => {
    if (isEditMode && EditId) {
      loadStudentData(EditId);
    }
  }, [isEditMode, EditId, loadStudentData]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchTranningData(),

          fetchEducation(),
          fetchCollegeNames(),
          fetchHr(),
          getAllQrCodes(),
          fetchBranch(),
          fetchTags(),
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [
    fetchTranningData,

    fetchEducation,
    fetchCollegeNames,
    fetchHr,
    getAllQrCodes,
    fetchBranch,
  ]);

  useEffect(() => {
    if (formData.paymentType === "full") {
      setFormData((prev) => ({ ...prev, amount: formData.finalFee }));
    }
  }, [formData.paymentType, formData.finalFee]);

  // Form validation
  const validateForm = useCallback(() => {
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
  }, [formData]);

  // Form handlers
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      if (field === "training") {
        fetchtechnologybytrainingid(value);
      }
      if (field === "technology") {
        fetchtechnologybyId(value);
      }
    },
    [errors, fetchtechnologybytrainingid, fetchtechnologybyId]
  );

  const resetForm = useCallback(() => {
    setFormData({
      mobile: "",
      whatshapp: "",
      studentName: "",
      training: "",
      technology: "",
      education: "",
      eduYear: "",
      fatherName: "",
      email: "",
      alternateMobile: "",
      hrName: "",
      branch: "",
      collegeName: "",
      totalFee: 0,
      discount: 0,
      finalFee: 0,
      amount: 0,
      dueFee: 0,
      paymentType: "registration",
      paymentMethod: "cash",
      qrcode: null,
      remark: "",
      tag: "",
    });
    setErrors({});
  }, []);

  const getRegStu = useCallback(async () => {
    try {
      const res = await axios.get(`/registration/get/user/${formData.mobile}`);
      if (res.data.data) {
        // Check if response is array (multiple enrollments)
        if (Array.isArray(res.data.data)) {
          if (res.data.data.length === 1) {
            // Only one enrollment, auto-select it
            const stu = res.data.data[0];
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
              remark: stu.remark || "",
            }));
            toast.success("Student found!");
          } else if (res.data.data.length === 0) {
            // No enrollments found, show modal to add
            setFormData((prev) => ({
              ...prev,
              studentName: "",
              fatherName: "",
              email: "",
              alternateMobile: "",
              collegeName: "",
              education: "",
              eduYear: "",
              training: "",
              technology: "",
              totalFee: "",
              paymentType: "registration",
              paymentMethod: "cash",
              remark: "",
            }));
          } else {
            // Multiple enrollments, show modal to select
            setStudentEnrollments(res.data.data);
            setShowEnrollmentsModal(true);
          }
        } else {
          // Single enrollment response
          const stu = res.data.data;
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
            remark: stu.remark || "",
          }));
          toast.success("Student found!");
        }
      } else {
        toast.error("Student not found");
        resetForm();
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  }, [formData.mobile, resetForm]);

  const selectEnrollment = (enrollment) => {
    setFormData((prev) => ({
      ...prev,
      mobile: enrollment.mobile,
      whatshapp: enrollment.whatshapp,
      studentName: enrollment.studentName,
      training: enrollment.training,
      technology: enrollment.technology,
      education: enrollment.education,
      eduYear: enrollment.eduYear,
      fatherName: enrollment.fatherName,
      email: enrollment.email,
      alternateMobile: enrollment.alternateMobile,
      hrName: enrollment.hrName,
      branch: enrollment.branch,
      collegeName: enrollment.collegeName,
      totalFee: enrollment.totalFee,
      discount: enrollment.discount,
      finalFee: enrollment.finalFee,
      amount: enrollment.amount,
      dueFee: enrollment.dueFee,
      paymentType: enrollment.paymentType,
      paymentMethod: enrollment.paymentMethod,
      qrcode: enrollment.qrcode,
      tnxId: enrollment.tnxId,
      remark: enrollment.remark,
    }));
    setShowEnrollmentsModal(false);
    toast.success("Enrollment selected!");
  };

  // Main form submission
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setRegistrationStatus({ success: null, message: "" });

    const registrationData = {
      mobile: formData.mobile,
      whatshapp: formData.whatshapp,
      studentName: formData.studentName,
      training: formData.training,
      technology: formData.technology,
      education: formData.education,
      eduYear: formData.eduYear,
      fatherName: formData.fatherName,
      email: formData.email || undefined,
      alternateMobile: formData.alternateMobile || undefined,
      hrName: formData.hrName,
      branch: formData.branch,
      collegeName: formData.collegeName,
      discountRemark: formData.discountRemark,
      discount: Number(formData.discount),
      amount: Number(formData.amount),
      tnxStatus: formData.paymentType === "full" ? "full paid" : "paid",
      paymentType: formData.paymentType,
      paymentMethod: formData.paymentMethod,
      qrcode: formData.qrcode,
      tnxId: formData.tnxId,
      registeredBy: admin.id,
      remark: formData.remark || undefined,
      tag: formData.tag || undefined,
      password: formData.mobile,
    };

    try {
      let res;
      if (isEditMode) {
        // Update existing student


        res = await axios.patch(
          `/registration/update/${EditId}`,
          registrationData
        );
        setRegistrationStatus({
          success: true,
          message: "Student updated successfully!",
        });
        toast.success("Student updated successfully!");
      } else {
        res = await axios.post(`/registration/register`, registrationData);
        setRegistrationStatus({
          success: true,
          message: "Student registered successfully!",
        });
        toast.success("Registration successful!");
      }

      if (res.data.success) {
        // 1 second के बाद receipt खोलें (only for new registrations)
        if (!isEditMode) {
          setTimeout(() => {
            window.open(`/receipt/${res.data.data._id}`, "_blank");
          }, 1500);
        }
        resetForm();
        // If in edit mode, navigate back to accepted registrations
        if (isEditMode) {
          setTimeout(() => {
            navigate("/accepted");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationStatus({
        success: false,
        message:
          error.response?.data?.message ||
          (isEditMode
            ? "Update failed. Please try again."
            : "Registration failed. Please try again."),
      });
      toast.error(
        error.response?.data?.message ||
        (isEditMode
          ? "Update failed. Please try again."
          : "Registration failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setRegistrationStatus({ success: null, message: "" });
      }, 5000);
      fetchCounts();
    }
  }, [
    validateForm,
    formData,
    admin.id,
    resetForm,
    isEditMode,
    EditId,
    navigate,
  ]);

  // Calculate derived values
  const finalAmount = formData.totalFee - formData.discount;
  const dueAmount = finalAmount - formData.amount;
  if (sameNum) formData.whatshapp = formData.mobile;

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
      {/* Header */}
      <div className="mb-6 pt-6">
        <div className="flex items-center text-gray-600 mb-4 gap-4">
          {" "}
          {isEditMode && (
            <button
              onClick={() => navigate("/accepted")}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-2"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )}
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-500 pr-5">
            {isEditMode ? "Edit Student" : "Add Student"}
          </h1>
          <div className="flex items-center">
            <Home className="w-5 h-5 text-blue-600" />
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-800">Dashboard</span>
            {isEditMode && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                <span className="text-gray-600">Edit Student</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {registrationStatus.message && (
        <div
          className={`mb-6 p-4 rounded-lg ${registrationStatus.success
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
              Student Primary Mobile Number *
            </label>
            <input
              type="number"
              placeholder="Enter 10-digit mobile number"
              className={`w-full px-4 py-3 border ${errors.mobile ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              maxLength="10"
              onBlur={getRegStu}
              disabled={isEditMode}
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
            )}
            <div className="ml-2 mt-2">
              <input
                type="checkbox"
                checked={sameNum}
                onChange={(e) => setSame(e.target.checked)}
              />{" "}
              Same Number for WhatsApp
            </div>
          </div>

          {/* {!sameNum && ( */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="number"
              placeholder="Enter 10-digit mobile number"
              className={`w-full px-4 py-3 border ${errors.whatshapp ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={formData.whatshapp}
              onChange={(e) => handleInputChange("whatshapp", e.target.value)}
              maxLength="10"
            />
            {errors.whatshapp && (
              <p className="mt-1 text-sm text-red-600">{errors.whatshapp}</p>
            )}
          </div>
          {/* )} */}

          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
            </label>
            <input
              type="text"
              placeholder="Enter Student Name"
              className={`w-full px-4 py-3 border ${errors.studentName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={formData.studentName}
              onChange={(e) => handleInputChange("studentName", e.target.value)}
            />
            {errors.studentName && (
              <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>
            )}
          </div>
          {/* Student Email ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Email ID *
            </label>
            <input
              type="email"
              placeholder="Enter Student Email ID"
              className={`w-full px-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading || isEditMode}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          {/* Choose Training */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Training *
            </label>
            <Select
              options={trainingOptions}
              placeholder="-Choose Training-"
              value={trainingOptions.find((opt) => opt.value === formData.training) || null}
              onChange={(selectedOption) => handleInputChange("training", selectedOption?.value || "")}
              disabled={isLoading || isEditMode}
              styles={getSelectStyles(errors.training)}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
            {errors.training && (
              <p className="mt-1 text-sm text-red-600">{errors.training}</p>
            )}
          </div>

          {/* Choose Technology */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Technology *
            </label>
            <Select
              options={technologyOptions}
              placeholder="-Choose Technology-"
              value={technologyOptions.find((opt) => opt.value === formData.technology) || null}
              onChange={(selectedOption) => handleInputChange("technology", selectedOption?.value || "")}
              styles={getSelectStyles(errors.technology)}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
            {errors.technology && (
              <p className="mt-1 text-sm text-red-600">{errors.technology}</p>
            )}
          </div>

          {/* Select Your Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Education *
            </label>
            <Select
              options={educationOptions}
              placeholder="-Select Your Education-"
              value={educationOptions.find((opt) => opt.value === formData.education) || null}
              onChange={(selectedOption) => handleInputChange("education", selectedOption?.value || "")}
              disabled={isLoading || isEditMode}
              styles={getSelectStyles(errors.education)}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
            {errors.education && (
              <p className="mt-1 text-sm text-red-600">{errors.education}</p>
            )}
          </div>

          {/* Select eduyear */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Year *
            </label>
            <Select
              options={yearOptions}
              placeholder="-Select Year-"
              value={yearOptions.find((opt) => opt.value === formData.eduYear) || null}
              onChange={(selectedOption) => handleInputChange("eduYear", selectedOption?.value || "")}
              disabled={isLoading}
              styles={getSelectStyles(errors.eduYear)}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
            {errors.eduYear && (
              <p className="mt-1 text-sm text-red-600">{errors.eduYear}</p>
            )}
          </div>

          {/* Select Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tag
            </label>
            <Select
              options={tagOptions}
              placeholder="-Select Tag-"
              value={tagOptions.find((opt) => opt.value === formData.tag) || null}
              onChange={(selectedOption) => handleInputChange("tag", selectedOption?.value || "")}
              styles={getSelectStyles()}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              isClearable
            />
          </div>

          {/* Student Father's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Father's / Guardian's Name *
            </label>
            <input
              type="text"
              placeholder="Enter Student Father's Name"
              className={`w-full px-4 py-3 border ${errors.fatherName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={formData.fatherName}
              onChange={(e) => handleInputChange("fatherName", e.target.value)}
            />
            {errors.fatherName && (
              <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
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
              className={`w-full px-4 py-3 border ${errors.alternateMobile ? "border-red-500" : "border-gray-300"
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

          {/* Manage hr */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Admission By *
            </label>
            <Select
              options={hrOptions}
              placeholder="-Select HR Name-"
              value={hrOptions.find((opt) => opt.value === formData.hrName) || null}
              onChange={(selectedOption) => handleInputChange("hrName", selectedOption?.value || "")}
              disabled={isLoading || isEditMode}
              styles={getSelectStyles(errors.hrName)}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
            {errors.hrName && (
              <p className="mt-1 text-sm text-red-600">{errors.hrName}</p>
            )}
          </div>

          {/* Branches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Branch / Mode *
            </label>
            <Select
              options={branchOptions}
              placeholder="-Select Branch-"
              value={branchOptions.find((opt) => opt.value === formData.branch) || null}
              onChange={(selectedOption) => handleInputChange("branch", selectedOption?.value || "")}
              disabled={isLoading}
              styles={getSelectStyles(errors.branch)}
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
            />
            {errors.branch && (
              <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
            )}
          </div>

          {/* Student College Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student College Name *
            </label>
            <Select
              options={collegeOptions}
              placeholder="Search & select college name"
              value={
                collegeOptions.find(
                  (opt) => opt.value === formData.collegeName
                ) || null
              }
              onChange={(selectedOption) =>
                handleInputChange("collegeName", selectedOption?.value || "")
              }
              classNamePrefix="react-select"
              styles={getSelectStyles(errors.collegeName)}
              menuPortalTarget={document.body}
            />
            {errors.collegeName && (
              <p className="mt-1 text-sm text-red-600">{errors.collegeName}</p>
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
                className={`w-full pl-8 px-4 py-3 border ${errors.totalFee ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.totalFee}
                disabled
              />
            </div>
            {errors.totalFee && (
              <p className="mt-1 text-sm text-red-600">{errors.totalFee}</p>
            )}
          </div>

          {/* Discount Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Fee Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 px-4 py-3 border ${errors.discount ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                disabled={isLoading || isEditMode}
              />
            </div>
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600">{errors.discount}</p>
            )}
          </div>
          {/* discountRemark Amount */}
          {formData.discount > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Remark
              </label>
              <div className="relative"> <span className="absolute left-3 top-3 text-gray-500">{formData.discountRemark ? "" : "Discount Remark"}</span>
                <input
                  type="text"
                  className={`w-full pl-3 px-4 py-3 border ${errors.discountRemark ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.discountRemark}
                  onChange={(e) => handleInputChange("discountRemark", e.target.value)}
                  disabled={isLoading || isEditMode}
                />
              </div>
              {errors.discountRemark && (
                <p className="mt-1 text-sm text-red-600">{errors.discountRemark}</p>
              )}
            </div>
          )}
          {/* Final Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₹</span>
              <input
                type="number"
                className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.finalFee}
                disabled
              />
            </div>
          </div>

          {/* Amount To Pay Now */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 px-4 py-3 border ${errors.amount ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                disabled={formData.paymentType === "full" || isLoading || isEditMode}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Due Fee Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Fee Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₹</span>
              <input
                type="number"
                className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.dueFee}
                disabled
              />
            </div>
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
                  disabled={isLoading || isEditMode}
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
                  disabled={isLoading || isEditMode}
                />
                <span className="ml-2 text-sm text-gray-700">Full Fee</span>
              </label>
            </div>
          </div>

          {/* Payment Method */}
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
                  disabled={isLoading || isEditMode}
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
                  disabled={isLoading || isEditMode}
                />
                <span className="ml-2 text-sm text-gray-700">Online</span>
              </label>
            </div>
          </div>

          {/* QR code selection */}
          {formData.paymentMethod === "online" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select QR Code *
              </label>
              <Select
                options={qrOptions}
                placeholder="- Select QR Code -"
                value={qrOptions.find((opt) => opt.value === formData.qrcode) || null}
                onChange={(selectedOption) => handleInputChange("qrcode", selectedOption?.value || "")}
                disabled={isLoading || isEditMode}
                styles={getSelectStyles(errors.qrcode)}
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
              />
              {errors.qrcode && (
                <p className="mt-1 text-sm text-red-600">{errors.qrcode}</p>
              )}
            </div>
          )}

          {/* QR code display */}
          {formData.paymentMethod === "online" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan & Pay
              </label>

              <span
                className="border rounded-full p-2  cursor-pointer hover:bg-gray-50 text-xs"
                onClick={() => handleQrView()}
              >
                Show Qr code
              </span>
            </div>
          )}
          {/* Transaction ID / UTR */}
          {formData.paymentMethod === "online" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID / UTR No.
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">UTR</span>
                <input
                  type="number"
                  className={`w-full pl-12 px-4 py-3 border ${errors.tnxId ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={formData.tnxId}
                  onChange={(e) => handleInputChange("tnxId", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.tnxId && (
                <p className="mt-1 text-sm text-red-600">{errors.tnxId}</p>
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
              disabled={isLoading}
            />
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
                {isEditMode ? "Updating..." : "Registering..."}
              </>
            ) : isEditMode ? (
              "Update Student"
            ) : (
              "Register Now"
            )}
          </button>
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
          <div className="flex gap-2 items-center">

            <a href={`${import.meta.env.VITE_BASE_URI}${selectedQrCode}`} target="_blank">
              <Fullscreen />
            </a>
            <IconButton onClick={handleQrModalClose}>
              <Close />
            </IconButton>
          </div>
        </div>
        <DialogContent className="flex flex-col items-center justify-center p-6">
          {selectedQrCode ? (
            <>
              <img
                src={`${import.meta.env.VITE_BASE_URI}${selectedQrCode}`}
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
};

export default React.memo(AddStudent);
