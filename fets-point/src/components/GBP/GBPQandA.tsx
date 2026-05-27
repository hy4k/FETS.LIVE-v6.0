// GBPQandA - Google Business Profile Q&A Manager
// View and answer candidate questions from Google Maps for Cochin & Calicut

import React, { useState } from 'react'
import { 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  AlertTriangle, 
  Loader2, 
  ThumbsUp, 
  User, 
  Calendar 
} from 'lucide-react'
import { useGBPQA } from '../../hooks/useGBP'
import type { GBPBranch, GBPQuestion } from '../../types/gbp.types'

const FETS_FAQ_TEMPLATES = [
  { q: 'What ID is required?', a: 'Candidates must bring a valid government-issued photo ID (Aadhaar, PAN, Passport, or Driving License) on the day of the exam.' },
  { q: 'Can I reschedule?', a: 'Yes, rescheduling is allowed subject to seat availability. Please visit fets.live or call us at least 48 hours before your exam date.' },
  { q: 'What time should I arrive?', a: 'Please arrive at least 30 minutes before your scheduled exam time. Late arrivals may not be admitted.' },
  { q: 'Is there parking?', a: 'Yes, parking is available at the FETS center. Please check fets.live for location-specific details.' },
]

function QuestionCard({ question, onAnswer }: {
  question: GBPQuestion
  onAnswer: (questionName: string, text: string) => Promise<void>
}) {
  const [answerText, setAnswerText] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const merchantAnswer = question.topAnswers?.find(a => a.author.type === 'MERCHANT')

  const handleSubmit = async () => {
    if (!answerText.trim()) return
    setSubmitting(true)
    try {
      await onAnswer(question.name, answerText)
      setAnswerText('')
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const applyFAQ = (text: string) => setAnswerText(text)

  return (
    <div className="sov-glass border border-[#BADFE7]/10 p-4 rounded-xl mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:border-[#FACC15]/30 transition-all duration-300 group">
      {/* Question */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#BADFE7]/10 to-[#BADFE7]/5 border border-[#BADFE7]/20 flex items-center justify-center text-[#BADFE7] font-bold text-sm flex-shrink-0">
          Q
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-semibold tracking-wide leading-relaxed">{question.text}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-xs text-[#BADFE7]/50 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#BADFE7]/30" />
              {question.author.displayName}
            </span>
            <span className="text-xs text-[#BADFE7]/50 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#BADFE7]/30" />
              {new Date(question.createTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {question.upvoteCount > 0 && (
              <span className="text-xs text-[#FACC15] flex items-center gap-1 font-semibold">
                <ThumbsUp className="w-3 h-3 text-[#FACC15]" />
                {question.upvoteCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Existing merchant answer */}
      {merchantAnswer && (
        <div className="bg-[#0d1d1f]/50 border border-[#FACC15]/20 rounded-xl p-3.5 ml-0 sm:ml-12 mb-3 shadow-inner relative overflow-hidden group-hover:border-[#FACC15]/40 transition-all duration-300">
          <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-[#BADFE7]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse" />
            <span className="text-[10px] font-bold text-[#FACC15] tracking-widest uppercase">FETS Response</span>
            <span className="text-[10px] text-[#BADFE7]/50 uppercase tracking-widest font-bold">(Official)</span>
          </div>
          <p className="text-sm text-[#BADFE7]/80 leading-relaxed pl-1">{merchantAnswer.text}</p>
        </div>
      )}

      {/* Answer form trigger */}
      {!merchantAnswer && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="ml-0 sm:ml-12 text-xs text-[#FACC15] hover:text-[#FEF08A] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors duration-200 mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Answer this question</span>
        </button>
      )}

      {/* Answer form */}
      {showForm && (
        <div className="ml-0 sm:ml-12 space-y-3 animate-fade-in mt-3">
          {/* FAQ quick picks */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-[#BADFE7]/40 uppercase tracking-widest font-bold self-center mr-1">Quick templates:</span>
            {FETS_FAQ_TEMPLATES.map(faq => (
              <button
                key={faq.q}
                onClick={() => applyFAQ(faq.a)}
                title={faq.q}
                className="text-[11px] bg-white/5 border border-[#BADFE7]/10 hover:border-[#FACC15]/30 text-[#BADFE7] px-2.5 py-1 rounded-lg transition-all hover:bg-white/10"
              >
                {faq.q}
              </button>
            ))}
          </div>
          <textarea
            value={answerText}
            onChange={e => setAnswerText(e.target.value)}
            className="sov-input w-full text-sm focus:ring-[#FACC15]/30 resize-none rounded-xl"
            rows={3}
            placeholder="Type your official answer as FETS..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !answerText.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#FACC15] to-[#CA8A04] hover:from-[#FEF08A] hover:to-[#FACC15] text-[#1a3a3d] text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
            >
              {submitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting...</>
              ) : (
                'Post Answer'
              )}
            </button>
            <button
              onClick={() => { setShowForm(false); setAnswerText('') }}
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

function BranchQA({ branch }: { branch: GBPBranch }) {
  const { questions, loading, error, answerQuestion } = useGBPQA(branch)
  const unanswered = questions.filter(q => !q.topAnswers?.some(a => a.author.type === 'MERCHANT')).length

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin h-8 w-8 text-[#FACC15]" />
      <span className="text-xs text-[#BADFE7]/60 uppercase tracking-widest">Loading questions...</span>
    </div>
  )

  if (error) return (
    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
      <span>{error}</span>
    </div>
  )

  if (questions.length === 0) return (
    <div className="text-center py-12 text-[#BADFE7]/40 text-sm font-medium">
      No questions yet from candidates on Google Maps.
    </div>
  )

  return (
    <div className="space-y-4">
      {unanswered > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(245,158,11,0.05)] mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
          <span className="font-semibold tracking-wide">
            {unanswered} unanswered question{unanswered > 1 ? 's' : ''} from candidates
          </span>
        </div>
      )}
      <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
        {questions.map(q => (
          <QuestionCard key={q.name} question={q} onAnswer={answerQuestion} />
        ))}
      </div>
    </div>
  )
}

export function GBPQandA() {
  const [activeTab, setActiveTab] = useState<GBPBranch>('cochin')

  return (
    <div className="sov-card border border-[#BADFE7]/10 p-5 md:p-6 rounded-2xl relative overflow-hidden flex flex-col h-fit">
      {/* Visual background card glow */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#FACC15]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#BADFE7]/10 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FACC15]" />
            <span>Candidate Q&amp;A</span>
          </h2>
          <p className="text-xs text-[#BADFE7]/50 mt-1">Questions from Google Maps visitors</p>
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
      <BranchQA key={activeTab} branch={activeTab} />
    </div>
  )
}
