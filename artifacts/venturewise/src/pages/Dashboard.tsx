import { useParams, Link } from "wouter";
import { useGetProject } from "@workspace/api-client-react";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import {
  ArrowLeft, DollarSign, Building2, MapPin, Target,
  TrendingUp, AlertTriangle, Users, Zap, ShieldAlert,
  BadgeCheck, CheckCircle2, XCircle, Clock, Percent,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetProject(Number(id), { query: { retry: false } });
  const [activeTab, setActiveTab] = useState("market");
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen pt-32 px-6 max-w-2xl mx-auto text-center">
        <div className="glass-panel p-12 rounded-3xl">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">{t("dashboard.notFound")}</h2>
          <p className="text-muted-foreground mb-8">{t("dashboard.notFoundDesc")}</p>
          <Link href="/" className="inline-flex items-center gap-2 gold-gradient-bg px-6 py-3 rounded-full hover:opacity-90">
            <ArrowLeft className="w-4 h-4" /> {t("dashboard.goHome")}
          </Link>
        </div>
      </div>
    );
  }

  const { project, analysis } = data;

  const getRiskColor = (level: string) => {
    if (level === "Low") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (level === "High") return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  };

  const getRiskLabel = (level: string) => {
    if (level === "Low") return t("dashboard.lowRisk");
    if (level === "High") return t("dashboard.highRisk");
    return t("dashboard.mediumRisk");
  };

  const getDemandColor = (d: string) => {
    if (d === "Very High") return "text-emerald-400";
    if (d === "High") return "text-blue-400";
    if (d === "Medium") return "text-amber-400";
    return "text-rose-400";
  };

  const radarData = [
    { subject: t("dashboard.radarLabels.marketDemand"), value: analysis.subScores.marketDemandScore, fullMark: 100 },
    { subject: t("dashboard.radarLabels.competitionPos"), value: analysis.subScores.competitionScore, fullMark: 100 },
    { subject: t("dashboard.radarLabels.financialStrength"), value: analysis.subScores.financialStrengthScore, fullMark: 100 },
    { subject: t("dashboard.radarLabels.locationFit"), value: analysis.subScores.locationScore, fullMark: 100 },
    { subject: t("dashboard.radarLabels.growthPotential"), value: analysis.subScores.growthPotentialScore, fullMark: 100 },
    { subject: t("dashboard.radarLabels.execReadiness"), value: analysis.subScores.executionReadinessScore, fullMark: 100 },
  ];

  const subScoreItems = [
    { label: t("dashboard.subScores.marketDemand"), value: analysis.subScores.marketDemandScore, color: "#D4AF37" },
    { label: t("dashboard.subScores.competition"), value: analysis.subScores.competitionScore, color: "#3B82F6" },
    { label: t("dashboard.subScores.financial"), value: analysis.subScores.financialStrengthScore, color: "#10B981" },
    { label: t("dashboard.subScores.location"), value: analysis.subScores.locationScore, color: "#8B5CF6" },
    { label: t("dashboard.subScores.growth"), value: analysis.subScores.growthPotentialScore, color: "#F59E0B" },
    { label: t("dashboard.subScores.execution"), value: analysis.subScores.executionReadinessScore, color: "#EC4899" },
  ];

  const tabs = [
    { id: "market", label: t("dashboard.marketAnalysis"), content: analysis.marketAnalysis },
    { id: "pricing", label: t("dashboard.pricingStrategy"), content: analysis.pricingStrategy },
    { id: "marketing", label: t("dashboard.marketingPlan"), content: analysis.marketingPlan },
    { id: "branding", label: t("dashboard.branding"), content: analysis.brandingSuggestions },
    { id: "product", label: t("dashboard.product"), content: analysis.productSuggestions },
    { id: "hiring", label: t("dashboard.hiringNeeds"), content: analysis.hiringNeeds },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-border text-sm">
          <p className="text-foreground font-semibold mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link href="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> {t("dashboard.backToProjects")}
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" /> {project.businessType}</span>
              <span className="w-1 h-1 rounded-full bg-foreground/20" />
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {project.location}</span>
              <span className="w-1 h-1 rounded-full bg-foreground/20" />
              <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-primary" /> {project.category}</span>
            </div>
          </div>
          <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-background/50 rounded-xl border border-border">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.initialBudget")}</p>
              <p className="text-xl font-bold">{formatCurrency(Number(project.budget))}</p>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <BadgeCheck className="w-5 h-5 text-primary" />, label: t("dashboard.feasibilityScore"), value: `${analysis.successScore}/100`, sub: getRiskLabel(analysis.riskLevel), color: "text-primary" },
            { icon: <TrendingUp className="w-5 h-5 text-blue-400" />, label: t("dashboard.estMonthlyRevenue"), value: `${formatCurrency(analysis.estimatedRevenueMin)}–${formatCurrency(analysis.estimatedRevenueMax)}`, sub: t("dashboard.atFullRamp"), color: "text-blue-400" },
            { icon: <Clock className="w-5 h-5 text-amber-400" />, label: t("dashboard.breakEven"), value: `~${analysis.breakEvenMonths} ${t("dashboard.months")}`, sub: t("dashboard.estimatedPayback"), color: "text-amber-400" },
            { icon: <Percent className="w-5 h-5 text-emerald-400" />, label: t("dashboard.projectedROI"), value: `${analysis.roiPercent > 0 ? "+" : ""}${analysis.roiPercent}%`, sub: t("dashboard.yearOneReturn"), color: "text-emerald-400" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-background/50 rounded-lg">{card.icon}</div>
              </div>
              <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
              <p className={cn("text-lg font-bold", card.color)}>{card.value}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Score + Radar ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center gap-4">
            <h2 className="text-lg font-semibold self-start">{t("dashboard.overallScore")}</h2>
            <ScoreGauge score={analysis.successScore} size={200} />
            <div className={cn("px-4 py-1.5 rounded-full border text-sm font-semibold inline-flex items-center gap-2", getRiskColor(analysis.riskLevel))}>
              <AlertTriangle className="w-4 h-4" />
              {getRiskLabel(analysis.riskLevel)}
            </div>
            <div className="w-full space-y-3 mt-1">
              {subScoreItems.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                  <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-panel p-6 rounded-3xl">
            <h2 className="text-lg font-semibold mb-4">{t("dashboard.businessDimension")}</h2>
            <ResponsiveContainer width="100%" height={310}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(var(--border) / 0.5)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar name="Score" dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.18} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Revenue Projection ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-6 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold">{t("dashboard.revenueProjection")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t("dashboard.revenueSubtitle")}</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded-full" /> {t("dashboard.projected")}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400/40 inline-block rounded-full" /> {t("dashboard.range")}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={analysis.revenueProjection} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="max" stroke="#3B82F6" strokeWidth={0} fill="url(#maxGrad)" name="Max" />
              <Area type="monotone" dataKey="min" stroke="#3B82F6" strokeWidth={0} fill="url(#maxGrad)" name="Min" />
              <Area type="monotone" dataKey="projected" stroke="#D4AF37" strokeWidth={2.5} fill="url(#projGrad)" name="Projected" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Market Breakdown + Strengths + Risks ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl">
            <h2 className="text-lg font-semibold mb-0.5">{t("dashboard.revenueBreakdown")}</h2>
            <p className="text-xs text-muted-foreground mb-4">{t("dashboard.byChannel")}</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={analysis.marketBreakdown} cx="50%" cy="50%" innerRadius={52} outerRadius={82} dataKey="value" stroke="none">
                  {analysis.marketBreakdown.map((seg, idx) => <Cell key={idx} fill={seg.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {analysis.marketBreakdown.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-muted-foreground">{seg.name}</span>
                  </div>
                  <span className="font-semibold">{seg.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">{t("dashboard.keyStrengths")}</h2>
            </div>
            <div className="space-y-4">
              {analysis.keyStrengths.length > 0 ? analysis.keyStrengths.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
                  <div>
                    <p className="text-sm font-semibold mb-0.5">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">{t("dashboard.noStrengths")}</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-semibold">{t("dashboard.keyRisks")}</h2>
            </div>
            <div className="space-y-4">
              {analysis.keyRisks.length > 0 ? analysis.keyRisks.map((r, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-2" />
                  <div>
                    <p className="text-sm font-semibold mb-0.5">{r.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-emerald-400 font-medium">{t("dashboard.noRisks")}</p>}
            </div>
          </motion.div>
        </div>

        {/* ── Roadmap + Competitors ── */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">{t("dashboard.strategicRoadmap")}</h2>
              <span className="text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">{tabs.length} {t("dashboard.sections")}</span>
            </div>
            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors relative", activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 start-0 end-0 h-0.5 bg-primary" />}
                  </button>
                ))}
              </div>
              <div className="p-7 min-h-[240px]">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                  {tabs.find((t) => t.id === activeTab)?.content}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">{t("dashboard.competitiveLandscape")}</h2>
              <span className={cn("px-3 py-1 rounded-full border text-xs font-medium", getRiskColor(analysis.competitionLevel === "Very High" ? "High" : analysis.competitionLevel as "Low" | "Medium" | "High"))}>
                {analysis.competitionLevel}
              </span>
            </div>
            <div className="space-y-3">
              {analysis.competitors.map((comp, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-2xl hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-semibold text-sm">{comp.name}</h4>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ms-2",
                      comp.threatLevel === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      comp.threatLevel === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {comp.threatLevel} {t("dashboard.threatLevel")}
                    </span>
                  </div>
                  <p className="text-xs text-primary mb-1.5">{comp.type}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{comp.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Executive Summary ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-8 rounded-3xl border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl"><Zap className="w-5 h-5 text-primary" /></div>
            <h2 className="text-lg font-semibold">{t("dashboard.executiveSummary")}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{analysis.explanation}</p>
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.marketDemand")}</p>
              <p className={cn("font-bold", getDemandColor(analysis.marketDemand))}>{analysis.marketDemand}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.competition")}</p>
              <p className="font-bold">{analysis.competitionLevel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.targetMarket")}</p>
              <p className="font-bold text-sm">{project.targetMarket}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.cityTier")}</p>
              <p className="font-bold capitalize">{project.citySize}</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
