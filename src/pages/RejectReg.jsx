
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
  Trash2,
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
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";
import useGetCount from "../hooks/useGetCount";
import { Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import useGetTechnology from "../hooks/useGetTechnology";

function RejectReg() {
  // Default filter for new registrations - ALWAYS applied
  const defaultFilters = { status: "rejected" };

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
  } = useGetStudents(defaultFilters);
  const { techState, fetchTechnology } = useGetTechnology()
  const { data: students, pagination, loading, filters, searchTerm } = currentState;
  const [actionLoading, setActionLoading] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState(null);
  const [branches, setBranches] = useState([]);
  const fetchCount = useGetCount();

  const didFetch = useRef(false);

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
      toast.error(error.response?.data?.message || error.message);
      console.error(error);
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

  const handleDelete = async (rowId) => {
    try {
      setActionLoading(`deleting-${rowId}`);
      const res = await axios.delete(`/registration/user/${rowId}`)
      if (res.data.success) {
        toast.success(res.data.message)
        fetchStudents()
      }
    } catch (error) {
      console.log(error);

    } finally {
      setActionLoading(null)
    }
  }


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
              <button
                className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              // onClick={() => handleView(row)}
              >
                <Eye size={20} />
              </button>
            </Tooltip>
          </Link>
          <DeleteConfirmationModal
            id={row.id}
            itemName={row.userid}
            onConfirm={() => handleDelete(row._id)}
            loading={loading}
          >
            <Tooltip
              title={<span className="font-bold ">Delete</span>}
              placement="top"
            >
              <button className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600">
                {actionLoading === `deleting-${row._id}` ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
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
          color={row.tnxStatus === "paid" ? "success" : "warning"}
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
      Cell: ({ row }) => (<span>{capitalizeFirst(row.collegeName.name)}</span>),
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
      Cell: ({ row }) => (<span>{capitalizeFirst(row.training.name)}</span>),
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
      const res = await axios.patch(`/registration/status/${id}`, {
        status: "accepted",
      });
      if (res.data.success) {
        toast.success("Registration accepted successfully");
        fetchCount();
        // Refresh current page with same filters
        fetchStudents({ forceRefresh: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(`Reject-${id}`);
      const res = await axios.patch(`/registration/status/${id}`, {
        status: "rejected",
      });
      if (res.data.success) {
        toast.success("Registration rejected successfully");
        fetchCount();
        // Refresh current page with same filters
        fetchStudents({ forceRefresh: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setActionLoading(null);
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
    Object.keys(defaultFilters).forEach(key => {
      delete userFilters[key];
    });

    return Object.entries(userFilters)
      .filter(([key, value]) => value && value !== "All")
      .map(([key, value]) => ({ key, value }));
  };

  const appliedFilters = getUserAppliedFilters();
  const appliedFiltersCount = appliedFilters.length;

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Rejected Registrations
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

export default RejectReg;