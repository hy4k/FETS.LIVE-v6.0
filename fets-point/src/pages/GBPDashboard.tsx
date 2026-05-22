import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Star, 
  FileText, 
  HelpCircle, 
  BarChart3, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { GBPReviewPanel } from '../components/GBP';
import { GBPInsightsPanel } from '../components/GBP';
import { GBPPostPublisher } from '../components/GBP';
import { GBPQandA } from '../components/GBP';
import { useGBP, useGBPDemoMode } from '../hooks/useGBP';

type GBPTab = 'overview' | 'reviews' | 'posts' | 'qa' | 'insights';
type Branch = 'cochin' | 'calicut';

const GBPDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GBPTab>('overview');
  const [activeBranch, setActiveBranch] = useState<Branch>('cochin');
  const { businessInfo, loading, error, isDemo } = useGBP(activeBranch);
  const globalDemo = useGBPDemoMode();

  const tabs: { id: GBPTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
    { id: 'posts', label: 'Posts', icon: <FileText className="w-4 h-4" /> },
    { id: 'qa', label: 'Q&A', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a3a3d] text-[#BADFE7] p-4 md:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#BADFE7]/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#FACC15] font-serif">
              Google Business Profile
            </h1>
            <p className="text-[#BADFE7]/60 text-sm mt-1">
              Manage FETS.LIVE online storefront configurations, posts, reviews, and insights.
            </p>
          </div>
          
          {/* Branch Selector */}
          <div className="flex bg-[#0d1d1f]/60 p-1.5 rounded-xl border border-[#BADFE7]/10 w-fit self-start md:self-center shadow-lg">
            {(['cochin', 'calicut'] as Branch[]).map((branch) => (
              <button
                key={branch}
                onClick={() => setActiveBranch(branch)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${
                  activeBranch === branch
                    ? 'bg-[#FACC15] text-[#1a3a3d] shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                    : 'text-[#BADFE7]/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {branch === 'cochin' ? 'Cochin' : 'Calicut'}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Mode / API Approval Warning Banner */}
        {(isDemo || globalDemo) && (
          <div className="sov-glass border border-[#FACC15]/30 rounded-2xl p-4 md:p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(250,204,21,0.05)] animate-fade-in">
            <div className="p-2.5 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/20 flex-shrink-0 text-[#FACC15] animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#FACC15] tracking-wide uppercase">
                Demo Mode — Google API Approval Pending
              </h4>
              <p className="text-xs text-[#BADFE7]/80 leading-relaxed">
                Showing sample data. Once Google approves the Business Profile API access, live data will appear automatically.
                Actions like replying to reviews and posting updates will work locally in demo mode but won't sync to Google.
              </p>
            </div>
          </div>
        )}

        {/* Business Info Header Card */}
        {loading ? (
          <div className="sov-card animate-pulse space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-white/5 rounded-xl border border-[#BADFE7]/10" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-white/10 rounded w-1/3" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          </div>
        ) : businessInfo ? (
          <div className="sov-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden group">
            {/* Background glowing gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FACC15]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 transition-all duration-500 group-hover:from-[#FACC15]/10" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#0d1d1f] border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15] shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#FACC15] tracking-wide">{businessInfo.title}</h2>
                <div className="flex items-center gap-1.5 text-xs text-[#BADFE7]/70">
                  <MapPin className="w-3.5 h-3.5 text-[#FACC15]/80 flex-shrink-0" />
                  <span>{businessInfo.storefrontAddress?.addressLines?.join(', ') || 'No address details'}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Storefront
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {businessInfo.metadata?.mapsUri && (
              <a
                href={businessInfo.metadata.mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#FACC15] bg-[#FACC15]/5 border border-[#FACC15]/20 hover:bg-[#FACC15] hover:text-[#1a3a3d] transition-all duration-300 shadow-md"
              >
                <span>View on Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : null}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)] animate-fade-in">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="flex overflow-x-auto bg-[#0d1d1f]/60 p-1 rounded-xl border border-[#BADFE7]/10 w-fit shadow-md scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#FACC15] text-[#1a3a3d] shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                  : 'text-[#BADFE7]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GBPReviewPanel />
              <GBPInsightsPanel />
            </div>
          )}
          {activeTab === 'reviews' && <GBPReviewPanel />}
          {activeTab === 'posts' && <GBPPostPublisher />}
          {activeTab === 'qa' && <GBPQandA />}
          {activeTab === 'insights' && <GBPInsightsPanel />}
        </div>
      </div>
    </div>
  );
};

export default GBPDashboard;

