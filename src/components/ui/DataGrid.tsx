import { useVirtualizer } from '@tanstack/react-virtual';
import React, { ReactNode } from 'react';
import { useLayout } from '@/contexts/LayoutContext';

export interface DataGridColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
  accessor?: (row: T) => any;
}

interface DataGridProps<T = any> {
  columns: DataGridColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  onRowClick?: (row: T, index: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  enableVirtualization?: boolean;
}

/**
 * Enterprise-Grade DataGrid Component
 *
 * Features:
 * - Sticky header that remains visible during scroll
 * - Density-aware cell padding (Compact/Normal/Relaxed)
 * - Scroll isolation (overscroll-contain)
 * - Clean, professional styling
 *
 * Enforces: Grid Frame Pattern (Header fixed, Body scrolls)
 */
export function DataGrid<T = any>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  rowClassName = '',
  enableVirtualization = false,
}: DataGridProps<T>) {
  const { density } = useLayout();

  // Density-aware padding
  const cellPadding = {
    compact: 'p-3',
    normal: 'p-4',
    relaxed: 'p-6',
  }[density];

  const fontSize = {
    compact: 'text-xs',
    normal: 'text-sm',
    relaxed: 'text-base',
  }[density];

  const headerFontSize = {
    compact: 'text-[0.5625rem]',
    normal: 'text-[0.625rem]',
    relaxed: 'text-[0.6875rem]',
  }[density];

  const getRowClassName = (row: T, index: number): string => {
    const baseClass = 'transition-colors';
    const hoverClass = onRowClick ? 'hover:bg-muted-bg/50 cursor-pointer' : 'hover:bg-muted-bg/30';
    const customClass =
      typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName;
    return `${baseClass} ${hoverClass} ${customClass}`;
  };

  const parentRef = React.useRef<HTMLDivElement>(null);

  // Check if virtualization should be active
  const shouldVirtualize = enableVirtualization && data.length > 50; // Auto-enable if explicitly requested and enough data, or just use prop

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      return (
        {
          compact: 40,
          normal: 56,
          relaxed: 72,
        }[density] || 56
      );
    },
    overscan: 5,
    enabled: shouldVirtualize,
  });

  const { getVirtualItems, getTotalSize } = rowVirtualizer;
  const virtualItems = shouldVirtualize ? getVirtualItems() : [];
  const paddingTop = shouldVirtualize && virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    shouldVirtualize && virtualItems.length > 0
      ? getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  const renderRows = () => {
    if (shouldVirtualize) {
      return (
        <>
          {paddingTop > 0 && (
            <tr>
              <td colSpan={columns.length} style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <tr
                key={keyExtractor(row, virtualRow.index)}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                onClick={() => onRowClick?.(row, virtualRow.index)}
                className={getRowClassName(row, virtualRow.index)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${cellPadding} ${fontSize} text-${col.align || 'left'}`}
                  >
                    {col.render
                      ? col.render(row, virtualRow.index)
                      : col.accessor
                        ? col.accessor(row)
                        : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td colSpan={columns.length} style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </>
      );
    }

    // Standard Rendering
    return data.map((row, index) => (
      <tr
        key={keyExtractor(row, index)}
        onClick={() => onRowClick?.(row, index)}
        className={getRowClassName(row, index)}
      >
        {columns.map((col) => (
          <td key={col.key} className={`${cellPadding} ${fontSize} text-${col.align || 'left'}`}>
            {col.render
              ? col.render(row, index)
              : col.accessor
                ? col.accessor(row)
                : (row as any)[col.key]}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div
      role="grid"
      aria-label="Data Grid"
      className="h-full flex flex-col overflow-hidden border border-border rounded-2xl bg-surface shadow-sm"
    >
      {/* Grid Container with Independent Scroll */}
      <div ref={parentRef} className="flex-1 overflow-auto overscroll-contain">
        <table className="w-full border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-surface shadow-sm ring-1 ring-border/50">
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${cellPadding} ${headerFontSize} font-black text-text-muted uppercase tracking-widest text-${col.align || 'left'}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Scrollable Body */}
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-text-muted font-bold text-sm">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-20 text-center">
                  <p className="text-text-muted font-bold text-sm">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              renderRows()
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
