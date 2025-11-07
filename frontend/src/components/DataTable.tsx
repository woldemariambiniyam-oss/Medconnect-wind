import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Box,
  Typography,
  Chip,
} from '@mui/material';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string | React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps {
  columns: Column[];
  rows: any[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  pagination?: {
    page: number;
    rowsPerPage: number;
    count: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  sorting?: {
    order: 'asc' | 'desc';
    orderBy: string;
    onRequestSort: (property: string) => void;
  };
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  title,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  pagination,
  sorting,
}) => {
  const handleRequestSort = (property: string) => {
    if (sorting?.onRequestSort) {
      sorting.onRequestSort(property);
    }
  };

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sorting?.orderBy === column.id ? sorting.order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sorting?.orderBy === column.id}
                      direction={sorting?.orderBy === column.id ? sorting.order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  hover
                  key={row.id || index}
                  onClick={() => handleRowClick(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.count}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={pagination.onPageChange}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
        />
      )}
    </Paper>
  );
};

export default DataTable;
