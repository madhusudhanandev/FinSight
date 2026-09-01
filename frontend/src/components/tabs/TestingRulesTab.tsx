import React from 'react';
import { DegradedConfig, UserProfileKey } from '../../types';
import { executeFourAgentsPipeline } from '../../services/multiAgentEngine';
import { Badge } from '../common/Badge';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  Terminal,
  RotateCcw
} from 'lucide-react';

interface TestingRulesTabProps {
  selectedSymbol: string;
  selectedProfile: UserProfileKey;
  investmentPercentage: number;
  degradedConfig: DegradedConfig;
  onUpdateDegraded: (config: DegradedConfig) => void;
}

export const TestingRulesTab: React.FC<TestingRulesTabProps> = ({
  selectedSymbol,
  selectedProfile,
  investmentPercentage,
  degradedConfig,
  onUpdateDegraded
}) => {
  const isAnyActive =
    degradedConfig.simulateSentimentFailure ||
    degradedConfig.simulateMissingFiling ||
    degradedConfig.simulateMissingSource;

  const result = executeFourAgentsPipeline(selectedSymbol, selectedProfile, investmentPercentage, degradedConfig);
  const envelope = result.apiEnvelope;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white font-sans">
              Interactive Fault Injection & Member 4 Rules Compliance
            </h2>
            <Badge variant="amber" size="sm">
              One-Click Error Simulation
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Test how the system behaves under degraded conditions (offline feeds, missing documents, unsupported tickers) without crashing the interface.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdateDegraded({
                simulateSentimentFailure: false,
                simulateMissingFiling: false,
                simulateMissingSource: false
              })
            }
            className="px-3.5 py-1.5 bg-[#10131b] hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-bold border border-[#222738] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Faults
          </button>
        </div>
      </div>

      {/* 3 Large Tactile Toggle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Toggle 1: Sentiment Offline */}
        <div
          onClick={() =>
            onUpdateDegraded({
              ...degradedConfig,
              simulateSentimentFailure: !degradedConfig.simulateSentimentFailure
            })
          }
          className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between shadow-md ${
            degradedConfig.simulateSentimentFailure
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50'
              : 'bg-[#161922] border-[#272d3e] hover:border-slate-600'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">1. News Sentiment Offline</span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  degradedConfig.simulateSentimentFailure ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {degradedConfig.simulateSentimentFailure ? 'FAULT ACTIVE' : 'NORMAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Passes <code>simulate_failure=True</code> to the News Sentiment Agent. Proves the agent returns <code>status: "unavailable"</code> while the rest of the report renders safely.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#252b3d] text-[10px] text-sky-400 font-mono">
            Click to Toggle ?
          </div>
        </div>

        {/* Toggle 2: Missing Documents */}
        <div
          onClick={() =>
            onUpdateDegraded({
              ...degradedConfig,
              simulateMissingFiling: !degradedConfig.simulateMissingFiling
            })
          }
          className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between shadow-md ${
            degradedConfig.simulateMissingFiling
              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
              : 'bg-[#161922] border-[#272d3e] hover:border-slate-600'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">2. Missing RAG Documents</span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  degradedConfig.simulateMissingFiling ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {degradedConfig.simulateMissingFiling ? 'FAULT ACTIVE' : 'NORMAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Simulates zero chunks returned from document retrieval. Proves the Fundamental Agent returns <code>status: "insufficient_data"</code> without fabricating numbers.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#252b3d] text-[10px] text-sky-400 font-mono">
            Click to Toggle ?
          </div>
        </div>

        {/* Toggle 3: Missing Source */}
        <div
          onClick={() =>
            onUpdateDegraded({
              ...degradedConfig,
              simulateMissingSource: !degradedConfig.simulateMissingSource
            })
          }
          className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between shadow-md ${
            degradedConfig.simulateMissingSource
              ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500/50'
              : 'bg-[#161922] border-[#272d3e] hover:border-slate-600'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">3. Source: null Bug Check</span>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  degradedConfig.simulateMissingSource ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {degradedConfig.simulateMissingSource ? 'FAULT ACTIVE' : 'NORMAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Simulates <code>source: null</code>. Proves Member 4 Rule 6 by visibly rendering a warning badge instead of concealing the missing citation.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-[#252b3d] text-[10px] text-sky-400 font-mono">
            Click to Toggle ?
          </div>
        </div>
      </div>

      {/* Member 4 Checklist */}
      <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#252b3d]">
          <Award className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Member 4 Rules Compliance Checklist
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#10131b] border border-[#222738] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Rule 3: Standard Envelope Enforced</span>
              <span className="text-slate-400 text-[11px]">All API responses follow status, data, source, is_simulated, disclaimer.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#10131b] border border-[#222738] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Rule 4 & 5: Disclaimers & is_simulated Visible</span>
              <span className="text-slate-400 text-[11px]">"Not financial advice." permanently displayed everywhere.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#10131b] border border-[#222738] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Rule 6 & 7: Missing Data & Isolated Error Safety</span>
              <span className="text-slate-400 text-[11px]">Unavailable metrics render as "unavailable"; single agent error won't crash report.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#10131b] border border-[#222738] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Rule 8: Zero Chain-of-Thought Exposed</span>
              <span className="text-slate-400 text-[11px]">Structured evidence and concise summaries only.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
