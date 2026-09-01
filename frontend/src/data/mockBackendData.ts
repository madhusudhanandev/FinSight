import { UserProfileData, PortfolioHoldingData, DemoDocumentChunk, SupportedSymbol, UserProfileKey } from '../types';

export const USER_PROFILES: Record<UserProfileKey, UserProfileData> = {
  conservative: {
    name: 'Conservative Profile',
    max_sector_exposure: 30.0,
    max_volatility: 0.25,
    description: 'Capital preservation focus with strict sector concentration limits (Max 30% per sector).',
    lossTolerance: 'Low (Preserve capital, minimize drawdowns)',
    typicalHoldDuration: '3 - 5 Years'
  },
  aggressive: {
    name: 'Aggressive Profile',
    max_sector_exposure: 50.0,
    max_volatility: 0.60,
    description: 'High growth tolerance with flexibility for concentrated tech and energy sector allocation (Max 50% per sector).',
    lossTolerance: 'High (Accept short-term market swings for capital appreciation)',
    typicalHoldDuration: '6 Months - 2 Years'
  }
};

export const DEMO_PORTFOLIO = {
  total_value: 1000000, // Rs 10 Lakhs
  holdings: [
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      sector: 'Information Technology',
      value: 250000, // 25.0% of portfolio
      volatility: 0.18,
      shares: 65,
      avgBuyPrice: 3840.00,
      currentPrice: 3910.50
    },
    {
      symbol: 'INFY',
      name: 'Infosys Limited',
      sector: 'Information Technology',
      value: 150000, // 15.0% of portfolio (Total IT = 40.0%)
      volatility: 0.22,
      shares: 80,
      avgBuyPrice: 1875.00,
      currentPrice: 1885.00
    },
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      sector: 'Energy & Conglomerate',
      value: 350000, // 35.0% of portfolio
      volatility: 0.28,
      shares: 119,
      avgBuyPrice: 2940.00,
      currentPrice: 2940.00
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      sector: 'Financials',
      value: 250000, // 25.0% of portfolio
      volatility: 0.19,
      shares: 151,
      avgBuyPrice: 1654.80,
      currentPrice: 1654.80
    }
  ] as PortfolioHoldingData[]
};

export const DEMO_DOCUMENTS: Record<string, DemoDocumentChunk[]> = {
  TCS: [
    {
      id: 'TCS-CHUNK-01',
      symbol: 'TCS',
      content: 'TCS reported strong quarterly revenue growth of 7.6% YoY with operating margin expansion of 40 bps to 26.0%. Order book total contract value reached record $10.2B driven by robust cloud and AI transformation partnerships.',
      source: 'TCS_Annual_Report_FY24.pdf',
      page: 42,
      date: '2024-06-15',
      sentimentBias: 'positive'
    },
    {
      id: 'TCS-CHUNK-02',
      symbol: 'TCS',
      content: 'Management noted reduction in attrition to 12.1% and improved cash flow conversion with net profit beat against consensus estimates. Debt remains zero with record return on equity.',
      source: 'TCS_Q3_Earnings_Transcript.pdf',
      page: 14,
      date: '2025-01-12',
      sentimentBias: 'positive'
    },
    {
      id: 'TCS-CHUNK-03',
      symbol: 'TCS',
      content: 'Near-term discretionary IT spending faces moderate macro volatility in North America banking clients, though long-term digital pipeline remains strong.',
      source: 'TCS_Investor_Factsheet.pdf',
      page: 6,
      date: '2025-01-20',
      sentimentBias: 'neutral'
    }
  ],
  RELIANCE: [
    {
      id: 'RIL-CHUNK-01',
      symbol: 'RELIANCE',
      content: 'Reliance Industries reported robust EBITDA growth across consumer businesses with Jio ARPU expansion and retail store network improvement.',
      source: 'RIL_Integrated_Annual_Report_FY24.pdf',
      page: 88,
      date: '2024-08-20',
      sentimentBias: 'positive'
    },
    {
      id: 'RIL-CHUNK-02',
      symbol: 'RELIANCE',
      content: 'Oil to chemicals segment faced global margin pressure and downstream crack spread volatility, resulting in temporary chemical earnings decline.',
      source: 'RIL_Q3_Financial_Review.pdf',
      page: 23,
      date: '2025-01-18',
      sentimentBias: 'negative'
    },
    {
      id: 'RIL-CHUNK-03',
      symbol: 'RELIANCE',
      content: 'Net debt reduction roadmap on track with strong operating cash flows supporting new energy solar and battery giga-factory capex guidance.',
      source: 'RIL_Investor_Presentation_Q3.pdf',
      page: 11,
      date: '2025-01-22',
      sentimentBias: 'positive'
    }
  ],
  INFY: [
    {
      id: 'INFY-CHUNK-01',
      symbol: 'INFY',
      content: 'Infosys delivered improved revenue guidance with large deal total contract value of $2.4B. Operating profit margin expanded with strong free cash flow generation beat.',
      source: 'INFY_Annual_Report_FY24.pdf',
      page: 35,
      date: '2024-06-30',
      sentimentBias: 'positive'
    },
    {
      id: 'INFY-CHUNK-02',
      symbol: 'INFY',
      content: 'Generative AI Topaz suite adoption increased with record enterprise client wins. Management reaffirmed dividend payout policy and continuous debt reduction.',
      source: 'INFY_Q3_Earnings_Call.pdf',
      page: 18,
      date: '2025-01-16',
      sentimentBias: 'positive'
    }
  ]
};

export const SUPPORTED_SYMBOLS: SupportedSymbol[] = ['TCS', 'RELIANCE', 'INFY'];

export const SYMBOL_METADATA: Record<string, { name: string; sector: string; price: number; change: number; changePercent: number; sparkline: number[] }> = {
  TCS: {
    name: 'Tata Consultancy Services',
    sector: 'Information Technology',
    price: 3910.50,
    change: 42.30,
    changePercent: 1.09,
    sparkline: [3840, 3855, 3870, 3865, 3880, 3895, 3890, 3905, 3900, 3910.5]
  },
  RELIANCE: {
    name: 'Reliance Industries Ltd',
    sector: 'Energy & Conglomerate',
    price: 2940.00,
    change: -8.50,
    changePercent: -0.29,
    sparkline: [2960, 2955, 2948, 2952, 2945, 2940, 2948, 2942, 2945, 2940]
  },
  INFY: {
    name: 'Infosys Limited',
    sector: 'Information Technology',
    price: 1885.00,
    change: 14.20,
    changePercent: 0.76,
    sparkline: [1860, 1865, 1872, 1868, 1875, 1880, 1878, 1884, 1881, 1885]
  },
  TATAMOTORS: {
    name: 'Tata Motors Limited (Unsupported Demo Symbol)',
    sector: 'Automotive',
    price: 984.50,
    change: 18.20,
    changePercent: 1.88,
    sparkline: [960, 965, 970, 968, 975, 980, 978, 982, 981, 984.5]
  }
};
