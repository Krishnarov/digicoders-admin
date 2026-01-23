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
    IconButton,
    Switch,
    Tooltip,
} from "@mui/material";
import { Plus, Edit, Trash2, Tag as TagIcon, Loader2, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

function ManageTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [openModal, setOpenModal] = useState(false);
    const [editTag, setEditTag] = useState(null);
    const [tagName, setTagName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);

    const fetchTags = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/tags", {
                params: {
                    page,
                    limit,
                    search,
                    sortBy,
                    sortOrder,
                },
            });
            if (response.data.success) {
                setTags(response.data.data);
                setTotal(response.data.pagination.totalRecords);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch tags");
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, sortBy, sortOrder]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleOpenModal = (tag = null) => {
        if (tag) {
            setEditTag(tag);
            setTagName(tag.name);
        } else {
            setEditTag(null);
            setTagName("");
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditTag(null);
        setTagName("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tagName.trim()) {
            toast.error("Tag name is required");
            return;
        }

        setSubmitting(true);
        try {
            if (editTag) {
                await axiosInstance.put(`/tags/${editTag._id}`, { name: tagName });
                toast.success("Tag updated successfully");
            } else {
                await axiosInstance.post("/tags", { name: tagName });
                toast.success("Tag added successfully");
            }
            handleCloseModal();
            fetchTags();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusToggle = async (tag) => {
        try {
            await axiosInstance.put(`/tags/${tag._id}`, { isActive: !tag.isActive });
            toast.success(`Tag ${!tag.isActive ? "activated" : "deactivated"} successfully`);
            fetchTags();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleDeleteClick = (tag) => {
        setTagToDelete(tag);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axiosInstance.delete(`/tags/${tagToDelete._id}`);
            toast.success("Tag deleted successfully");
            setDeleteModalOpen(false);
            fetchTags();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete tag");
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
                            className="px-2 py-1 rounded-md hover:bg-gray-100 transition-colors border text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleOpenModal(row)}
                            disabled={loading.delete === row._id || loading.status === row._id}
                        >
                            <Edit2 size={20} />
                        </button>
                    </Tooltip>
                    <DeleteConfirmationModal
                        id={row._id}
                        itemName={row.name}
                        onConfirm={confirmDelete}
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
            label: "Tag Name",
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
                            disabled={loading.status === row._id}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none disabled:opacity-50 ${row.isActive ? "bg-green-500" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${row.isActive ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                            {loading.status === row._id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin w-3 h-3 text-white" />
                                </div>
                            )}
                        </button>
                    </Tooltip>
                </div>
            ),
            filter: false,
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
                    <TagIcon className="text-blue-600" /> Manage Tags
                </h1>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Add New Tag
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={tags}
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
                    <DialogTitle>{editTag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Tag Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
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
                            {submitting ? "Saving..." : editTag ? "Update" : "Add"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Tag"
                message={`Are you sure you want to delete tag "${tagToDelete?.name}"? This action cannot be undone.`}
            />
        </div>
    );
}

export default ManageTags;
