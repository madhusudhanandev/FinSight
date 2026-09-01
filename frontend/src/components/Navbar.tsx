import React from 'react';
import { UserProfileKey, DegradedConfig } from '../types';
import { Badge } from './common/Badge';
import {
  Activity,
  Database,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Compass,
  Cpu
} from 'lucide-react';

export type TabId = 'analysis' | 'data_vault' | 'testing';

interface NavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  selectedProfile: UserProfileKey;
  onSelectProfile: (profile: UserProfileKey) => void;
  investmentPercentage: number;
  onInvestmentChange: (val: number) => void;
  degradedConfig: DegradedConfig;
  onUpdateDegraded: (config: DegradedConfig) => void;
  latencyMs: number;
  apiStatus: 'success' | 'partial' | 'error';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  selectedSymbol,
  onSelectSymbol,
  selectedProfile,
  onSelectProfile,
  investmentPercentage,
  onInvestmentChange,
  degradedConfig,
  onUpdateDegraded,
  latencyMs,
  apiStatus
}) => {
  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'analysis', label: '1. Multi-Agent Analysis', icon: Activity },
    { id: 'data_vault', label: '2. Documents & Portfolio Data', icon: Database },
    { id: 'testing', label: '3. Test Errors & Rules', icon: ShieldAlert }
  ];

  return (
    <header className="border-b border-[#272d3e] bg-[#12151e] sticky top-0 z-40">
      {/* Top Disclaimer Strip */}
      <div className="bg-[#161a26] border-b border-[#252b3d] py-1 px-4 text-xs font-mono text-slate-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="amber" size="sm" dot>
            SIMULATED DEMO
          </Badge>
          <span className="font-bold text-amber-300">NOT FINANCIAL ADVICE � FinSight Multi-Agent Intelligence</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span>Ownership: <strong className="text-slate-200">/frontend-api/ (Member 4)</strong></span>
          <span>�</span>
          <span>Branch: <strong className="text-slate-200">mem4</strong></span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-sans">
                  FinSight
                </h1>
                <Badge variant="cobalt" size="sm">Multi-Agent AI</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Simple, Grounded Financial Intelligence for Retail Investors
              </p>
            </div>
          </div>

          {/* 3 Clear Big Tab Buttons */}
          <div className="flex items-center gap-2 bg-[#0a0d14] p-1.5 rounded-xl border border-[#272d3e]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#161922]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* System Status */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">API Status:</span>
              {apiStatus === 'success' && (
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                </span>
              )}
              {apiStatus === 'partial' && (
                <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> PARTIAL
                </span>
              )}
              {apiStatus === 'error' && (
                <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> ERROR
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>{latencyMs}ms</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
