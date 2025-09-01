// // components/DataTable.jsx
// import React, { useState, useMemo, useCallback } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TablePagination,
//   TableRow,
//   TextField,
//   Paper,
//   TableSortLabel,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Grid,
//   Box,
// } from "@mui/material";

// function DataTable({ columns, data }) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [orderBy, setOrderBy] = useState("");
//   const [order, setOrder] = useState("asc");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [filters, setFilters] = useState({});

//   // Handle sort toggle
//   const handleSort = (column) => {
//     const isAsc = orderBy === column && order === "asc";
//     setOrder(isAsc ? "desc" : "asc");
//     setOrderBy(column);
//   };

//   // Handle filters
//   const handleFilterChange = (column, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [column]: value,
//     }));
//   };

//   const filteredData = useMemo(() => {
//     return data
//       ?.filter((row) =>
//         Object.values(row).some((val) =>
//           String(val).toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       )
//       .filter((row) => {
//         return Object.entries(filters).every(([column, value]) => {
//           if (!value) return true;
//           return (
//             String(row?.[column] ?? "").toLowerCase() ===
//             String(value ?? "").toLowerCase()
//           );
//         });
//       });
//   }, [data, searchTerm, filters]);

//   const sortedData = useMemo(() => {
//     if (!orderBy) return filteredData;
//     return [...filteredData].sort((a, b) => {
//       const aValue = a[orderBy];
//       const bValue = b[orderBy];
//       if (aValue < bValue) return order === "asc" ? -1 : 1;
//       if (aValue > bValue) return order === "asc" ? 1 : -1;
//       return 0;
//     });
//   }, [filteredData, orderBy, order]);

//   const paginatedData = useMemo(() => {
//     return sortedData.slice(
//       page * rowsPerPage,
//       page * rowsPerPage + rowsPerPage
//     );
//   }, [sortedData, page, rowsPerPage]);

//   // Function to get the maximum content width for a column
//   const getMaxContentWidth = useCallback(
//     (accessor) => {
//       const visibleData = filteredData || [];
//       const headerContent =
//         columns.find((col) => col.accessor === accessor)?.label || "";

//       // Get all cell contents for this column
//       const cellContents = visibleData.map((row) => {
//         const colConfig = columns.find((col) => col.accessor === accessor);
//         if (colConfig?.Cell) {
//           // For custom cells, we'll estimate based on the accessor value
//           return String(row[accessor] || "");
//         }
//         return String(row[accessor] || "");
//       });

//       // Combine header and all cell values
//       const allContents = [headerContent, ...cellContents];

//       // Find the longest content
//       const longestContent = allContents.reduce((longest, current) => {
//         return current.length > longest.length ? current : longest;
//       }, "");

//       // Calculate approximate width based on content length
//       // This is a rough estimation - you might need to adjust the multiplier
//       return Math.min(Math.max(longestContent.length * 10, 120), 300); // Min 120px, max 300px
//     },
//     [filteredData, columns]
//   );

//   return (
//     <Paper elevation={3} className="p-4">
//       <Grid container spacing={2} className="mb-4">
//         <Grid item xs={12} md={6} className="w-60">
//           <TextField
//             label="Search"
//             variant="outlined"
//             fullWidth
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Grid container spacing={1}>
//             {columns.map(
//               (col) =>
//                 col.filter && (
//                   <Grid item xs={12} md={12} key={col.accessor}>
//                     <FormControl fullWidth>
//                       <InputLabel>{col.label}</InputLabel>
//                       <Select
//                         value={filters[col.accessor] || ""}
//                         label={col.label}
//                         className="min-w-40"
//                         onChange={(e) =>
//                           handleFilterChange(col.accessor, e.target.value)
//                         }
//                       >
//                         <MenuItem value="">All</MenuItem>
//                         {[...new Set(data?.map((d) => d[col.accessor]))].map(
//                           (option) => (
//                             <MenuItem key={option} value={option}>
//                               {`${option}`}
//                             </MenuItem>
//                           )
//                         )}
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                 )
//             )}
//           </Grid>
//         </Grid>
//       </Grid>

//       <TableContainer
//         className="w-full overflow-x-scroll"
//         sx={{
//           maxWidth: "100%",
//         }}
//       >
//         <Table sx={{ tableLayout: "auto", width: "100%", minWidth: 300 }}>
//           <TableHead className="bg-slate-50">
//             <TableRow>
//               {columns
//                 .filter((col) => col.show !== false)
//                 .map((col) => (
//                   <TableCell
//                     key={col.accessor}
//                     sx={{
//                       fontWeight: "bold",
//                       whiteSpace: "nowrap",
//                       padding: "12px 16px",
//                       borderRight: "1px solid #e0e0e0",
//                       "&:last-child": {
//                         borderRight: "none",
//                       },
//                     }}
//                   >
//                     <TableSortLabel
//                       active={orderBy === col.accessor}
//                       direction={orderBy === col.accessor ? order : "asc"}
//                       onClick={() => handleSort(col.accessor)}
//                     >
//                       {col.label}
//                     </TableSortLabel>
//                   </TableCell>
//                 ))}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {paginatedData.map((row, idx) => (
//               <TableRow key={idx} hover>
//                 {columns
//                   .filter((col) => col.show !== false)
//                   .map((col) => (
//                     <TableCell
//                       key={col.accessor}
//                       sx={{
//                         whiteSpace: "nowrap",
//                         padding: "12px 16px",
//                         borderRight: "1px solid #f0f0f0",
//                         "&:last-child": {
//                           borderRight: "none",
//                         },
//                       }}
//                     >
//                       <div
//                         style={{
//                           display: "block",
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                         }}
//                       >
//                         {col.Cell ? col.Cell({ row }) : row[col.accessor]}
//                       </div>
//                     </TableCell>
//                   ))}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <TablePagination
//         component="div"
//         count={sortedData.length}
//         page={page}
//         rowsPerPage={rowsPerPage}
//         onPageChange={(_, newPage) => setPage(newPage)}
//         onRowsPerPageChange={(e) => {
//           setRowsPerPage(parseInt(e.target.value, 10));
//           setPage(0);
//         }}
//         rowsPerPageOptions={[5, 10, 25]}
//       />
//     </Paper>
//   );
// }

// export default DataTable;
// components/DataTable.jsx
import React, { useState, useMemo, useCallback } from "react";
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
  Box,
} from "@mui/material";

// Helper function to get nested property values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

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
          
          // Find the column configuration
          const colConfig = columns.find(col => col.accessor === column);
          
          // Get the actual value from the row
          let rowValue;
          
          if (colConfig && colConfig.accessor.includes('.')) {
            // Handle nested properties
            rowValue = getNestedValue(row, colConfig.accessor);
          } else {
            // Handle regular properties
            rowValue = row[column];
          }
          
          // For objects, try to get the name property if it exists
          if (typeof rowValue === 'object' && rowValue !== null && rowValue.name) {
            rowValue = rowValue.name;
          }
          
          return (
            String(rowValue ?? "").toLowerCase() ===
            String(value ?? "").toLowerCase()
          );
        });
      });
  }, [data, searchTerm, filters, columns]);

  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      // Find the column configuration
      const colConfig = columns.find(col => col.accessor === orderBy);
      
      // Get values for comparison
      let aValue, bValue;
      
      if (colConfig && colConfig.accessor.includes('.')) {
        // Handle nested properties
        aValue = getNestedValue(a, colConfig.accessor);
        bValue = getNestedValue(b, colConfig.accessor);
      } else {
        // Handle regular properties
        aValue = a[orderBy];
        bValue = b[orderBy];
      }
      
      // For objects, try to get the name property if it exists
      if (typeof aValue === 'object' && aValue !== null && aValue.name) {
        aValue = aValue.name;
      }
      
      if (typeof bValue === 'object' && bValue !== null && bValue.name) {
        bValue = bValue.name;
      }
      
      // Convert to string for comparison
      aValue = String(aValue || "");
      bValue = String(bValue || "");
      
      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, orderBy, order, columns]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedData, page, rowsPerPage]);

  // Get unique filter options for each column
  const getFilterOptions = (column) => {
    const options = new Set();
    
    data?.forEach((row) => {
      let value;
      
      if (column.accessor.includes('.')) {
        // Handle nested properties
        value = getNestedValue(row, column.accessor);
      } else {
        // Handle regular properties
        value = row[column.accessor];
      }
      
      // For objects, try to get the name property if it exists
      if (typeof value === 'object' && value !== null && value.name) {
        value = value.name;
      }
      
      if (value !== undefined && value !== null) {
        options.add(String(value));
      }
    });
    
    return Array.from(options).sort();
  };

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
                        {getFilterOptions(col).map(
                          (option) => (
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
      </Grid>

      <TableContainer
        className="w-full overflow-x-scroll"
        sx={{
          maxWidth: "100%",
        }}
      >
        <Table sx={{ tableLayout: "auto", width: "100%", minWidth: 300 }}>
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
                    <TableSortLabel
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
              <TableRow key={idx} hover>
                {columns
                  .filter((col) => col.show !== false)
                  .map((col) => {
                    // Get the cell value
                    let cellValue;
                    
                    if (col.accessor.includes('.')) {
                      // Handle nested properties
                      cellValue = getNestedValue(row, col.accessor);
                    } else {
                      // Handle regular properties
                      cellValue = row[col.accessor];
                    }
                    
                    // For objects, try to get the name property if it exists
                    if (typeof cellValue === 'object' && cellValue !== null && cellValue.name) {
                      cellValue = cellValue.name;
                    }
                    
                    return (
                      <TableCell
                        key={col.accessor}
                        sx={{
                          whiteSpace: "nowrap",
                          padding: "12px 16px",
                          borderRight: "1px solid #f0f0f0",
                          "&:last-child": {
                            borderRight: "none",
                          },
                        }}
                      >
                        <div
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {col.Cell ? col.Cell({ row }) : cellValue}
                        </div>
                      </TableCell>
                    );
                  })}
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