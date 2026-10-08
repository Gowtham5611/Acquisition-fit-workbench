import { useState } from 'react';
import { MatrixPoint } from '../types';
import { Info, Crosshair } from 'lucide-react';

interface OpportunityMatrixProps {
  points: MatrixPoint[];
  onSelectLead: (leadId: number) => void;
  isLoading?: boolean;
}

export default function OpportunityMatrix({ points, onSelectLead, isLoading }: OpportunityMatrixProps) {
  const [hoveredPoint, setHoveredPoint] = useState<MatrixPoint | null>(null);

  // SVG dimensions & margins
  const width = 640;
  const height = 440;
  const margin = { top: 35, right: 35, bottom: 50, left: 55 };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Scale functions (0-100 to SVG plot coords)
  const getX = (conf: number) => margin.left + (conf / 100) * plotWidth;
  const getY = (fit: number) => margin.top + plotHeight - (fit / 100) * plotHeight;

  // Midpoint threshold dividers: Fit = 70, Confidence = 75
  const splitX = getX(75);
  const splitY = getY(70);

  const getPointColor = (quadrant: string, isHovered: boolean) => {
    if (isHovered) return '#f59e0b'; // Amber-gold focus
    switch (quadrant) {
      case 'PRIORITY_TARGETS':
        return '#10b981'; // Emerald
      case 'VERIFY_FIRST':
        return '#f59e0b'; // Amber
      case 'KNOWN_LOW_FIT':
        return '#64748b'; // Slate
      case 'DEPRIORITIZE':
      default:
        return '#94a3b8'; // Light slate
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Opportunity Matrix
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              Fit × Confidence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Separates strategic thesis alignment from information completeness
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Click any point to view target brief</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center text-slate-500 text-sm">
          Loading matrix telemetry...
        </div>
      ) : points.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-500 text-sm">
          <p>No scored targets plotted yet.</p>
          <p className="text-xs text-slate-600 mt-1">Configure an ICP and score leads to populate the matrix.</p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            style={{ maxHeight: '420px' }}
          >
            {/* Background Quadrant Tints */}
            {/* Top-Right: Priority Targets (High Fit, High Conf) */}
            <rect
              x={splitX}
              y={margin.top}
              width={plotWidth - (splitX - margin.left)}
              height={splitY - margin.top}
              fill="#10b981"
              fillOpacity="0.07"
            />
            {/* Top-Left: Verify First (High Fit, Low Conf) */}
            <rect
              x={margin.left}
              y={margin.top}
              width={splitX - margin.left}
              height={splitY - margin.top}
              fill="#f59e0b"
              fillOpacity="0.05"
            />
            {/* Bottom-Right: Known Low Fit (Low Fit, High Conf) */}
            <rect
              x={splitX}
              y={splitY}
              width={plotWidth - (splitX - margin.left)}
              height={plotHeight - (splitY - margin.top)}
              fill="#64748b"
              fillOpacity="0.04"
            />
            {/* Bottom-Left: Deprioritize (Low Fit, Low Conf) */}
            <rect
              x={margin.left}
              y={splitY}
              width={splitX - margin.left}
              height={plotHeight - (splitY - margin.top)}
              fill="#334155"
              fillOpacity="0.06"
            />

            {/* Subtle Grid Lines */}
            {[25, 50, 75].map((val) => (
              <g key={`grid-x-${val}`}>
                <line
                  x1={getX(val)}
                  y1={margin.top}
                  x2={getX(val)}
                  y2={margin.top + plotHeight}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                />
                <text
                  x={getX(val)}
                  y={height - margin.bottom + 16}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            ))}

            {[20, 40, 60, 80].map((val) => (
              <g key={`grid-y-${val}`}>
                <line
                  x1={margin.left}
                  y1={getY(val)}
                  x2={margin.left + plotWidth}
                  y2={getY(val)}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 10}
                  y={getY(val) + 3}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Threshold Dividing Lines */}
            <line
              x1={splitX}
              y1={margin.top}
              x2={splitX}
              y2={margin.top + plotHeight}
              stroke="#475569"
              strokeWidth="1.25"
            />
            <line
              x1={margin.left}
              y1={splitY}
              x2={margin.left + plotWidth}
              y2={splitY}
              stroke="#475569"
              strokeWidth="1.25"
            />

            {/* Quadrant Watermark Badges */}
            <text
              x={splitX + 10}
              y={margin.top + 16}
              fill="#10b981"
              fillOpacity="0.75"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              PRIORITY TARGETS
            </text>
            <text
              x={margin.left + 10}
              y={margin.top + 16}
              fill="#f59e0b"
              fillOpacity="0.75"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              VERIFY FIRST
            </text>
            <text
              x={splitX + 10}
              y={margin.top + plotHeight - 12}
              fill="#94a3b8"
              fillOpacity="0.65"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              KNOWN LOW FIT
            </text>
            <text
              x={margin.left + 10}
              y={margin.top + plotHeight - 12}
              fill="#64748b"
              fillOpacity="0.6"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="0.05em"
            >
              DEPRIORITIZE
            </text>

            {/* Axis Labels */}
            <text
              x={margin.left + plotWidth / 2}
              y={height - 12}
              fill="#94a3b8"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
            >
              DATA CONFIDENCE →
            </text>
            <text
              x={-(margin.top + plotHeight / 2)}
              y={18}
              fill="#94a3b8"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              transform="rotate(-90)"
            >
              ACQUISITION FIT SCORE →
            </text>

            {/* Scatter Points */}
            {points.map((pt) => {
              const cx = getX(pt.data_confidence);
              const cy = getY(pt.fit_score);
              const isHovered = hoveredPoint?.id === pt.id;
              const radius = isHovered ? 7 : pt.is_shortlisted ? 6 : 4.5;
              const color = getPointColor(pt.quadrant, isHovered);

              return (
                <g
                  key={pt.id}
                  className="cursor-pointer transition-all duration-100"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onSelectLead(pt.id)}
                >
                  {isHovered && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 4}
                      fill={color}
                      fillOpacity="0.25"
                    />
                  )}
                  {pt.is_shortlisted && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius + 2}
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={color}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none z-20 bg-slate-950/95 border border-slate-700 text-white rounded-lg p-3 shadow-2xl backdrop-blur-sm max-w-xs transition-opacity duration-150"
              style={{
                left: `${Math.min(
                  Math.max(10, (getX(hoveredPoint.data_confidence) / width) * 100),
                  72
                )}%`,
                top: `${Math.max(
                  8,
                  (getY(hoveredPoint.fit_score) / height) * 100 - 18
                )}%`,
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 mb-2">
                <span className="font-bold text-xs text-white truncate">
                  {hoveredPoint.company_name}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    hoveredPoint.priority === 'HIGH'
                      ? 'bg-emerald-900/80 text-emerald-300'
                      : hoveredPoint.priority === 'MEDIUM'
                      ? 'bg-amber-900/80 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {hoveredPoint.priority}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Fit Score</span>
                  <span className="font-bold text-slate-100">
                    {hoveredPoint.fit_score.toFixed(0)}/100
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Data Confidence</span>
                  <span className="font-bold text-slate-100">
                    {hoveredPoint.data_confidence.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                  Next Action
                </span>
                {hoveredPoint.next_best_action}
              </div>
              <p className="text-[10px] text-indigo-400 mt-1.5 font-medium">
                Click to open target brief →
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legend Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300 font-medium">Priority Targets (Fit ≥70, Conf ≥75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-300 font-medium">Verify First (Fit ≥70, Conf &lt;75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
            <span className="text-slate-300 font-medium">Known Low Fit</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300">
          <span className="w-2 h-2 rounded-full border border-amber-400 inline-block"></span>
          <span>Shortlisted Target</span>
        </div>
      </div>
    </div>
  );
}
