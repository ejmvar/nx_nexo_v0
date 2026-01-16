import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Checkbox,
  TablePagination,
  Toolbar,
  Chip,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewColumn as ColumnIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (props: { getValue: () => any; row: any; column: any; table: any }) => React.ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableHiding?: boolean;
  filterFn?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  title?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowSelectionChange?: (selectedRows: T[]) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFilteringChange?: (filters: ColumnFiltersState) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnVisibility = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  onRowSelectionChange,
  onSortingChange,
  onFilteringChange,
  loading = false,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibilityMenuAnchor, setColumnVisibilityMenuAnchor] = useState<null | HTMLElement>(null);

  // Convert our column definitions to TanStack Table format
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = columns.map((col) => ({
      id: col.id,
      accessorKey: col.accessorKey,
      accessorFn: col.accessorFn,
      header: col.header,
      cell: col.cell || (({ getValue }) => getValue()),
      size: col.size,
      minSize: col.minSize,
      maxSize: col.maxSize,
      enableSorting: col.enableSorting ?? enableSorting,
      enableColumnFilter: col.enableFiltering ?? enableFiltering,
      enableHiding: col.enableHiding ?? enableColumnVisibility,
      filterFn: col.filterFn,
    }));

    // Add row selection column if enabled
    if (enableRowSelection) {
      cols.unshift({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: false,
      });
    }

    return cols;
  }, [columns, enableSorting, enableFiltering, enableColumnVisibility, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      onFilteringChange?.(newFilters);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onRowSelectionChange) {
        const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
        onRowSelectionChange(selectedRows);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleColumnVisibilityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnVisibilityMenuAnchor(event.currentTarget);
  };

  const handleColumnVisibilityMenuClose = () => {
    setColumnVisibilityMenuAnchor(null);
  };

  const toggleColumnVisibility = (columnId: string) => {
    table.getColumn(columnId)?.toggleVisibility();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Paper className={className} sx={{ width: '100%', overflow: 'hidden' }}>
      {title && (
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
            {title}
          </Typography>
          {enableFiltering && (
            <TextField
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: globalFilter && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setGlobalFilter('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, minWidth: 250 }}
            />
          )}
          {enableColumnVisibility && (
            <IconButton onClick={handleColumnVisibilityMenuOpen}>
              <ColumnIcon />
            </IconButton>
          )}
        </Toolbar>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="data table">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 'bold',
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <Box sx={{ ml: 1 }}>
                            {header.column.getIsSorted() === 'asc' && <SortAscIcon fontSize="small" />}
                            {header.column.getIsSorted() === 'desc' && <SortDescIcon fontSize="small" />}
                            {header.column.getIsSorted() === false && <SortAscIcon fontSize="small" sx={{ opacity: 0.3 }} />}
                          </Box>
                        )}
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} sx={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {enablePagination && (
        <TablePagination
          component="div"
          count={table.getFilteredRowModel().rows.length}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          rowsPerPage={table.getState().pagination.pageSize}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
          rowsPerPageOptions={pageSizeOptions}
        />
      )}

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={columnVisibilityMenuAnchor}
        open={Boolean(columnVisibilityMenuAnchor)}
        onClose={handleColumnVisibilityMenuClose}
      >
        {table.getAllColumns().map((column) => (
          <MenuItem
            key={column.id}
            onClick={() => toggleColumnVisibility(column.id)}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Checkbox
              checked={column.getIsVisible()}
              size="small"
              sx={{ mr: 1 }}
            />
            {column.columnDef.header as string}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

// Simple Table Component for basic use cases
export interface SimpleTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  title?: string;
  className?: string;
}

export function SimpleTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  className,
}: SimpleTableProps<T>) {
  return (
    <Paper className={className} sx={{ width: '100%', overflow: 'hidden' }}>
      {title && (
        <Toolbar sx={{ pl: 2 }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Toolbar>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key as string} sx={{ fontWeight: 'bold' }}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key as string}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}