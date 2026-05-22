import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Clock } from 'lucide-react'
import { formatBranchName } from '../utils/authUtils'
import { createISTDate, formatDateForIST, getCurrentISTDateString } from '../utils/dateUtils'

type SessionRow = {
  id?: number
  date: string
  client_name: string
  exam_name: string
  candidate_count?: number
  start_time?: string
  end_time?: string
  branch_location?: string | null
}

function formatTime12(t?: string) {
  if (!t) return '—'
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  if (Number.isNaN(h)) return t
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:${m.padStart(2, '0')} ${ampm}`
}

function buildSevenDayKeys(todayYmd: string): string[] {
  const base = createISTDate(todayYmd)
  const keys: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    keys.push(formatDateForIST(d))
  }
  return keys
}

function dayHeaderLabel(ymd: string, todayYmd: string) {
  const d = createISTDate(ymd)
  const wd = d.toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' })
  const dayNum = d.toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' })
  const mon = d.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' })
  const isToday = ymd === todayYmd
  return { weekday: wd, dayNum, mon, isToday }
}

function clientAccentClass(client: string) {
  const u = client.toUpperCase()
  if (u.includes('PEARSON') || u.includes('VUE')) return 'border-l-cyan-400 bg-cyan-500/10'
  if (u.includes('PROMETRIC')) return 'border-l-yellow-400 bg-yellow-500/10'
  if (u.includes('CELPIP')) return 'border-l-orange-400 bg-orange-500/10'
  if (u.includes('CMA')) return 'border-l-emerald-400 bg-emerald-500/10'
  if (u.includes('PSI')) return 'border-l-pink-400 bg-pink-500/10'
  if (u.includes('ITTS')) return 'border-l-blue-400 bg-blue-500/10'
  if (u.includes('IELTS')) return 'border-l-violet-400 bg-violet-500/10'
  return 'border-l-zinc-500 bg-white/[0.04]'
}

function clientTextColor(client: string) {
  const u = client.toUpperCase()
  if (u.includes('PEARSON') || u.includes('VUE')) return 'text-cyan-300'
  if (u.includes('PROMETRIC')) return 'text-yellow-300'
  if (u.includes('CELPIP')) return 'text-orange-300'
  if (u.includes('CMA')) return 'text-emerald-300'
  if (u.includes('PSI')) return 'text-pink-300'
  if (u.includes('ITTS')) return 'text-blue-300'
  if (u.includes('IELTS')) return 'text-violet-300'
  return 'text-[#FACC15]/95'
}

export function SevenDayExamOutlook({
  sessions,
  isLoading,
  activeBranch,
  staffByDate,
  staffLoading,
}: {
  sessions: SessionRow[]
  isLoading: boolean
  activeBranch: string
  staffByDate: Record<string, string[]>
  staffLoading: boolean
}) {
  const todayYmd = getCurrentISTDateString()
  const dayKeys = useMemo(() => buildSevenDayKeys(todayYmd), [todayYmd])

  const byDate = useMemo(() => {
    const map = new Map<string, SessionRow[]>()
    dayKeys.forEach((k) => map.set(k, []))
    for (const s of sessions) {
      const d = s.date
      if (!map.has(d)) continue
      map.get(d)!.push(s)
    }
    return map
  }, [sessions, dayKeys])

  const subtitle =
    activeBranch === 'global'
      ? 'All centres · next seven days (India time)'
      : `${formatBranchName(activeBranch)} · next seven days (India time)`

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-gradient-to-b from-[#16161c] via-[#121218] to-[#0e0e12] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      aria-label="Seven day exam outlook"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(250,204,21,0.12),transparent_55%)]" />

      <div className="relative px-5 pt-6 pb-4 md:px-8 md:pt-6 md:pb-4 border-b border-white/[0.07]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/25 flex items-center justify-center shrink-0 shadow-inner">
              <Calendar size={20} className="text-[#FACC15]" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight">
                7-Day Exam Outlook
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 font-bold uppercase tracking-widest mt-1.5">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: stacked cards · Desktop: single 7-column row */}
      <div className="relative grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-7 lg:gap-0 lg:p-0 lg:divide-x lg:divide-white/[0.08]">
        {dayKeys.map((ymd) => {
          const { weekday, dayNum, mon, isToday } = dayHeaderLabel(ymd, todayYmd)
          const daySessions = byDate.get(ymd) || []
          const rosterNames = staffByDate[ymd] || []

          const byClient = new Map<string, SessionRow[]>()
          for (const s of daySessions) {
            const key = (s.client_name || 'Other').trim() || 'Other'
            if (!byClient.has(key)) byClient.set(key, [])
            byClient.get(key)!.push(s)
          }
          const clients = Array.from(byClient.keys()).sort((a, b) => a.localeCompare(b))
          for (const c of clients) {
            byClient.get(c)!.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
          }

          const dayCandidateTotal = daySessions.reduce((s, r) => s + (r.candidate_count ?? 0), 0)

          return (
            <div
              key={ymd}
              className={`
                flex flex-col min-h-0 rounded-2xl transition-all duration-300
                ${isToday 
                  ? 'border-2 border-[#FACC15]/50 bg-[#FACC15]/[0.02] shadow-[0_0_20px_rgba(250,204,21,0.12)] relative z-10 scale-[1.01] lg:scale-[1.005]'
                  : 'border border-white/[0.08] bg-white/[0.02] lg:border-0 lg:bg-transparent'}
                lg:rounded-none lg:border-r lg:border-white/[0.08] lg:last:border-r-0
                lg:min-h-[480px] xl:min-h-[520px]
              `}
            >
              <div
                className={`
                  shrink-0 px-5 py-4 md:px-5 md:py-4 border-b border-white/[0.08]
                  ${isToday 
                    ? 'bg-gradient-to-r from-[#FACC15]/[0.15] to-[#FACC15]/[0.05]' 
                    : 'bg-black/25 lg:bg-black/20'}
                `}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${isToday ? 'text-[#FACC15]' : 'text-zinc-500'}`}>
                      {weekday}
                    </p>
                    <p className="text-xl md:text-2xl font-black text-white tabular-nums leading-none mt-1">
                      {dayNum}{' '}
                      <span className={`text-sm md:text-base font-bold ${isToday ? 'text-[#FACC15]/70' : 'text-zinc-400'}`}>{mon}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isToday && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-[#FACC15]/20 text-[#FECC2F] border border-[#FACC15]/35 shadow-[0_0_8px_rgba(250,204,21,0.2)]">
                        Today
                      </span>
                    )}
                    {dayCandidateTotal > 0 && (
                      <span className="text-[9px] font-black tabular-nums px-2 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                        {dayCandidateTotal} C
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-[180px] max-h-[52vh] lg:max-h-none lg:min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 md:px-4 md:py-4 space-y-3 touch-pan-y [-webkit-overflow-scrolling:touch]">
                {isLoading ? (
                  <p className="text-xs text-zinc-500 font-medium text-center py-12">Loading...</p>
                ) : clients.length === 0 ? (
                  <p className="text-xs text-zinc-600 font-semibold text-center py-12">No exams scheduled</p>
                ) : (
                  clients.map((client) => {
                    const rows = byClient.get(client)!
                    return (
                      <div
                        key={client}
                        className={`rounded-xl border border-white/[0.08] pl-3 pr-2 py-2.5 border-l-4 ${clientAccentClass(client)}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-black uppercase tracking-wider ${clientTextColor(client)}`}>
                            {client}
                          </span>
                        </div>
                        <ul className="space-y-3">
                          {rows.map((row) => (
                            <li
                              key={row.id ?? `${row.date}-${row.start_time}-${row.exam_name}`}
                              className="border-t border-white/[0.06] pt-3 first:border-t-0 first:pt-0"
                            >
                              <div className="text-[11px] md:text-[12px] font-black text-white leading-snug">
                                {row.exam_name || 'Exam'}
                              </div>
                              <div className="flex flex-col gap-1 mt-1.5 text-[9px] md:text-[10px] text-zinc-400">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                  <Users size={11} className="text-zinc-500 shrink-0" />
                                  <span className="text-zinc-300 font-bold">{row.candidate_count ?? 0} candidates</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                  <Clock size={11} className="text-zinc-500 shrink-0" />
                                  <span className="text-zinc-300">{formatTime12(row.start_time)}{row.end_time ? ` – ${formatTime12(row.end_time)}` : ''}</span>
                                </span>
                              </div>
                              {activeBranch === 'global' && row.branch_location && (
                                <div className="text-[8px] font-black uppercase tracking-widest text-[#FACC15]/60 mt-1">
                                  {formatBranchName(String(row.branch_location))}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })
                )}
              </div>

              <div className={`shrink-0 border-t border-white/[0.06] px-4 py-3 mt-auto ${isToday ? 'bg-[#FACC15]/[0.05]' : 'bg-black/10'}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Roster Staff</span>
                  <span className="text-[8px] text-zinc-600 font-medium uppercase tracking-wider">
                    {activeBranch === 'global' ? 'All' : formatBranchName(activeBranch)}
                  </span>
                </div>
                {staffLoading ? (
                  <div className="text-[10px] text-zinc-500 font-medium py-0.5">Loading...</div>
                ) : rosterNames.length === 0 ? (
                  <div className="text-[10px] text-zinc-600 italic py-0.5">None rostered</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {rosterNames.map((name) => (
                      <span
                        key={`${ymd}-${name}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-zinc-300 bg-white/[0.04] border border-white/[0.08]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
