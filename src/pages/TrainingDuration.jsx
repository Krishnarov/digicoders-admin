import React, { useState, useEffect, useCallback } from "react";
import { Home, ChevronRight, Edit2, Trash2, Loader2 } from "lucide-react";
import DataTable from "../components/DataTable";
import { Button, TextField, Tooltip } from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

function TrainingDuration() {
    const [durations, setDurations] = useState([]);
    const [loading, setLoading] = useState({
        table: false,
        save: false,
        delete: null,
        status: null
    });
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "" });
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for pagination and filters
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({});
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ column: "createdAt", order: "desc" });

    // Function to fetch durations data with all params
    const fetchDurations = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, table: true }));

            // Prepare query params
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                sortBy: sortConfig.column,
                sortOrder: sortConfig.order,
                ...filters
            };

            // Add search if exists
            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await axios.get("/duration", { params });

            if (response.data.success) {
                setDurations(response.data.data || []);
                // Update pagination info from server
                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.pagination.totalCount || 0
                    }));
                }
            } else {
                toast.error(response.data.message || "Failed to fetch durations");
            }
        } catch (error) {
            console.error("Error fetching durations:", error);
            toast.error(error.response?.data?.message || "Failed to load duration data");
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    }, [pagination.page, pagination.limit, filters, search, sortConfig]);

    // Fetch data when dependencies change
    useEffect(() => {
        fetchDurations();
    }, [fetchDurations]);

    const columns = [
        {
            label: "Action",
            accessor: "action",
            Cell: ({ row }) => (
                <div className="flex gap-2 items-center">
                    <Tooltip
                        title={<span className="font-bold">Edit</span>}
                        placement="top"
                    >
                        <button
                            className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleEdit(row)}
                            disabled={loading.delete === row._id || loading.status === row._id}
                        >
                            <Edit2 size={20} />
                        </button>
                    </Tooltip>
                    <DeleteConfirmationModal
                        id={row._id}
                        itemName={row.name}
                        onConfirm={() => handleDelete(row._id)}
                        loading={loading.delete === row._id}
                    >
                        <Tooltip
                            title={<span className="font-bold">Delete</span>}
                            placement="top"
                        >
                            <button
                                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading.delete === row._id || loading.status === row._id}
                            >
                                {loading.delete === row._id ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
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
            label: "Duration Name",
            accessor: "name",
            Cell: ({ row }) => (
                <span className="font-medium">{row.name}</span>
            ),
            sortable: true,
            filter: false,
        },
        {
            label: "Status",
            accessor: "isActive",
            Cell: ({ row }) => (
                <div className="flex items-center gap-4">
                    <span className={`ml-2 text-sm font-medium ${row.isActive ? "text-green-600" : "text-gray-600"}`}>
                        {row.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                        onClick={() => toggleStatus(row._id)}
                        disabled={loading.status === row._id}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none disabled:opacity-50 ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
                    >
                        <span
                            className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${row.isActive ? "translate-x-6" : "translate-x-1"}`}
                        />
                        {loading.status === row._id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="animate-spin w-3 h-3 text-white" />
                            </div>
                        )}
                    </button>
                </div>
            ),
            filter: true,
            sortable: true,
            filterOptions: [
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" }
            ],
            filterKey: "status"
        },
    ];

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    // Handle sort change
    const handleSort = (column, order) => {
        setSortConfig({ column, order });
    };

    // Handle filter change
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter
    };

    // Handle search
    const handleSearch = (searchTerm) => {
        setSearch(searchTerm);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    };

    const handleEdit = (row) => {
        setFormData({ name: row.name });
        setEditId(row._id);
        setOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(prev => ({ ...prev, delete: id }));
            const res = await axios.delete(`/duration/${id}?action=delete`);

            if (res.data.success) {
                toast.success(res.data.message || "Deleted successfully");
                // Refresh data immediately after delete
                await fetchDurations();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to delete");
            console.error("Error deleting duration:", error);
        } finally {
            setLoading(prev => ({ ...prev, delete: null }));
        }
    };

    const toggleStatus = async (id) => {
        try {
            setLoading(prev => ({ ...prev, status: id }));
            const item = durations.find((item) => item._id === id);
            const res = await axios.put(`/duration/${id}?action=update`, {
                isActive: !item.isActive,
            });

            if (res.data.success) {
                toast.success(res.data.message || "Status updated successfully");
                // Refresh data immediately after status change
                await fetchDurations();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to update status");
            console.error("Error toggling status:", error);
        } finally {
            setLoading(prev => ({ ...prev, status: null }));
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            setLoading(prev => ({ ...prev, save: true }));

            // Validate form data
            if (!formData.name.trim()) {
                toast.error("Please enter duration name");
                return;
            }

            let res;
            if (editId) {
                res = await axios.put(`/duration/${editId}?action=update`, formData);
            } else {
                res = await axios.post("/duration?action=add", formData);
            }

            if (res.data.success) {
                toast.success(res.data.message || "Saved successfully");
                // Refresh data immediately after save
                await fetchDurations();
                handleClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to save");
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
            setLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({ name: "" });
        setEditId(null);
        setIsSubmitting(false);
    };

    const handleOpen = () => {
        setOpen(true);
        setFormData({ name: "" });
        setEditId(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-sm md:max-w-6xl mx-auto px-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
                        Training Duration
                    </h1>
                    <Link
                        to="/dashboard"
                        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <Home className="w-5 h-5 text-blue-600 mr-1" />
                        <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                        <span className="text-gray-800">Dashboard</span>
                    </Link>
                </div>
                <Button
                    variant="contained"
                    onClick={handleOpen}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading.table}
                >
                    {loading.table ? "Loading..." : "Add New Duration"}
                </Button>
            </div>

            {/* DataTable */}
            <DataTable
                mode="server"
                columns={columns}
                data={durations}
                loading={loading.table}
                page={pagination.page}
                limit={pagination.limit}
                total={pagination.total}
                onPageChange={handlePageChange}
                onLimitChange={handleRowsPerPageChange}
                onSortChange={handleSort}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                filters={filters}
                pagination={true}
                search={true}
                filter={true}
                sort={true}
                showDateFilter={false} // Set to true if you want date range filter
            />

            {/* Modal */}
            <CustomModal
                open={open}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title={editId ? "Edit Duration" : "Add New Duration"}
                submitText={editId ? "Update" : "Create"}
                loading={loading.save}
                submitDisabled={isSubmitting}
            >
                <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                        label="Duration Name *"
                        name="name"
                        fullWidth
                        value={formData.name}
                        onChange={handleChange}
                        variant="outlined"
                        autoFocus
                        required
                        error={isSubmitting && !formData.name.trim()}
                        helperText={!formData.name.trim() ? "Duration name is required" : ""}
                        disabled={loading.save}
                        InputProps={{
                            onKeyPress: (e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit();
                                }
                            }
                        }}
                    />
                </Stack>
            </CustomModal>
        </div>
    );
}

export default TrainingDuration;