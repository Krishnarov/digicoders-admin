import React, { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Edit2, Trash2, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function QrCode() {
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    upi: "",
    bankName: "",
  });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [qrcodes, setQrcodes] = useState([]);
  
  // State for pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  
  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({});

  // Memoized fetch function for QR Codes
  const getAllQrCodes = useCallback(async (search = "", newFilters = {}, sortBy = "", sortOrder = "") => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams();

      // Add search if provided
      if (search) {
        params.append("search", search);
      }

      // Add filters
      Object.keys(newFilters).forEach((key) => {
        if (newFilters[key] && newFilters[key] !== "All") {
          params.append(key, newFilters[key]);
        }
      });

      // Add sorting
      if (sortBy && sortOrder) {
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
      }

      // Add pagination params
      params.append("page", pagination.page);
      params.append("limit", pagination.limit);

      const res = await axios.get(`/qrcode?${params.toString()}`);
      if (res.data.success) {
        setQrcodes(res.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.data.total || 0,
          pages: res.data.pages || 1,
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    getAllQrCodes();
  }, [getAllQrCodes]);

  const columns = [
    {
      label: "Action",
      accessor: "action",
      sortable: false,
      show: true,
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
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
          <DeleteConfirmationModal
            id={row._id}
            itemName={row.name}
            onConfirm={() => handleDelete(row._id)}
            loading={loading}
          >
            <Tooltip
              title={<span className="font-bold ">Delete</span>}
              placement="top"
            >
              <button 
                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                disabled={loading === `deleting-${row._id}`}
              >
                {loading === `deleting-${row._id}` ? (
                  <Loader2 className="animate-spin" />
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
      label: "QR Code Name", 
      accessor: "name",
      sortable: true 
    },
    { 
      label: "Bank Name", 
      accessor: "bankName",
      sortable: true,
      filter: true,
    },
    { 
      label: "UPI ID", 
      accessor: "upi",
      sortable: true 
    },
    {
      label: "QR Code",
      accessor: "image",
      sortable: false,
      Cell: ({ row }) =>
        row.image?.url ? (
          <img
            src={`${import.meta.env.VITE_BASE_URI}${row.image.url}`}
            alt="QR Code"
            className="h-12 w-12 object-contain"
          />
        ) : (
          "No Image"
        ),
    },
    {
      label: "Status",
      accessor: "isActive",
      sortable: true,
      filter: true,
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className="ml-2 text-sm font-medium text-gray-700">
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row)}
            disabled={loading === `status-${row._id}`}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${
                row.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            >
              {loading === `status-${row._id}` && (
                <Loader2 className="animate-spin w-4 h-4" />
              )}
            </span>
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      upi: row.upi,
      bankName: row.bankName,
      image: null,
    });
    setPreview(row.image?.url);
    setEditId(row._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      const res = await axios.delete(`/qrcode/${id}`);
      
      if (res.data.success) {
        toast.success(res.data.message || "QR Code deleted successfully");
        getAllQrCodes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error deleting QR code:", error);
    } finally {
      setLoading("");
    }
  };

  const toggleStatus = async (data) => {
    try {
      setLoading(`status-${data._id}`);
      const res = await axios.put(`/qrcode/${data._id}`, {
        isActive: !data.isActive,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");
        getAllQrCodes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error toggling status:", error);
    } finally {
      setLoading("");
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.bankName.trim() || !formData.upi.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("upi", formData.upi);
    formDataToSend.append("bankName", formData.bankName);
    
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      setLoading("Save");
      let res;
      if (editId) {
        res = await axios.put(`/qrcode/${editId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.post("/qrcode", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      
      if (res.data.success) {
        toast.success(res.data.message || "Operation successful");
        getAllQrCodes();
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", image: null, upi: "", bankName: "" });
    setPreview(null);
    setEditId(null);
  };

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreview(null);
  };

  // Handle search from DataTable
  const handleSearch = useCallback(
    (searchTerm) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllQrCodes(searchTerm, filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllQrCodes, filters, sortConfig]
  );

  // Handle sort from DataTable
  const handleSort = useCallback(
    (column, order) => {
      setSortConfig({ sortBy: column, sortOrder: order });
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllQrCodes("", filters, column, order);
    },
    [getAllQrCodes, filters]
  );

  // Handle filter from DataTable
  const handleFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
      getAllQrCodes("", newFilters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllQrCodes, sortConfig]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      setPagination((prev) => ({ ...prev, page }));
      getAllQrCodes("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllQrCodes, filters, sortConfig]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (limit) => {
      setPagination((prev) => ({ ...prev, limit, page: 1 }));
      getAllQrCodes("", filters, sortConfig.sortBy, sortConfig.sortOrder);
    },
    [getAllQrCodes, filters, sortConfig]
  );

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            QR Code
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
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New QR Code
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        mode="server"
        columns={columns}
        data={qrcodes}
        loading={tableLoading}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onLimitChange={handleRowsPerPageChange}
        onSortChange={handleSort}
        onFilterChange={handleFilter}
        onSearch={handleSearch}
      />

      {/* Modal */}
      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={editId ? "Edit QR Code" : "Add New QR Code"}
        submitText={editId ? "Update" : "Create"}
        loading={loading === "Save"}
      >
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="QR Code Name *"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            autoFocus
            required
          />

          <TextField
            label="Bank Name *"
            name="bankName"
            fullWidth
            value={formData.bankName}
            onChange={handleChange}
            variant="outlined"
            required
          />

          <TextField
            label="UPI ID *"
            name="upi"
            fullWidth
            value={formData.upi}
            onChange={handleChange}
            variant="outlined"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QR Code Image *
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required={!editId} // Required only for new QR codes
            />
            {editId && (
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to keep current image
              </p>
            )}

            {preview && (
              <div className="mt-2 relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 object-contain border rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -mt-2 -mr-2 hover:bg-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </Stack>
      </CustomModal>
    </div>
  );
}

export default QrCode;