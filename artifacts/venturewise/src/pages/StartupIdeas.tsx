import { useListStartupIdeas } from "@workspace/api-client-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Rocket, TrendingUp, Activity, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function StartupIdeas() {
  const { data: ideas, isLoading } = useListStartupIdeas();
  const { t } = useTranslation();

  const getStageColor = (stage: string) => {
    const map: Record<string, string> = {
      idea: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      mvp: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      growth: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      scaling: "text-primary bg-primary/10 border-primary/20",
    };
    return map[stage] || "text-foreground bg-card border-border";
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-sm font-medium mb-4">
            <Rocket className="w-4 h-4 text-primary" /> Exclusive Opportunities
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t("ideas.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{t("ideas.subtitle")}</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="glass-panel h-80 rounded-3xl animate-pulse" />)}
          </div>
        ) : ideas && ideas.filter(i => i.isActive).length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {ideas.filter(i => i.isActive).map((idea, idx) => {
              const roi = ((idea.expectedReturn - idea.requiredBudget) / idea.requiredBudget) * 100;
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="glass-panel rounded-3xl overflow-hidden group border border-border hover:border-primary/40 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-card">
                    <img
                      src={`${import.meta.env.BASE_URL}images/startup-abstract.png`}
                      alt=""
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute bottom-4 start-6 flex gap-2">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-md", getStageColor(idea.stage))}>
                        {idea.stage}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-card/80 border border-border backdrop-blur-md">
                        {idea.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-2xl font-bold mb-2">{idea.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-grow">{idea.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-background/50 rounded-xl p-4 border border-border">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{t("ideas.investment")}</p>
                        <p className="text-lg font-bold">{formatCurrency(idea.requiredBudget)}</p>
                      </div>
                      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                        <p className="text-xs text-primary mb-1 uppercase tracking-wider">Proj. Return</p>
                        <p className="text-lg font-bold">{formatCurrency(idea.expectedReturn)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                          <TrendingUp className="w-4 h-4" /> {roi.toFixed(0)}% {t("ideas.roi")}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
                          <Activity className="w-4 h-4" /> {idea.riskLevel} Risk
                        </span>
                      </div>
                      <button className="text-primary hover:text-foreground transition-colors p-2 rounded-full hover:bg-primary/10">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel py-24 text-center rounded-3xl">
            <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">{t("ideas.noIdeas")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
