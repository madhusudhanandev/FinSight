# Round-1-hackverse
# Finsight AI

### Multi-Agent Autonomous Financial Intelligence for Retail Investors

> **From market data to explainable financial intelligence — in seconds.**

Finsight AI is a **multi-agent financial intelligence platform** designed to bridge the gap between raw market information and personalized, explainable decision-making for retail investors.

Instead of relying on a single model, Finsight AI deploys **specialized AI agents in parallel** across technical analysis, market sentiment, fundamentals, financial documents, and portfolio context. Their outputs are then synthesized into a transparent intelligence layer that explains **what is happening, why it matters, and how it relates to the individual investor**.

The system is designed around one principle:

> **Don't just give the investor a signal. Show the evidence behind it.**

---

## 🚀 Why Finsight AI?

Retail investors already have access to enormous amounts of financial data — prices, charts, news, filings, earnings information, and portfolio trackers.

The problem is **not data availability**.

The problem is turning that continuous stream of information into something that is:

* **Timely**
* **Personalized**
* **Explainable**
* **Evidence-backed**
* **Multi-perspective**
* **Risk-aware**

A traditional financial tool might answer:

> *"RELIANCE is bullish."*

Finsight AI aims to answer:

> **"RELIANCE is currently showing a bullish technical structure, supported by momentum and volume, while recent market sentiment remains positive. However, the system detected conflicting evidence in the fundamental signals. For a conservative investor, this changes the interpretation of the opportunity."**

This difference — **signal → reasoning → context → personalization** — is the core of Finsight AI.

---

# 🧠 The Core Idea

Finsight AI works like a **virtual investment research team**.

Instead of asking one AI model to understand everything, the system divides the problem into specialized research tasks.

```text
                         ┌──────────────────────┐
                         │   MARKET DATA        │
                         │ Price • Volume • News │
                         │ Filings • Fundamentals│
                         └───────────┬──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
             ┌────────────┐   ┌────────────┐   ┌────────────┐
             │ Technical  │   │ Sentiment  │   │Fundamental │
             │   Agent    │   │   Agent    │   │   Agent    │
             └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
                   │                │                │
                   └────────────────┼────────────────┘
                                    │
                           ┌────────▼────────┐
                           │  RAG / Filing   │
                           │    Retrieval    │
                           └────────┬────────┘
                                    │
                           ┌────────▼────────┐
                           │   Portfolio &   │
                           │ Risk Context    │
                           └────────┬────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │   SYNTHESIS ENGINE     │
                       │                        │
                       │ Evidence + Confidence  │
                       │ Conflicts + Context    │
                       └────────────┬───────────┘
                                    │
                                    ▼
                       ┌────────────────────────┐
                       │      FINSIGHT AI       │
                       │   Investor Dashboard   │
                       └────────────────────────┘
```

Each agent has a **clearly defined responsibility and structured output contract**, allowing the system to reason across independent perspectives before producing a final intelligence layer.

---

# 🔬 Multi-Agent Intelligence

## 1. 📈 Technical Analysis Agent

The Technical Agent analyzes market behavior using quantitative signals.

### Analyzes

* Price momentum
* Moving averages
* RSI
* MACD
* Volume anomalies
* Short-term vs long-term trends
* Recent price behavior

### Example

```json
{
  "agent": "technical_analysis",
  "signal": "BULLISH",
  "confidence": 0.84,
  "evidence": [
    "Price is above the 20-day moving average",
    "Positive momentum detected",
    "Trading volume is above recent average"
  ]
}
```

The agent does not simply return *Bullish/Bearish*.

It returns:

**Signal + Confidence + Evidence + Reasoning**

---

# 📰 2. Sentiment Analysis Agent

The Sentiment Agent analyzes financial news and market-related textual information.

### Analyzes

* Financial news
* Company announcements
* Earnings-related information
* Market commentary
* Positive/negative market signals

### Output

```json
{
  "agent": "sentiment_analysis",
  "signal": "POSITIVE",
  "confidence": 0.79,
  "evidence": [
    "Recent earnings-related coverage is predominantly positive"
  ],
  "sources": [
    "Retrieved financial news"
  ]
}
```

This allows the system to distinguish between:

```text
Positive sentiment
Negative sentiment
Neutral sentiment
Insufficient evidence
```

---

# 📊 3. Fundamental Intelligence Agent

The Fundamental Agent evaluates the underlying financial health of a company.

Depending on available data, it considers:

* Revenue growth
* Profitability
* Earnings
* Valuation indicators
* Debt-related metrics
* Financial performance trends
* Company-specific fundamentals

The purpose is to prevent the system from relying entirely on short-term market movement.

---

# 📚 4. RAG / Financial Document Agent

Financial intelligence should not be based solely on a language model's prior knowledge.

Finsight AI therefore uses **Retrieval-Augmented Generation (RAG)** to ground relevant reasoning in retrieved financial documents.

### Pipeline

```text
Financial Documents
       │
       ▼
Document Processing
       │
       ▼
Chunking + Embeddings
       │
       ▼
Vector Database
       │
       ▼
Semantic Retrieval
       │
       ▼
Relevant Evidence
       │
       ▼
AI Reasoning
       │
       ▼
Cited Output
```

The system can retrieve relevant portions of:

* Regulatory filings
* Financial disclosures
* Earnings transcripts
* Other supported financial documents

Most importantly, retrieved evidence is **attributed to the user** instead of being hidden behind an AI-generated answer.

This directly addresses the requirement that at least one agent output must be grounded in retrieved source material with visible attribution.

---

# 👤 5. Portfolio & Personalization Agent

The same market event does not mean the same thing to every investor.

Finsight AI therefore considers the user's:

* Risk preference
* Portfolio composition
* Existing exposure
* Watchlist
* Behavioral interaction history

### Example

The same market input:

```text
Stock X → Bullish
Confidence → 84%
```

may produce different intelligence for two investors.

### Conservative Investor

```text
Strong technical momentum detected.

However, your existing portfolio already has
significant exposure to this sector.

Risk interpretation:
MODERATE

Reason:
Potential concentration risk.
```

### Aggressive Investor

```text
Strong technical momentum detected.

Your current portfolio has limited exposure
to this sector.

Risk interpretation:
LOWER PORTFOLIO CONCENTRATION CONCERN
```

This demonstrates that Finsight AI is not simply a stock-analysis tool.

It is a **personalized intelligence system**.

The problem statement explicitly requires identical market inputs to produce demonstrably different outputs for different stored user profiles.

---

# ⚡ Parallel Agent Orchestration

A major architectural principle of Finsight AI is **parallel reasoning**.

Instead of:

```text
Technical
   ↓
Sentiment
   ↓
Fundamentals
   ↓
RAG
   ↓
Portfolio
```

the system performs independent analysis concurrently:

```text
                 MARKET INPUT
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
   Technical      Sentiment      Fundamentals
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
                     RAG
                      │
                      ▼
                 PERSONALIZATION
                      │
                      ▼
                  SYNTHESIS
```

This architecture enables faster multi-perspective reasoning and satisfies the requirement for specialized agents executing in parallel with structured outputs.

---

# 🎯 Signal Intelligence

Finsight AI evaluates market information across multiple independent dimensions.

| Dimension               | What it detects                                  |
| ----------------------- | ------------------------------------------------ |
| 📈 Price Momentum       | Direction and strength of price movement         |
| 📊 Volume               | Abnormal or unusually strong trading activity    |
| 📉 Technical Indicators | RSI, moving averages, MACD, etc.                 |
| 📰 Sentiment            | Positive / Neutral / Negative market sentiment   |
| 💰 Fundamentals         | Underlying financial performance                 |
| 📚 Filings              | Evidence from financial documents                |
| 👤 Portfolio            | Personal exposure and concentration              |
| ⚠️ Risk                 | Potential conflicts and portfolio-level concerns |

This multi-dimensional approach prevents a single indicator from dominating the final intelligence.

---

# 🧩 Evidence-Based Reasoning

Every major agent output follows a common structure:

```text
┌─────────────────────────────────────┐
│ SIGNAL                              │
│                                     │
│ 🟢 BULLISH                          │
│                                     │
│ Confidence: 84%                     │
│                                     │
│ Evidence                            │
│ • Positive momentum                 │
│ • Above-average volume              │
│ • Positive sentiment                │
│                                     │
│ Why it matters                      │
│ Explanation of the signal           │
│                                     │
│ Sources                             │
│ • Retrieved filing                  │
│ • Financial news                    │
└─────────────────────────────────────┘
```

The objective is **explainability rather than black-box prediction**.

---

# ⚖️ Conflict-Aware Reasoning

Real markets are rarely perfectly aligned.

Finsight AI explicitly handles conflicting signals.

Example:

```text
Technical Agent       → 🟢 BULLISH   84%
Sentiment Agent       → 🔴 NEGATIVE  76%
Fundamental Agent     → 🟡 NEUTRAL   68%
```

Instead of hiding this disagreement, Finsight AI surfaces it:

```text
⚠️ CONFLICT DETECTED

Technical momentum is positive,
but recent sentiment is negative.

Confidence in a unified direction: LOW

The final interpretation should account
for this uncertainty.
```

This prevents the synthesis layer from creating false certainty.

---

# 🛡️ Graceful Degraded-Data Handling

Financial systems must remain reliable even when data is incomplete.

Finsight AI explicitly handles cases such as:

### Missing News

```text
Technical Analysis → AVAILABLE
Sentiment Analysis → UNAVAILABLE

Final Output:
Sentiment could not be evaluated because
valid news data was unavailable.
```

### Missing Filing

```text
RAG Evidence → UNAVAILABLE

System behavior:
Do not fabricate a citation.
Clearly mark the missing evidence.
```

### Conflicting Agents

```text
Agent A → Bullish
Agent B → Bearish

System behavior:
Surface the conflict.
Reduce confidence.
Allow the synthesis layer to reason over both.
```

The system is designed to **fail transparently rather than hallucinate confidently**, matching the degraded-data requirement in the challenge.

---

# 🧠 Synthesis Engine

The Synthesis Engine acts as the final reasoning layer.

It receives structured outputs from the specialized agents:

```text
Technical
Sentiment
Fundamentals
RAG Evidence
Portfolio Context
Risk Signals
        │
        ▼
┌──────────────────────┐
│   SYNTHESIS ENGINE   │
│                      │
│ Evidence             │
│ Confidence           │
│ Conflicts             │
│ User Context         │
│ Risk                  │
└──────────┬───────────┘
           │
           ▼
   Explainable Intelligence
```

The synthesis layer does not blindly average agent scores.

It considers:

1. Evidence quality
2. Agent confidence
3. Agreement/disagreement
4. Retrieved source evidence
5. User-specific context
6. Portfolio exposure
7. Identified risks

---

# 🖥️ Investor Experience

The Finsight AI interface is designed around three things:

### 1. Market Signals

Users can quickly see:

```text
Stock
Current Signal
Confidence
Technical State
Sentiment
```

### 2. Explainable AI

Instead of only displaying:

> **BUY**

the interface exposes:

```text
WHY?

✓ Momentum is positive
✓ Volume is above average
✓ Sentiment is positive
✓ Retrieved filing supports the earnings trend

⚠ Risk:
Existing portfolio exposure is high.
```

### 3. Portfolio Context

The investor can see how market intelligence relates to their existing holdings and watchlist.

The challenge requires the live interface to display market classifications, synthesized output with source attribution, and portfolio/watchlist state.

---

# 📐 System Architecture

```text
                         ┌─────────────────┐
                         │   Frontend UI   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Backend API   │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │ Agent Orchestrator│
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
       ┌────────────┐      ┌────────────┐      ┌────────────┐
       │ Technical  │      │ Sentiment  │      │Fundamental │
       │   Agent    │      │   Agent    │      │   Agent    │
       └─────┬──────┘      └─────┬──────┘      └─────┬──────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                           ┌──────▼──────┐
                           │ RAG Engine  │
                           └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │ Portfolio & │
                           │ Risk Agent  │
                           └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │  Synthesis  │
                           │    Agent    │
                           └──────┬──────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Explainable     │
                         │ Intelligence    │
                         └─────────────────┘
```

---

# 📊 Performance & Evaluation

Finsight AI maintains a performance log to evaluate the system beyond simply producing an answer.

Example metrics include:

| Metric               | Purpose                                 |
| -------------------- | --------------------------------------- |
| Signal Accuracy      | Compare signals against forward returns |
| Agent Latency        | Measure reasoning response time         |
| Portfolio Risk Score | Measure concentration/exposure          |
| Confidence           | Quantify evidence strength              |
| Agent Agreement      | Measure cross-agent consistency         |

The challenge requires at least **three measurable performance metrics per session**.

---

# 🔄 End-to-End Flow

A complete Finsight AI request follows this pipeline:

```text
01  User selects a stock
            ↓
02  Market data is ingested
            ↓
03  Technical Agent analyzes market behavior
            ↓
04  Sentiment Agent analyzes financial news
            ↓
05  Fundamental Agent evaluates company health
            ↓
06  RAG retrieves relevant financial evidence
            ↓
07  Portfolio Agent evaluates user context
            ↓
08  Agents return structured outputs
            ↓
09  Conflicts and confidence are evaluated
            ↓
10  Synthesis Engine generates intelligence
            ↓
11  Evidence and sources are attached
            ↓
12  Personalized result reaches the dashboard
```

This creates the required **raw-data → multi-agent reasoning → user-facing intelligence** pipeline.

---

# 🧪 Example Intelligence Output

### RELIANCE

**Overall Intelligence:** 🟢 Positive

**Confidence:** `82%`

| Agent          | Signal        | Confidence |
| -------------- | ------------- | ---------: |
| Technical      | 🟢 Bullish    |        84% |
| Sentiment      | 🟢 Positive   |        79% |
| Fundamentals   | 🟡 Neutral    |        68% |
| RAG Evidence   | 🟢 Supporting |        81% |
| Portfolio Risk | 🟠 Moderate   |        73% |

### Why?

* Price momentum is currently positive.
* Trading activity is above the recent baseline.
* Recent financial coverage is predominantly positive.
* Retrieved financial evidence supports parts of the growth narrative.
* Existing portfolio exposure introduces a concentration consideration.

### ⚠️ Important Conflict

Technical indicators are stronger than the fundamental signal.

Therefore, confidence in the **short-term market direction** is higher than confidence in the **long-term fundamental thesis**.

### Evidence

```text
Technical evidence
→ Price + volume indicators

Sentiment evidence
→ Recent financial news

Fundamental evidence
→ Company financial metrics

Document evidence
→ Retrieved filing / disclosure
```

---

# 🏗️ Project Structure

```text
Finsight-AI/
│
├── backend/
│   ├── api/
│   ├── orchestration/
│   └── models/
│
├── market-agents/
│   ├── agents/
│   │   ├── technical_agent.py
│   │   ├── sentiment_agent.py
│   │   └── signal_classifier.py
│   │
│   ├── indicators/
│   │   ├── momentum.py
│   │   ├── volume.py
│   │   ├── rsi.py
│   │   └── moving_average.py
│   │
│   ├── sentiment/
│   │   ├── analyzer.py
│   │   └── news_processor.py
│   │
│   ├── models/
│   │   └── signal_models.py
│   │
│   ├── tests/
│   └── README.md
│
├── rag-personalization/
│   ├── rag/
│   ├── fundamentals/
│   ├── portfolio/
│   └── personalization/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── data/
│   └── sample/
│
└── README.md
```

---

# 🌿 Team Architecture

Finsight AI is developed using independent Git branches so that each major subsystem can evolve without blocking the others.

| Branch                 | Responsibility                                |
| ---------------------- | --------------------------------------------- |
| `backend-api`          | Backend APIs & agent orchestration            |
| `market-agents`        | **Technical & sentiment intelligence**        |
| `rag-personalization`  | RAG, fundamentals & portfolio personalization |
| `frontend-integration` | Frontend integration, testing & presentation  |

The architecture allows each team member to develop and test their subsystem independently before integration.

---

# 🧰 Technology Stack

### AI & Intelligence

* Multi-agent architecture
* LLM-based reasoning
* Retrieval-Augmented Generation
* Semantic search
* Sentiment analysis
* Structured agent outputs

### Backend

* Python
* REST APIs
* Agent orchestration
* JSON-based agent contracts

### Data

* Market price data
* Volume data
* Financial news
* Financial/regulatory documents
* Vector database / semantic retrieval

### Frontend

* Modern web interface
* Live market signals
* Explainable reasoning
* Portfolio visualization
* Agent reasoning traces

### Development

* Git
* GitHub
* Modular agent architecture
* Automated testing

---

# 🔐 Responsible Financial Intelligence

Finsight AI is designed as an **intelligence and decision-support system**, not an autonomous trading system.

The system prioritizes:

* Evidence over speculation
* Transparency over black-box outputs
* Confidence over false certainty
* Conflict visibility over forced conclusions
* User context over generic recommendations
* Clear attribution over unsupported claims

When evidence is insufficient, Finsight AI should say:

> **"Insufficient evidence."**

rather than inventing an answer.

---

# 🏆 Challenge Requirement Coverage

| Requirement                      | Finsight AI                                              |
| -------------------------------- | -------------------------------------------------------- |
| 3+ independent signal dimensions | ✅ Technical + Volume + Sentiment + Fundamentals          |
| Classified signals               | ✅ Bullish / Bearish / Neutral                            |
| Confidence level                 | ✅ Per-agent confidence                                   |
| Cited reasoning                  | ✅ Evidence-backed explanations                           |
| RAG                              | ✅ Financial document retrieval                           |
| Source attribution               | ✅ Retrieved evidence displayed                           |
| 3+ parallel specialized agents   | ✅ Technical + Sentiment + Fundamentals + RAG + Portfolio |
| Structured agent contracts       | ✅ JSON-based outputs                                     |
| User profiling                   | ✅ Risk + portfolio context                               |
| Different outputs by profile     | ✅ Personalization layer                                  |
| Live market interface            | ✅ Dashboard                                              |
| Portfolio / watchlist            | ✅ Investor context                                       |
| Performance metrics              | ✅ Accuracy + latency + risk metrics                      |
| End-to-end pipeline              | ✅ Data → Agents → Synthesis → UI                         |
| Conflict handling                | ✅ Explicit conflict detection                            |
| Degraded-data handling           | ✅ Graceful fallback                                      |
| Explainable reasoning            | ✅ Evidence + reasoning + confidence                      |

---

# 🎬 Hackathon Demo

The strongest demonstration of Finsight AI is not simply showing a dashboard.

The demo should show the **reasoning pipeline**.

### Scenario

```text
User:
"Analyze RELIANCE for my portfolio."
```

### Finsight AI

```text
             RELIANCE
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
   Technical  Sentiment  Fundamental
     84%        79%         68%
       │         │           │
       └─────────┼───────────┘
                 ▼
             RAG Agent
                 │
                 ▼
          Portfolio Context
                 │
                 ▼
             SYNTHESIS
                 │
                 ▼
       ┌───────────────────┐
       │ FINAL INTELLIGENCE│
       │                   │
       │ Signal: POSITIVE  │
       │ Confidence: 82%   │
       │                   │
       │ Evidence: ✓       │
       │ Conflict: ⚠       │
       │ Portfolio Risk: ⚠ │
       └───────────────────┘
```

The judge can therefore see **not only the answer, but the complete reasoning chain behind the answer**.

---

# 🚀 Vision

Finsight AI aims to make sophisticated financial research infrastructure accessible to ordinary investors.

The long-term vision is simple:

> **Give every retail investor the research capabilities of a multi-disciplinary financial intelligence team — without hiding the reasoning behind a black box.**

---

## 📌 Built For

**HACKVERSE: INTO THE WEB — Sprint 1: Rapid Vibe Coding**

**IEEE Robotics & Automation Society · VIT Chennai Student Chapter**

**PS-01 — Multi-Agent Autonomous Financial Intelligence System for Retail Investors**

---

### Finsight AI

**Observe → Analyze → Retrieve → Personalize → Explain**

> **Because better financial decisions begin with better financial intelligence.**
