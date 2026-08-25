'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface ColumnDef<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

// ============================================
// Component
// ============================================

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys,
  pagination,
  onRowClick,
  emptyMessage = 'No data found',
  loading = false,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      if (searchKeys) {
        return searchKeys.some((key) => {
          const value = row[key];
          return String(value ?? '').toLowerCase().includes(query);
        });
      }
      // Default: search all string values
      return Object.values(row).some((value) =>
        String(value ?? '').toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (columnId: string) => {
    setSortConfig((current) => {
      if (current?.key === columnId) {
        if (current.direction === 'asc') return { key: columnId, direction: 'desc' };
        return null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1;

  return (
    <div className={cn('w-full', className)}>
      {/* Search bar */}
      {searchable && (
        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          {/* Header */}
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-muted-foreground',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground',
                    col.headerClassName
                  )}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {typeof col.header === 'string' ? <span>{col.header}</span> : col.header}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sortConfig?.key === col.id ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-muted-foreground">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'hover:bg-muted/30 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.id} className={cn('px-4 py-3', col.className)}>
                      {col.accessorFn
                        ? col.accessorFn(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? '—')
                          : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.perPage + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
