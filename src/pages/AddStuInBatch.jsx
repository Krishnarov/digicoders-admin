


import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Home, ChevronRight, ArrowLeft, Save, Loader2, XCircle } from "lucide-react";
import DataTable from "../components/DataTable";
import {
  Button,
  Tooltip,
  Chip,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
} from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "../axiosInstance";
import { useSelector } from "react-redux";
import useGetStudents from "../hooks/useGetStudent";
import useGetTechnology from "../hooks/useGetTechnology";
import useGetTranning from "../hooks/useGetTranning";
import { toast } from "react-toastify";

function AddStuInBatch() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");
  const [batch, setBatch] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Available students के लिए server-side pagination/filtering hook
  const defaultFilters = useMemo(() => ({ status: "accepted" }), []);
  const {
    fetchStudents,
    changePage,
    changeLimit,
    changeSort,
    changeFilters,
    changeSearch,
    clearAllFilters,
    currentState,
  } = useGetStudents(defaultFilters);

  const { data: allAvailableStudents, pagination, loading: studentsLoading, filters, searchTerm } = currentState;

  const { techState, fetchTechnology } = useGetTechnology();
  const fetchTranning = useGetTranning();
  const tranningData = useSelector((state) => state.tranning.data);
  const [branches, setBranches] = useState([]);

  // Available students (बिना selected students के)
  const availableStudents = useMemo(() => {
    return allAvailableStudents.filter(
      student => !selectedStudents.includes(student._id)
    );
  }, [allAvailableStudents, selectedStudents]);

  // Batch students (केवल selected students)
  const batchStudents = useMemo(() => {
    return allAvailableStudents.filter(
      student => selectedStudents.includes(student._id)
    );
  }, [allAvailableStudents, selectedStudents]);

  // 🔹 Fetch batch details
  const getBatchDetails = async () => {
    try {
      setLoading("batch");
      const res = await axios.get(`/batches/${batchId}`);
      if (res.data.success) {
        setBatch(res.data.batch);
        // Set initially selected students (those already in the batch)
        const batchStudentIds =
          res.data.batch.students?.map((s) => s._id) || [];
        setSelectedStudents(batchStudentIds);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error(error);
    } finally {
      setLoading("");
    }
  };

  const getAllBranches = async () => {
    try {
      const res = await axios.get("/branches");
      if (res.data.success) {
        setBranches(res.data.data.filter((b) => b.isActive));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getBatchDetails();
    fetchStudents();
    fetchTechnology();
    fetchTranning();
    getAllBranches();
  }, [batchId]);

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

  // 🔹 Select all/none students in current filtered view (available students)
  const toggleSelectAll = (tableType) => {
    if (tableType === 'available') {
      const currentPageStudentIds = availableStudents.map((student) => student._id);

      if (currentPageStudentIds.length === 0) return;

      // Check if all current page students are selected
      const allCurrentPageSelected = currentPageStudentIds.every(id =>
        selectedStudents.includes(id)
      );

      if (allCurrentPageSelected) {
        // Deselect all current page students
        setSelectedStudents((prev) =>
          prev.filter((id) => !currentPageStudentIds.includes(id))
        );
      } else {
        // Select all current page students
        setSelectedStudents((prev) => {
          const newSelection = [...prev];
          currentPageStudentIds.forEach((id) => {
            if (!newSelection.includes(id)) {
              newSelection.push(id);
            }
          });
          return newSelection;
        });
      }
    }
  };

  // Check if all current page available students are selected
  const currentPageAvailableStudentIds = availableStudents.map((student) => student._id);
  const allCurrentPageAvailableSelected =
    currentPageAvailableStudentIds.length > 0 &&
    currentPageAvailableStudentIds.every(id => selectedStudents.includes(id));

  // Check if some current page available students are selected
  const someCurrentPageAvailableSelected =
    currentPageAvailableStudentIds.length > 0 &&
    currentPageAvailableStudentIds.some(id => selectedStudents.includes(id)) &&
    !allCurrentPageAvailableSelected;

  // 🔹 Save student assignments to batch
  const saveStudentsToBatch = async () => {
    try {
      setLoading("save");
      const res = await axios.put(`/batches/${batchId}/students`, {
        studentIds: selectedStudents,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Students updated successfully");
        navigate("/batchs");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Error saving students:", error);
    } finally {
      setLoading("");
    }
  };

  // Student table columns for batch students
  const batchStudentColumns = [
    {
      label: "Select",
      accessor: "select",
      Cell: ({ row }) => (
        <Checkbox
          checked={true}
          onChange={() => toggleStudentSelection(row._id)}
        />
      ),
    },
    { label: "Name", accessor: "studentName", sortable: true },
    {
      label: "Training",
      accessor: "training.name",
      filter: true,
      filterKey: "training",
      filterOptions: tranningData.map((t) => ({ label: t.name, value: t._id })),
      Cell: ({ row }) => <span>{row.training?.name || "N/A"}</span>,
      sortable: true,
    },
    {
      label: "Technology",
      accessor: "technology.name",
      filter: true,
      filterKey: "technology",
      filterOptions: techState.data.map((t) => ({ label: t.name, value: t._id })),
      Cell: ({ row }) => <span>{row.technology?.name || "N/A"}</span>,
      sortable: true,
    },
    {
      label: "Branch",
      accessor: "branch.name",
      filter: true,
      filterKey: "branch",
      filterOptions: branches.map((b) => ({ label: b.name, value: b._id })),
      Cell: ({ row }) => <span>{row.branch?.name || "N/A"}</span>,
      sortable: true,
    },
    { label: "Email", accessor: "email", sortable: true },
    { label: "Phone", accessor: "mobile", sortable: true },
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
      sortable: true,
    },
  ];

  // Student table columns for available students
  const availableStudentColumns = [
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
    { label: "Name", accessor: "studentName", sortable: true },
    {
      label: "Training",
      accessor: "training.name",
      filter: true,
      filterKey: "training",
      filterOptions: tranningData.map((t) => ({ label: t.name, value: t._id })),
      Cell: ({ row }) => <span>{row.training?.name || "N/A"}</span>,
      sortable: true,
    },
    {
      label: "Technology",
      accessor: "technology.name",
      filter: true,
      filterKey: "technology",
      filterOptions: techState.data.map((t) => ({ label: t.name, value: t._id })),
      Cell: ({ row }) => <span>{row.technology?.name || "N/A"}</span>,
      sortable: true,
    },
    {
      label: "Branch",
      accessor: "branch.name",
      filter: true,
      filterKey: "branch",
      filterOptions: branches.map((b) => ({ label: b.name, value: b._id })),
      Cell: ({ row }) => <span>{row.branch?.name || "N/A"}</span>,
      sortable: true,
    },
    { label: "Email", accessor: "email", sortable: true },
    { label: "Phone", accessor: "mobile", sortable: true },
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
      sortable: true,
    },
  ];

  // Get user-applied filters
  const getUserAppliedFilters = () => {
    const userFilters = { ...filters };
    return Object.entries(userFilters)
      .filter(([key, value]) => value && value !== "All")
      .map(([key, value]) => ({ key, value }));
  };

  const appliedFilters = getUserAppliedFilters();
  const appliedFiltersCount = appliedFilters.length;

  if (loading === "batch") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 border-r-2 border-gray-300 pr-4 mr-4">
            Manage Students - {batch?.batchName || "Batch"}
          </h1>
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="w-5 h-5 text-blue-600 mr-1" />
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            </Link>
            <Link
              to="/batchs"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span>Batches</span>
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            </Link>
            <span className="text-gray-800">Manage Students</span>
          </div>
        </div>
      </div>

      {/* Selection Info */}
      <Box className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Typography variant="h6" className="text-blue-800">
              Selected Students: {selectedStudents.length}
            </Typography>
            <Typography variant="body2" className="text-blue-600">
              Check/uncheck students to add/remove them from this batch
            </Typography>
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={allCurrentPageAvailableSelected}
                indeterminate={someCurrentPageAvailableSelected}
                onChange={() => toggleSelectAll('available')}
                disabled={availableStudents.length === 0}
              />
            }
            label="Select All (Available Students)"
          />
        </div>
      </Box>

      {/* Students in Batch (Server-side) */}
      <Box className="mb-8">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" className="pb-5 text-gray-800">
            Students in This Batch ({selectedStudents.length})
          </Typography>

          {/* Applied Filters Badge */}
          <Box className="flex items-center gap-2">
            {appliedFiltersCount > 1 && (
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
        </Box>

        {/* Batch Students DataTable - Server-side */}
        <DataTable
          mode="server"
          columns={batchStudentColumns}
          data={batchStudents}
          loading={studentsLoading}
          page={pagination.page}
          limit={pagination.limit}
          total={selectedStudents.length} // Since these are filtered client-side
          onPageChange={changePage}
          onLimitChange={changeLimit}
          onSortChange={changeSort}
          onFilterChange={changeFilters}
          onSearch={changeSearch}
          filters={filters}
          pagination={true}
          search={true}
          filter={true}
          sort={true}
          showDateFilter={false}
        />
      </Box>

      {/* Available Students (Server-side) */}
      <Box className="mb-8">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" className="pb-5 text-gray-800">
            Available Students ({allAvailableStudents.length - selectedStudents.length})
          </Typography>

          {/* Applied Filters Badge */}
          <Box className="flex items-center gap-2">
            {appliedFiltersCount > 1 && (
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
        </Box>

        {/* Available Students DataTable - Server-side */}
        <DataTable
          mode="server"
          columns={availableStudentColumns}
          data={availableStudents}
          loading={studentsLoading}
          page={pagination.page}
          limit={pagination.limit}
          total={allAvailableStudents.length - selectedStudents.length} // Excluding selected ones
          onPageChange={changePage}
          onLimitChange={changeLimit}
          onSortChange={changeSort}
          onFilterChange={changeFilters}
          onSearch={changeSearch}
          filters={filters}
          pagination={true}
          search={true}
          filter={true}
          sort={true}
          showDateFilter={false}
        />
      </Box>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/batchs")}
        >
          Back to Batches
        </Button>
        <Button
          variant="contained"
          startIcon={
            loading === "save" ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )
          }
          onClick={saveStudentsToBatch}
          disabled={loading === "save"}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading === "save" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default AddStuInBatch;