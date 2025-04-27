"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: string
  exportData?: boolean
  exportFilename?: string
  pagination?: boolean
  columnVisibility?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  exportData = false,
  exportFilename = "export",
  pagination = true,
  columnVisibility = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibilityState, setColumnVisibility] = React.useState<VisibilityState>({})
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility: columnVisibilityState,
    },
  })

  // Function to export table data to CSV
  const exportToCSV = () => {
    if (!data.length) return

    // Get all visible columns
    const visibleColumns = table.getVisibleFlatColumns()
    
    // Create CSV header row
    const headers = visibleColumns.map(column => {
      // Access the header using the flexRender function
      const headerContent = flexRender(
        column.column.columnDef.header,
        column.getContext()
      )
      // Convert React element to string if needed
      return typeof headerContent === 'string' 
        ? headerContent 
        : column.id
    })

    // Create CSV data rows
    const rows = table.getRowModel().rows.map(row => {
      return visibleColumns.map(column => {
        const cellContent = flexRender(
          column.column.columnDef.cell,
          row.getCell(column.id).getContext()
        )
        // Handle different data types for CSV formatting
        const cellValue = row.getValue(column.id)
        if (cellValue === null || cellValue === undefined) return ''
        
        // Format dates
        if (cellValue instanceof Date) {
          return cellValue.toISOString().split('T')[0]
        }
        
        // Convert objects to JSON string
        if (typeof cellValue === 'object') {
          return JSON.stringify(cellValue)
        }
        
        return String(cellValue)
      })
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${exportFilename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        {searchColumn && (
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${searchColumn}...`}
              value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchColumn)?.setFilterValue(event.target.value)
              }
              className="pl-8 max-w-sm"
            />
          </div>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          {exportData && (
            <Button variant="outline" size="sm" onClick={exportToCSV} className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          
          {columnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> of{" "}
            <span className="font-medium">{data.length}</span> results
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}