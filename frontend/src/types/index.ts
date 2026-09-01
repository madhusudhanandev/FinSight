export type SupportedSymbol = 'TCS' | 'RELIANCE' | 'INFY' | 'HDFCBANK' | 'TATAMOTORS';

export type UserProfileKey = 'conservative' | 'aggressive';

export interface AgentApiResponse<T> {
  status: 'success' | 'partial' | 'error';
  data: T;
  source: string | null;
  is_simulated: true;
  disclaimer: 'Not financial advice.';
  error: string | null;
}

export interface FundamentalAgentOutput {
  name: 'Fundamental Agent';
  status: 'completed' | 'insufficient_data' | 'error';
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  summary: string;
  evidence: string[];
  source: string;
  latency: number;
}

export interface PortfolioRiskAgentOutput {
  name: 'Portfolio Risk Agent';
  status: 'completed' | 'insufficient_data' | 'error';
  signal: 'SUITABLE' | 'CAUTION' | 'NEUTRAL';
  confidence: number;
  summary: string;
  evidence: string[];
  source: string;
  latency: number;
  currentExposure: number | 'unavailable';
  projectedExposure: number | 'unavailable';
  concentration: 'within_limit' | 'over_limit' | 'unavailable';
}

export interface SentimentAgentOutput {
  name: 'News Sentiment Agent';
  status: 'completed' | 'unavailable' | 'error';
  signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'UNAVAILABLE';
  confidence: number;
  summary: string;
  evidence: string[];
  source: string;
  latency: number;
}

export interface TechnicalAgentOutput {
  name: 'Technical Analysis Agent';
  status: 'completed' | 'error';
  signal: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  confidence: number;
  summary: string;
  evidence: string[];
  source: string;
  latency: number;
}

export interface FourAgentsResponse {
  fundamental: FundamentalAgentOutput;
  portfolio_risk: PortfolioRiskAgentOutput;
  sentiment: SentimentAgentOutput;
  technical: TechnicalAgentOutput;
}

export interface SynthesizedConsensus {
  symbol: string;
  profile: UserProfileKey;
  investmentPercentage: number;
  overallSignal: 'STRONG_BUY' | 'BUY' | 'ACCUMULATE' | 'NEUTRAL' | 'CAUTION' | 'AVOID';
  overallConfidence: number;
  executiveSummary: string;
  suitabilityStatus: 'SUITABLE_FOR_PORTFOLIO' | 'CONCENTRATION_WARNING' | 'HIGH_VOLATILITY_ALERT';
  projectedSectorExposure: number | 'unavailable';
  sectorLimit: number;
  warnings: string[];
  timestamp: string;
}

export interface DemoDocumentChunk {
  id: string;
  symbol: string;
  content: string;
  source: string;
  page: number;
  date: string;
  sentimentBias: 'positive' | 'negative' | 'neutral';
}

export interface UserProfileData {
  name: string;
  max_sector_exposure: number;
  max_volatility: number;
  description: string;
  lossTolerance: string;
  typicalHoldDuration: string;
}

export interface PortfolioHoldingData {
  symbol: string;
  name: string;
  sector: string;
  value: number;
  volatility: number;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
}

export interface DegradedConfig {
  simulateSentimentFailure: boolean;
  simulateMissingFiling: boolean;
  simulateMissingSource: boolean;
  unsupportedSymbolOverride?: boolean;
}
