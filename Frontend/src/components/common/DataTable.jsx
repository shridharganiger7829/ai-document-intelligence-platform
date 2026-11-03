import React from 'react';
import LoadingSpinner, { TableSkeleton } from './LoadingSpinner';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display.',
  onRowClick,
  rowKey = 'id',
}) => {
  if (loading) {
    return <TableSkeleton rows={5} cols={columns.length || 4} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-surface-card/60 backdrop-blur-md shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, rIdx) => (
              <tr
                key={row[rowKey] || rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-white/[0.04]'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={col.key || cIdx}
                    className={`py-3.5 px-4 text-slate-300 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row[col.key], row, rIdx) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
