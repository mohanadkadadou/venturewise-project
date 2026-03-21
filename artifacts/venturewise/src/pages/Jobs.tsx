import { useState } from "react";
import { useListJobs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Building, DollarSign, Users, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Jobs() {
  const { data: jobs, isLoading } = useListJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { t } = useTranslation();

  const inputCls = "w-full bg-background/50 border border-border rounded-xl py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all";

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || job.type === filterType;
    return matchesSearch && matchesType && job.isActive;
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="glass-panel p-8 rounded-3xl mb-10 relative overflow-hidden border border-primary/10">
          <div className="absolute top-0 end-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <h1 className="text-4xl font-display font-bold mb-3 relative z-10">{t("jobs.title")}</h1>
          <p className="text-muted-foreground mb-8 max-w-2xl relative z-10">{t("jobs.subtitle")}</p>
          <div className="flex flex-col md:flex-row gap-4 relative z-10">
            <div className="relative flex-grow">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={`${t("jobs.title")}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputCls} ps-12 pe-4`}
              />
            </div>
            <div className="relative md:w-56">
              <Filter className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`${inputCls} ps-12 pe-4 bg-card appearance-none`}
              >
                <option value="all">{t("jobs.allRoles")}</option>
                <option value="full-time">{t("jobs.fullTime")}</option>
                <option value="part-time">{t("jobs.partTime")}</option>
                <option value="contract">{t("jobs.contract")}</option>
                <option value="remote">{t("jobs.remote")}</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="glass-panel h-40 rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                      {job.type.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {job.company}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                        {job.salaryMin ? formatCurrency(job.salaryMin) : '0'} – {job.salaryMax ? formatCurrency(job.salaryMax) : '...'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl">{job.description}</p>
                </div>
                <div className="flex md:flex-col items-center justify-between gap-3 shrink-0 md:w-32">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {job.applicantCount} applied
                  </div>
                  <Link
                    href={`/apply?jobId=${job.id}`}
                    className="w-full text-center py-2 px-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium text-sm"
                  >
                    {t("jobs.applyNow")}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-panel py-20 rounded-3xl text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold mb-2">{t("jobs.noJobs")}</h3>
            <button onClick={() => { setSearchTerm(""); setFilterType("all"); }} className="mt-4 text-primary hover:underline text-sm">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
