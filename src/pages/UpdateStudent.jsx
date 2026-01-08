import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Save,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  BookOpen,
  GraduationCap,
  CreditCard,
  FileText,
  ArrowLeft,
  Upload,
  Camera,
  Home,
  ChevronRight,
  IdCard,
  Award,
  Shirt,
  Briefcase,
} from "lucide-react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetTranning from "../hooks/useGetTranning";
import useGetTechnology from "../hooks/useGetTechnology";
import useGetEducations from "../hooks/useGetEducations";
import { toast } from "react-toastify";

function UpdateStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [technologiesData, setTechnologiesData] = useState([]);
  const [collegeNames, setCollegeNames] = useState([]);
  const [qrcodes, setQrcodes] = useState([]);
  const [branchs, setBranchs] = useState([]);

  const Educations = useSelector((state) => state.education.data);
  const Trainings = useSelector((state) => state.tranning.data);
  const Technologies = useSelector((state) => state.technology.data);
  const Branches = useSelector((state) => state?.branch?.data) || [];
  const [HRs, setHr] = useState([]);
  const [updatedData, setUpdatedData] = useState({});
  const fetchTranningData = useGetTranning();
  const fetchEducation = useGetEducations();
  const [preview, setPreview] = useState(null);

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
    joiningData: "",
    isJoin: false,
    dateOfBirth: "",
    gender: "",
    address: "",
    district: "",
    guardianMobile: "",
    guardianMobileVerification: false,
    guardianRelation: "",
    higherEducation: "",
    lastQualification: "",
    idCardIssued: false,
    certificateIssued: false,
    hardForm: false,
    aadharCardUploded: false,
    tSartIssued: false,
    isJobNeed: true,
    placementStatus: false,
    cvUploded: false,
    cv: null,
    placeInCompany: "",
    interviewInCompanines: [],
    aadharCard: null,
    photoSummited: false,
    profilePhoto: null,
    hrName: "",
    branch: "",
    collegeName: "",
    totalFee: 0,
    discount: 0,
    finalFee: 0,
    amount: 0,
    dueFee: 0,
    paidFee: 0,
    paymentType: "registration",
    paymentMethod: "cash",
    qrcode: null,
    tnxId: "",
    remark: "",
    pincode: "", // Added missing field
  });

  // Data fetching functions
  const fetchHr = useCallback(async () => {
    try {
      const response = await axios.get("/hr");
      if (response.data.success) setHr(response.data.data);
    } catch (error) {
      console.error("Error fetching HR data:", error);
    }
  }, []);

  const fetchCollegeNames = useCallback(async () => {
    try {
      const params = { limit: 1000 }
      const response = await axios.get(`/college`, { params });
      if (response.data.success) setCollegeNames(response.data.colleges);
    } catch (error) {
      console.error("Error fetching college names:", error);
    }
  }, []);

  const getAllQrCodes = useCallback(async () => {
    try {
      const res = await axios.get("/qrcode");
      if (res.data.success) setQrcodes(res.data.data);
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
        if (res.data.success) setTechnologiesData(res.data.data);

        const selectedTraining = Trainings.find((t) => t._id === trainingid);
        if (selectedTraining) {
          let amount = 500;
          if (selectedTraining?.duration === "45 days") {
            amount = 1000;
          } else if (selectedTraining?.duration === "6 months") {
            amount = 2000;
          }

          setFormData((prev) => ({
            ...prev,
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
      if (!value) return;
      const res = await axios.get(`/technology/getById/${value}`);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, totalFee: res.data.data.price }));
      }
    } catch (error) {
      console.error("Error fetching technology by ID:", error);
    }
  }, []);

  // Fetch student data based on ID
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/registration/user?id=${id}`);
        console.log(response.data);

        if (response.data.success) {
          const studentData = response.data.data;

          // Create initial form data
          const initialFormData = {
            mobile: studentData.mobile || "",
            whatshapp: studentData.whatshapp || "",
            studentName: studentData.studentName || "",
            training: studentData.training?._id || "",
            technology: studentData.technology?._id || "",
            education: studentData.education?._id || "",
            eduYear: studentData.eduYear || "",
            fatherName: studentData.fatherName || "",
            email: studentData.email || "",
            alternateMobile: studentData.alternateMobile || "",
            joiningData: studentData.joiningData
              ? studentData.joiningData.split("T")[0]
              : "",
            isJoin: studentData.isJoin || false,
            dateOfBirth: studentData.dateOfBirth
              ? studentData.dateOfBirth.split("T")[0]
              : "",
            gender: studentData.gender || "",
            address: studentData.address || "",
            district: studentData.district || "",
            guardianMobile: studentData.guardianMobile || "",
            guardianMobileVerification:
              studentData.guardianMobileVerification || false,
            guardianRelation: studentData.guardianRelation || "",
            higherEducation: studentData.higherEducation || "",
            lastQualification: studentData.lastQualification || "",
            idCardIssued: studentData.idCardIssued || false,
            certificateIssued: studentData.certificateIssued || false,
            hardForm: studentData.hardForm || false,
            aadharCardUploded: studentData.aadharCardUploded || false,
            tSartIssued: studentData.tSartIssued || false,
            isJobNeed:
              studentData.isJobNeed !== undefined
                ? studentData.isJobNeed
                : true,
            placementStatus: studentData.placementStatus || false,
            cvUploded: studentData.cvUploded || false,
            cv: studentData.cv || null,
            placeInCompany: studentData.placeInCompany || "",
            interviewInCompanines: studentData.interviewInCompanines || [],
            aadharCard: studentData.aadharCard || null,
            photoSummited: studentData.photoSummited || false,
            profilePhoto: studentData.profilePhoto || null,
            hrName: studentData.hrName?._id || "",
            branch: studentData.branch?._id || "",
            collegeName: studentData.collegeName?._id || "",
            totalFee: studentData.totalFee || 0,
            discount: studentData.discount || 0,
            finalFee: studentData.finalFee || 0,
            amount: studentData.amount || 0,
            dueFee: studentData.dueAmount || 0,
            paidFee: studentData.paidAmount || 0,
            paymentType: studentData.paymentType || "registration",
            paymentMethod: studentData.paymentMethod || "cash",
            qrcode: studentData.qrcode?._id || null,
            tnxId: studentData.tnxId || "",
            remark: studentData.remark || "",
            pincode: studentData.pincode || "",

          };
          setPreview(studentData?.profilePhoto?.url)
          setFormData(initialFormData);

          // If training is set, fetch technologies for that training
          if (studentData.training?._id) {
            await fetchtechnologybytrainingid(studentData.training._id);
          }
        }
      } catch (error) {
        console.error("Error loading student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id, fetchtechnologybytrainingid]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCollegeNames(),
          fetchHr(),
          getAllQrCodes(),
          fetchBranch(),
          fetchTranningData(),
          fetchEducation(),
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [
    fetchCollegeNames,
    fetchHr,
    getAllQrCodes,
    fetchBranch,
    fetchTranningData,

    fetchEducation,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      setUpdatedData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      setUpdatedData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      const file = e.target.files[0];
      if (file) {
        setPreview(URL.createObjectURL(file)); // image preview ke liye URL
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setUpdatedData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Handle training change to fetch technologies
      if (name === "training") {
        fetchtechnologybytrainingid(value);
        // Reset technology when training changes
        setFormData((prev) => ({ ...prev, technology: "" }));
      }

      // Handle technology change to set total fee
      if (name === "technology") {
        fetchtechnologybyId(value);
      }
    }
  };

  const handleArrayChange = (e) => {
    const { value } = e.target;
    const companiesArray = value.split(",").map((item) => item.trim());

    setFormData((prev) => ({
      ...prev,
      interviewInCompanines: companiesArray,
    }));
    setUpdatedData((prev) => ({
      ...prev,
      interviewInCompanines: companiesArray,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create FormData for file uploads
      const submissionFormData = new FormData();

      // Append all fields from formData
      Object.keys(updatedData).forEach((key) => {
        if (Array.isArray(updatedData[key])) {
          // For arrays like interviewInCompanines
          updatedData[key].forEach((item, index) => {
            submissionFormData.append(`${key}[${index}]`, item);
          });
        } else if (updatedData[key] instanceof File) {
          // For files
          submissionFormData.append(key, updatedData[key]);
        } else if (
          updatedData[key] !== null &&
          updatedData[key] !== undefined
        ) {
          // For normal values
          submissionFormData.append(key, updatedData[key]);
        }
      });

      // Only append changed data to avoid unnecessary updates
      // Object.keys(updatedData).forEach((key) => {
      //   if (key === "interviewInCompanines") {
      //     // Handle array data
      //     updatedData[key].forEach((item, index) => {
      //       submissionFormData.append(`${key}[${index}]`, item);
      //     });
      //   } else if (
      //     updatedData[key] !== null &&
      //     !(updatedData[key] instanceof File)
      //   ) {
      //     // Handle regular fields
      //     submissionFormData.append(key, updatedData[key]);
      //   }
      // });

      // // Append files if they exist in updatedData
      // if (updatedData.profilePhoto instanceof File) {
      //   submissionFormData.append("profilePhoto", updatedData.profilePhoto);
      // }
      // if (updatedData.aadharCard instanceof File) {
      //   submissionFormData.append("aadharCard", updatedData.aadharCard);
      // }
      // if (updatedData.cv instanceof File) {
      //   submissionFormData.append("cv", updatedData.cv);
      // }
      // if (updatedData.district) {
      //   submissionFormData.append("district", updatedData.district);
      // }
      // Send update request
      const response = await axios.patch(
        `/registration/update/${id}`,
        submissionFormData
      );

      if (response.data.success) {

        toast.success("Student data updated successfully!")
        navigate("/accepted");
      } else {
        toast.error("Failed to update student: " + response.data.message)
        alert("Failed to update student: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating student data:", error);
      alert("Error updating student data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate final fee and due fee whenever totalFee, discount, or paidFee changes
  useEffect(() => {
    const total = Number(formData.totalFee) || 0;
    const discount = Number(formData.discount) || 0;
    const paid = Number(formData.paidFee) || 0;

    const finalFee = total - discount;
    const dueFee = finalFee - paid;

    setFormData((prev) => ({
      ...prev,
      finalFee,
      dueFee,
    }));
  }, [formData.totalFee, formData.discount, formData.paidFee]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center  font-medium text-gray-700 hover:text-blue-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                  <Link
                    to="/accepted"
                    className="ml-1  font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    Students
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                  <span className="ml-1  font-medium text-gray-500 md:ml-2">
                    Update Student
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Update Student
              </h1>
              <p className="text-gray-600 mt-1">ID: {id}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 md:mt-0 flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft size={20} className="mr-1" /> Back to Students
            </button>
          </div> */}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg overflow-hidden"
          encType="multipart/form-data"
        >
          <div className="px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Update Student
              </h1>
              <p className="text-gray-600 mt-1">ID: {id}</p>
            </div>
          </div>
          <hr />
          {/* Personal Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2" size={20} /> Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatshapp"
                  value={formData.whatshapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Mobile
                </label>
                <input
                  type="tel"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's / Guardian's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                    </div>
                    <input
                      type="file"
                      name="profilePhoto"
                      onChange={handleChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 relative overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile Preview"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      name="profilePhoto"
                      onChange={handleChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Education Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="mr-2" size={20} /> Education Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Education</option>
                  {Educations.map((edu) => (
                    <option key={edu._id} value={edu._id}>
                      {edu.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Year
                </label>
                <input
                  type="text"
                  name="eduYear"
                  value={formData.eduYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2023-2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Education
                </label>
                <select
                  name="higherEducation"
                  value={formData.higherEducation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Higher Education</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Diploma+Graduation">Diploma+Graduation</option>
                  <option value="Post Graduation">Post Graduation</option>
                  <option value="12th">12th</option>
                  <option value="10th">10th</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Qualification
                </label>
                <input
                  type="text"
                  name="lastQualification"
                  value={formData.lastQualification}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name
                </label>
                <select
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select College</option>
                  {collegeNames.map((college) => (
                    <option key={college?._id} value={college?._id}>
                      {college?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Training Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="mr-2" size={20} /> Training Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Training
                </label>
                <select
                  name="training"
                  value={formData.training}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Training</option>
                  {Trainings.map((training) => (
                    <option key={training._id} value={training._id}>
                      {training.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technology
                </label>
                <select
                  name="technology"
                  value={formData.technology}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                // disabled={!formData.training}
                >
                  <option value="">Select Technology</option>
                  {technologiesData.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="joiningData"
                    value={formData.joiningData}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isJoin"
                  checked={formData.isJoin}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Has Joined
                </label>
              </div>
            </div>
          </div>

          {/* Guardian Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <User className="mr-2" size={20} /> Guardian Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Mobile
                </label>
                <input
                  type="tel"
                  name="guardianMobile"
                  value={formData.guardianMobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Relation
                </label>

                <select
                  name="guardianRelation"
                  value={formData.guardianRelation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Other">Other</option>
                </select>
              </div>


              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="guardianMobileVerification"
                  checked={formData.guardianMobileVerification}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Mobile Verified
                </label>
              </div>
            </div>
          </div>

          {/* Document Status Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2" size={20} /> Document Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="idCardIssued"
                  checked={formData.idCardIssued}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 flex items-center">
                  <IdCard size={16} className="mr-1" /> ID Card Issued
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="certificateIssued"
                  checked={formData.certificateIssued}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 flex items-center">
                  <Award size={16} className="mr-1" /> Certificate Issued
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hardForm"
                  checked={formData.hardForm}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 flex items-center">
                  <FileText size={16} className="mr-1" /> Hard Form
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="aadharCardUploded"
                  checked={formData.aadharCardUploded}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Aadhar Card Uploaded
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="tSartIssued"
                  checked={formData.tSartIssued}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 flex items-center">
                  <Shirt size={16} className="mr-1" /> T-Shirt Issued
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="photoSummited"
                  checked={formData.photoSummited}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Photo Submitted
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="cvUploded"
                  checked={formData.cvUploded}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  CV Uploaded
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Aadhar Card
                </label>
                <input
                  type="file"
                  name="aadharCard"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*,.pdf"
                />
                <p className="text-xs text-green-500 ">{formData.aadharCard?.public_id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload CV
                </label>
                <input
                  type="file"
                  name="cv"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx"
                />
                <p className="text-xs text-green-500 ">{formData.cv?.public_id}</p>
              </div>
            </div>
          </div>

          {/* Placement Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="mr-2" size={20} /> Placement Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isJobNeed"
                  checked={formData.isJobNeed}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Job Assistance Needed
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="placementStatus"
                  checked={formData.placementStatus}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Placement Status
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placed In Company
                </label>
                <input
                  type="text"
                  name="placeInCompany"
                  value={formData.placeInCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interviewed In Companies
                </label>
                <input
                  type="text"
                  name="interviewInCompanines"
                  value={formData.interviewInCompanines.join(", ")}
                  onChange={handleArrayChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company names separated by commas"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate company names with commas
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard className="mr-2" size={20} /> Payment Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Fee (₹)
                </label>
                <input
                  type="number"
                  name="totalFee"
                  value={formData.totalFee}
                  onChange={handleChange}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md outline-0  bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Fee (₹)
                </label>
                <input
                  type="number"
                  name="finalFee"
                  value={formData.finalFee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 outline-0"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Fee (₹)
                </label>
                <input
                  type="number"
                  name="paidFee"
                  value={formData.paidFee}
                  onChange={handleChange}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 outline-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Fee (₹)
                </label>
                <input
                  type="number"
                  name="dueFee"
                  value={formData.dueFee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 outline-0"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                >
                  <option value="registration">Registration</option>
                  <option value="installment">Installment</option>
                  <option value="full">Full Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QR Code
                </label>
                <select
                  name="qrcode"
                  value={formData.qrcode || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select QR Code</option>
                  {qrcodes.map((qr) => (
                    <option key={qr._id} value={qr._id}>
                      {qr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="tnxId"
                  value={formData.tnxId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Transaction ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2" size={20} /> Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HR Name
                </label>
                <select
                  name="hrName"
                  value={formData.hrName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select HR</option>
                  {HRs.map((hr) => (
                    <option key={hr._id} value={hr._id}>
                      {hr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branchs.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional remarks or notes"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Update Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateStudent;
