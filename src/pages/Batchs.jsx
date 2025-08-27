import React, { useState, useEffect } from "react";
import { Home, ChevronRight, Edit2, Trash2, Users } from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import CustomModal from "../components/CustomModal";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import axios from "../axiosInstance";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { Search, Filter } from "lucide-react";
import useGetStudents from "../hooks/useGetStudent";
import { useSelector } from "react-redux";
import useGetTranning from "../hooks/useGetTranning";

function Batchs() {
  const [loading, setLoading] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    batchName: "",
    trainingType: "",
    startDate: "",
    teacher: "",
    students: [],
  });
  const [editId, setEditId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const allStudents = useSelector((state) => state.student.data).filter(
    (item) => item.status === "accepted"
  );
  const trainingType = useSelector((state) =>
    state.tranning.data.filter((item) => item.isActive)
  );
  const fetchTranningData = useGetTranning();
  // New states for student management
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);

  const fetchStudents = useGetStudents();
  // 🔹 Fetch all batches
  const getAllBatches = async () => {
    try {
      const res = await axios.get("/batches");
      if (res.data.success) {
        setBatches(res.data.batches || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 Fetch teachers for dropdown
  const getAllTeachers = async () => {
    try {
      const res = await axios.get("/teachers");

      if (res.data.success) {
        setTeachers(res.data.teachers.filter((item) => item.isActive) || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllBatches();
    getAllTeachers();
    fetchStudents();
    fetchTranningData();
  }, []);

  // 🔹 Table Columns
  const columns = [
    {
      label: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Tooltip
            title={<span className="font-bold">Manage Students</span>}
            placement="top"
          >
            <button
              className="px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border text-blue-600"
              onClick={() => handleOpenStudentsModal(row)}
            >
              <Users size={20} />
            </button>
          </Tooltip>
          <Tooltip
            title={<span className="font-bold">Edit</span>}
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
            itemName={row.batchName}
            onConfirm={() => handleDelete(row._id)}
            loading={loading}
          >
            <Tooltip
              title={<span className="font-bold">Delete</span>}
              placement="top"
            >
              <button className="px-2 py-1 rounded-md hover:bg-red-100 transition-colors border text-red-600">
                <Trash2 size={20} />
              </button>
            </Tooltip>
          </DeleteConfirmationModal>
        </div>
      ),
    },
    { label: "Batch Name", accessor: "batchName" },
    {
      label: "Training Type",
      accessor: "trainingType",
      Cell: ({ row }) => (
        <span>
          {row.trainingType?.name} <br /> ({row.trainingType?.duration}){" "}
        </span>
      ),
    },
    {
      label: "Start Date",
      accessor: "startDate",
      Cell: ({ row }) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      label: "Teacher",
      accessor: "teacher",
      Cell: ({ row }) => row.teacher?.name || "Unassigned",
    },
    {
      label: "Students Count",
      accessor: "students",
      Cell: ({ row }) => (
        <Chip label={row.students?.length || 0} color="primary" size="small" />
      ),
    },
    {
      label: "Status",
      accessor: "isActive",
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <span className="ml-2 text-sm font-medium text-gray-700">
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => toggleStatus(row)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform rounded-full bg-white shadow-md ${
                row.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ),
      filter: true,
    },
  ];

  const toggleStatus = async (data) => {
    try {
      setLoading(true);
      const res = await axios.patch(`/batches/updatestatus/${data._id}`);
      console.log(res);
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
      getAllBatches();
    }
  };
  // 🔹 Open student management modal
  const handleOpenStudentsModal = (batch) => {
    setCurrentBatch(batch);
    // Set initially selected students (those already in the batch)
    const batchStudentIds = batch.students?.map((s) => s._id) || [];
    setSelectedStudents(batchStudentIds);
    setStudentsModalOpen(true);
  };

  // 🔹 Close student management modal
  const handleCloseStudentsModal = () => {
    setStudentsModalOpen(false);
    setSelectedStudents([]);
    setCurrentBatch(null);
  };

  // 🔹 Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // 🔹 Select all/none students in current filtered view
  const toggleSelectAll = () => {
    const filteredStudentIds = allStudents.map((student) => student._id);

    if (
      selectedStudents.length === filteredStudentIds.length &&
      filteredStudentIds.length > 0
    ) {
      // Deselect all filtered students
      setSelectedStudents((prev) =>
        prev.filter((id) => !filteredStudentIds.includes(id))
      );
    } else {
      // Select all filtered students, keeping previously selected ones
      setSelectedStudents((prev) => {
        const newSelection = [...prev];
        filteredStudentIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // 🔹 Save student assignments to batch
  const saveStudentsToBatch = async () => {
    try {
      setLoading("saving-students");
      await axios.put(`/batches/${currentBatch._id}/students`, {
        studentIds: selectedStudents,
      });
      getAllBatches(); // Refresh batches data
      handleCloseStudentsModal();
    } catch (error) {
      console.error("Error saving students:", error);
    } finally {
      setLoading("");
    }
  };

  // 🔹 Handle Edit
  const handleEdit = (row) => {
    setFormData({
      batchName: row.batchName,
      trainingType: row.trainingType,
      startDate: row.startDate?.split("T")[0],
      teacher: row.teacher?._id || "",
      students: row.students || [],
    });
    setEditId(row._id);
    setOpen(true);
  };

  // 🔹 Handle Delete
  const handleDelete = async (id) => {
    try {
      setLoading(`deleting-${id}`);
      await axios.delete(`/batches/${id}`);
      getAllBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
    } finally {
      setLoading("");
    }
  };

  // 🔹 Submit Form (Create / Update Batch)
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editId) {
        await axios.put(`/batches/${editId}`, formData);
      } else {
        await axios.post("/batches/create", formData);
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
      getAllBatches();
    }
  };

  // 🔹 Close Modal
  const handleClose = () => {
    setOpen(false);
    setFormData({
      batchName: "",
      trainingType: "",
      startDate: "",
      teacher: "",
      students: [],
    });
    setEditId(null);
  };

  // 🔹 Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Student table columns for the modal
  const studentColumns = [
    {
      label: "Select",
      accessor: "select",
      Cell: ({ row }) => (
        <Checkbox
          checked={selectedStudents.includes(row._id)}
          onChange={() => toggleStudentSelection(row._id)}
        />
      ),
    },
    { label: "Name", accessor: "studentName" },
    {
      label: "Technology",
      accessor: "technology",
      Cell: ({ row }) => <span>{row.technology?.name || "N/A"}</span>,
      filter: true,
      show: true,
    },
    { label: "Email", accessor: "email" },
    { label: "Phone", accessor: "mobile" },
    {
      label: "Join Date",
      accessor: "createdAt",
      Cell: ({ row }) => (
        <span>
          {new Date(row.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  // Check if all filtered students are selected
  const allFilteredSelected =
    allStudents.length > 0 &&
    allStudents.every((student) => selectedStudents.includes(student._id));

  // Check if some filtered students are selected
  const someFilteredSelected =
    allStudents.length > 0 &&
    allStudents.some((student) => selectedStudents.includes(student._id)) &&
    !allFilteredSelected;

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
              Batches
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
            Add New Batch
          </Button>
        </div>

        {/* DataTable */}
        <DataTable columns={columns} data={batches} loading={loading} />

        {/* Add/Edit Batch Modal */}
        <CustomModal
          open={open}
          onClose={handleClose}
          onSubmit={handleSubmit}
          title={editId ? "Edit Batch" : "Add New Batch"}
          submitText={editId ? "Update" : "Create"}
          loading={loading}
        >
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Batch Name"
              name="batchName"
              fullWidth
              value={formData.batchName}
              onChange={handleChange}
              variant="outlined"
              required
            />

            {/* Training Type Select */}
            <FormControl fullWidth>
              <InputLabel>Training Type</InputLabel>
              <Select
                name="trainingType"
                value={formData.trainingType}
                onChange={handleChange}
              >
                {trainingType.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Start Date */}
            <TextField
              type="date"
              label="Start Date"
              name="startDate"
              fullWidth
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            {/* Teacher Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Assign Teacher</InputLabel>
              <Select
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
              >
                {teachers.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CustomModal>

        {/* Manage Students Modal */}
        <CustomModal
          open={studentsModalOpen}
          onClose={handleCloseStudentsModal}
          onSubmit={saveStudentsToBatch}
          title={`Manage Students - ${currentBatch?.batchName || ""}`}
          submitText="Save Changes"
          loading={loading === "saving-students"}
          size="2xl"
        >
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allFilteredSelected}
                    indeterminate={someFilteredSelected}
                    onChange={toggleSelectAll}
                  />
                }
                label={`Select filtered (${selectedStudents.length} total selected)`}
              />

              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedStudents([])}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <DataTable
              columns={studentColumns}
              data={allStudents}
              loading={false}
              showPagination={false}
            />
          </div>
        </CustomModal>
      </div>
    </div>
  );
}

export default Batchs;
