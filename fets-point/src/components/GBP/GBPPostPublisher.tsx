// GBPPostPublisher - Create and manage Google Business Profile posts
// Publish exam announcements, updates to both Cochin & Calicut Google listings

import React, { useState } from 'react'
import { 
  FileText, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  Trash2, 
  Loader2, 
  Plus,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useGBPPosts } from '../../hooks/useGBP'
import type { GBPBranch, GBPLocalPost, GBPPostTopicType } from '../../types/gbp.types'

const POST_TYPES: { type: GBPPostTopicType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'STANDARD', label: 'Update', icon: <FileText className="w-5 h-5" />, description: 'General announcement or news' },
  { type: 'EVENT', label: 'Event', icon: <Calendar className="w-5 h-5" />, description: 'Exam dates, scheduled sessions' },
  { type: 'OFFER', label: 'Offer', icon: <Tag className="w-5 h-5" />, description: 'Special promotions or discounts' },
  { type: 'ALERT', label: 'Alert', icon: <AlertTriangle className="w-5 h-5" />, description: 'Important notices or changes' },
]

const FETS_TEMPLATES = [
  { label: 'Exam Slots Open', text: 'New exam slots are now open at FETS {branch} for upcoming sessions. Visit fets.live to register and book your preferred date.' },
  { label: 'Result Announcement', text: 'Congratulations to all candidates who appeared for their exams at FETS {branch}. Results are now available on fets.live.' },
  { label: 'Schedule Change', text: 'Important notice: Exam schedule has been updated at FETS {branch}. Please check fets.live for your revised timings.' },
  { label: 'Holiday Notice', text: 'FETS {branch} will be closed on this holiday. Please plan your exam bookings accordingly. Visit fets.live for available slots.' },
]

function PostCard({ post, onDelete }: { post: GBPLocalPost; onDelete: (name: string) => Promise<void> }) {
  const [deleting, setDeleting] = useState(false)
  const typeInfo = POST_TYPES.find(t => t.type === post.topicType)

  const handleDelete = async () => {
    if (!confirm('Delete this post from Google Business Profile?')) return
    setDeleting(true)
    try { await onDelete(post.name) }
    finally { setDeleting(false) }
  }

  return (
    <div className="sov-glass border border-[#BADFE7]/10 p-4 rounded-xl mb-4 hover:border-[#FACC15]/30 transition-all duration-300 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.15)] animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5 text-[#FACC15] group-hover:bg-[#FACC15]/10 transition-colors">
            {typeInfo?.icon ?? <FileText className="w-4 h-4" />}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            post.state === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            post.state === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            'bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/20'
          }`}>
            {post.state ?? 'Processing'}
          </span>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400/80 hover:text-red-400 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
      <p className="text-[#BADFE7]/90 text-sm leading-relaxed pl-1 font-medium">{post.summary}</p>
      {post.createTime && (
        <p className="text-[10px] text-[#BADFE7]/50 font-bold uppercase tracking-wider mt-3 pl-1">
          {new Date(post.createTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

function BranchPosts({ branch }: { branch: GBPBranch }) {
  const { posts, loading, error, submitting, createPost, deletePost } = useGBPPosts(branch)
  const [summary, setSummary] = useState('')
  const [postType, setPostType] = useState<GBPPostTopicType>('STANDARD')
  const [success, setSuccess] = useState(false)

  const handlePost = async () => {
    if (!summary.trim()) return
    try {
      await createPost({ summary, topicType: postType, languageCode: 'en' })
      setSummary('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      alert('Failed to publish post: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const applyTemplate = (template: string) => {
    setSummary(template.replace('{branch}', branch === 'cochin' ? 'Cochin' : 'Calicut'))
  }

  return (
    <div className="space-y-6">
      {/* Compose area */}
      <div className="bg-[#0d1d1f]/40 border border-[#BADFE7]/10 rounded-2xl p-4 md:p-5 shadow-inner">
        <span className="text-[10px] font-bold text-[#FACC15] tracking-widest uppercase mb-4 block">
          NEW GBP ANNOUNCEMENT
        </span>

        {/* Post type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {POST_TYPES.map(t => (
            <button
              key={t.type}
              onClick={() => setPostType(t.type)}
              title={t.description}
              className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all duration-300 ${
                postType === t.type
                  ? 'bg-[#FACC15] text-[#1a3a3d] border-[#FACC15] shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                  : 'bg-[#0d1d1f]/60 border-[#BADFE7]/10 text-[#BADFE7]/60 hover:text-white hover:border-[#BADFE7]/30 hover:bg-white/5'
              }`}
            >
              <div className="mb-1">{t.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider">{t.label}</div>
            </button>
          ))}
        </div>

        {/* Templates */}
        <div className="space-y-1.5 mb-4 pb-4 border-b border-[#BADFE7]/5">
          <div className="text-[9px] font-bold text-[#BADFE7]/40 uppercase tracking-wider mb-2">Compose templates</div>
          <div className="flex flex-wrap gap-1.5">
            {FETS_TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => applyTemplate(t.text)}
                className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-[#BADFE7]/10 hover:border-[#FACC15]/30 hover:bg-white/10 text-[#BADFE7]/80 px-2.5 py-1.5 rounded-lg transition-all duration-300"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            className="sov-input w-full text-sm focus:ring-[#FACC15]/30 bg-[#0d1d1f]/40 resize-none rounded-xl p-3.5"
            rows={4}
            placeholder="Write your announcement here... (This will appear on your Google Maps listing search card)"
            maxLength={1500}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[10px] text-[#BADFE7]/40 font-bold uppercase tracking-widest">{summary.length} / 1500 characters</span>
            <button
              onClick={handlePost}
              disabled={submitting || !summary.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#FACC15] to-[#CA8A04] hover:from-[#FEF08A] hover:to-[#FACC15] text-[#1a3a3d] text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.2)] w-full sm:w-auto"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Publish to Google</>
              )}
            </button>
          </div>
        </div>
        
        {success && (
          <div className="mt-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.05)] animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Post published to Google Business Profile!</span>
          </div>
        )}
      </div>

      {/* Existing posts */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-[#BADFE7]/40 tracking-widest uppercase block pl-1">
          Active Google Posts
        </span>

        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin h-6 w-6 text-[#FACC15]" />
            <span className="text-xs text-[#BADFE7]/60 uppercase tracking-widest">Loading posts...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-[#BADFE7]/40 text-sm font-semibold border border-dashed border-[#BADFE7]/10 rounded-2xl bg-[#0d1d1f]/20">
            No active posts found. Use the composer above to create a post.
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
            {posts.map(post => (
              <PostCard key={post.name} post={post} onDelete={deletePost} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function GBPPostPublisher() {
  const [activeTab, setActiveTab] = useState<GBPBranch>('cochin')

  return (
    <div className="sov-card border border-[#BADFE7]/10 p-5 md:p-6 rounded-2xl relative overflow-hidden flex flex-col h-fit">
      {/* Visual background card glow */}
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#BADFE7]/10 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FACC15]" />
            <span>Google Posts</span>
          </h2>
          <p className="text-xs text-[#BADFE7]/50 mt-1">Publish exam updates & announcements directly to Google Maps listings</p>
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
      <BranchPosts key={activeTab} branch={activeTab} />
    </div>
  )
}

