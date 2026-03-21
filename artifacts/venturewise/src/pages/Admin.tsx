import { useState } from "react";
import {
  useAdminGetStats, useAdminListUsers, useListProjects,
  useListJobs, useListStartupIdeas, useDeleteProject
} from "@workspace/api-client-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { BarChart, Users, Briefcase, Trash2, LayoutDashboard, Lightbulb } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: stats } = useAdminGetStats();
  const { data: users } = useAdminListUsers();
  const { data: projects } = useListProjects();
  const { data: jobs } = useListJobs();
  const { data: ideas } = useListStartupIdeas();

  const { mutate: delProject, isPending: isDeleting } = useDeleteProject({
    mutation: {
      onSuccess: () => {
        toast({ title: "Project Deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      }
    }
  });

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="glass-panel p-6 rounded-3xl">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {trend && <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">+{trend}%</span>}
      </div>
      <h3 className="text-3xl font-display font-bold mb-1">{value ?? "-"}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );

  const tabs = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "users", icon: Users, label: "Users" },
    { id: "projects", icon: Briefcase, label: t("nav.projects") },
    { id: "jobs", icon: Briefcase, label: t("nav.jobs") },
    { id: "ideas", icon: Lightbulb, label: t("nav.ideas") },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">{t("admin.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.subtitle")}</p>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-card text-muted-foreground hover:bg-accent/10 hover:text-foreground border border-border"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title={t("admin.totalProjects")} value={stats.totalProjects} icon={Briefcase} trend={12} />
            <StatCard title="Active Users" value={stats.totalUsers} icon={Users} trend={5} />
            <StatCard title={t("admin.totalJobs")} value={stats.totalJobs} icon={Briefcase} />
            <StatCard title={t("admin.totalApplications")} value={stats.totalApplications} icon={LayoutDashboard} trend={24} />
            <StatCard title={t("admin.totalIdeas")} value={stats.totalStartupIdeas} icon={Lightbulb} />
            <StatCard title="Avg Success Score" value={`${stats.avgSuccessScore?.toFixed(1) || 0}/100`} icon={BarChart} />
          </div>
        )}

        {activeTab === "projects" && (
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-6 py-4 text-sm font-medium">Project</th>
                    <th className="px-6 py-4 text-sm font-medium">Owner</th>
                    <th className="px-6 py-4 text-sm font-medium">{t("projects.budget")}</th>
                    <th className="px-6 py-4 text-sm font-medium">{t("projects.createdOn")}</th>
                    <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects?.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{p.ownerEmail}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatCurrency(p.budget)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{format(new Date(p.createdAt), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => confirm("Delete this project?") && delProject({ id: p.id })}
                          disabled={isDeleting}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!projects || projects.length === 0) && (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">{t("projects.noProjects")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-6 py-4 text-sm font-medium">ID</th>
                    <th className="px-6 py-4 text-sm font-medium">Name</th>
                    <th className="px-6 py-4 text-sm font-medium">Email</th>
                    <th className="px-6 py-4 text-sm font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users?.map((u) => (
                    <tr key={u.id} className="hover:bg-accent/5">
                      <td className="px-6 py-4 text-sm text-muted-foreground">#{u.id}</td>
                      <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4 text-xs text-primary font-bold uppercase">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeTab === "jobs" || activeTab === "ideas") && (
          <div className="glass-panel py-20 text-center rounded-3xl">
            <p className="text-muted-foreground mb-2">Management view for {activeTab} coming soon.</p>
            <p className="text-sm text-muted-foreground/60">
              Records: {activeTab === "jobs" ? jobs?.length : ideas?.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
