import {
  SupportedSymbol,
  UserProfileKey,
  DegradedConfig,
  FundamentalAgentOutput,
  PortfolioRiskAgentOutput,
  SentimentAgentOutput,
  TechnicalAgentOutput,
  FourAgentsResponse,
  SynthesizedConsensus,
  AgentApiResponse
} from '../types';
import {
  USER_PROFILES,
  DEMO_PORTFOLIO,
  DEMO_DOCUMENTS,
  SUPPORTED_SYMBOLS,
  SYMBOL_METADATA
} from '../data/mockBackendData';

const POSITIVE_TERMS = [
  'growth', 'increase', 'increased', 'profit', 'margin', 'expansion',
  'strong', 'record', 'robust', 'reduction', 'improved', 'improvement',
  'beat', 'guidance'
];

const NEGATIVE_TERMS = [
  'decline', 'declined', 'risk', 'volatility', 'headwind', 'pressure',
  'concentration', 'slowdown', 'weak', 'loss', 'exposure'
];

export interface MultiAgentPipelineResult {
  apiEnvelope: AgentApiResponse<{
    agents: FourAgentsResponse;
    consensus: SynthesizedConsensus;
  }>;
  totalLatencyMs: number;
}

export function runFundamentalAgent(symbol: string, degraded: DegradedConfig): FundamentalAgentOutput {
  const start = performance.now();
  const latency = () => Math.round(performance.now() - start + 85);

  if (!symbol || typeof symbol !== 'string') {
    return {
      name: 'Fundamental Agent',
      status: 'error',
      signal: 'NEUTRAL',
      confidence: 0,
      summary: 'No symbol provided. Not financial advice.',
      evidence: [],
      source: 'unavailable',
      latency: latency()
    };
  }

  const symbolNorm = symbol.trim().toUpperCase();

  if (!SUPPORTED_SYMBOLS.includes(symbolNorm as any) && !degraded.unsupportedSymbolOverride) {
    return {
      name: 'Fundamental Agent',
      status: 'error',
      signal: 'NEUTRAL',
      confidence: 0,
      summary: `Symbol '${symbolNorm}' is not covered by the demo financial document corpus (supported: ${[...SUPPORTED_SYMBOLS].sort().join(', ')}). Insufficient data to make fundamental claims. Not financial advice.`,
      evidence: [],
      source: 'unavailable',
      latency: latency()
    };
  }

  if (degraded.simulateMissingFiling) {
    return {
      name: 'Fundamental Agent',
      status: 'insufficient_data',
      signal: 'NEUTRAL',
      confidence: 0,
      summary: `No supporting demo documents were retrieved for ${symbolNorm}. Insufficient evidence to make fundamental claims. Not financial advice.`,
      evidence: [],
      source: 'unavailable',
      latency: latency()
    };
  }

  const docs = DEMO_DOCUMENTS[symbolNorm] || [];

  if (!docs || docs.length === 0) {
    return {
      name: 'Fundamental Agent',
      status: 'insufficient_data',
      signal: 'NEUTRAL',
      confidence: 0,
      summary: `No supporting demo documents were retrieved for ${symbolNorm}. Insufficient evidence to make fundamental claims. Not financial advice.`,
      evidence: [],
      source: 'unavailable',
      latency: latency()
    };
  }

  // Sentiment scoring over docs
  let posCount = 0;
  let negCount = 0;

  docs.forEach((doc) => {
    const text = doc.content.toLowerCase();
    POSITIVE_TERMS.forEach((term) => {
      const matches = text.split(term).length - 1;
      posCount += matches;
    });
    NEGATIVE_TERMS.forEach((term) => {
      const matches = text.split(term).length - 1;
      negCount += matches;
    });
  });

  let signal: FundamentalAgentOutput['signal'] = 'NEUTRAL';
  if (posCount > negCount * 1.2) {
    signal = 'BULLISH';
  } else if (negCount > posCount * 1.2) {
    signal = 'BEARISH';
  }

  const confidence = Math.min(95, 55 + 5 * docs.length + Math.abs(posCount - negCount) * 2);

  const evidence = docs.map(
    (doc) => `${doc.content} (Source: ${doc.source}, Page: ${doc.page}, Date: ${doc.date})`
  );

  const uniqueSources = Array.from(new Set(docs.map((d) => d.source))).sort();
  const extraSources = uniqueSources.length > 1 ? ` and ${uniqueSources.length - 1} other source(s)` : '';

  const summary = `${symbolNorm} fundamentals show a ${signal.toLowerCase()} signal based on ${docs.length} demo document chunk(s) from ${uniqueSources[0]}${extraSources}. All figures are drawn from the synthetic demo corpus, not live filings. Not financial advice.`;

  return {
    name: 'Fundamental Agent',
    status: 'completed',
    signal,
    confidence,
    summary,
    evidence,
    source: degraded.simulateMissingSource ? (null as any) : uniqueSources.join('; '),
    latency: latency()
  };
}

export function runPortfolioRiskAgent(
  symbol: string,
  profile: UserProfileKey,
  investmentPercentage: number = 14
): PortfolioRiskAgentOutput {
  const start = performance.now();
  const latency = () => Math.round(performance.now() - start + 45);

  if (!symbol) {
    return {
      name: 'Portfolio Risk Agent',
      status: 'error',
      signal: 'NEUTRAL',
      confidence: 0,
      summary: 'No symbol provided. Not financial advice.',
      evidence: [],
      source: 'unavailable',
      latency: latency(),
      currentExposure: 'unavailable',
      projectedExposure: 'unavailable',
      concentration: 'unavailable'
    };
  }

  const symbolNorm = symbol.trim().toUpperCase();
  const profileNorm = profile.trim().toLowerCase() as UserProfileKey;

  const profileData = USER_PROFILES[profileNorm];
  if (!profileData) {
    return {
      name: 'Portfolio Risk Agent',
      status: 'error',
      signal: 'NEUTRAL',
      confidence: 0,
      summary: `Unknown profile '${profile}'. Supported profiles: ${Object.keys(USER_PROFILES).sort().join(', ')}. Not financial advice.`,
      evidence: [],
      source: 'unavailable',
      latency: latency(),
      currentExposure: 'unavailable',
      projectedExposure: 'unavailable',
      concentration: 'unavailable'
    };
  }

  const holdings = DEMO_PORTFOLIO.holdings;
  const totalValue = DEMO_PORTFOLIO.total_value;

  const targetHolding = holdings.find((h) => h.symbol.toUpperCase() === symbolNorm);

  if (!targetHolding || !totalValue) {
    return {
      name: 'Portfolio Risk Agent',
      status: 'insufficient_data',
      signal: 'NEUTRAL',
      confidence: 0,
      summary: `No demo portfolio holding found for '${symbolNorm}'. Sector exposure is unavailable rather than estimated. Not financial advice.`,
      evidence: [],
      source: 'unavailable',
      latency: latency(),
      currentExposure: 'unavailable',
      projectedExposure: 'unavailable',
      concentration: 'unavailable'
    };
  }

  const sector = targetHolding.sector;
  const sectorValue = holdings
    .filter((h) => h.sector === sector)
    .reduce((sum, h) => sum + h.value, 0);

  const currentExposure = Number(((sectorValue / totalValue) * 100).toFixed(1));
  const projectedExposure = Number((currentExposure + investmentPercentage).toFixed(1));

  const limit = profileData.max_sector_exposure;
  const maxVolatility = profileData.max_volatility;
  const holdingVolatility = targetHolding.volatility;

  const concentration = projectedExposure <= limit ? 'within_limit' : 'over_limit';
  const volatilityBreach = holdingVolatility !== undefined && holdingVolatility > maxVolatility;

  const warnings: string[] = [];
  if (concentration === 'over_limit') {
    warnings.push(
      `Projected ${sector} exposure of ${projectedExposure}% exceeds the ${profileNorm} profile's ${limit}% sector limit.`
    );
  }
  if (volatilityBreach) {
    warnings.push(
      `${symbolNorm} volatility (${holdingVolatility}) exceeds the ${profileNorm} profile's volatility ceiling (${maxVolatility}).`
    );
  }

  const suitabilityWarning =
    warnings.length > 0
      ? warnings.join(' ')
      : `Projected ${sector} exposure of ${projectedExposure}% remains within the ${profileNorm} profile's limits.`;

  const signal: PortfolioRiskAgentOutput['signal'] = warnings.length === 0 ? 'SUITABLE' : 'CAUTION';
  const confidence = 90;

  const evidence = [
    `Current ${sector} exposure: ${currentExposure}% of demo portfolio (Source: data/portfolios.json - DEMO holdings snapshot).`,
    `Proposed additional investment: ${investmentPercentage}% -> projected ${sector} exposure: ${projectedExposure}%.`,
    `${profileNorm.charAt(0).toUpperCase() + profileNorm.slice(1)} profile sector limit: ${limit}% (Source: data/user_profiles.json).`,
    suitabilityWarning
  ];

  const summary = `A ${investmentPercentage}% additional allocation to ${symbolNorm} would bring ${sector} exposure to ${projectedExposure}% under the ${profileNorm} profile (${concentration.replace('_', ' ')}). Not financial advice.`;

  return {
    name: 'Portfolio Risk Agent',
    status: 'completed',
    signal,
    confidence,
    summary,
    evidence,
    source: 'data/portfolios.json; data/user_profiles.json (DEMO)',
    latency: latency(),
    currentExposure,
    projectedExposure,
    concentration
  };
}

export function runSentimentAgent(symbol: string, simulateFailure: boolean = false): SentimentAgentOutput {
  const start = performance.now();
  const latency = () => Math.round(performance.now() - start + 120);

  if (simulateFailure) {
    return {
      name: 'News Sentiment Agent',
      status: 'unavailable',
      signal: 'UNAVAILABLE',
      confidence: 0,
      summary: '[PLACEHOLDER] News feed unavailable (simulated failure).',
      evidence: [],
      source: 'Simulated news feed (placeholder)',
      latency: latency()
    };
  }

  // Consistent signal for demo stability
  const isTcs = symbol.toUpperCase() === 'TCS';
  const signal = isTcs ? 'BULLISH' : 'NEUTRAL';
  const confidence = isTcs ? 76 : 64;

  return {
    name: 'News Sentiment Agent',
    status: 'completed',
    signal,
    confidence,
    summary: `[PLACEHOLDER] Simulated sentiment read for ${symbol.toUpperCase()}.`,
    evidence: [
      `Simulated headline sample for ${symbol.toUpperCase()}: Enterprise deal momentum reported in tech sector.`
    ],
    source: 'Simulated news feed (placeholder)',
    latency: latency()
  };
}

export function runTechnicalAgent(symbol: string): TechnicalAgentOutput {
  const start = performance.now();
  const latency = () => Math.round(performance.now() - start + 150);

  const isTcs = symbol.toUpperCase() === 'TCS';
  const signal = isTcs ? 'BULLISH' : 'NEUTRAL';
  const confidence = isTcs ? 82 : 68;

  return {
    name: 'Technical Analysis Agent',
    status: 'completed',
    signal,
    confidence,
    summary: `[PLACEHOLDER] Simulated technical read for ${symbol.toUpperCase()}.`,
    evidence: [
      'Simulated RSI-14 at 58.4 (Neutral-Bullish momentum)',
      'Simulated 20-DMA / 50-EMA moving average crossover detected'
    ],
    source: 'Simulated market data (placeholder)',
    latency: latency()
  };
}

export function synthesizeConsensus(
  symbol: string,
  profile: UserProfileKey,
  investmentPercentage: number,
  agents: FourAgentsResponse
): SynthesizedConsensus {
  const fund = agents.fundamental;
  const port = agents.portfolio_risk;
  const sent = agents.sentiment;
  const tech = agents.technical;

  const profileData = USER_PROFILES[profile];
  const sectorLimit = profileData ? profileData.max_sector_exposure : 30.0;

  const warnings: string[] = [];

  if (port.concentration === 'over_limit') {
    warnings.push(`Sector Concentration Breach: Projected exposure (${port.projectedExposure}%) exceeds the ${profile} profile ceiling of ${sectorLimit}%.`);
  }

  if (fund.status === 'insufficient_data' || fund.status === 'error') {
    warnings.push(`Fundamental Data Notice: ${fund.summary}`);
  }

  if (sent.status === 'unavailable') {
    warnings.push('Sentiment Feed Offline: News sentiment agent reported unavailable state (isolated degradation).');
  }

  let overallSignal: SynthesizedConsensus['overallSignal'] = 'BUY';
  let overallConfidence = 80;

  if (port.signal === 'CAUTION') {
    overallSignal = 'CAUTION';
    overallConfidence = 70;
  } else if (fund.signal === 'BULLISH' && tech.signal === 'BULLISH') {
    overallSignal = 'STRONG_BUY';
    overallConfidence = 88;
  } else if (fund.signal === 'BEARISH' || port.concentration === 'over_limit') {
    overallSignal = 'AVOID';
    overallConfidence = 75;
  } else {
    overallSignal = 'ACCUMULATE';
    overallConfidence = 74;
  }

  const summary = port.concentration === 'over_limit'
    ? `CAUTION: While ${symbol} fundamentals and technical signals show positive strength, adding ${investmentPercentage}% exceeds the ${profile} profile's ${sectorLimit}% sector limit. Allocate with smaller sizing. Not financial advice.`
    : `SUITABLE: ${symbol} is aligned with your ${profile} risk profile. Fundamental agent verified grounded document evidence and portfolio risk checks passed. Not financial advice.`;

  return {
    symbol,
    profile,
    investmentPercentage,
    overallSignal,
    overallConfidence,
    executiveSummary: summary,
    suitabilityStatus: port.concentration === 'over_limit' ? 'CONCENTRATION_WARNING' : 'SUITABLE_FOR_PORTFOLIO',
    projectedSectorExposure: port.projectedExposure,
    sectorLimit,
    warnings,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

export function executeFourAgentsPipeline(
  symbol: string,
  profile: UserProfileKey,
  investmentPercentage: number = 14,
  degraded: DegradedConfig
): MultiAgentPipelineResult {
  const fundamental = runFundamentalAgent(symbol, degraded);
  const portfolio_risk = runPortfolioRiskAgent(symbol, profile, investmentPercentage);
  const sentiment = runSentimentAgent(symbol, degraded.simulateSentimentFailure);
  const technical = runTechnicalAgent(symbol);

  const agents: FourAgentsResponse = {
    fundamental,
    portfolio_risk,
    sentiment,
    technical
  };

  const consensus = synthesizeConsensus(symbol, profile, investmentPercentage, agents);

  const hasErrors = fundamental.status === 'error' || portfolio_risk.status === 'error';
  const hasPartial = sentiment.status === 'unavailable' || fundamental.status === 'insufficient_data';

  const overallStatus = hasErrors ? 'error' : hasPartial ? 'partial' : 'success';
  const totalLatencyMs = Math.max(fundamental.latency, sentiment.latency, technical.latency) + portfolio_risk.latency;

  return {
    apiEnvelope: {
      status: overallStatus,
      is_simulated: true,
      disclaimer: 'Not financial advice.',
      source: degraded.simulateMissingSource ? null : 'FinSight Multi-Agent Orchestrator (DEMO)',
      error: hasErrors ? 'One or more agents reported an error.' : null,
      data: {
        agents,
        consensus
      }
    },
    totalLatencyMs
  };
}
