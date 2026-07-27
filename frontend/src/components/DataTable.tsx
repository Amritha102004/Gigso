import React from 'react';
import Pagination from './Pagination';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  whitespaceNowrap?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No items found.',
  currentPage,
  totalPages,
  onPageChange,
  whitespaceNowrap = true,
}: DataTableProps<T>): React.ReactElement {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm border-collapse ${whitespaceNowrap ? 'whitespace-nowrap' : ''}`}>
              <thead className="bg-[#F8F9FA] text-[#848462] text-xs font-bold tracking-wider uppercase border-b border-gray-100">
                <tr>
                  {columns.map((column, idx) => (
                    <th
                      key={idx}
                      className={`px-6 py-4 ${column.className || ''}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((item, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {columns.map((column, colIdx) => (
                        <td
                          key={colIdx}
                          className={`px-6 py-4 ${column.className || ''}`}
                        >
                          {column.accessor(item)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {currentPage && totalPages && onPageChange && totalPages > 1 && (
            <div className="p-4 border-t border-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
