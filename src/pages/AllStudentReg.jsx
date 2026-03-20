

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home,
  ChevronRight,
  Eye,
  Check,
  X,
  Printer,
  Loader2,
  Filter,
  XCircle,
  Edit2,
  Download,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Chip,
  Tooltip,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Box,
  Typography,
  Badge,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";
import useGetCount from "../hooks/useGetCount";
import { Close } from "@mui/icons-material";
import useGetTechnology from "../hooks/useGetTechnology";
import { ActionButton } from "../components/LoadingComponents";
import { showSuccess, showError } from "../utils/toast";
import * as XLSX from "xlsx";
import { useLoading } from "../hooks/useLoading";

function AllStudentReg() {


  const {
    fetchStudents,
    changePage,
    changeLimit,
    changeSort,
    changeFilters,
    changeSearch,
    clearAllFilters,
    currentState,
    defaultFilters: hookDefaults
  } = useGetStudents();
  const { techState, fetchTechnology } = useGetTechnology()
  const { data: students, pagination, loading, filters, searchTerm } = currentState;
  const [actionLoading, setActionLoading] = useState(null);
  const { loading: buttonLoading, startLoading, stopLoading } = useLoading();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const [branches, setBranches] = useState([]);
  const fetchCount = useGetCount();
  const navigate = useNavigate();
  const didFetch = useRef(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchInitialData = async () => {
      await fetchStudents({ forceRefresh: true, filters: {} });
      await fetchTechnology();
      await getAllBranches();
    };

    fetchInitialData();
  }, [fetchStudents]);


  const getAllBranches = async () => {
    try {
      const res = await axios.get("/branches");
      if (res.data.success) {
        setBranches(res.data.data.filter((b) => b.isActive));
      }
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error fetching branches");
    }
  };


  const handlePrint = (student) => {
    window.open(`/receipt/${student._id}`, "_blank");
  };

  const handleQrView = (row) => {
    if (row.qrcode?.image?.url) {
      setSelectedQrCode(row.qrcode.image.url);
      setQrModalOpen(true);
    }
  };
  const handleEdit = (row) => {
    // navigate(`/AddStudent/${row._id}`);
    navigate(`/update-student/${row._id}`);
  };
  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedQrCode(null);
  };
  const capitalizeFirst = (text = "") =>
    text.charAt(0).toUpperCase() + text.slice(1);

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
      sortable: true,
      filter: true,
      filterKey: "trainingFeeStatus",
      Cell: ({ row }) => (
        <Chip
          label={capitalizeFirst(row.trainingFeeStatus || "pending")}
          color={row.trainingFeeStatus === "full paid" ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      label: "Tnx Status",
      accessor: "tnxStatus",
      sortable: true,
      filter: false,
      filterKey: "tnxStatus",
      Cell: ({ row }) => (
        <Chip
          label={capitalizeFirst(row.tnxStatus || "pending")}
          color={row.tnxStatus === "paid" ? row.tnxStatus === "full paid" ? "success" : "success" : "warning"}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      label: "Enroll ID",
      accessor: "userid",
      sortable: true,
    },
    {
      label: "Student Name",
      accessor: "studentName",
      Cell: ({ row }) => (<span>{capitalizeFirst(row.studentName)}</span>),
      sortable: true,
    },

    {
      label: "Registration Amount",
      accessor: "amount",
      sortable: true,
    },
    {
      label: "Total Fee",
      accessor: "totalFee",
      sortable: true,
    },
    {
      label: "Discount Fee",
      accessor: "discount",
      sortable: true,
    },
    {
      label: "Final Fee",
      accessor: "finalFee",
      sortable: true,
    },
    {
      label: "Paid Amount",
      accessor: "paidAmount",
      sortable: true,
    },
    {
      label: "Due Amount",
      accessor: "dueAmount",
      sortable: true,
    },

    {
      label: "Payment Method",
      accessor: "paymentMethod",
      sortable: true,
      Cell: ({ row }) => (<span>{capitalizeFirst(row.paymentMethod)}</span>),

      filter: true,
      filterKey: "paymentMethod",
    },
    {
      label: "Payment Type",
      accessor: "paymentType",
      sortable: true,
      Cell: ({ row }) => (<span>{capitalizeFirst(row.paymentType)}</span>),
      filter: false,
    },
    {
      label: "Payment qrcode",
      accessor: "qrcode.name",
      sortable: true,
      Cell: ({ row }) => (
        <div
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
          onClick={() => handleQrView(row)}
        >
          {row.qrcode?.name}
        </div>
      ),
    },
    {
      label: "UTR No",
      accessor: "tnxId",
      sortable: true,
    },
    {
      label: "Mobile",
      accessor: "mobile",
      sortable: true,
    },
    {
      label: "Whatshapp",
      accessor: "whatshapp",
      sortable: true,
    },
    {
      label: "Alternate Mobile",
      accessor: "alternateMobile",
      sortable: true,
    },
    {
      label: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      label: "Father Name",
      accessor: "fatherName",
      Cell: ({ row }) => (<span>{capitalizeFirst(row.fatherName)}</span>),
      sortable: true,
    },

    {
      label: "College Name",
      accessor: "collegeName",
      Cell: ({ row }) => (<span>{capitalizeFirst(row.collegeName?.name)}</span>),
      sortable: true,
      filter: false,
      filterKey: "collegeName",

    },
    {
      label: "Education",
      accessor: "education.name",
      sortable: true,
    },
    {
      label: "Edu Year",
      accessor: "eduYear",
      sortable: true,
    },
    {
      label: "Training",
      accessor: "training.name",
      sortable: true,
      Cell: ({ row }) => (<span>{capitalizeFirst(row.training?.name)}</span>),
    },

    {
      label: "Technology",
      accessor: "technology.name",
      sortable: true,
      filter: true,
      filterKey: "technology",
      filterOptions: techState.data.map((t) => ({
        label: t.name,
        value: t._id,
      })),
      Cell: ({ row }) => <span>{capitalizeFirst(row.technology?.name || "N/A")}</span>,
    },
    {
      label: "Branch",
      accessor: "branch.name", // 👈 display ke liye
      filter: true,
      filterKey: "branch", // 👈 API ko objectId bhejne ke liye
      filterOptions: branches.map((b) => ({
        label: b.name,
        value: b._id,
      })),
      sortable: true,
      Cell: ({ row }) => (<span>{capitalizeFirst(row.branch?.name || "N/A")}</span>),
    },
    {
      label: "Batch",
      accessor: "batch",
      sortable: true,
      Cell: ({ row }) => (
        <div>
          {row.batch?.map((b, i) => (
            <div key={b._id}> {capitalizeFirst(b.batchName)}</div>
          ))}
        </div>
      ),
    },
    {
      label: "Hr Name",
      accessor: "hrName.name",
      sortable: true,
      Cell: ({ row }) => (<span>{capitalizeFirst(row.hrName?.name || "N/A")}</span>),
    },
    {
      label: "Reg Date",
      accessor: "createdAt",
      sortable: true,
      Cell: ({ row }) => <span>{formatDate(row.createdAt)}</span>,
    },
    {
      label: "Remark",
      accessor: "remark",

    },
  ];

  const handleAccept = async (id) => {
    try {
      setActionLoading(`Accept-${id}`);
      startLoading(`Accept-${id}`);
      const res = await axios.patch(`/registration/status/${id}`, {
        status: "accepted",
      });
      if (res.data.success) {
        showSuccess("Registration accepted successfully");
        fetchCount();
        // Refresh current page with same filters
        fetchStudents({ forceRefresh: true });
      }
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error accepting registration");
    } finally {
      setActionLoading(null);
      stopLoading();
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(`Reject-${id}`);
      startLoading(`Reject-${id}`);
      const res = await axios.patch(`/registration/status/${id}`, {
        status: "rejected",
      });
      if (res.data.success) {
        showSuccess("Registration rejected successfully");
        fetchCount();
        // Refresh current page with same filters
        fetchStudents({ forceRefresh: true });
      }
    } catch (error) {
      showError(error?.response?.data?.message || error?.message || "Error rejecting registration");
    } finally {
      setActionLoading(null);
      stopLoading();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get user-applied filters (excluding default filters)
  const getUserAppliedFilters = () => {
    const userFilters = { ...filters };
    // Remove default filters


    return Object.entries(userFilters)
      .filter(([key, value]) => value && value !== "All")
      .map(([key, value]) => ({ key, value }));
  };

  const appliedFilters = getUserAppliedFilters();
  const appliedFiltersCount = appliedFilters.length;

  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      
      const params = {
        limit: 100000,
        page: 1,
        ...filters,
      };

      const response = await axios.get("/registration", { params });
      
      if (!response.data.success || !response.data.data) {
        showError("No data to export");
        return;
      }

      const exportData = response.data.data.map(student => ({
        "Enroll ID": student.userid || "",
        "Student Name": capitalizeFirst(student.studentName || ""),
        "Mobile": student.mobile || "",
        "Email": student.email || "",
        "Father Name": capitalizeFirst(student.fatherName || ""),
        "College Name": capitalizeFirst(student.collegeName?.name || ""),
        "Education": student.education?.name || "",
        "Edu Year": student.eduYear || "",
        "Training": capitalizeFirst(student.training?.name || ""),
        "Technology": capitalizeFirst(student.technology?.name || "N/A"),
        "Branch": capitalizeFirst(student.branch?.name || "N/A"),
        "Batch": student.batch?.map(b => capitalizeFirst(b.batchName)).join(", ") || "",
        "Registration Amount": student.amount || "",
        "Total Fee": student.totalFee || "",
        "Discount Fee": student.discount || "",
        "Final Fee": student.finalFee || "",
        "Paid Amount": student.paidAmount || "",
        "Due Amount": student.dueAmount || "",
        "Training Fee Status": capitalizeFirst(student.trainingFeeStatus || "pending"),
        "Transaction Status": capitalizeFirst(student.tnxStatus || "pending"),
        "Payment Method": capitalizeFirst(student.paymentMethod || ""),
        "Payment Type": capitalizeFirst(student.paymentType || ""),
        "UTR No": student.tnxId || "",
        "HR Name": capitalizeFirst(student.hrName?.name || "N/A"),
        "Registration Date": formatDate(student.createdAt),
        "Remark": student.remark || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, `student_registration_${new Date().getTime()}.xlsx`);
      showSuccess(`Exported ${exportData.length} records successfully`);
    } catch (error) {
      showError(error?.response?.data?.message || "Failed to export data");
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
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

        {/* Applied Filters Badge */}
        <Box className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={exportToExcel}
            disabled={exportLoading || students.length === 0}
            startIcon={exportLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            size="small"
          >
            {exportLoading ? "Exporting..." : "Export"}
          </Button>

          {appliedFiltersCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<XCircle size={16} />}
              onClick={clearAllFilters}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </div>



      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={students}
        loading={loading}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        onPageChange={changePage}
        onLimitChange={changeLimit}
        onSortChange={changeSort}
        onFilterChange={changeFilters} // This uses our custom handler
        onSearch={changeSearch}
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
            <img
              src={`${import.meta.env.VITE_BASE_URI}${selectedQrCode}`}
              alt="QR Code"
              className="w-72 h-72 object-contain border rounded-lg"
            />
          ) : (
            <p className="text-gray-500">No QR code available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AllStudentReg;