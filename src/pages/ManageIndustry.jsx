import React, { useState, useEffect, useCallback } from "react";
import DataTable from "../components/DataTable";
import axiosInstance from "../axiosInstance";
import {
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
} from "@mui/material";
import { Plus, Trash2, Building2, Loader2, Edit2 } from "lucide-react";
import { showSuccess, showError, apiWithToast } from "../utils/toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

function ManageIndustry() {
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [openModal, setOpenModal] = useState(false);
    const [editIndustry, setEditIndustry] = useState(null);
    const [industryName, setIndustryName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchIndustries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/industries", {
                params: {
                    page,
                    limit,
                    search,
                    sortBy,
                    sortOrder,
                },
            });
            if (response.data.success) {
                setIndustries(response.data.data);
                setTotal(response.data.pagination.totalRecords);
            }
        } catch (error) {
            showError(error.response?.data?.message || "Failed to fetch industries");
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, sortBy, sortOrder]);

    useEffect(() => {
        fetchIndustries();
    }, [fetchIndustries]);

    const handleOpenModal = (industry = null) => {
        if (industry) {
            setEditIndustry(industry);
            setIndustryName(industry.name);
        } else {
            setEditIndustry(null);
            setIndustryName("");
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditIndustry(null);
        setIndustryName("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!industryName.trim()) {
            showError("Industry name is required");
            return;
        }

        setSubmitting(true);
        try {
            if (editIndustry) {
                await axiosInstance.put(`/industries/${editIndustry._id}`, { name: industryName });
                showSuccess("Industry updated successfully");
            } else {
                await axiosInstance.post("/industries", { name: industryName });
                showSuccess("Industry added successfully");
            }
            handleCloseModal();
            fetchIndustries();
        } catch (error) {
            showError(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusToggle = async (industry) => {
        try {
            await axiosInstance.put(`/industries/${industry._id}`, { isActive: !industry.isActive });
            showSuccess(`Industry ${!industry.isActive ? "activated" : "deactivated"} successfully`);
            fetchIndustries();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to update status");
        }
    };

    const confirmDelete = async (id) => {
        try {
            await axiosInstance.delete(`/industries/${id}`);
            showSuccess("Industry deleted successfully");
            fetchIndustries();
        } catch (error) {
            showError(error.response?.data?.message || "Failed to delete industry");
        }
    };

    const columns = [
        {
            label: "Action",
            accessor: "action",
            Cell: ({ row }) => (
                <div className="flex gap-2">
                    <Tooltip
                        title={<span className="font-bold">Edit</span>}
                        placement="top"
                    >
                        <button
                            className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600"
                            onClick={() => handleOpenModal(row)}
                        >
                            <Edit2 size={20} />
                        </button>
                    </Tooltip>
                    <DeleteConfirmationModal
                        id={row._id}
                        itemName={row.name}
                        onConfirm={() => confirmDelete(row._id)}
                    >
                        <Tooltip
                            title={<span className="font-bold">Delete</span>}
                            placement="top"
                        >
                            <button
                                className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600"
                            >
                                <Trash2 size={20} />
                            </button>
                        </Tooltip>
                    </DeleteConfirmationModal>
                </div>
            ),
        },
        {
            label: "Industry Name",
            accessor: "name",
            sortable: true,
        },
        {
            label: "Status",
            accessor: "isActive",
            Cell: ({ row }) => (
                <div className="flex items-center gap-4">
                    <span className={`ml-2 text-sm font-medium ${row.isActive ? "text-green-600" : "text-gray-600"}`}>
                        {row.isActive ? "Active" : "Inactive"}
                    </span>
                    <Tooltip title={row.isActive ? "Active" : "Inactive"}>
                        <button
                            onClick={() => handleStatusToggle(row)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${row.isActive ? "bg-green-500" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${row.isActive ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
        {
            label: "Added By",
            accessor: "addedBy.name",
        },
        {
            label: "Created At",
            accessor: "createdAt",
            sortable: true,
            Cell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="text-blue-600" /> Manage Industries
                </h1>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Add New Industry
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={industries}
                loading={loading}
                page={page}
                limit={limit}
                total={total}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onSearch={setSearch}
                onSortChange={(col, order) => {
                    setSortBy(col);
                    setSortOrder(order);
                }}
                search={true}
                sort={true}
                pagination={true}
            />

            {/* Add/Edit Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{editIndustry ? "Edit Industry" : "Add New Industry"}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Industry Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={industryName}
                            onChange={(e) => setIndustryName(e.target.value)}
                            className="mt-2"
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} color="secondary">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={submitting}
                        >
                            {submitting ? "Saving..." : editIndustry ? "Update" : "Add"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
}

export default ManageIndustry;
