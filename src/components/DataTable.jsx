import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Paper,
  TableSortLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  CircularProgress,
  Box,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import { Calendar, X } from "lucide-react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

function DataTable({
  columns,
  data = [],
  loading = false,

  /* server side props */
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 0,

  /* feature flags */
  pagination = true,
  search = true,
  filter = true,
  sort = true,

  /* callbacks */
  onPageChange,
  onLimitChange,
  onSortChange,
  onFilterChange,
  onSearch,

  /* additional props */
  showDateFilter = false,
  filters = {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [localFilters, setLocalFilters] = useState(filters);

  // Initialize local filters from parent filters
  // useEffect(() => {
  //   setLocalFilters(filters);
  //   // Reset search term when filters change
  //   if (Object.keys(filters).length === 0) {
  //     setSearchTerm("");
  //   }
  // }, [filters]);

  /* 🔍 debounce search */
  useEffect(() => {
    if (!search) return;

    const t = setTimeout(() => {
      onSearch?.(searchTerm);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm, search]);

  /* ↕ sort */
  const handleSort = (column) => {
    if (!sort) return;

    const isAsc = orderBy === column && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(column);
    onSortChange?.(column, newOrder);
  };

  /* 🎯 filter */
  const handleFilterChange = (column, value) => {
    if (!filter) return;

    const updated = { ...localFilters, [column]: value || undefined };
    Object.keys(updated).forEach(
      (k) => updated[k] === undefined && delete updated[k]
    );
    setLocalFilters(updated);
    onFilterChange?.(updated);
  };

  /* 📅 Handle date change immediately */
  const handleDateChange = (type, date) => {
    let updated = { ...localFilters };

    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      updated[type] = formattedDate;
    } else {
      // If date is null, remove it from filters
      delete updated[type];
    }

    // Apply filter only if both dates are selected
    if (updated.startDate && updated.endDate) {
      // Validate date range
      const start = new Date(updated.startDate);
      const end = new Date(updated.endDate);

      if (start > end) {
        // Swap dates if start is after end
        const temp = updated.startDate;
        updated.startDate = updated.endDate;
        updated.endDate = temp;
      }
    }

    setLocalFilters(updated);
    onFilterChange?.(updated);
  };

  /* pagination */
  const handlePageChange = (_, newPage) => {
    if (!pagination) return;
    onPageChange?.(newPage + 1);
  };

  const handleRowsPerPageChange = (e) => {
    if (!pagination) return;
    const newLimit = parseInt(e.target.value, 10);
    onLimitChange?.(newLimit);
    onPageChange?.(1);
  };

  // Check if any filter is active
  const isAnyFilterActive = () => {
    return Object.keys(localFilters).length > 0 || searchTerm.trim() !== "";
  };

  // Check if date filter is active
  const isDateFilterActive = localFilters.startDate && localFilters.endDate;

  // Get date values for DatePicker
  const getDateValue = (type) => {
    if (!localFilters[type]) return null;
    try {
      return new Date(localFilters[type]);
    } catch (e) {
      return null;
    }
  };

  // Get unique filter options for each column
  const getFilterOptions = (column) => {
    if (column.filterOptions) {
      return column.filterOptions;
    }

    const set = new Set();
    data.forEach((row) => {
      let value = column.accessor;
      if (column.accessor.includes(".")) {
        const keys = column.accessor.split(".");
        value = keys.reduce((obj, key) => obj?.[key], row);
      } else {
        value = row[column.accessor];
      }

      if (value && typeof value === "boolean") {
        value = value ? "Active" : "Inactive";
      }

      if (value) set.add(String(value));
    });
    return Array.from(set).sort();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} className="p-4">
        {/* SEARCH + FILTER UI */}
        {(search || filter || showDateFilter) && (
          <Grid container spacing={2} className="mb-4" alignItems="center">
            {search && (
              <Grid item xs={12} md={3}>
                <TextField
                  label="Search"
                  variant="outlined"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  size="small"
                />
              </Grid>
            )}

            {filter && (
              <Grid
                item
                xs={12}
                md={search ? (showDateFilter ? 4 : 7) : showDateFilter ? 6 : 9}
              >
                <Grid container spacing={1}>
                  {columns.map(
                    (col) =>
                      col.filter && (
                        <Grid item xs={12} sm={6} md={4} key={col.accessor}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{col.label}</InputLabel>
                            <Select
                              value={
                                localFilters[col.filterKey || col.accessor] ||
                                ""
                              }
                              label={col.label}
                              className="min-w-40"
                              onChange={(e) =>
                                handleFilterChange(
                                  col.filterKey || col.accessor,
                                  e.target.value
                                )
                              }
                              disabled={loading}
                            >
                              <MenuItem value="">All</MenuItem>
                              {getFilterOptions(col).map((option) =>
                                typeof option === "object" ? (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ) : (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                      )
                  )}
                </Grid>
              </Grid>
            )}
            {/* Date Range Filter - Direct DatePickers */}
            {showDateFilter && (
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    label="Start Date"
                    value={getDateValue("startDate")}
                    onChange={(newValue) =>
                      handleDateChange("startDate", newValue)
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          minWidth: 140,
                          "& .MuiInputBase-root": {
                            height: 36,
                            padding: "0 6px",
                          },
                          "& input": {
                            padding: "6px 4px",
                            fontSize: "13px",
                          },
                        },
                      },
                    }}
                  />

                  <span className="text-gray-500 text-sm">to</span>

                  <DatePicker
                    label="End Date"
                    value={getDateValue("endDate")}
                    onChange={(newValue) =>
                      handleDateChange("endDate", newValue)
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          minWidth: 140,
                          "& .MuiInputBase-root": {
                            height: 36,
                            padding: "0 6px",
                          },
                          "& input": {
                            padding: "6px 4px",
                            fontSize: "13px",
                          },
                        },
                      },
                    }}
                  />
                </Stack>
              </Grid>
            )}
          </Grid>
        )}

        {/* TABLE UI */}
        <TableContainer className="w-full overflow-x-auto">
          <Table sx={{ minWidth: 650 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                {columns
                  .filter((col) => col.show !== false)
                  .map((col) => (
                    <TableCell
                      key={col.accessor}
                      sx={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        padding: "12px 16px",
                        borderRight: "1px solid #e0e0e0",
                        "&:last-child": {
                          borderRight: "none",
                        },
                      }}
                    >
                      {col.sortable !== false && sort ? (
                        <TableSortLabel
                          active={orderBy === col.accessor}
                          direction={orderBy === col.accessor ? order : "asc"}
                          onClick={() => handleSort(col.accessor)}
                          disabled={loading}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <CircularProgress />
                    <Box sx={{ mt: 2 }}>Loading data...</Box>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={row._id || idx}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      bgcolor:
                        idx % 2 === 0 ? "background.default" : "action.hover",
                    }}
                  >
                    {columns
                      .filter((col) => col.show !== false)
                      .map((col) => {
                        let value = col.accessor;
                        if (col.accessor.includes(".")) {
                          const keys = col.accessor.split(".");
                          value = keys.reduce((obj, key) => obj?.[key], row);
                        } else {
                          value = row[col.accessor];
                        }

                        return (
                          <TableCell
                            key={col.accessor}
                            sx={{
                              whiteSpace: "nowrap",
                              padding: "8px 12px",
                              borderRight: "1px solid #e0e0e0",
                              "&:last-child": {
                                borderRight: "none",
                              },
                            }}
                          >
                            {col.Cell ? col.Cell({ row }) : value ?? "-"}
                          </TableCell>
                        );
                      })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION UI */}
        {pagination && (
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            rowsPerPage={limit}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disabled={loading}
          />
        )}
      </Paper>
    </LocalizationProvider>
  );
}

export default DataTable;
