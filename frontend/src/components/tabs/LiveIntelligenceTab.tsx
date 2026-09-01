import React from 'react';
import {
  SupportedSymbol,
  UserProfileKey,
  FourAgentsResponse,
  SynthesizedConsensus
} from '../../types';
import { SYMBOL_METADATA, USER_PROFILES, DEMO_PORTFOLIO } from '../../data/mockBackendData';
import { Badge } from '../common/Badge';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Zap,
  Target,
  BarChart3,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Clock,
  PieChart,
  Sliders,
  UserCheck,
  Building
} from 'lucide-react';

interface LiveIntelligenceTabProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  selectedProfile: UserProfileKey;
  onSelectProfile: (profile: UserProfileKey) => void;
  investmentPercentage: number;
  onInvestmentChange: (val: number) => void;
  agents: FourAgentsResponse;
  consensus: SynthesizedConsensus;
  onRunSimulation: () => void;
  isSimulatedSourceMissing?: boolean;
}

export const LiveIntelligenceTab: React.FC<LiveIntelligenceTabProps> = ({
  selectedSymbol,
  onSelectSymbol,
  selectedProfile,
  onSelectProfile,
  investmentPercentage,
  onInvestmentChange,
  agents,
  consensus,
  onRunSimulation,
  isSimulatedSourceMissing = false
}) => {
  const meta = SYMBOL_METADATA[selectedSymbol] || {
    name: selectedSymbol,
    sector: 'Equities',
    price: 1000.0,
    change: 0.0,
    changePercent: 0.0,
    sparkline: [1000, 1005, 995, 1002, 1000]
  };

  const isPos = meta.change >= 0;
  const profileData = USER_PROFILES[selectedProfile];
  const isOverLimit = agents.portfolio_risk.concentration === 'over_limit';

  const signalColors: Record<string, { bg: string; text: string; border: string }> = {
    STRONG_BUY: { bg: 'bg-emerald-950/70', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    BUY: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    ACCUMULATE: { bg: 'bg-teal-950/60', text: 'text-teal-300', border: 'border-teal-500/40' },
    NEUTRAL: { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700/50' },
    SUITABLE: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    BULLISH: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    BEARISH: { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-500/40' },
    CAUTION: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-500/40' },
    AVOID: { bg: 'bg-rose-950/70', text: 'text-rose-300', border: 'border-rose-500/40' },
    UNAVAILABLE: { bg: 'bg-slate-900', text: 'text-slate-500', border: 'border-slate-800' }
  };

  return (
    <div className="space-y-6">
      {/* Missing Source Bug Warning (Member 4 Rule 6) */}
      {isSimulatedSourceMissing && (
        <div className="p-4 rounded-xl bg-purple-950/70 border border-purple-500/60 text-purple-200 text-xs flex items-start gap-3 shadow-lg">
          <AlertOctagon className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-sm">
              Member 4 Rule 6 & 7 Verification: Missing Source Flag Active
            </strong>
            <p className="mt-0.5 text-purple-300">
              A claim has <code>source: null</code>. Per project rules, our UI flags this visibly as a bug rather than concealing the missing citation.
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: SIMPLE CONTROLS CARD */}
      <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#252b3d]">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Step 1: Choose Stock, Investor Profile & Allocation
          </h2>
          <span className="text-xs text-amber-400 font-mono">?? is_simulated: true � Not financial advice.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 1. Select Stock */}
          <div className="bg-[#10131b] p-3.5 rounded-xl border border-[#222738]">
            <span className="text-xs font-bold text-slate-400 block mb-2">1. Select Stock:</span>
            <div className="grid grid-cols-2 gap-2">
              {['TCS', 'RELIANCE', 'INFY', 'TATAMOTORS'].map((sym) => {
                const isSelected = selectedSymbol === sym;
                const isSupported = sym !== 'TATAMOTORS';
                return (
                  <button
                    key={sym}
                    onClick={() => onSelectSymbol(sym)}
                    className={`p-2.5 rounded-lg text-xs font-mono font-bold text-left border transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                        : 'bg-[#161922] text-slate-300 border-[#272d3e] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{sym}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-[10px] opacity-80 font-sans mt-0.5">
                      {isSupported ? (sym === 'RELIANCE' ? 'Energy' : 'IT Sector') : 'Unsupported'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Profile */}
          <div className="bg-[#10131b] p-3.5 rounded-xl border border-[#222738]">
            <span className="text-xs font-bold text-slate-400 block mb-2">2. Select Investor Risk Profile:</span>
            <div className="space-y-2">
              <button
                onClick={() => onSelectProfile('conservative')}
                className={`w-full p-2.5 rounded-lg text-xs text-left border transition-all ${
                  selectedProfile === 'conservative'
                    ? 'bg-sky-950 text-sky-200 border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                    : 'bg-[#161922] text-slate-400 border-[#272d3e] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>??? Conservative Profile</span>
                  <span className="text-[10px] font-mono">Max 30% Sector Limit</span>
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">Capital preservation focus</div>
              </button>

              <button
                onClick={() => onSelectProfile('aggressive')}
                className={`w-full p-2.5 rounded-lg text-xs text-left border transition-all ${
                  selectedProfile === 'aggressive'
                    ? 'bg-sky-950 text-sky-200 border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                    : 'bg-[#161922] text-slate-400 border-[#272d3e] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>? Aggressive Profile</span>
                  <span className="text-[10px] font-mono">Max 50% Sector Limit</span>
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">High growth & tech tolerance</div>
              </button>
            </div>
          </div>

          {/* 3. Proposed Allocation Slider */}
          <div className="bg-[#10131b] p-3.5 rounded-xl border border-[#222738] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400">3. Proposed Investment:</span>
                <span className="text-sm font-mono font-bold text-sky-400">+{investmentPercentage}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={investmentPercentage}
                onChange={(e) => onInvestmentChange(Number(e.target.value))}
                className="w-full accent-sky-500 mt-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5% (Rs 50k)</span>
                <span>14% (Default)</span>
                <span>35% (Rs 3.5L)</span>
              </div>
            </div>

            <button
              onClick={onRunSimulation}
              className="mt-3 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow"
            >
              <Sparkles className="w-4 h-4" />
              Re-Calculate 4 Agents
            </button>
          </div>
        </div>
      </div>

      {/* STEP 2: MASTER RECOMMENDATION BANNER */}
      <div
        className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-all ${
          isOverLimit
            ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
            : consensus.overallSignal === 'STRONG_BUY' || consensus.overallSignal === 'BUY'
            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
            : 'bg-slate-900 border-slate-700 text-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Step 2: Master Verdict
              </span>
              <Badge
                variant={isOverLimit ? 'coral' : 'mint'}
                size="md"
                dot
              >
                {isOverLimit ? 'CONCENTRATION LIMIT WARNING' : 'SUITABLE FOR PORTFOLIO'}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">For {selectedSymbol} ({selectedProfile} Profile)</span>
            </div>

            <h3 className="text-2xl font-black text-white mt-2">
              {isOverLimit
                ? `?? Caution: Adding ${investmentPercentage}% to ${selectedSymbol} exceeds your ${selectedProfile} sector limit`
                : `? Green Light: ${selectedSymbol} is suitable with positive multi-agent signals`}
            </h3>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-[#10131b] p-3 rounded-xl border border-slate-700 text-center min-w-[120px]">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Confidence</div>
              <div className="text-2xl font-black text-white font-mono">{consensus.overallConfidence}%</div>
            </div>

            <div
              className={`px-5 py-3 rounded-xl border text-center font-black text-sm uppercase tracking-wide shadow-md ${
                isOverLimit
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-emerald-500 text-black border-emerald-400'
              }`}
            >
              {consensus.overallSignal}
            </div>
          </div>
        </div>

        {/* Explainable Rationale */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#10131b]/90 p-4 rounded-xl border border-slate-700 text-xs leading-relaxed text-slate-200">
            <strong className="text-sky-300 font-mono uppercase text-[11px] block mb-1">
              Plain English Decision Summary:
            </strong>
            {consensus.executiveSummary}
          </div>

          <div className="bg-[#10131b]/90 p-4 rounded-xl border border-slate-700 text-xs space-y-2 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Current Sector Exposure:</span>
              <strong className="text-white">{agents.portfolio_risk.currentExposure}%</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Proposed Addition:</span>
              <strong className="text-sky-400">+{investmentPercentage}%</strong>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
              <span>Projected Exposure:</span>
              <span className={isOverLimit ? 'text-rose-400' : 'text-emerald-400'}>
                {consensus.projectedSectorExposure}% (Limit: {consensus.sectorLimit}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3: THE 4 AGENT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            Step 3: What Each of the 4 Specialized Agents Reported
          </h3>
          <span className="text-xs text-slate-400 font-mono">Simultaneous Concurrent Execution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Fundamental Agent Card */}
          <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 flex flex-col justify-between shadow-md hover:border-slate-600 transition-all">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-[#252b3d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <h4 className="text-base font-extrabold text-white">1. Fundamental Agent</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Evidence-grounded RAG over demo documents</p>
                </div>
                <Badge
                  variant={agents.fundamental.signal === 'BULLISH' ? 'mint' : agents.fundamental.signal === 'BEARISH' ? 'coral' : 'slate'}
                  size="md"
                >
                  {agents.fundamental.signal}
                </Badge>
              </div>

              <div className="mt-3.5 p-3 bg-[#10131b] rounded-xl border border-[#222738] text-xs text-slate-200 leading-relaxed">
                {agents.fundamental.summary}
              </div>

              {/* Exact Evidence Quotes */}
              <div className="mt-3.5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Exact Retrieved Evidence Quotes ({agents.fundamental.evidence.length} Chunks):
                </span>
                {agents.fundamental.evidence.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-2 bg-[#10131b] rounded">No document chunks found.</div>
                ) : (
                  agents.fundamental.evidence.map((ev, idx) => (
                    <div key={idx} className="text-xs text-slate-300 bg-[#10131b] p-3 rounded-xl border border-[#222738] leading-relaxed">
                      <span className="text-emerald-400 font-mono font-bold block mb-1">? Evidence Chunk #{idx + 1}:</span>
                      "{ev}"
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#252b3d] text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Source: <strong className="text-slate-300">{agents.fundamental.source}</strong></span>
              <span>Status: <strong className="text-emerald-400">{agents.fundamental.status}</strong> ({agents.fundamental.latency}ms)</span>
            </div>
          </div>

          {/* 2. Portfolio Risk Agent Card */}
          <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 flex flex-col justify-between shadow-md hover:border-slate-600 transition-all">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-[#252b3d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <h4 className="text-base font-extrabold text-white">2. Portfolio Risk Agent</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Deterministic sector exposure & limits math</p>
                </div>
                <Badge
                  variant={agents.portfolio_risk.signal === 'SUITABLE' ? 'mint' : 'coral'}
                  size="md"
                >
                  {agents.portfolio_risk.signal}
                </Badge>
              </div>

              {/* Math Visual */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
                <div className="bg-[#10131b] p-2.5 rounded-xl border border-[#222738]">
                  <span className="text-[10px] text-slate-400 block">Current Exposure</span>
                  <strong className="text-white text-sm">{agents.portfolio_risk.currentExposure}%</strong>
                </div>
                <div className="bg-[#10131b] p-2.5 rounded-xl border border-[#222738]">
                  <span className="text-[10px] text-slate-400 block">Projected (+{investmentPercentage}%)</span>
                  <strong className={`text-sm ${isOverLimit ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {agents.portfolio_risk.projectedExposure}%
                  </strong>
                </div>
                <div className="bg-[#10131b] p-2.5 rounded-xl border border-[#222738]">
                  <span className="text-[10px] text-slate-400 block">Sector Limit</span>
                  <strong className="text-white text-sm">{consensus.sectorLimit}%</strong>
                </div>
              </div>

              <div className="mt-3.5 p-3 bg-[#10131b] rounded-xl border border-[#222738] text-xs text-slate-200 leading-relaxed">
                {agents.portfolio_risk.summary}
              </div>

              <div className="mt-3.5 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Deterministic Math Evidence:
                </span>
                {agents.portfolio_risk.evidence.map((ev, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-[#10131b] p-2 rounded-lg border border-[#222738]">
                    <span className="text-rose-400 font-bold">�</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#252b3d] text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Source: <strong className="text-slate-300">data/portfolios.json</strong></span>
              <span>Status: <strong className="text-emerald-400">{agents.portfolio_risk.status}</strong> ({agents.portfolio_risk.latency}ms)</span>
            </div>
          </div>

          {/* 3. News Sentiment Agent Card */}
          <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 flex flex-col justify-between shadow-md hover:border-slate-600 transition-all">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-[#252b3d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <h4 className="text-base font-extrabold text-white">3. News Sentiment Agent</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Sentiment analysis feed stub (Member 2)</p>
                </div>
                <Badge
                  variant={agents.sentiment.status === 'unavailable' ? 'coral' : agents.sentiment.signal === 'BULLISH' ? 'mint' : 'slate'}
                  size="md"
                >
                  {agents.sentiment.signal}
                </Badge>
              </div>

              {agents.sentiment.status === 'unavailable' && (
                <div className="mt-3 p-2.5 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-mono">
                  ?? Status: UNAVAILABLE (Simulated Feed Failure)
                </div>
              )}

              <div className="mt-3.5 p-3 bg-[#10131b] rounded-xl border border-[#222738] text-xs text-slate-200 leading-relaxed">
                {agents.sentiment.summary}
              </div>

              <div className="mt-3.5 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Simulated Headlines:
                </span>
                {agents.sentiment.evidence.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-2 bg-[#10131b] rounded">No headlines available.</div>
                ) : (
                  agents.sentiment.evidence.map((ev, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-[#10131b] p-2 rounded-lg border border-[#222738]">
                      <span className="text-amber-400 font-bold">�</span>
                      <span>{ev}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#252b3d] text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Source: <strong className="text-slate-300">{agents.sentiment.source}</strong></span>
              <span>Status: <strong className={agents.sentiment.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>{agents.sentiment.status}</strong> ({agents.sentiment.latency}ms)</span>
            </div>
          </div>

          {/* 4. Technical Analysis Agent Card */}
          <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 flex flex-col justify-between shadow-md hover:border-slate-600 transition-all">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-[#252b3d]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-400" />
                    <h4 className="text-base font-extrabold text-white">4. Technical Analysis Agent</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Price & momentum analysis stub (Member 2)</p>
                </div>
                <Badge
                  variant={agents.technical.signal === 'BULLISH' ? 'mint' : 'slate'}
                  size="md"
                >
                  {agents.technical.signal}
                </Badge>
              </div>

              <div className="mt-3.5 p-3 bg-[#10131b] rounded-xl border border-[#222738] text-xs text-slate-200 leading-relaxed">
                {agents.technical.summary}
              </div>

              <div className="mt-3.5 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Technical Indicators:
                </span>
                {agents.technical.evidence.map((ev, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-[#10131b] p-2 rounded-lg border border-[#222738]">
                    <span className="text-sky-400 font-bold">�</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#252b3d] text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Source: <strong className="text-slate-300">{agents.technical.source}</strong></span>
              <span>Status: <strong className="text-emerald-400">{agents.technical.status}</strong> ({agents.technical.latency}ms)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
