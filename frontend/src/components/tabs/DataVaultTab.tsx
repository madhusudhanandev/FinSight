import React, { useState } from 'react';
import { DEMO_DOCUMENTS, DEMO_PORTFOLIO, SUPPORTED_SYMBOLS } from '../../data/mockBackendData';
import { DemoDocumentChunk } from '../../types';
import { Badge } from '../common/Badge';
import {
  Database,
  Search,
  FileText,
  PieChart,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export const DataVaultTab: React.FC = () => {
  const [selectedDocSymbol, setSelectedDocSymbol] = useState<string>('TCS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allChunks = Object.values(DEMO_DOCUMENTS).flat();
  const filteredChunks = allChunks.filter((chunk) => {
    const matchesSymbol = selectedDocSymbol === 'ALL' || chunk.symbol === selectedDocSymbol;
    const matchesSearch =
      searchQuery.trim() === '' ||
      chunk.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chunk.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSymbol && matchesSearch;
  });

  const holdings = DEMO_PORTFOLIO.holdings;
  const totalValue = DEMO_PORTFOLIO.total_value;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white font-sans">
              Knowledge Base & Portfolio Data Files
            </h2>
            <Badge variant="mint" size="sm">
              Primary Data Sources
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inspecting the underlying raw data sources consumed by the 4 Python agents: <strong>Demo Document Chunks</strong> for RAG, and <strong>data/portfolios.json</strong> for risk exposure math.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-[#10131b] p-3 rounded-xl border border-[#222738]">
          <span>Total Portfolio Value: <strong className="text-white">Rs {totalValue.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Demo Document Corpus */}
        <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#252b3d]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Demo Financial Documents (RAG Layer)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">{filteredChunks.length} Chunks</span>
          </div>

          {/* Filters */}
          <div className="flex gap-2 items-center flex-wrap">
            {['ALL', ...SUPPORTED_SYMBOLS].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedDocSymbol(sym)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  selectedDocSymbol === sym
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-[#10131b] text-slate-400 border-[#222738] hover:text-white'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Chunks List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredChunks.map((chunk) => (
              <div key={chunk.id} className="p-3.5 rounded-xl bg-[#10131b] border border-[#222738] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-sky-400">{chunk.symbol} � {chunk.id}</span>
                  <span className="text-slate-400 text-[10px]">{chunk.date}</span>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans">
                  "{chunk.content}"
                </div>
                <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-[#1e2330] flex justify-between">
                  <span>Source: {chunk.source}</span>
                  <span>Page {chunk.page}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: data/portfolios.json Holdings */}
        <div className="bg-[#161922] border border-[#272d3e] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#252b3d]">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Current Holdings (data/portfolios.json)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{holdings.length} Positions</span>
          </div>

          <div className="space-y-3">
            {holdings.map((h) => {
              const weight = ((h.value / totalValue) * 100).toFixed(1);
              return (
                <div key={h.symbol} className="p-3.5 rounded-xl bg-[#10131b] border border-[#222738] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white font-mono text-sm">{h.symbol}</span>
                      <span className="text-xs text-slate-400 ml-2">{h.name}</span>
                    </div>
                    <Badge variant="cobalt" size="sm">{weight}% Weight</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                    <div className="bg-[#161922] p-2 rounded border border-[#272d3e]">
                      <span className="text-[10px] text-slate-500 block">Sector</span>
                      <span className="text-slate-300 truncate block">{h.sector}</span>
                    </div>
                    <div className="bg-[#161922] p-2 rounded border border-[#272d3e]">
                      <span className="text-[10px] text-slate-500 block">Holding Value</span>
                      <span className="text-slate-200 font-bold block">Rs {h.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-[#161922] p-2 rounded border border-[#272d3e]">
                      <span className="text-[10px] text-slate-500 block">Volatility</span>
                      <span className="text-slate-300 block">{h.volatility}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
