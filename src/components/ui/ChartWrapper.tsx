import React, { useState } from 'react';
import { BarChart3, Table } from 'lucide-react';
import { Card } from './Card';

export interface AccessibleTableColumn {
  key: string;
  label: string;
  numeric?: boolean;
}

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  columns: AccessibleTableColumn[];
  rows: Record<string, string | number>[];
  children: React.ReactNode;
  heightClass?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  columns,
  rows,
  children,
  heightClass = 'h-72',
}) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          aria-pressed={showTable}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          {showTable ? (
            <>
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Chart view</span>
            </>
          ) : (
            <>
              <Table className="h-3.5 w-3.5" />
              <span>Data table</span>
            </>
          )}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" aria-label={`${title} data table`}>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2.5 pr-4 ${col.numeric ? 'text-right' : 'text-left'}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2.5 pr-4 text-slate-700 dark:text-slate-200 ${
                        col.numeric ? 'text-right tabular-nums font-mono' : ''
                      }`}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`w-full ${heightClass}`} role="img" aria-label={title}>
          {children}
        </div>
      )}
    </Card>
  );
};
