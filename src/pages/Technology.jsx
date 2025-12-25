import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  FormControl,
  InputLabel,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import useGetTechnology from "../hooks/useGetTechnology";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function Technology() {
  /* ================= HOOK ================= */
  const {
    fetchTechnology,
    changePage,
    changeLimit,
    changeSearch,
    changeSort,
    changeFilters,
    refreshTechnology,
    techState,
  } = useGetTechnology();

  const { data, loading: tableLoading, pagination, filters } = techState;

  /* ================= LOCAL STATE ================= */
  const [loading, setLoading] = useState({
    save: false,
    delete: null,
    status: null,
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
  });

  /* ================= INITIAL LOAD ================= */
  // useEffect(() => {
  //   fetchTechnology();
  // }, [fetchTechnology]);
 const didFetch = useRef(false);
  
    useEffect(() => {
      if (didFetch.current) return;
      didFetch.current = true;
  
      const fetchInitialData = async () => {
        await fetchTechnology();
      };
  
      fetchInitialData();
    }, [fetchTechnology]);
  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <button
              onClick={() => handleEdit(row)}
              className="px-2 py-1 border rounded"
            >
              <Edit2 size={18} />
            </button>
          </Tooltip>

          <DeleteConfirmationModal
            id={row._id}
            itemName={row.name}
            onConfirm={() => handleDelete(row._id)}
            loading={loading.delete === row._id}
          >
            <Tooltip title="Delete">
              <button
                className="px-2 py-1 border rounded text-red-600"
                disabled={loading.delete === row._id}
              >
                {loading.delete === row._id ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
        </div>
      ),
    },
    { label: "Technology Name", accessor: "name" },
    { label: "Duration", accessor: "duration", filter: true },
    {
      label: "Price",
      accessor: "price",
      Cell: ({ row }) => `₹${row.price}`,
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
                onClick={() => toggleStatus(row._id)}
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

  /* ================= HANDLERS ================= */
  const handlePageChange = (page) => changePage(page);
  const handleRowsPerPageChange = (limit) => changeLimit(limit);
  const handleSearch = (value) => changeSearch(value);
  const handleSort = ({ sortBy, sortOrder }) =>
    changeSort(sortBy, sortOrder);
  const handleFilter = (newFilters) => changeFilters(newFilters);
  const clearFilters = () => changeFilters({});

  const handleEdit = (row) => {
    setEditId(row._id);
    setFormData({
      name: row.name,
      duration: row.duration,
      price: row.price,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading((p) => ({ ...p, delete: id }));
      await axios.delete(`/technology/delete/${id}`, {
        withCredentials: true,
      });
      toast.success("Deleted successfully");
      refreshTechnology();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setLoading((p) => ({ ...p, delete: null }));
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading((p) => ({ ...p, status: id }));
      const item = data.find((i) => i._id === id);
      await axios.patch(
        `/technology/update/${id}`,
        { isActive: !item.isActive },
        { withCredentials: true }
      );
      toast.success("Status updated");
      refreshTechnology();
    } catch {
      toast.error("Status update failed");
    } finally {
      setLoading((p) => ({ ...p, status: null }));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setLoading((p) => ({ ...p, save: true }));

      if (!formData.name || !formData.duration || !formData.price) {
        toast.error("All fields required");
        return;
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      if (editId) {
        await axios.patch(`/technology/update/${editId}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post("/technology/create", payload, {
          withCredentials: true,
        });
      }

      toast.success("Saved successfully");
      refreshTechnology();
      handleClose();
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSubmitting(false);
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData({ name: "", duration: "", price: "" });
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Technology</h1>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Technology
        </Button>
      </div>

      <DataTable
        mode="server"
        columns={columns}
        data={data}
        loading={tableLoading}
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleRowsPerPageChange}
        onSearch={handleSearch}
        onSortChange={handleSort}
        onFilterChange={handleFilter}
        filters={filters}
        onClearFilters={clearFilters}
      />

      <CustomModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        loading={loading.save}
        title={editId ? "Edit Technology" : "Add Technology"}
      >
        <Stack spacing={2}>
          <TextField
            label="Technology Name"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Duration</InputLabel>
            <Select
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
            >
              <MenuItem value="45 days">45 days</MenuItem>
              <MenuItem value="28 days">28 days</MenuItem>
              <MenuItem value="6 months">6 months</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            fullWidth
          />
        </Stack>
      </CustomModal>
    </div>
  );
}

export default Technology;
