import React, { useState, useMemo } from 'react'
import { TrendingUp, ArrowUpRight, AlertCircle } from 'lucide-react'

export function AnalyticsChart({
  title = 'Platform Capital Deployment',
  subtitle = 'Investment capital deployment calculated from backend deals',
  deals = [],
  pitches = [],
  repayments = [],
  color = '#10b981', // Brand Primary Green
}) {
  const [timeframe, setTimeframe] = useState('6M')
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Compute real dynamic dataset strictly from backend objects
  const chartData = useMemo(() => {
    const now = new Date()
    let pointsCount = 6
    let labelGenerator = (i) => `Point ${i + 1}`

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (timeframe === '1M') {
      pointsCount = 4
      labelGenerator = (i) => `Week ${i + 1}`
    } else if (timeframe === '3M') {
      pointsCount = 6
      labelGenerator = (i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return `${monthNames[d.getMonth()]} Mid`
      }
    } else if (timeframe === '6M') {
      pointsCount = 6
      labelGenerator = (i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return monthNames[d.getMonth()]
      }
    } else if (timeframe === '1Y') {
      pointsCount = 12
      labelGenerator = (i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
        return monthNames[d.getMonth()]
      }
    }

    // Extract real deal amounts & creation timestamps from backend
    const allBackendItems = [...deals, ...pitches]
    const generatedValues = []
    const generatedLabels = []

    for (let i = 0; i < pointsCount; i++) {
      generatedLabels.push(labelGenerator(i))

      // Filter real items created up to this timeframe interval
      const windowItems = allBackendItems.filter(item => {
        if (!item.createdAt) return true
        const itemDate = new Date(item.createdAt)
        const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24)
        if (timeframe === '1M') return daysDiff <= (4 - i) * 7
        if (timeframe === '3M') return daysDiff <= (6 - i) * 15
        if (timeframe === '6M') return daysDiff <= (6 - i) * 30
        return daysDiff <= (12 - i) * 30
      })

      const realSum = windowItems.reduce((sum, item) => {
        const val = Number(item.bid?.amount ?? item.pitch?.amountNeeded ?? item.amountNeeded ?? item.amount ?? 0)
        return sum + val
      }, 0)

      generatedValues.push(realSum)
    }

    const lastVal = generatedValues[generatedValues.length - 1]
    const firstVal = generatedValues[0]

    return {
      values: generatedValues,
      labels: generatedLabels,
      total: lastVal,
      start: firstVal,
      hasRealData: allBackendItems.length > 0,
    }
  }, [deals, pitches, repayments, timeframe])

  // Growth Rate Calculation
  const growthRate = useMemo(() => {
    if (chartData.start === 0 && chartData.total === 0) return '0.0%'
    if (chartData.start === 0) return '+100.0%'
    const pct = ((chartData.total - chartData.start) / chartData.start) * 100
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  }, [chartData])

  // Responsive SVG Coordinate Math
  const viewBoxWidth = 600
  const viewBoxHeight = 240
  const paddingX = 45
  const paddingTop = 25
  const paddingBottom = 45

  const minVal = Math.min(...chartData.values)
  const maxVal = Math.max(...chartData.values)
  const valRange = maxVal - minVal || 1

  const points = chartData.values.map((val, i) => {
    const x = paddingX + (i / (chartData.values.length - 1)) * (viewBoxWidth - paddingX * 2)
    const y = paddingTop + (1 - (val - minVal) / valRange) * (viewBoxHeight - paddingTop - paddingBottom)
    return { x, y, val, label: chartData.labels[i] }
  })

  const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const fillPoints = [
    `${points[0].x.toFixed(1)},${viewBoxHeight - paddingBottom}`,
    ...points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `${points[points.length - 1].x.toFixed(1)},${viewBoxHeight - paddingBottom}`,
  ].join(' ')

  const formatCurrency = (val) => {
    if (val >= 1000000) return `GHS ${(val / 1000000).toFixed(2)}M`
    if (val >= 1000) return `GHS ${(val / 1000).toFixed(0)}K`
    return `GHS ${val.toLocaleString()}`
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 w-full overflow-hidden">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
        </div>

        {/* Working Timeframe Selector Controls */}
        <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200/70 text-xs font-semibold self-start sm:self-auto">
          {[
            { key: '1M', label: '1M (Weekly)' },
            { key: '3M', label: '3M' },
            { key: '6M', label: '6M (Monthly)' },
            { key: '1Y', label: '1Y (Yearly)' },
          ].map(tf => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                timeframe === tf.key
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Metric Display */}
      <div className="flex flex-wrap items-baseline gap-3 pt-1">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(chartData.total)}
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <ArrowUpRight size={13} /> {growthRate} ({timeframe})
        </span>
        <span className="text-xs text-slate-400 font-medium">
          · {deals.length + pitches.length} real backend records evaluated
        </span>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full pt-2">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="brandChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.5, 0.8].map((ratio, i) => {
            const lineY = paddingTop + ratio * (viewBoxHeight - paddingTop - paddingBottom)
            return (
              <line
                key={i}
                x1={paddingX}
                y1={lineY}
                x2={viewBoxWidth - paddingX}
                y2={lineY}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            )
          })}

          {/* Polygon Area Fill */}
          <polygon points={fillPoints} fill="url(#brandChartGradient)" />

          {/* Line Path */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes & Axis Labels */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                fill={hoveredIndex === i ? color : '#ffffff'}
                stroke={color}
                strokeWidth="2.5"
                className="transition-all duration-150"
              />
              <text
                x={p.x}
                y={viewBoxHeight - 15}
                textAnchor="middle"
                className="text-[11px] fill-slate-500 font-semibold"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute top-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg pointer-events-none -translate-x-1/2 transition-all z-20"
            style={{ left: `${(points[hoveredIndex].x / viewBoxWidth) * 100}%` }}
          >
            <div>{points[hoveredIndex].label}: <span className="text-emerald-400 font-bold">{formatCurrency(points[hoveredIndex].val)}</span></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsChart
