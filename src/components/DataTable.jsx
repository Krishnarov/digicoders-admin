// components/DataTable.jsx
import React, { useState, useMemo } from "react";
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
  Grid
} from "@mui/material";

function DataTable({ columns, data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({});

  // Handle sort toggle
  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  // Handle filters
  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const filteredData = useMemo(() => {
    return data
      ?.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .filter((row) => {
        return Object.entries(filters).every(([column, value]) => {
          if (!value) return true;
          // return String(row[column]).toLowerCase() === value.toLowerCase();
          return String(row?.[column] ?? '').toLowerCase() === String(value ?? '').toLowerCase();

        });
      });
  }, [data, searchTerm, filters]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, orderBy, order]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  return (
    <Paper elevation={3} className="p-4">
      <Grid container spacing={2} className="mb-4">
        <Grid item xs={12} md={6} className="w-60">
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={1}>
            {columns.map(
              (col) =>
                col.filter && (
                  <Grid item xs={12} md={12} key={col.accessor}>
                    <FormControl fullWidth>
                      <InputLabel>{col.label}</InputLabel>
                      <Select
                        value={filters[col.accessor] || ""}
                        label={col.label}
                        className="min-w-40"
                        onChange={(e) =>
                          handleFilterChange(col.accessor, e.target.value)
                        }
                      >
                        <MenuItem value="">All</MenuItem>
                        {[
                          ...new Set(data?.map((d) => d[col.accessor])),
                        ].map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )
            )}
          </Grid>
        </Grid>
      </Grid>

      <TableContainer>
        <Table>
          <TableHead className="bg-slate-50">
            <TableRow>
              {columns.filter((col)=>col.show !== false).map((col) => (
                <TableCell  key={col.accessor}>
                  <TableSortLabel
                  className="font-bold"
                    active={orderBy === col.accessor}
                    direction={orderBy === col.accessor ? order : "asc"}
                    onClick={() => handleSort(col.accessor)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row, idx) => (
              <TableRow key={idx}>
                {columns.filter((col)=>col.show !== false).map((col) => (
                  <TableCell key={col.accessor}>{col.Cell ? col.Cell({ row }) : row[col.accessor]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}

export default DataTable;
