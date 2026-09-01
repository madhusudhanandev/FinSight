import React, { useState, useMemo } from 'react';
import { UserProfileKey, DegradedConfig } from './types';
import { executeFourAgentsPipeline } from './services/multiAgentEngine';
import { Navbar, TabId } from './components/Navbar';
import { LiveIntelligenceTab } from './components/tabs/LiveIntelligenceTab';
import { DataVaultTab } from './components/tabs/DataVaultTab';
import { TestingRulesTab } from './components/tabs/TestingRulesTab';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('analysis');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('TCS');
  const [selectedProfile, setSelectedProfile] = useState<UserProfileKey>('conservative');
  const [investmentPercentage, setInvestmentPercentage] = useState<number>(14);
  const [degradedConfig, setDegradedConfig] = useState<DegradedConfig>({
    simulateSentimentFailure: false,
    simulateMissingFiling: false,
    simulateMissingSource: false
  });
  const [simulationTrigger, setSimulationTrigger] = useState(0);

  const pipelineResult = useMemo(
    () => executeFourAgentsPipeline(selectedSymbol, selectedProfile, investmentPercentage, degradedConfig),
    [selectedSymbol, selectedProfile, investmentPercentage, degradedConfig, simulationTrigger]
  );

  const apiEnvelope = pipelineResult.apiEnvelope;
  const agents = apiEnvelope.data.agents;
  const consensus = apiEnvelope.data.consensus;

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 font-sans flex flex-col selection:bg-sky-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
        selectedProfile={selectedProfile}
        onSelectProfile={setSelectedProfile}
        investmentPercentage={investmentPercentage}
        onInvestmentChange={setInvestmentPercentage}
        degradedConfig={degradedConfig}
        onUpdateDegraded={setDegradedConfig}
        latencyMs={pipelineResult.totalLatencyMs}
        apiStatus={apiEnvelope.status}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analysis' && (
          <LiveIntelligenceTab
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            selectedProfile={selectedProfile}
            onSelectProfile={setSelectedProfile}
            investmentPercentage={investmentPercentage}
            onInvestmentChange={setInvestmentPercentage}
            agents={agents}
            consensus={consensus}
            onRunSimulation={() => setSimulationTrigger((prev) => prev + 1)}
            isSimulatedSourceMissing={degradedConfig.simulateMissingSource}
          />
        )}

        {activeTab === 'data_vault' && <DataVaultTab />}

        {activeTab === 'testing' && (
          <TestingRulesTab
            selectedSymbol={selectedSymbol}
            selectedProfile={selectedProfile}
            investmentPercentage={investmentPercentage}
            degradedConfig={degradedConfig}
            onUpdateDegraded={setDegradedConfig}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#222738] bg-[#0c0e14] py-4 px-4 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>FinSight � /frontend-api/ (Member 4) � Branch: mem4</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-amber-300 font-semibold">
            <span>NOT FINANCIAL ADVICE</span>
            <span>�</span>
            <span>SIMULATED DEMO CORPUS (is_simulated: true)</span>
            <span>�</span>
            <span>4 Python Backend Agents</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
