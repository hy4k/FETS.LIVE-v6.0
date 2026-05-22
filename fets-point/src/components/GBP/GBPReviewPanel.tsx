// GBPReviewPanel - Review management dashboard for Cochin & Calicut
// Shows all reviews, avg rating, unreplied count. Allows replying from fets.live

import React, { useState } from 'react'
import { 
  Star, 
  MessageSquare, 
  Trash2, 
  Edit, 
  Plus, 
  AlertCircle, 
  Loader2 
} from 'lucide-react'
import { useGBPReviews } from '../../hooks/useGBP'
import type { GBPBranch, GBPReview } from '../../types/gbp.types'
import { starRatingToNumber } from '../../types/gbp.types'

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg 
          key={i} 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill={i <= rating ? '#FACC15' : 'rgba(250, 204, 21, 0.1)'}
          stroke={i <= rating ? '#CA8A04' : 'rgba(250, 204, 21, 0.2)'}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function ReviewCard({ review, onReply, onDeleteReply }: {
  review: GBPReview
  onReply: (name: string, comment: string) => Promise<void>
  onDeleteReply: (name: string) => Promise<void>
}) {
  const [replyText, setReplyText] = useState(review.reviewReply?.comment ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const stars = starRatingToNumber[review.starRating]

  const handleSave = async () => {
    if (!replyText.trim()) return
    setSaving(true)
    try {
      await onReply(review.name, replyText)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this reply?')) return
    setSaving(true)
    try {
      await onDeleteReply(review.name)
      setReplyText('')
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sov-glass border border-[#BADFE7]/10 p-4 rounded-xl mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:border-[#FACC15]/30 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FACC15] to-[#CA8A04] flex items-center justify-center text-[#1a3a3d] font-bold text-sm shadow-[0_0_10px_rgba(250,204,21,0.2)]">
            {review.reviewer.isAnonymous ? '?' : review.reviewer.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-wide">{review.reviewer.isAnonymous ? 'Anonymous' : review.reviewer.displayName}</p>
            <p className="text-[10px] text-[#BADFE7]/50 uppercase tracking-wider mt-0.5">
              {new Date(review.createTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <StarRating rating={stars} size={16} />
      </div>

      {review.comment && (
        <p className="text-[#BADFE7]/90 text-sm mb-4 leading-relaxed font-medium pl-1 border-l border-[#FACC15]/20">
          {review.comment}
        </p>
      )}

      {/* Reply section */}
      {!editing && review.reviewReply ? (
        <div className="bg-[#0d1d1f]/50 border border-[#FACC15]/20 rounded-xl p-3.5 mt-3 shadow-inner relative overflow-hidden group-hover:border-[#FACC15]/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#BADFE7]/5">
            <span className="text-[10px] font-bold text-[#FACC15] tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse" />
              FETS Response
            </span>
            <div className="flex gap-3">
              <button 
                onClick={() => setEditing(true)} 
                className="text-xs text-[#BADFE7]/60 hover:text-[#FACC15] transition-colors flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button 
                onClick={handleDelete} 
                className="text-xs text-red-400/80 hover:text-red-400 transition-colors flex items-center gap-1" 
                disabled={saving}
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-[#BADFE7]/80 leading-relaxed pl-1">{review.reviewReply.comment}</p>
        </div>
      ) : !editing ? (
        <button
          onClick={() => setEditing(true)}
          className="mt-1 text-xs text-[#FACC15] hover:text-[#FEF08A] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors duration-200"
        >
          <Plus className="w-3.5 h-3.5" /> 
          <span>Add reply</span>
        </button>
      ) : (
        <div className="mt-3 space-y-2 animate-fade-in">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            className="sov-input w-full text-sm focus:ring-[#FACC15]/30 resize-none rounded-xl"
            rows={3}
            placeholder="Write your official response to this review..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !replyText.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#CA8A04] hover:from-[#FEF08A] hover:to-[#FACC15] text-[#1a3a3d] text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
            >
              {saving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              ) : (
                'Post Reply'
              )}
            </button>
            <button 
              onClick={() => { setEditing(false); setReplyText(review.reviewReply?.comment ?? '') }} 
              className="px-4 py-2 bg-white/5 border border-[#BADFE7]/20 hover:bg-white/10 text-[#BADFE7] text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BranchReviews({ branch }: { branch: GBPBranch }) {
  const { reviews, averageRating, totalCount, loading, error, nextPageToken, fetchReviews, replyToReview, deleteReply } = useGBPReviews(branch)
  const unreplied = reviews.filter(r => !r.reviewReply).length

  if (loading && reviews.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin h-8 w-8 text-[#FACC15]" />
      <span className="text-xs text-[#BADFE7]/60 uppercase tracking-widest">Loading reviews...</span>
    </div>
  )

  if (error) return (
    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="sov-glass border border-[#FACC15]/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="text-3xl font-extrabold text-[#FACC15] font-serif tracking-tight">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center mt-1"><StarRating rating={Math.round(averageRating)} size={11} /></div>
          <p className="text-[10px] text-[#BADFE7]/50 font-bold uppercase tracking-widest mt-2">Avg Rating</p>
        </div>
        <div className="sov-glass border border-[#BADFE7]/10 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="text-3xl font-extrabold text-white font-serif tracking-tight">{totalCount}</div>
          <p className="text-[10px] text-[#BADFE7]/50 font-bold uppercase tracking-widest mt-3.5">Total Reviews</p>
        </div>
        <div className="sov-glass border border-red-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className={`text-3xl font-extrabold font-serif tracking-tight ${unreplied > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{unreplied}</div>
          <p className="text-[10px] text-[#BADFE7]/50 font-bold uppercase tracking-widest mt-3.5">Unreplied</p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-[#BADFE7]/40 text-sm font-medium">
            No reviews found for this branch.
          </div>
        ) : (
          reviews.map(review => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              onReply={async (name, comment) => { await replyToReview(name, comment) }}
              onDeleteReply={deleteReply}
            />
          ))
        )}
      </div>

      {nextPageToken && (
        <button
          onClick={() => fetchReviews(nextPageToken)}
          disabled={loading}
          className="w-full py-3 bg-white/5 hover:bg-white/10 text-[#BADFE7] text-xs font-bold uppercase tracking-widest rounded-xl border border-[#BADFE7]/15 transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{loading ? 'Loading...' : 'Load more reviews'}</span>
        </button>
      )}
    </div>
  )
}

export function GBPReviewPanel() {
  const [activeTab, setActiveTab] = useState<GBPBranch>('cochin')

  return (
    <div className="sov-card border border-[#BADFE7]/10 p-5 md:p-6 rounded-2xl relative overflow-hidden flex flex-col h-fit">
      {/* Visual background card glow */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#BADFE7]/10 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FACC15] fill-[#FACC15]/20" />
            <span>Google Reviews</span>
          </h2>
          <p className="text-xs text-[#BADFE7]/50 mt-1">Review ratings and replies from FETS locations</p>
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
      <BranchReviews key={activeTab} branch={activeTab} />
    </div>
  )
}

