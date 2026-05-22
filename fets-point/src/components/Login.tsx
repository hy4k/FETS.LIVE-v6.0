import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ArrowRight, Calendar, Users, Briefcase, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Stage = 'credentials' | 'launching'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  const [stage, setStage] = useState<Stage>('credentials')
  const [resetEmail, setResetEmail] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    setStage('launching')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
        setStage('credentials')
      }
    } catch (err: any) {
      const errorMessage = err.message === 'Failed to fetch'
        ? 'Network error: Unable to connect to the server. Please check your internet connection or disable adblockers.'
        : (err.message || 'Login failed')
      setError(errorMessage)
      setStage('credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return
    setLoading(true)
    setResetMessage(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) throw error
      setResetMessage({ type: 'success', text: 'Recovery link sent! Check your inbox.' })
    } catch (err: any) {
      const errorMessage = err.message === 'Failed to fetch'
        ? 'Network error: Unable to connect to the server. Please check your internet connection or disable adblockers.'
        : (err.message || 'Something went wrong')
      setResetMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const pageTransition = {
    initial: { opacity: 0, y: 30, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -20, filter: 'blur(6px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 md:p-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Ambient background with warm color theme */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7D046] via-[#F0C027] to-[#E2A80D]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.22)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(180,120,0,0.2)_0%,transparent_50%)]" />
        
        {/* Premium floating glass-like light circles */}
        <motion.div
          animate={{ y: [-40, 40, -40], x: [-25, 25, -25], scale: [1, 1.08, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[5%] right-[10%] w-[350px] h-[350px] rounded-full bg-white/[0.09] blur-2xl"
        />
        <motion.div
          animate={{ y: [30, -30, 30], x: [15, -25, 15], scale: [1, 1.12, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-white/[0.07] blur-xl"
        />
        <motion.div
          animate={{ y: [-20, 25, -20] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4.5 }}
          className="absolute top-[45%] right-[45%] w-[200px] h-[200px] rounded-full bg-orange-400/[0.1] blur-3xl"
        />

        {/* Dynamic Dot Pattern Mesh */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </motion.div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-[1.2fr_420px] gap-12 lg:gap-16 items-center my-auto">
        
        {/* Left column showcase - desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block text-white space-y-8"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-4.5 py-2 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">System Operations Active</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl xl:text-8xl font-black tracking-[-0.06em] leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              fets<span className="text-white/45">.</span>live
            </h1>
            <p className="max-w-2xl text-2xl xl:text-3xl font-bold leading-tight text-white/90 font-serif tracking-tight drop-shadow-sm">
              Unified command deck for test operations, candidate tracker, and center capacity.
            </p>
          </div>

          {/* Premium Showcase Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-3xl pt-4">
            {[
              {
                title: 'Exam Calendar',
                description: 'Manage daily exam sessions, optimize seating, and track capacities.',
                icon: Calendar
              },
              {
                title: 'Client Workspace',
                description: 'Track billable events, monitor invoices, and host client portals.',
                icon: Briefcase
              },
              {
                title: 'Staff Roster',
                description: 'Schedule examiners, view standbys, and coordinate operations.',
                icon: Users
              },
              {
                title: 'AI Intelligence',
                description: 'Analyze rosters, automate reports, and track center operations.',
                icon: Sparkles
              }
            ].map((card) => (
              <div 
                key={card.title} 
                className="rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-xl shadow-md hover:bg-white/15 hover:border-white/35 transition-all duration-300 group hover:translate-y-[-2px]"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                    <card.icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-white">{card.title}</div>
                </div>
                <div className="text-xs font-medium leading-relaxed text-white/70">{card.description}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column Login card */}
        <div className="w-full max-w-[420px] mx-auto rounded-[32px] border border-white/35 bg-white/12 px-8 py-10 backdrop-blur-xl shadow-[0_32px_80px_rgba(120,80,0,0.25)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_40px_100px_rgba(120,80,0,0.3)]">
          <AnimatePresence mode="wait">

            {stage === 'credentials' && !showForgot && (
              <motion.div key="credentials" {...pageTransition}>
                <div className="text-center mb-8">
                  <h2
                    className="text-white font-black tracking-[-0.04em] leading-none mb-2"
                    style={{ fontSize: 'clamp(36px, 10vw, 44px)', textShadow: '0 2px 20px rgba(0,0,0,0.05)' }}
                  >
                    fets<span className="opacity-45">.</span>live
                  </h2>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">Sign in to your workspace</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-4 py-3 bg-red-600/30 backdrop-blur-xl border border-red-500/40 rounded-xl text-white text-xs font-bold leading-relaxed"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/25 rounded-2xl text-white text-sm font-semibold placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300 shadow-sm focus:ring-2 focus:ring-white/20"
                        placeholder="name@fets.in"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-white/50 text-[10px] font-black hover:text-white/80 transition-colors uppercase tracking-wider"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/25 rounded-2xl text-white text-sm font-semibold placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300 shadow-sm focus:ring-2 focus:ring-white/20"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-4 bg-white text-[#9A6A00] font-black uppercase tracking-wider text-xs rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-amber-300 border-t-[#9A6A00] rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={14} className="opacity-80" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {stage === 'credentials' && showForgot && (
              <motion.div key="forgot" {...pageTransition}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-white" size={24} />
                  </div>
                  <h2 className="text-white font-black text-2xl mb-1 tracking-tight">Reset Password</h2>
                  <p className="text-white/50 text-xs font-bold">Enter your email to receive recovery instructions</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {resetMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`px-4 py-3 rounded-xl backdrop-blur-xl border text-xs font-bold leading-relaxed ${resetMessage.type === 'success'
                        ? 'bg-green-600/30 border-green-500/40 text-white'
                        : 'bg-red-600/30 border-red-500/40 text-white'
                        }`}
                    >
                      {resetMessage.text}
                    </motion.div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/40" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/25 rounded-2xl text-white text-sm font-semibold placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all duration-300 shadow-sm focus:ring-2 focus:ring-white/20"
                      placeholder="name@fets.in"
                      required
                      autoFocus
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-white text-[#9A6A00] font-black uppercase tracking-wider text-xs rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-amber-300 border-t-[#9A6A00] rounded-full animate-spin" />
                    ) : (
                      'Send Recovery Link'
                    )}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setShowForgot(false)}
                    className="w-full py-3 text-white/60 text-xs font-black hover:text-white/80 transition-colors uppercase tracking-wider text-center"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              </motion.div>
            )}

            {stage === 'launching' && (
              <motion.div
                key="launching"
                className="flex flex-col items-center justify-center text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6 relative">
                  <div className="w-12 h-12 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 bg-white rounded-full animate-ping" />
                  </div>
                </div>

                <h2 className="text-white font-black text-lg mb-1 tracking-tight">Launching workspace...</h2>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Setting up secure session</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Footer Branding */}
      <motion.div
        className="absolute bottom-5 left-0 right-0 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1.5">
          © {new Date().getFullYear()} FETS.LIVE · System Control
        </p>
        <a href="/privacy-policy" className="text-white/40 hover:text-white/80 text-[10px] font-bold uppercase tracking-wider transition-colors underline">
          Privacy Policy
        </a>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
      `}</style>
    </div>
  )
}
