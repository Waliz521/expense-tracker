import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { getCategoryById } from '../lib/categories';
import type { CategorySummary, DailyTotal } from '../types/expense';

const CHART_COLORS = [
  '#0d9488', /* teal */
  '#dc2626', /* red */
  '#ea580c', /* orange */
  '#ca8a04', /* amber */
  '#16a34a', /* green */
  '#2563eb', /* blue */
  '#7c3aed', /* violet */
  '#c026d3', /* fuchsia */
  '#db2777', /* pink */
  '#64748b', /* slate */
  '#0891b2', /* cyan */
  '#65a30d', /* lime */
];

interface TreemapNode {
  name: string;
  value: number;
  percentage: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TreemapProps {
  data: Array<{ name: string; value: number; percentage: number; color: string }>;
  width: number;
  height: number;
  formatCurrency: (n: number) => string;
}

function Treemap({ data, width, height, formatCurrency }: TreemapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: typeof data[0] } | null>(null);

  // Treemap layout using slice-and-dice algorithm
  const layoutTreemap = (items: typeof data, w: number, h: number): TreemapNode[] => {
    if (items.length === 0 || w <= 0 || h <= 0) return [];

    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return [];

    const nodes: TreemapNode[] = [];
    const sorted = [...items].sort((a, b) => b.value - a.value);
    
    let currentX = 0;
    let currentY = 0;
    let remainingWidth = w;
    let remainingHeight = h;
    let direction: 'horizontal' | 'vertical' = w >= h ? 'horizontal' : 'vertical';

    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const itemArea = (item.value / total) * w * h;
      
      let nodeWidth: number;
      let nodeHeight: number;

      if (direction === 'horizontal') {
        // Fill remaining height
        nodeHeight = remainingHeight;
        nodeWidth = itemArea / nodeHeight;
        
        // Clamp to remaining width
        if (nodeWidth > remainingWidth) {
          nodeWidth = remainingWidth;
          nodeHeight = itemArea / nodeWidth;
        }
        
        nodes.push({
          ...item,
          x: currentX,
          y: currentY,
          width: nodeWidth,
          height: nodeHeight,
        });

        currentX += nodeWidth;
        remainingWidth -= nodeWidth;
        
        // Switch direction if we've filled the row
        if (remainingWidth <= 0.1) {
          currentX = 0;
          currentY += nodeHeight;
          remainingHeight -= nodeHeight;
          remainingWidth = w;
          direction = remainingHeight > remainingWidth ? 'vertical' : 'horizontal';
        }
      } else {
        // Fill remaining width
        nodeWidth = remainingWidth;
        nodeHeight = itemArea / nodeWidth;
        
        // Clamp to remaining height
        if (nodeHeight > remainingHeight) {
          nodeHeight = remainingHeight;
          nodeWidth = itemArea / nodeHeight;
        }
        
        nodes.push({
          ...item,
          x: currentX,
          y: currentY,
          width: nodeWidth,
          height: nodeHeight,
        });

        currentY += nodeHeight;
        remainingHeight -= nodeHeight;
        
        // Switch direction if we've filled the column
        if (remainingHeight <= 0.1) {
          currentY = 0;
          currentX += nodeWidth;
          remainingWidth -= nodeWidth;
          remainingHeight = h;
          direction = remainingWidth >= remainingHeight ? 'horizontal' : 'vertical';
        }
      }
    }

    return nodes;
  };

  const nodes = layoutTreemap(data, width, height);

  const handleMouseEnter = (node: TreemapNode, index: number, event: React.MouseEvent) => {
    setHoveredIndex(index);
    const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      data: { name: node.name, value: node.value, percentage: node.percentage, color: node.color },
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip(null);
  };

  return (
    <div className="relative w-full h-full">
      <svg width={width} height={height} className="overflow-visible">
        {nodes.map((node, index) => {
          const isHovered = hoveredIndex === index;
          // For vertical text, we can show percentages even in narrower rectangles
          // Check if height is sufficient (since text will be vertical)
          const canShowLabel = node.height > 25; // Lower threshold since vertical text fits better
          const fontSize = Math.min(11, Math.min(node.width, node.height) / 6);

          return (
            <g key={index}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                fill={node.color}
                stroke={isHovered ? '#fff' : 'rgba(0,0,0,0.1)'}
                strokeWidth={isHovered ? 2 : 1}
                rx={4}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(node, index, e)}
                onMouseLeave={handleMouseLeave}
                style={{ opacity: isHovered ? 0.9 : 1 }}
              />
              {canShowLabel && (
                <text
                  x={node.x + node.width / 2}
                  y={node.y + node.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={fontSize}
                  fontWeight="600"
                  className="pointer-events-none select-none"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  transform={`rotate(-90 ${node.x + node.width / 2} ${node.y + node.height / 2})`}
                >
                  {node.percentage.toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg pointer-events-none border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-surface-900 dark:text-white">{tooltip.data.name}</div>
          <div className="text-surface-600 dark:text-surface-400">
            {formatCurrency(tooltip.data.value)} ({tooltip.data.percentage.toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
}

interface DashboardChartsProps {
  byCategory: CategorySummary[];
  daily: DailyTotal[];
  total: number;
  formatCurrency: (n: number) => string;
}

export function DashboardCharts({ byCategory, daily, total: _total, formatCurrency }: DashboardChartsProps) {
  const categoryData = byCategory.map((c, i) => ({
    name: getCategoryById(c.categoryId).label,
    value: c.total,
    percentage: c.percentage,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const barData = daily.map((d) => ({
    date: d.date,
    label: format(parseISO(d.date), 'MMM d'),
    total: d.total,
    count: d.count,
  }));

  const treemapContainerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [treemapSize, setTreemapSize] = useState({ width: 0, height: 0 });

  // Set up ResizeObserver when container is available
  useEffect(() => {
    const container = treemapContainerRef.current;
    if (!container || categoryData.length === 0) {
      return;
    }

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTreemapSize({ width: rect.width, height: rect.height });
      }
    };

    // Initial size calculation with multiple attempts to handle timing issues
    const attemptUpdate = () => {
      updateSize();
      // Try again after a short delay to handle delayed rendering
      setTimeout(() => {
        updateSize();
      }, 50);
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(attemptUpdate);

    // Set up ResizeObserver
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setTreemapSize({ width, height });
          }
        }
      });
      resizeObserverRef.current.observe(container);
    }

    // Fallback to window resize listener
    window.addEventListener('resize', updateSize);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [categoryData.length]); // Re-run when data changes

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      {/* By category — Treemap */}
      <div className="min-w-0 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-5">
        <h3 className="mb-4 font-display text-base font-bold text-surface-900 dark:text-white">Spending by category</h3>
        {categoryData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-surface-500">No data this month</div>
        ) : (
          <div ref={treemapContainerRef} className="h-[400px] w-full sm:h-[420px]">
            {treemapSize.width > 0 && treemapSize.height > 0 && (
              <Treemap
                data={categoryData}
                width={treemapSize.width}
                height={treemapSize.height}
                formatCurrency={formatCurrency}
              />
            )}
          </div>
        )}
      </div>

      {/* Daily trend — Vertical Bar Chart */}
      <div className="min-w-0 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900 sm:p-5">
        <h3 className="mb-4 font-display text-base font-bold text-surface-900 dark:text-white">Daily spending</h3>
        {barData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-surface-500">No data this month</div>
        ) : (
          <div className="h-[400px] w-full sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 20, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  interval="preserveStartEnd"
                  className="text-surface-500"
                />
                <YAxis
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v.toString())}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  width={32}
                  className="text-surface-500"
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Spent']}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date && format(parseISO(payload[0].payload.date), 'MMM d, yyyy')
                  }
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--surface-200)' }}
                />
                <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
