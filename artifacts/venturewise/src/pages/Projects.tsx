import { useListProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Briefcase, MapPin, Target, ChevronRight, Plus, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">{t("projects.title")}</h1>
            <p className="text-muted-foreground">{t("projects.subtitle")}</p>
          </div>
          <Link href="/" className="hidden sm:flex items-center gap-2 gold-gradient-bg px-6 py-2.5 rounded-full text-sm hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" /> {t("projects.newAnalysis")}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-panel h-64 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Link href={`/dashboard/${project.id}`} className="block h-full group">
                  <div className="h-full glass-panel p-6 rounded-3xl border border-border hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 end-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 text-primary">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-1">{format(new Date(project.createdAt), 'MMM d, yyyy')}</div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.name}</h3>
                    </div>
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" /> {project.category}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" /> {project.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" /> {formatCurrency(project.budget)} {t("projects.budget")}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-medium">{t("projects.viewReport")}</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-16 rounded-3xl text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-2xl font-display font-bold mb-2">{t("projects.noProjects")}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("projects.noProjectsDesc")}</p>
            <Link href="/" className="inline-flex items-center gap-2 gold-gradient-bg px-6 py-3 rounded-full hover:opacity-90">
              {t("projects.startAnalysis")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
