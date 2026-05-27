import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Copy,
  Trash2,
  Pencil,
  Check,
  LayoutGrid,
  Eye,
  EyeOff,
  ExternalLink,
  Crown,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { isMithunEmail } from '../utils/authUtils'
import {
  LIVE_SUPPORT_CLIENTS,
  QUICK_ACCESS_EXTRA,
  type QuickAccessClientSlug,
} from '../constants/liveSupportClients'

export type { QuickAccessClientSlug }

export type QuickAccessFieldType =
  | 'url'
  | 'login_id'
  | 'password'
  | 'email'
  | 'contact_phone'
  | 'site_code'
  | 'access_code'
  | 'api_key'
  | 'support_pin'
  | 'notes'
  | 'other'

export type QuickAccessItemRow = {
  id: string
  owner_id: string
  client_slug: QuickAccessClientSlug
  field_type: QuickAccessFieldType
  value_text: string
  label: string | null
  sort_order: number
  source_vault_row_id: string | null
  is_global?: boolean
  created_at: string
  updated_at: string
}

const FIELD_OPTIONS: { id: QuickAccessFieldType; label: string }[] = [
  { id: 'url', label: 'URL / link' },
  { id: 'login_id', label: 'Login / ID' },
  { id: 'password', label: 'Password' },
  { id: 'email', label: 'Email' },
  { id: 'contact_phone', label: 'Phone' },
  { id: 'site_code', label: 'Site code' },
  { id: 'access_code', label: 'Access code' },
  { id: 'api_key', label: 'API key' },
  { id: 'support_pin', label: 'Support PIN' },
  { id: 'notes', label: 'Note / long text' },
  { id: 'other', label: 'Other' },
]

const QA_TILES = [
  ...LIVE_SUPPORT_CLIENTS.map((c) => ({
    slug: c.slug,
    name: c.name,
    image: c.image,
    supportUrl: c.supportUrl,
  })),
  ...QUICK_ACCESS_EXTRA.map((c) => ({
    slug: c.slug,
    name: c.name,
    image: c.image as string | undefined,
    supportUrl: undefined as string | undefined,
  })),
]

function inferClientSlug(v: Record<string, unknown>): QuickAccessClientSlug {
  const blob = `${v.category ?? ''} ${v.title ?? ''} ${v.notes ?? ''} ${v.type ?? ''} ${v.content ?? ''}`
    .toLowerCase()
  if (blob.includes('prometric')) return 'prometric'
  if (blob.includes('pearson') || blob.includes('vue')) return 'pearson'
  if (blob.includes('celpip')) return 'celpip'
  if (blob.includes('psi')) return 'psi'
  if (blob.includes('itts') || blob.includes('surpass')) return 'itts'
  return 'fets'
}

function fieldLabel(t: string) {
  return FIELD_OPTIONS.find((f) => f.id === t)?.label ?? t
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} copied`, {
    style: {
      background: '#121214',
      color: '#FACC15',
      border: '1px solid rgba(250, 204, 21, 0.2)',
      fontSize: '10px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
  })
}

function isSecretField(fieldType: QuickAccessFieldType) {
  return fieldType === 'password' || fieldType === 'api_key'
}

function looksLikeHttpUrl(s: string) {
  const t = s.trim()
  if (!t) return false
  try {
    const u = new URL(t.startsWith('http') ? t : `https://${t}`)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return /^https?:\/\//i.test(t)
  }
}

function normalizeHref(s: string) {
  const t = s.trim()
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

/** Neomorphic surface (dark) */
const neuCard =
  'rounded-2xl border border-white/[0.07] bg-[#16181d] shadow-[6px_8px_18px_rgba(0,0,0,0.45),-4px_-4px_14px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.06)]'
const neuInset =
  'rounded-xl border border-black/40 bg-[#0e0f12] shadow-[inset_3px_3px_10px_rgba(0,0,0,0.5),inset_-2px_-2px_8px_rgba(255,255,255,0.04)]'

export function QuickAccessSection({
  profile,
  authUserId,
}: {
  profile: { id: string; email?: string | null; role?: string | null } | null | undefined
  authUserId?: string | null
}) {
  const [items, setItems] = useState<QuickAccessItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [migrationDone, setMigrationDone] = useState(false)
  const [activeClient, setActiveClient] = useState<QuickAccessClientSlug>('prometric')

  const [addFieldType, setAddFieldType] = useState<QuickAccessFieldType>('other')
  const [addValue, setAddValue] = useState('')
  const [addLabel, setAddLabel] = useState('')
  const [addShareGlobally, setAddShareGlobally] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editFieldType, setEditFieldType] = useState<QuickAccessFieldType>('other')
  const [editShareGlobally, setEditShareGlobally] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})
  const isMithun = isMithunEmail(profile?.email) && profile?.role === 'super_admin'

  const fetchItems = useCallback(async () => {
    if (!profile?.id) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('quick_access_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
        setTableMissing(true)
        setItems([])
      } else {
        console.error('quick_access_items', error)
        toast.error(error.message)
      }
      setLoading(false)
      return
    }
    setTableMissing(false)
    const visibleRows = ((data || []) as QuickAccessItemRow[]).filter(
      (row) => row.is_global || row.owner_id === profile.id
    )
    setItems(visibleRows)
    setLoading(false)
  }, [profile?.id])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (!profile?.id || tableMissing || migrationDone) return

    let cancelled = false
    ;(async () => {
      const { data: existingTags } = await supabase
        .from('quick_access_items')
        .select('source_vault_row_id')
        .not('source_vault_row_id', 'is', null)

      const migratedVaultIds = new Set(
        (existingTags || []).map((r: { source_vault_row_id: string }) => r.source_vault_row_id).filter(Boolean)
      )

      const { data: vaultRows, error: vErr } = await supabase.from('fets_vault').select('*')
      if (vErr || !vaultRows?.length) {
        setMigrationDone(true)
        return
      }

      const toInsert: Record<string, unknown>[] = []
      for (const v of vaultRows as Record<string, unknown>[]) {
        const vid = v.id as string | undefined
        if (!vid || migratedVaultIds.has(vid)) continue

        const rowOwner = v.user_id as string | undefined
        const isMine =
          rowOwner && (rowOwner === profile.id || (authUserId && rowOwner === authUserId))
        if (!isMine) continue

        const client = inferClientSlug(v)
        const rowLabel = (v.title as string) || null

        const push = (field_type: QuickAccessFieldType, val: unknown) => {
          if (val == null) return
          const s = String(val).trim()
          if (!s) return
          toInsert.push({
            owner_id: profile.id,
            client_slug: client,
            field_type,
            value_text: s,
            label: rowLabel,
            sort_order: 0,
            source_vault_row_id: vid,
          })
        }

        push('url', v.url)
        push('login_id', v.username)
        push('password', v.password)
        push('email', v.prof_email)
        push('contact_phone', v.contact_numbers)
        push('site_code', v.site_id)
        push('password', v.prof_email_password)
        const notes = (v.notes as string) || (v.content as string)
        push('notes', notes)
        if (v.other_urls) {
          push('notes', typeof v.other_urls === 'string' ? v.other_urls : JSON.stringify(v.other_urls))
        }
      }

      if (cancelled || toInsert.length === 0) {
        setMigrationDone(true)
        return
      }

      const { error: insErr } = await supabase.from('quick_access_items').insert(toInsert)
      if (insErr) {
        console.error('Quick access migration', insErr)
      } else {
        await fetchItems()
      }
      setMigrationDone(true)
    })()

    return () => {
      cancelled = true
    }
  }, [profile?.id, authUserId, tableMissing, migrationDone, fetchItems])

  const byClient = useMemo(() => {
    const m = new Map<QuickAccessClientSlug, QuickAccessItemRow[]>()
    QA_TILES.forEach((c) => m.set(c.slug, []))
    for (const it of items) {
      const list = m.get(it.client_slug) || []
      list.push(it)
      m.set(it.client_slug, list)
    }
    return m
  }, [items])

  const activeItems = useMemo(() => {
    if (!activeClient) return []
    const list = byClient.get(activeClient) || []
    return [...list].sort(
      (a, b) =>
        a.sort_order - b.sort_order || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }, [activeClient, byClient])

  const resetAdd = () => {
    setAddFieldType('other')
    setAddValue('')
    setAddLabel('')
    setAddShareGlobally(false)
    setShowAddPanel(false)
  }

  const handleAdd = async () => {
    if (!profile?.id || !activeClient) return
    const v = addValue.trim()
    if (!v) {
      toast.error('Enter a value')
      return
    }
    const nextOrder =
      activeItems.length > 0 ? Math.max(...activeItems.map((x) => x.sort_order), -1) + 1 : 0
    const { error } = await supabase.from('quick_access_items').insert({
      owner_id: profile.id,
      client_slug: activeClient,
      field_type: addFieldType,
      value_text: v,
      label: addLabel.trim() || null,
      sort_order: nextOrder,
      is_global: Boolean(isMithun && addShareGlobally),
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Saved')
    resetAdd()
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('quick_access_items').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Removed')
    if (editingId === id) setEditingId(null)
    setRevealedIds((prev) => {
      const n = { ...prev }
      delete n[id]
      return n
    })
    fetchItems()
  }

  const startEdit = (row: QuickAccessItemRow) => {
    setEditingId(row.id)
    setEditValue(row.value_text)
    setEditLabel(row.label || '')
    setEditFieldType(row.field_type as QuickAccessFieldType)
    setEditShareGlobally(Boolean(row.is_global))
  }

  const saveEdit = async () => {
    if (!editingId || !profile?.id) return
    const v = editValue.trim()
    if (!v) {
      toast.error('Value required')
      return
    }
    const { error } = await supabase
      .from('quick_access_items')
      .update({
        value_text: v,
        label: editLabel.trim() || null,
        field_type: editFieldType,
        is_global: Boolean(isMithun && editShareGlobally),
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Updated')
    setEditingId(null)
    fetchItems()
  }

  const activeMeta = QA_TILES.find((c) => c.slug === activeClient)

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const inputForField = (
    fieldType: QuickAccessFieldType,
    value: string,
    onChange: (v: string) => void,
    id: string
  ) => {
    if (fieldType === 'notes') {
      return (
        <textarea
          id={id}
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Long note, instructions, pasted content…"
          className={`w-full px-3 py-2.5 text-xs text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-sky-400/40 resize-y min-h-[100px] ${neuInset}`}
        />
      )
    }
    const type =
      fieldType === 'password'
        ? 'password'
        : fieldType === 'email'
          ? 'email'
          : fieldType === 'contact_phone'
            ? 'tel'
            : fieldType === 'url'
              ? 'url'
              : 'text'
    return (
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 text-xs text-white/90 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-sky-400/40 ${neuInset}`}
      />
    )
  }

  const renderValueDisplay = (row: QuickAccessItemRow) => {
    const raw = row.value_text
    const showSecret = isSecretField(row.field_type)
    const revealed = revealedIds[row.id]
    const asUrl = row.field_type === 'url' || (row.field_type === 'other' && looksLikeHttpUrl(raw))

    if (editingId === row.id) {
      return null
    }

    if (asUrl && looksLikeHttpUrl(raw)) {
      return (
        <a
          href={normalizeHref(raw)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-sky-300/95 hover:text-sky-200 underline underline-offset-2 break-all font-medium"
        >
          {raw}
        </a>
      )
    }

    if (showSecret && !revealed) {
      return <span className="text-sm text-white/35 tracking-widest select-none">••••••••</span>
    }

    return (
      <p className="text-sm text-white/80 whitespace-pre-wrap break-words font-medium leading-relaxed">{raw}</p>
    )
  }

  if (!profile?.id) {
    return null
  }

  return (
    <section
      id="quick-access-section"
      className="rounded-[24px] border border-sky-500/25 bg-gradient-to-b from-sky-500/[0.07] via-[#0a0c10]/40 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(56,189,248,0.06)] overflow-hidden"
      aria-label="Quick access credentials by vendor"
    >
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-sky-500/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center border border-sky-400/25 shrink-0 shadow-[3px_4px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <LayoutGrid size={16} className="text-sky-300" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-white uppercase tracking-[0.12em] leading-none">
                Quick Access Vault
              </h3>
              <p className="text-[9px] text-sky-200/50 uppercase tracking-widest font-bold mt-1.5">
                {items.length} saved entries · Select a vendor to view
              </p>
            </div>
          </div>

          {/* Global External Support URL & Add Button */}
          <div className="flex items-center gap-2">
            {activeMeta?.supportUrl && (
              <a
                href={activeMeta.supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-sky-300 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/5 hover:border-white/12 transition-all"
                title="Official live support (new tab)"
              >
                <ExternalLink size={12} />
                <span>Support Portal</span>
              </a>
            )}
            
            {!showAddPanel && (
              <button
                type="button"
                onClick={() => setShowAddPanel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white bg-sky-500/25 border border-sky-400/40 hover:bg-sky-500/40 transition-all"
              >
                <Plus size={12} />
                <span>Add Entry</span>
              </button>
            )}
          </div>
        </div>

        {tableMissing && (
          <p className="text-xs text-amber-400/90 mb-4 px-1 leading-relaxed">
            Run the SQL migration{' '}
            <code className="text-[10px] bg-white/5 px-1 rounded">supabase/migrations/20260404120000_quick_access_items.sql</code> in the
            Supabase SQL editor to enable Quick Access storage.
          </p>
        )}

        {/* Grid Layout: Tabs Left, Vault Right */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Left sidebar / Tabs */}
          <div className="md:col-span-1">
            {/* Mobile horizontal scroll tabs */}
            <div className="flex md:hidden overflow-x-auto gap-2 pb-3 mb-2 scrollbar-thin scrollbar-thumb-white/10">
              {QA_TILES.map((c) => {
                const count = byClient.get(c.slug)?.length ?? 0
                const isActive = activeClient === c.slug
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => {
                      setActiveClient(c.slug)
                      setShowAddPanel(false)
                      setEditingId(null)
                    }}
                    className={`flex-none flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-300
                      ${isActive 
                        ? 'bg-sky-500/10 border-sky-400/50 text-white shadow-[0_0_12px_rgba(56,189,248,0.15)]' 
                        : 'bg-[#14161c]/90 border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white'}`}
                  >
                    <span>{c.name}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-sky-400/20 text-sky-200' : 'bg-white/5 text-white/30'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Desktop vertical sidebar tabs */}
            <div className="hidden md:flex flex-col gap-2">
              {QA_TILES.map((c) => {
                const count = byClient.get(c.slug)?.length ?? 0
                const isActive = activeClient === c.slug
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => {
                      setActiveClient(c.slug)
                      setShowAddPanel(false)
                      setEditingId(null)
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all duration-300 text-left
                      ${isActive 
                        ? 'bg-sky-500/10 border-sky-400/40 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_12px_rgba(56,189,248,0.15)]' 
                        : 'bg-transparent border-transparent text-white/50 hover:bg-white/[0.02] hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {c.image ? (
                        <img src={c.image} alt="" className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 shrink-0" />
                      ) : (
                        <span className="w-5 h-5 rounded-md bg-sky-500/20 flex items-center justify-center text-[8px] font-black text-sky-300 shrink-0">F</span>
                      )}
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-sky-400/25 text-sky-200' : 'bg-white/5 text-white/30'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Panel / Credentials List */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block w-6 h-6 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin mb-2" />
                <p className="text-xs text-white/44">Loading credentials...</p>
              </div>
            ) : (
              <>
                {/* Inline Add Panel */}
                <AnimatePresence>
                  {showAddPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 space-y-3 ${neuCard} border-sky-500/40 bg-sky-500/[0.02]`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-sky-300 font-bold">New credential entry</p>
                        <button
                          type="button"
                          onClick={() => setShowAddPanel(false)}
                          className="text-[10px] text-white/40 hover:text-white/60 uppercase font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-white/35 block mb-1">Label / Title (optional)</label>
                          <input
                            value={addLabel}
                            onChange={(e) => setAddLabel(e.target.value)}
                            placeholder="e.g. Main portal login, API Key"
                            className={`w-full px-3 py-2 text-xs text-white/90 placeholder:text-white/20 ${neuInset}`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-white/35 block mb-1">Field Type</label>
                          <select
                            value={addFieldType}
                            onChange={(e) => setAddFieldType(e.target.value as QuickAccessFieldType)}
                            className={`w-full px-3 py-2 text-xs text-white/90 ${neuInset}`}
                          >
                            {FIELD_OPTIONS.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold text-white/35 block mb-1">Value</label>
                        {inputForField(addFieldType, addValue, setAddValue, 'add-value')}
                      </div>

                      {isMithun && (
                        <label className="flex items-start gap-2 rounded-xl border border-[#FACC15]/15 bg-[#FACC15]/5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FACC15]/80 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mt-0.5 accent-[#FACC15]"
                            checked={addShareGlobally}
                            onChange={(e) => setAddShareGlobally(e.target.checked)}
                          />
                          Share permanently with all users
                        </label>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddPanel(false)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAdd}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:brightness-110 text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Save Entry
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Vault List */}
                {activeItems.length === 0 ? (
                  <div className={`${neuInset} border-dashed border-white/12 px-4 py-12 text-center`}>
                    <p className="text-xs text-white/45 leading-relaxed mb-4">
                      No entries found for {activeMeta?.name} in your vault.
                    </p>
                    {!showAddPanel && (
                      <button
                        type="button"
                        onClick={() => setShowAddPanel(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-sky-300 hover:text-white bg-sky-500/10 border border-sky-400/30 hover:bg-sky-500/20 transition-all"
                      >
                        <Plus size={14} />
                        Add your first entry
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {activeItems.map((row) => {
                      const isShared = Boolean(row.is_global)
                      const canModifyRow = !isShared || isMithun
                      const isEditing = editingId === row.id

                      return (
                        <div
                          key={row.id}
                          className={`p-4 rounded-2xl border bg-[#16181d] shadow-md transition-all duration-300
                            ${isShared ? 'border-[#FACC15]/20 bg-[#16181d]/85' : 'border-white/[0.06] hover:border-white/12'}
                            ${isEditing ? 'ring-1 ring-sky-400/40 border-sky-400/40' : ''}`}
                        >
                          {isEditing ? (
                            // Inline Edit Mode
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-sky-300 font-bold">Edit credential</p>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="text-[10px] text-white/40 hover:text-white/60 uppercase font-bold"
                                >
                                  Cancel
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-white/35 block mb-1">Label (your name for this)</label>
                                  <input
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    placeholder="e.g. Main portal password"
                                    className={`w-full px-3 py-2 text-xs text-white/90 placeholder:text-white/20 ${neuInset}`}
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-white/35 block mb-1">Type</label>
                                  <select
                                    value={editFieldType}
                                    onChange={(e) => setEditFieldType(e.target.value as QuickAccessFieldType)}
                                    className={`w-full px-3 py-2 text-xs text-white/90 ${neuInset}`}
                                  >
                                    {FIELD_OPTIONS.map((o) => (
                                      <option key={o.id} value={o.id}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div>
                                  <label className="text-[9px] uppercase font-bold text-white/35 block mb-1">Value</label>
                                  {inputForField(editFieldType, editValue, setEditValue, `edit-${row.id}`)}
                              </div>

                              {isMithun && (
                                <label className="flex items-start gap-2 rounded-xl border border-[#FACC15]/15 bg-[#FACC15]/5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#FACC15]/80 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 accent-[#FACC15]"
                                    checked={editShareGlobally}
                                    onChange={(e) => setEditShareGlobally(e.target.checked)}
                                  />
                                  Keep this entry shared for all users
                                </label>
                              )}

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Read Mode
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400/80">
                                      {row.label?.trim() || fieldLabel(row.field_type)}
                                    </p>
                                    {isShared && (
                                      <span className="inline-flex items-center gap-1 rounded-full border border-[#FACC15]/25 bg-[#FACC15]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#FACC15]">
                                        <Crown size={10} />
                                        Shared
                                      </span>
                                    )}
                                  </div>
                                  {row.label?.trim() && (
                                    <p className="text-[8px] text-white/30 uppercase tracking-widest">{fieldLabel(row.field_type)}</p>
                                  )}
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                  {isSecretField(row.field_type) && (
                                    <button
                                      type="button"
                                      onClick={() => toggleReveal(row.id)}
                                      className="p-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:text-sky-300 transition-colors"
                                      title={revealedIds[row.id] ? 'Hide Value' : 'Show Value'}
                                    >
                                      {revealedIds[row.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(row.value_text, row.label?.trim() || fieldLabel(row.field_type))
                                    }
                                    className="p-1.5 rounded-lg bg-white/[0.04] text-white/45 hover:text-sky-300 transition-colors"
                                    title="Copy Value"
                                  >
                                    <Copy size={13} />
                                  </button>
                                  {canModifyRow && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => startEdit(row)}
                                        className="p-1.5 rounded-lg bg-white/[0.04] text-white/45 hover:text-sky-300 transition-colors"
                                        title="Edit Entry"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDelete(row.id)}
                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400/90 hover:bg-red-500/20 transition-colors"
                                        title="Delete Entry"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-1">
                                {renderValueDisplay(row)}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
