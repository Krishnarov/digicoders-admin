import React, { useState, useEffect } from "react";
import { Home, ChevronRight, ArrowLeft, Save, Loader2 } from "lucide-react";
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
import { toast } from "react-toastify";

function AddStuInBatch() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");
  const [batch, setBatch] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Available students के लिए server-side pagination/filtering hook
  const defaultFilters = { status: "accepted" };
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
  
  const { data: availableStudents, pagination, loading: studentsLoading, filters, searchTerm } = currentState;
  
  // Redux से सभी students (client-side के लिए)
  const allStudents = useSelector((state) => state.student.data).filter(
    (item) => item.status === "accepted"
  );

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
      toast.error(error.response.data.message || error.message);
      console.error(error);
    } finally {
      setLoading("");
    }
  };

  useEffect(() => {
    getBatchDetails();
    fetchStudents();
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
  const toggleSelectAll = () => {
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
  };

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
      toast.error(error.response.data.message || error.message);
      console.error("Error saving students:", error);
    } finally {
      setLoading("");
    }
  };

  // Student table columns for batch students (client-side)
  const batchStudentColumns = [
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
      accessor: "technology.name",
      Cell: ({ row }) => <span>{row.technology?.name || "N/A"}</span>,
      filter: true,
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

  // Student table columns for available students (server-side)
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
    { label: "Name", accessor: "studentName" },
    {
      label: "Technology",
      accessor: "technology.name",
      Cell: ({ row }) => <span>{row.technology?.name || "N/A"}</span>,
      filter: true,
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

  // Get students currently in the batch (client-side filtering)
  const batchStudents = allStudents.filter((student) =>
    selectedStudents.includes(student._id)
  );

  // Check if all current page students are selected
  const currentPageStudentIds = availableStudents.map((student) => student._id);
  const allCurrentPageSelected = 
    currentPageStudentIds.length > 0 &&
    currentPageStudentIds.every(id => selectedStudents.includes(id));

  // Check if some current page students are selected
  const someCurrentPageSelected = 
    currentPageStudentIds.length > 0 &&
    currentPageStudentIds.some(id => selectedStudents.includes(id)) &&
    !allCurrentPageSelected;

  if (loading === "batch") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-sm md:max-w-6xl mx-auto  px-2">
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
        <div className="flex justify-between items-center">
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
                checked={allCurrentPageSelected}
                indeterminate={someCurrentPageSelected}
                onChange={toggleSelectAll}
                disabled={availableStudents.length === 0}
              />
            }
            label="Select All (Current Page)"
          />
        </div>
      </Box>

      {/* Students in Batch (Client-side) */}
      <Box className="mb-8">
        <Typography variant="h5" className="pb-5 text-gray-800">
          Students in This Batch ({batchStudents.length})
        </Typography>
        
        <DataTable
          mode="client"
          columns={batchStudentColumns}
          data={batchStudents}
          loading={false}
          pagination
          search
          filters
        />
      </Box>

      {/* Available Students (Server-side) */}
      <Box className="mb-8">
        <Typography variant="h5" className="pb-5 text-gray-800">
          Available Students ({pagination.total || 0})
        </Typography>
        
        <DataTable
          mode="server"
          columns={availableStudentColumns}
          data={availableStudents}
          loading={studentsLoading}
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={changePage}
          onLimitChange={changeLimit}
          onSortChange={changeSort}
          onFilterChange={changeFilters}
          onSearch={changeSearch}
          filters
          search
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