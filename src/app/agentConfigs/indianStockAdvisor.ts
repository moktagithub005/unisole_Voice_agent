import { RealtimeAgent, tool } from "@openai/agents/realtime";

export const advisorBrandName = "Unisole Invest";

type RiskLevel = "low" | "moderate" | "high";

const stockUniverse: Record<
  string,
  {
    symbol: string;
    company: string;
    sector: string;
    priceInr: number;
    dayChangePct: number;
    pe: number;
    notes: string;
  }
> = {
  RELIANCE: {
    symbol: "RELIANCE",
    company: "Reliance Industries",
    sector: "Conglomerate",
    priceInr: 3025.5,
    dayChangePct: 0.8,
    pe: 28.4,
    notes: "Large-cap core holding candidate with diversified businesses.",
  },
  TCS: {
    symbol: "TCS",
    company: "Tata Consultancy Services",
    sector: "IT Services",
    priceInr: 4189.2,
    dayChangePct: -0.3,
    pe: 31.6,
    notes: "Stable cash-flow profile; useful for long-term compounding narratives.",
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    company: "HDFC Bank",
    sector: "Banking",
    priceInr: 1679.3,
    dayChangePct: 0.5,
    pe: 19.1,
    notes: "Banking bellwether; often used as a core financial exposure.",
  },
  INFY: {
    symbol: "INFY",
    company: "Infosys",
    sector: "IT Services",
    priceInr: 1824.7,
    dayChangePct: -0.6,
    pe: 27.8,
    notes: "Global IT exporter; suitable for tech-sector discussion.",
  },
  ICICIBANK: {
    symbol: "ICICIBANK",
    company: "ICICI Bank",
    sector: "Banking",
    priceInr: 1242.8,
    dayChangePct: 1.1,
    pe: 18.6,
    notes: "Consistent credit growth profile; common portfolio contender.",
  },
  BHARTIARTL: {
    symbol: "BHARTIARTL",
    company: "Bharti Airtel",
    sector: "Telecom",
    priceInr: 1538.9,
    dayChangePct: 0.2,
    pe: 63.4,
    notes: "Telecom growth story with premium valuation context.",
  },
};

const riskBuckets: Record<RiskLevel, string[]> = {
  low: ["HDFCBANK", "TCS", "RELIANCE"],
  moderate: ["ICICIBANK", "INFY", "RELIANCE"],
  high: ["BHARTIARTL", "INFY", "ICICIBANK"],
};

const getTodayIST = () =>
  new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

const indianStockAdvisorAgent = new RealtimeAgent({
  name: "indian_stock_advisor",
  voice: "alloy",
  instructions: `You are a warm, practical Indian stock market voice assistant for ${advisorBrandName}.

Language style (very important):
- Default language must be Hindi-first Hinglish (simple Hindi + common English finance words).
- Start every new conversation in Hinglish automatically unless user asks for another language.
- Keep Hindi in Roman script by default for easy understanding (example: "aapka risk profile kya hai?").
- If user asks "English only" then switch fully to English.
- If user asks "Hindi only" then avoid English terms except essential stock words.

Style:
- Use a natural North-India tone with subtle Himachal warmth: calm, grounded, polite, and practical.
- Keep phrasing simple and soft: "ji", "bilkul", "chaliye araam se dekhte hain", "theek rahega".
- Avoid heavy slang or exaggerated dialect; keep it understandable across North India.
- Keep answers crisp for workshop demo audiences.

Safety and trust:
- You are an educational assistant, not a SEBI-registered investment advisor.
- Never promise guaranteed returns.
- Always mention risk, diversification, and that users should do their own research before investing.

Core behavior:
1) Start with a short greeting in Hinglish, then ask three things: risk appetite, investment horizon, and monthly amount.
2) Use tools to fetch market snapshot and stock details before giving suggestions.
3) Suggest diversified ideas (large cap + sector mix) rather than a single stock.
4) For beginners, prefer SIP style guidance and staggered entry over lump-sum timing calls.
5) If the user asks "where to invest now in India", provide 2-3 sample baskets with rationale.

Output format preference:
- Use short sections: "Market Snapshot", "Suggested Basket", "Why", "Risks".
- Keep it voice-friendly and non-jargony.
`,
  tools: [
    tool({
      name: "get_indian_market_snapshot",
      description:
        "Returns a workshop demo snapshot for key Indian indices and sectors.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
      execute: async () => {
        return {
          asOfIST: getTodayIST(),
          indices: [
            { name: "NIFTY 50", level: 24786.4, dayChangePct: 0.61 },
            { name: "SENSEX", level: 81614.2, dayChangePct: 0.58 },
            { name: "BANK NIFTY", level: 52841.9, dayChangePct: 0.74 },
          ],
          sectorMomentum: [
            { sector: "Banking", trend: "positive" },
            { sector: "IT", trend: "mixed" },
            { sector: "Telecom", trend: "positive" },
            { sector: "FMCG", trend: "stable" },
          ],
          disclaimer:
            "Demo market data for workshop use. Replace with a live market API before production use.",
        };
      },
    }),
    tool({
      name: "get_stock_quote_nse",
      description:
        "Get demo quote, valuation and summary for a supported NSE symbol.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            enum: Object.keys(stockUniverse),
            description: "NSE symbol, e.g. RELIANCE, TCS, HDFCBANK.",
          },
        },
        required: ["symbol"],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { symbol } = input as { symbol: string };
        return {
          asOfIST: getTodayIST(),
          quote: stockUniverse[symbol],
          disclaimer:
            "Demo quote for workshop only. Use broker/exchange feeds for live execution.",
        };
      },
    }),
    tool({
      name: "suggest_indian_portfolio_basket",
      description:
        "Suggest a simple stock basket based on risk profile and horizon for educational demo.",
      parameters: {
        type: "object",
        properties: {
          riskLevel: {
            type: "string",
            enum: ["low", "moderate", "high"],
          },
          horizonYears: {
            type: "number",
            minimum: 1,
            maximum: 30,
          },
          monthlySipInr: {
            type: "number",
            minimum: 1000,
          },
        },
        required: ["riskLevel", "horizonYears", "monthlySipInr"],
        additionalProperties: false,
      },
      execute: async (input: any) => {
        const { riskLevel, horizonYears, monthlySipInr } = input as {
          riskLevel: RiskLevel;
          horizonYears: number;
          monthlySipInr: number;
        };
        const symbols = riskBuckets[riskLevel];
        const stocks = symbols.map((symbol) => stockUniverse[symbol]);
        const monthlyPerStock = Math.round(monthlySipInr / stocks.length);

        return {
          asOfIST: getTodayIST(),
          profile: { riskLevel, horizonYears, monthlySipInr },
          basket: stocks.map((s) => ({
            symbol: s.symbol,
            company: s.company,
            sector: s.sector,
            suggestedMonthlySipInr: monthlyPerStock,
          })),
          reasoning:
            horizonYears >= 5
              ? "Longer horizon supports equity SIP allocation with broad sector spread."
              : "Short-to-medium horizon; consider conservative allocation and phased exposure.",
          disclaimer:
            "Educational illustration only, not investment advice. Markets are volatile.",
        };
      },
    }),
  ],
});

export const indianStockAdvisorScenario = [indianStockAdvisorAgent];
