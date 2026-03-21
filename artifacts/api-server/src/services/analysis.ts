interface Competitor {
  name: string;
  type: string;
  threatLevel: "Low" | "Medium" | "High";
  notes: string;
}

interface SubScores {
  marketDemandScore: number;
  competitionScore: number;
  financialStrengthScore: number;
  locationScore: number;
  growthPotentialScore: number;
  executionReadinessScore: number;
}

interface RevenueDataPoint {
  month: string;
  min: number;
  max: number;
  projected: number;
}

interface MarketSegment {
  name: string;
  value: number;
  color: string;
}

interface KeyFactor {
  title: string;
  description: string;
}

interface AnalysisResult {
  successScore: number;
  riskLevel: "Low" | "Medium" | "High";
  marketDemand: "Low" | "Medium" | "High" | "Very High";
  competitionLevel: "Low" | "Medium" | "High" | "Very High";
  estimatedRevenueMin: number;
  estimatedRevenueMax: number;
  explanation: string;
  marketAnalysis: string;
  pricingStrategy: string;
  marketingPlan: string;
  brandingSuggestions: string;
  productSuggestions: string;
  hiringNeeds: string;
  competitors: Competitor[];
  subScores: SubScores;
  revenueProjection: RevenueDataPoint[];
  marketBreakdown: MarketSegment[];
  keyStrengths: KeyFactor[];
  keyRisks: KeyFactor[];
  breakEvenMonths: number;
  roiPercent: number;
}

interface ProjectInput {
  name: string;
  businessType: string;
  category: string;
  location: string;
  citySize: string;
  budget: number;
  targetMarket: string;
  description: string;
}

const HIGH_DEMAND_CATEGORIES = ["food", "restaurant", "cafe", "health", "tech", "technology", "software", "ecommerce", "retail", "education", "fitness", "beauty", "delivery"];
const MEDIUM_DEMAND_CATEGORIES = ["consulting", "marketing", "real estate", "legal", "accounting", "manufacturing", "logistics", "travel", "fashion", "media"];
const HIGH_COMPETITION_CATEGORIES = ["food", "restaurant", "retail", "ecommerce", "fitness", "beauty", "coffee", "cafe"];
const LOW_COMPETITION_CATEGORIES = ["software", "tech", "niche", "specialty", "consulting", "b2b"];

function categorizeMarketDemand(category: string): "Low" | "Medium" | "High" | "Very High" {
  const cat = category.toLowerCase();
  if (HIGH_DEMAND_CATEGORIES.some((c) => cat.includes(c))) {
    return cat.includes("tech") || cat.includes("software") ? "Very High" : "High";
  }
  if (MEDIUM_DEMAND_CATEGORIES.some((c) => cat.includes(c))) return "Medium";
  return "Medium";
}

function categorizeCompetition(category: string, citySize: string): "Low" | "Medium" | "High" | "Very High" {
  const cat = category.toLowerCase();
  const isLargeCity = citySize === "large" || citySize === "metro";
  if (HIGH_COMPETITION_CATEGORIES.some((c) => cat.includes(c))) {
    return isLargeCity ? "Very High" : "High";
  }
  if (LOW_COMPETITION_CATEGORIES.some((c) => cat.includes(c))) {
    return isLargeCity ? "Medium" : "Low";
  }
  return isLargeCity ? "High" : "Medium";
}

function computeSubScores(input: ProjectInput): SubScores {
  const cat = input.category.toLowerCase();
  const demand = categorizeMarketDemand(input.category);
  const competition = categorizeCompetition(input.category, input.citySize);

  const demandMap: Record<string, number> = { "Very High": 92, High: 78, Medium: 58, Low: 35 };
  const compMap: Record<string, number> = { Low: 88, Medium: 65, High: 45, "Very High": 25 };

  const marketDemandScore = demandMap[demand] ?? 55;
  const competitionScore = compMap[competition] ?? 50;

  const financialStrengthScore = Math.min(100, Math.round(
    (input.budget >= 1000000 ? 95 : input.budget >= 500000 ? 85 : input.budget >= 100000 ? 72 : input.budget >= 50000 ? 58 : input.budget >= 10000 ? 40 : 22)
  ));

  const locationMap: Record<string, number> = { metro: 88, large: 72, medium: 58, small: 42 };
  const locationScore = locationMap[input.citySize] ?? 55;

  const growthPotentialScore = Math.min(100, Math.round(
    (cat.includes("tech") || cat.includes("software") ? 90 : cat.includes("health") ? 82 : cat.includes("food") ? 72 : cat.includes("education") ? 76 : 60)
    + (input.budget > 200000 ? 8 : 0)
  ));

  const descQuality = input.description.length > 300 ? 85 : input.description.length > 150 ? 70 : 50;
  const executionReadinessScore = Math.round((descQuality + financialStrengthScore) / 2);

  return {
    marketDemandScore,
    competitionScore,
    financialStrengthScore,
    locationScore,
    growthPotentialScore,
    executionReadinessScore,
  };
}

function calculateSuccessScore(subScores: SubScores): number {
  const weights = {
    marketDemandScore: 0.22,
    competitionScore: 0.20,
    financialStrengthScore: 0.20,
    locationScore: 0.12,
    growthPotentialScore: 0.16,
    executionReadinessScore: 0.10,
  };
  const score = Math.round(
    subScores.marketDemandScore * weights.marketDemandScore +
    subScores.competitionScore * weights.competitionScore +
    subScores.financialStrengthScore * weights.financialStrengthScore +
    subScores.locationScore * weights.locationScore +
    subScores.growthPotentialScore * weights.growthPotentialScore +
    subScores.executionReadinessScore * weights.executionReadinessScore
  );
  return Math.min(100, Math.max(10, score));
}

function determineRiskLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

function estimateRevenue(category: string, citySize: string, budget: number, score: number): { min: number; max: number } {
  const cat = category.toLowerCase();
  let baseMin = 5000, baseMax = 20000;

  if (cat.includes("tech") || cat.includes("software")) { baseMin = 30000; baseMax = 150000; }
  else if (cat.includes("food") || cat.includes("restaurant")) { baseMin = 15000; baseMax = 80000; }
  else if (cat.includes("retail") || cat.includes("ecommerce")) { baseMin = 10000; baseMax = 60000; }
  else if (cat.includes("consulting") || cat.includes("service")) { baseMin = 20000; baseMax = 100000; }
  else if (cat.includes("health") || cat.includes("fitness")) { baseMin = 12000; baseMax = 70000; }

  const cityMult = citySize === "metro" ? 2.5 : citySize === "large" ? 1.8 : citySize === "medium" ? 1.2 : 0.8;
  const budgetMult = budget >= 500000 ? 2 : budget >= 100000 ? 1.5 : budget >= 50000 ? 1.2 : 1;
  const scoreMult = score / 50;

  return {
    min: Math.round(baseMin * cityMult * budgetMult * scoreMult),
    max: Math.round(baseMax * cityMult * budgetMult * scoreMult),
  };
}

function generateRevenueProjection(revenueMin: number, revenueMax: number, budget: number, score: number): RevenueDataPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rampUpFactor = [0.05, 0.12, 0.22, 0.35, 0.48, 0.60, 0.70, 0.78, 0.85, 0.90, 0.95, 1.0];
  const growthBonus = score >= 75 ? 0.08 : score >= 55 ? 0.04 : 0.01;

  return months.map((month, i) => {
    const ramp = rampUpFactor[i] * (1 + growthBonus * i * 0.1);
    const projected = Math.round(((revenueMin + revenueMax) / 2) * ramp);
    return {
      month,
      min: Math.round(revenueMin * ramp * 0.8),
      max: Math.round(revenueMax * ramp * 1.1),
      projected,
    };
  });
}

function generateMarketBreakdown(category: string, score: number): MarketSegment[] {
  const cat = category.toLowerCase();
  if (cat.includes("tech") || cat.includes("software")) {
    return [
      { name: "Enterprise B2B", value: 38, color: "#D4AF37" },
      { name: "SMB Market", value: 30, color: "#3B82F6" },
      { name: "Freelancers", value: 18, color: "#10B981" },
      { name: "Consumer", value: 14, color: "#8B5CF6" },
    ];
  } else if (cat.includes("food") || cat.includes("restaurant")) {
    return [
      { name: "Dine-in", value: 42, color: "#D4AF37" },
      { name: "Delivery", value: 28, color: "#3B82F6" },
      { name: "Catering", value: 18, color: "#10B981" },
      { name: "Takeaway", value: 12, color: "#8B5CF6" },
    ];
  } else if (cat.includes("retail") || cat.includes("ecommerce")) {
    return [
      { name: "Online Sales", value: 45, color: "#D4AF37" },
      { name: "Walk-in", value: 30, color: "#3B82F6" },
      { name: "Wholesale", value: 15, color: "#10B981" },
      { name: "Subscriptions", value: 10, color: "#8B5CF6" },
    ];
  } else if (cat.includes("health") || cat.includes("fitness")) {
    return [
      { name: "Memberships", value: 50, color: "#D4AF37" },
      { name: "Classes/PT", value: 25, color: "#3B82F6" },
      { name: "Products", value: 15, color: "#10B981" },
      { name: "Corporate", value: 10, color: "#8B5CF6" },
    ];
  }
  return [
    { name: "Primary Revenue", value: 55, color: "#D4AF37" },
    { name: "Secondary Revenue", value: 25, color: "#3B82F6" },
    { name: "Ancillary", value: 20, color: "#10B981" },
  ];
}

function generateKeyStrengths(input: ProjectInput, subScores: SubScores): KeyFactor[] {
  const strengths: KeyFactor[] = [];

  if (subScores.marketDemandScore >= 70) {
    strengths.push({ title: "Strong Market Demand", description: `The ${input.category} sector shows robust consumer demand with sustained growth trends. Your timing is aligned with market momentum.` });
  }
  if (subScores.competitionScore >= 65) {
    strengths.push({ title: "Favorable Competitive Landscape", description: `Competition in your target market is manageable. There is meaningful room to establish a differentiated position and capture loyal customers.` });
  }
  if (subScores.financialStrengthScore >= 65) {
    strengths.push({ title: "Solid Financial Foundation", description: `Your budget of $${input.budget.toLocaleString()} provides adequate runway to reach profitability. This reduces early-stage financial risk significantly.` });
  }
  if (subScores.locationScore >= 65) {
    strengths.push({ title: "High-Potential Location", description: `${input.location} offers strong consumer purchasing power, access to talent, and infrastructure ideal for this business type.` });
  }
  if (subScores.growthPotentialScore >= 72) {
    strengths.push({ title: "High Growth Sector", description: `The ${input.category} market is expanding rapidly with double-digit annual growth rates, creating excellent long-term upside.` });
  }

  return strengths.slice(0, 4);
}

function generateKeyRisks(input: ProjectInput, subScores: SubScores): KeyFactor[] {
  const risks: KeyFactor[] = [];

  if (subScores.competitionScore < 55) {
    risks.push({ title: "Intense Competition", description: "Established competitors with strong brand equity and resources dominate this market. Differentiation will be critical to survival and growth." });
  }
  if (subScores.financialStrengthScore < 55) {
    risks.push({ title: "Undercapitalization Risk", description: "The allocated budget may be insufficient to reach profitability before cash runs out. Consider raising additional capital or phasing the launch." });
  }
  if (subScores.marketDemandScore < 60) {
    risks.push({ title: "Uncertain Market Demand", description: "Consumer demand signals in this sector are mixed. Thorough customer discovery research is essential before committing full resources." });
  }
  if (subScores.executionReadinessScore < 60) {
    risks.push({ title: "Execution Complexity", description: "This business model requires significant operational capability. Building the right team and processes early is crucial to avoid costly mistakes." });
  }
  if (input.citySize === "small") {
    risks.push({ title: "Limited Addressable Market", description: "A smaller city limits the initial customer pool. You may need to expand geographically or digitally sooner than expected to sustain growth." });
  }

  return risks.slice(0, 4);
}

function computeBreakEven(budget: number, revenueMin: number, score: number): number {
  const monthlyBurn = Math.round(budget / 18);
  const rampProjected = revenueMin * 0.6;
  if (rampProjected <= 0) return 24;
  const months = Math.round(budget / (rampProjected - monthlyBurn * 0.3));
  return Math.min(36, Math.max(3, months));
}

function generateExplanation(input: ProjectInput, score: number, riskLevel: string, marketDemand: string, competition: string): string {
  const city = input.citySize.charAt(0).toUpperCase() + input.citySize.slice(1);
  const budgetStr = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(input.budget);
  return `Based on our analysis, "${input.name}" achieves a feasibility score of ${score}/100, indicating a ${riskLevel.toLowerCase()} risk venture. The ${input.category} sector in ${input.location} (${city} city) shows ${marketDemand.toLowerCase()} market demand with ${competition.toLowerCase()} competition. With a budget of ${budgetStr} targeting ${input.targetMarket}, this business demonstrates ${score >= 70 ? "strong" : score >= 50 ? "moderate" : "limited"} viability. ${score >= 70 ? "The fundamentals are solid and the market opportunity is real." : score >= 50 ? "Success is achievable with focused execution and differentiation." : "Significant challenges exist — consider pivoting the concept or increasing budget."} Key success factors include understanding local consumer behavior, building strong brand presence, and maintaining operational efficiency from day one.`;
}

function generateMarketAnalysis(input: ProjectInput, marketDemand: string, competition: string): string {
  const cat = input.category;
  return `The ${cat} market in ${input.location} is experiencing ${marketDemand.toLowerCase()} demand driven by changing consumer preferences and macro-economic tailwinds. Competition is ${competition.toLowerCase()}, with established players and well-funded startups competing for market share.\n\nKey market trends include increasing digital adoption, sustainability consciousness, and demand for personalized experiences. The total addressable market for ${cat} businesses in ${input.location}'s ${input.citySize}-sized market is estimated to grow 8–15% annually over the next 3 years.\n\nYour target segment — ${input.targetMarket} — represents a well-defined group with measurable purchasing power. Focusing on underserved niches and leveraging data-driven marketing strategies will be critical to capturing meaningful market share.`;
}

function generatePricingStrategy(input: ProjectInput, score: number): string {
  const cat = input.category.toLowerCase();
  if (cat.includes("tech") || cat.includes("software")) {
    return `Adopt a SaaS-style tiered pricing:\n• Free Tier — limited features to drive top-of-funnel\n• Professional ($29–$99/mo) — core feature set with support\n• Enterprise — custom pricing with SLAs and dedicated onboarding\n\nOffer 20–30% annual billing discounts. Initially price 15–20% below competitors to gain traction, then increase prices as you build brand authority. Usage-based pricing components for high-volume customers.`;
  } else if (cat.includes("food") || cat.includes("restaurant")) {
    return `Position in the mid-to-premium range for ${input.targetMarket}:\n• Use cost-plus pricing targeting 60–70% gross margins\n• Dynamic pricing for peak/off-peak hours\n• Loyalty rewards for repeat customers (5–10% cashback)\n• Bundle meals and family packages to lift AOV by 25–35%\n• Weekly specials and seasonal menus drive return visits`;
  }
  return `Value-based pricing approach:\n• Tier 1 (Basic) — accessible entry price to capture early adopters\n• Tier 2 (Standard) — comprehensive package with added support\n• Tier 3 (Premium) — white-glove experience with dedicated account management\n\nPrice 10–20% above market average while clearly communicating superior value. Review and adjust pricing quarterly based on demand signals.`;
}

function generateMarketingPlan(input: ProjectInput): string {
  return `Phase 1 — Brand Awareness (Months 1–3):\n• Launch social media on Instagram, LinkedIn, TikTok targeting ${input.targetMarket}\n• Allocate 30% of marketing budget to paid social ads with A/B tested creatives\n• Secure 5+ local press mentions through PR outreach and founder storytelling\n\nPhase 2 — Lead Generation (Months 4–6):\n• SEO-optimized content marketing (2 posts/week)\n• Email campaigns targeting 25%+ open rates\n• Partner with 3–5 complementary businesses for cross-promotion\n• Referral program with 10–15% incentives\n\nPhase 3 — Retention & Growth (Months 7–12):\n• Loyalty program launch\n• Target NPS of 50+ through proactive customer success\n• Expand to Google Ads and programmatic advertising\n• Host monthly community events to establish thought leadership`;
}

function generateBrandingSuggestions(input: ProjectInput): string {
  const cat = input.category.toLowerCase();
  const colors = cat.includes("food") ? "warm oranges and earthy greens" : cat.includes("tech") ? "deep blues and electric accents" : cat.includes("health") ? "clean whites and calming greens" : "sophisticated navy and gold";
  return `Brand Identity for "${input.name}":\n• Choose a memorable name with an available .com domain and clear phonetics\n• Visual identity: ${colors} — colors that evoke trust and relevance in the ${input.category} space\n• Design a scalable logo that works from app icon to billboard size\n• Brand voice: ${cat.includes("tech") ? "innovative, precise, and empowering" : cat.includes("food") ? "warm, inviting, and craveable" : "professional yet approachable"}\n\nRequired Brand Assets:\n• Primary logo + icon variant\n• Color palette (2 primary, 2 secondary, 2 neutral)\n• Typography system (heading + body)\n• Business card and stationery suite\n• Social media profile kit\n• Full brand guidelines PDF\n\nRegister trademark in your jurisdiction within the first 6 months.`;
}

function generateProductSuggestions(input: ProjectInput): string {
  const cat = input.category.toLowerCase();
  if (cat.includes("tech") || cat.includes("software")) {
    return `Core Product — ${input.name} Platform:\n• MVP: User onboarding, core workflow, basic analytics, export\n• V2: Advanced analytics, API integrations, team collaboration\n• V3: Marketplace/ecosystem play, AI-powered features\n\nDifferentiation:\n• Integrate AI/ML for intelligent recommendations and automation\n• Build a developer API to create an ecosystem effect\n• White-label option for enterprise customers (3x revenue multiplier)`;
  } else if (cat.includes("food") || cat.includes("restaurant")) {
    return `Core Menu Strategy:\n• Signature items (5–8 hero dishes defining your brand identity)\n• Seasonal specials to drive repeat visits and social media buzz\n\nRevenue Diversification:\n• Catering packages (corporate events, weddings)\n• Branded merchandise (sauces, spice blends, gift sets)\n• Subscription meal plans (weekly/monthly, 10–15% margin uplift)\n• Cooking classes and private dining events`;
  }
  return `Service Tiers for ${input.name}:\n• Tier 1 (Entry) — Core service at accessible price to acquire first customers\n• Tier 2 (Standard) — Comprehensive package with enhanced support and faster SLAs\n• Tier 3 (Premium) — Full white-glove experience with dedicated account management\n\nExpansion Opportunities:\n• Complementary services extending customer lifetime value\n• Educational content (workshops, webinars, certifications)\n• Partnership referral program with adjacent service providers`;
}

function generateHiringNeeds(input: ProjectInput, budget: number): string {
  const budgetBracket = budget >= 500000 ? "large" : budget >= 100000 ? "medium" : "small";
  if (budgetBracket === "large") {
    return `Immediate Hires (Month 1):\n• CEO/Founder, COO, CTO or Head of Technology\n\nCore Team (Months 1–6):\n• Sales Manager + 2–3 Sales Representatives\n• Marketing Manager\n• Customer Success Lead\n• 2 Developers\n• Finance Manager\n\nSupport Staff:\n• 3–5 operational staff (role-specific to ${input.category})\n\nYear 1 Headcount: 12–18 employees\nCompensation: Competitive base + equity for senior hires, KPI-linked bonuses`;
  } else if (budgetBracket === "medium") {
    return `Immediate (Month 1): 1–2 operational core staff\nQ1: Generalist sales/marketing hire + part-time bookkeeper\nQ2–Q3: Customer support + additional operations as revenue grows\n\nYear 1 Target: 5–8 employees\n\nUse contractors for: design, legal, PR, development\nConsider equity packages to attract talent when cash-constrained`;
  }
  return `Lean Startup Approach:\n• Start as solopreneur or with 1–2 co-founders covering complementary skills\n• First hire: A versatile generalist for operations and customer interaction\n\nFreelance Resources: Upwork, Fiverr, Toptal for design, dev, legal\nConsider part-time university interns\n\nYear 1 target (with traction): 1 full-time sales/marketing hire to accelerate growth`;
}

function generateCompetitors(category: string, citySize: string): Competitor[] {
  const cat = category.toLowerCase();
  const competitorSets: { [key: string]: Competitor[] } = {
    tech: [
      { name: "Established SaaS Market Leader", type: "Direct Competitor", threatLevel: "High", notes: "Large market share, well-funded, mature product with network effects" },
      { name: "VC-Backed Startup", type: "Direct Competitor", threatLevel: "High", notes: "Fast-moving, aggressive pricing, heavy marketing spend and talent acquisition" },
      { name: "Open Source Alternative", type: "Indirect Competitor", threatLevel: "Medium", notes: "Free option but requires technical expertise — alienates non-technical buyers" },
      { name: "Legacy Enterprise Vendor", type: "Substitute", threatLevel: "Low", notes: "Expensive and slow to innovate — prime opportunity for disruption" },
    ],
    food: [
      { name: "National Chain Restaurants", type: "Direct Competitor", threatLevel: "High", notes: "Brand recognition, economies of scale, and multi-million dollar marketing budgets" },
      { name: "Local Independent Restaurants", type: "Direct Competitor", threatLevel: "Medium", notes: "Community loyalty, flexible menus, local sourcing story" },
      { name: "Food Delivery Dark Kitchens", type: "Indirect Competitor", threatLevel: "Medium", notes: "Ghost kitchen operators competing on delivery speed and price" },
      { name: "Meal Kit Services", type: "Substitute", threatLevel: "Low", notes: "Home cooking convenience — different occasion but competing for wallet share" },
    ],
    retail: [
      { name: "Amazon / E-commerce Giants", type: "Indirect Competitor", threatLevel: "High", notes: "Unlimited selection, fast delivery, aggressive pricing — redefines consumer expectations" },
      { name: "Big Box Retailers", type: "Direct Competitor", threatLevel: "High", notes: "Purchasing power, prime locations, established customer base" },
      { name: "Specialty Boutiques", type: "Direct Competitor", threatLevel: "Medium", notes: "Curated experience, loyal niche customers, strong community ties" },
      { name: "Direct-to-Consumer Brands", type: "Indirect Competitor", threatLevel: "Medium", notes: "Bypassing retail margins with strong online communities and content marketing" },
    ],
  };

  let key = "retail";
  if (cat.includes("tech") || cat.includes("software")) key = "tech";
  else if (cat.includes("food") || cat.includes("restaurant") || cat.includes("cafe")) key = "food";

  const base = competitorSets[key];
  return citySize === "small" || citySize === "medium"
    ? base.map((c, i) => (i === 0 ? { ...c, threatLevel: "Medium" as const } : c))
    : base;
}

export function analyzeProject(input: ProjectInput): AnalysisResult {
  const marketDemand = categorizeMarketDemand(input.category);
  const competitionLevel = categorizeCompetition(input.category, input.citySize);
  const subScores = computeSubScores(input);
  const successScore = calculateSuccessScore(subScores);
  const riskLevel = determineRiskLevel(successScore);
  const revenue = estimateRevenue(input.category, input.citySize, input.budget, successScore);
  const revenueProjection = generateRevenueProjection(revenue.min, revenue.max, input.budget, successScore);
  const marketBreakdown = generateMarketBreakdown(input.category, successScore);
  const keyStrengths = generateKeyStrengths(input, subScores);
  const keyRisks = generateKeyRisks(input, subScores);
  const competitors = generateCompetitors(input.category, input.citySize);
  const breakEvenMonths = computeBreakEven(input.budget, revenue.min, successScore);
  const cat = input.category.toLowerCase();
  const netMargin = cat.includes("tech") || cat.includes("software") ? 0.28 : cat.includes("food") || cat.includes("restaurant") ? 0.08 : cat.includes("retail") ? 0.10 : 0.15;
  const annualNetProfit = revenue.max * 12 * netMargin;
  const roiPercent = Math.round(((annualNetProfit - input.budget) / input.budget) * 100);

  return {
    successScore,
    riskLevel,
    marketDemand,
    competitionLevel,
    estimatedRevenueMin: revenue.min,
    estimatedRevenueMax: revenue.max,
    explanation: generateExplanation(input, successScore, riskLevel, marketDemand, competitionLevel),
    marketAnalysis: generateMarketAnalysis(input, marketDemand, competitionLevel),
    pricingStrategy: generatePricingStrategy(input, successScore),
    marketingPlan: generateMarketingPlan(input),
    brandingSuggestions: generateBrandingSuggestions(input),
    productSuggestions: generateProductSuggestions(input),
    hiringNeeds: generateHiringNeeds(input, input.budget),
    competitors,
    subScores,
    revenueProjection,
    marketBreakdown,
    keyStrengths,
    keyRisks,
    breakEvenMonths,
    roiPercent,
  };
}
