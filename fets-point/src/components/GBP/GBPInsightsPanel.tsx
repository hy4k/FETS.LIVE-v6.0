// GBPInsightsPanel - Analytics dashboard showing Google Business Profile performance
// Displays search impressions, calls, directions, website clicks for Cochin & Calicut

import React, { useState } from 'react'
import { 
  BarChart3, 
  Eye, 
  Search, 
  Phone, 
  Compass, 
  Globe, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Loader2,
  Navigation
} from 'lucide-react'
import { useGBPInsights } from '../../hooks/useGBP'
import type { GBPBranch, GBPMetric } from '../../types/gbp.types'

const METRIC_LABELS: Record<GBPMetric, string> = {
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS: 'Desktop Maps',
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: 'Desktop Search',
  BUSINESS_IMPRESSIONS_MOBILE_MAPS: 'Mobile Maps',
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: 'Mobile Search',
  CALL_CLICKS: 'Call Clicks',
  DIRECTION_REQUESTS: 'Direction Requests',
  WEBSITE_CLICKS: 'Website Clicks',
}

const METRIC_COLORS: Record<GBPMetric, string> = {
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS: '#60a5fa', // blue
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: '#c084fc', // purple
  BUSINESS_IMPRESSIONS_MOBILE_MAPS: '#2dd4bf', // teal
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: '#34d399', // emerald
  CALL_CLICKS: '#facc15', // gold
  DIRECTION_REQUESTS: '#f87171', // red
  WEBSITE_CLICKS: '#f472b6', // pink
}

const METRIC_ICONS: Record<GBPMetric, React.ReactNode> = {
  BUSINESS_IMPRESSIONS_DESKTOP_MAPS: <Compass className="w-4 h-4 text-blue-400" />,
  BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: <Search className="w-4 h-4 text-purple-400" />,
  BUSINESS_IMPRESSIONS_MOBILE_MAPS: <Compass className="w-4 h-4 text-teal-400 animate-pulse" />,
  BUSINESS_IMPRESSIONS_MOBILE_SEARCH: <Search className="w-4 h-4 text-emerald-400 animate-pulse" />,
  CALL_CLICKS: <Phone className="w-4 h-4 text-[#FACC15]" />,
  DIRECTION_REQUESTS: <Navigation className="w-4 h-4 text-red-400" />,
  WEBSITE_CLICKS: <Globe className="w-4 h-4 text-pink-400" />,
}

const DATE_RANGES = [
  { label: '7 days', days: 7 },
  { label: '28 days', days: 28 },
  { label: '90 days', days: 90 },
]

function getDateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function sumTimeSeries(datedValues: Array<{ date: unknown; value: string }>): number {
  return datedValues.reduce((sum, v) => sum + parseInt(v.value || '0', 10), 0)
}

function MetricCard({ metric, total, color, icon, label }: {
  metric: GBPMetric
  total: number
  color: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="sov-glass border border-[#BADFE7]/10 p-4 rounded-xl shadow-md hover:border-[#FACC15]/30 transition-all duration-300 relative overflow-hidden group">
      {/* Dynamic background glow */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-5 pointer-events-none transition-all duration-300 group-hover:opacity-10" 
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm" style={{ backgroundColor: color + '15', color }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-extrabold text-white tracking-tight">{total.toLocaleString('en-IN')}</div>
      <div className="text-[10px] text-[#BADFE7]/50 font-bold uppercase tracking-wider mt-1">{METRIC_LABELS[metric]}</div>
    </div>
  )
}

function BranchInsights({ branch, days }: { branch: GBPBranch; days: number }) {
  const startDate = getDateDaysAgo(days)
  const endDate = getTodayDate()
  const { insights, loading, error } = useGBPInsights(branch, startDate, endDate)

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin h-8 w-8 text-[#FACC15]" />
      <span className="text-xs text-[#BADFE7]/60 uppercase tracking-widest">Loading insights...</span>
    </div>
  )

  if (error) return (
    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )

  if (!insights?.multiDailyMetricTimeSeries?.length) return (
    <div className="text-center py-16 text-[#BADFE7]/40 text-sm font-semibold border border-dashed border-[#BADFE7]/10 rounded-2xl bg-[#0d1d1f]/20">
      No insights data available yet. This requires GBP API access approval.
    </div>
  )

  const metricMap = new Map<GBPMetric, number>()
  insights.multiDailyMetricTimeSeries.forEach(series => {
    const total = sumTimeSeries(series.timeSeries.datedValues)
    metricMap.set(series.dailyMetric, total)
  })

  // Summary KPIs
  const totalImpressions = (
    (metricMap.get('BUSINESS_IMPRESSIONS_DESKTOP_MAPS') ?? 0) +
    (metricMap.get('BUSINESS_IMPRESSIONS_DESKTOP_SEARCH') ?? 0) +
    (metricMap.get('BUSINESS_IMPRESSIONS_MOBILE_MAPS') ?? 0) +
    (metricMap.get('BUSINESS_IMPRESSIONS_MOBILE_SEARCH') ?? 0)
  )

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="sov-glass border border-[#BADFE7]/10 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-tight">{totalImpressions.toLocaleString('en-IN')}</div>
          <p className="text-[9px] text-[#BADFE7]/50 font-bold uppercase tracking-widest mt-2 leading-none">Total Impressions</p>
        </div>
        <div className="sov-glass border border-[#FACC15]/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="text-2xl md:text-3xl font-extrabold text-[#FACC15] font-serif tracking-tight">{(metricMap.get('CALL_CLICKS') ?? 0).toLocaleString('en-IN')}</div>
          <p className="text-[9px] text-[#BADFE7]/50 font-bold uppercase tracking-widest mt-2 leading-none">Calls</p>
        </div>
        <div className="sov-glass border border-red-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="text-2xl md:text-3xl font-extrabold text-red-400 font-serif tracking-tight">{(metricMap.get('DIRECTION_REQUESTS') ?? 0).toLocaleString('en-IN')}</div>
          <p className="text-[9px] text-[#BADFE7]/50 font-bold uppercase tracking-widest mt-2 leading-none">Directions</p>
        </div>
      </div>

      {/* Full metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(METRIC_LABELS) as GBPMetric[]).map(metric => (
          <MetricCard
            key={metric}
            metric={metric}
            total={metricMap.get(metric) ?? 0}
            color={METRIC_COLORS[metric]}
            icon={METRIC_ICONS[metric]}
            label={METRIC_LABELS[metric].split(' ').pop()!}
          />
        ))}
      </div>
    </div>
  )
}

export function GBPInsightsPanel() {
  const [activeTab, setActiveTab] = useState<GBPBranch>('cochin')
  const [activeDays, setActiveDays] = useState(28)

  return (
    <div className="sov-card border border-[#BADFE7]/10 p-5 md:p-6 rounded-2xl relative overflow-hidden flex flex-col h-fit">
      {/* Visual background card glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#BADFE7]/10 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FACC15]" />
            <span>GBP Insights</span>
          </h2>
          <p className="text-xs text-[#BADFE7]/50 mt-1">Search impressions, calls & direction metrics from Google</p>
        </div>
        
        {/* Sub-Tab Location Selector */}
        <div className="flex bg-[#0d1d1f]/60 p-1 rounded-xl border border-[#BADFE7]/10 self-start sm:self-center shadow-md">
          {(['cochin', 'calicut'] as GBPBranch[]).map(branch => (
            <button
              key={branch}
              onClick={() => setActiveTab(branch)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === branch
                  ? 'bg-[#FACC15] text-[#1a3a3d] shadow-sm'
                  : 'text-[#BADFE7]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {branch === 'cochin' ? 'Cochin' : 'Calicut'}
            </button>
          ))}
        </div>
      </div>

      {/* Date range picker */}
      <div className="flex gap-2 mb-6 relative z-10">
        {DATE_RANGES.map(range => (
          <button
            key={range.days}
            onClick={() => setActiveDays(range.days)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
              activeDays === range.days
                ? 'bg-[#FACC15] text-[#1a3a3d] border-[#FACC15] shadow-sm'
                : 'bg-white/5 text-[#BADFE7] border-[#BADFE7]/10 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Last {range.label}</span>
          </button>
        ))}
      </div>

      <BranchInsights key={`${activeTab}-${activeDays}`} branch={activeTab} days={activeDays} />
    </div>
  )
}

