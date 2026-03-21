import { useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListJobs, useApplyForJob } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  jobId: z.coerce.number().min(1),
  applicantName: z.string().min(2),
  applicantEmail: z.string().email(),
  skills: z.string().min(5),
  experience: z.string().min(10),
  cvText: z.string().min(20),
  coverLetter: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Apply() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialJobId = params.get("jobId");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { data: jobs, isLoading: jobsLoading } = useListJobs();
  const activeJobs = useMemo(() => jobs?.filter(j => j.isActive) || [], [jobs]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { jobId: initialJobId ? Number(initialJobId) : undefined }
  });

  const { mutate: submitApplication, isPending, isSuccess } = useApplyForJob({
    mutation: {
      onSuccess: () => toast({ title: t("apply.successTitle"), description: t("apply.successDesc") }),
      onError: (err) => toast({ variant: "destructive", title: t("home.toastError"), description: (err as Error).message || t("common.error") })
    }
  });

  const onSubmit = (data: FormData) => {
    const { jobId, ...applicationData } = data;
    submitApplication({ jobId, data: applicationData });
  };

  const inputCls = "w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all";

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">{t("apply.successTitle")}!</h1>
        <p className="text-muted-foreground max-w-md mb-8">{t("apply.successDesc")}</p>
        <div className="flex gap-4">
          <Link href="/jobs" className="px-6 py-3 rounded-full border border-border hover:bg-accent/10 transition-colors">
            {t("jobs.title")}
          </Link>
          <Link href="/" className="px-6 py-3 rounded-full gold-gradient-bg transition-transform hover:-translate-y-0.5">
            {t("common.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("jobs.title")}
        </Link>
        <div className="glass-panel p-6 sm:p-10 rounded-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">{t("apply.title")}</h1>
            <p className="text-muted-foreground">{t("apply.subtitle")}</p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("apply.position")}</label>
              {jobsLoading ? (
                <div className="h-12 bg-accent/10 animate-pulse rounded-xl" />
              ) : (
                <select {...form.register("jobId")} className={`${inputCls} bg-card`}>
                  <option value="">{t("apply.positionPlaceholder")}</option>
                  {activeJobs.map(job => <option key={job.id} value={job.id}>{job.title} @ {job.company}</option>)}
                </select>
              )}
              {form.formState.errors.jobId && <p className="text-destructive text-xs">{form.formState.errors.jobId.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">{t("apply.yourName")}</label>
                <input {...form.register("applicantName")} className={inputCls} placeholder="Jane Doe" />
                {form.formState.errors.applicantName && <p className="text-destructive text-xs">{form.formState.errors.applicantName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">{t("apply.email")}</label>
                <input type="email" {...form.register("applicantEmail")} className={inputCls} placeholder="jane@example.com" />
                {form.formState.errors.applicantEmail && <p className="text-destructive text-xs">{form.formState.errors.applicantEmail.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Key Skills</label>
              <input {...form.register("skills")} className={inputCls} placeholder="React, TypeScript, Product Management..." />
              {form.formState.errors.skills && <p className="text-destructive text-xs">{form.formState.errors.skills.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("apply.experience")}</label>
              <textarea {...form.register("experience")} rows={3} className={`${inputCls} resize-y`} placeholder="5 years in..." />
              {form.formState.errors.experience && <p className="text-destructive text-xs">{form.formState.errors.experience.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("apply.resume")}</label>
              <textarea {...form.register("cvText")} rows={5} className={`${inputCls} resize-y font-mono text-sm`} placeholder="Paste your CV/Resume text here..." />
              {form.formState.errors.cvText && <p className="text-destructive text-xs">{form.formState.errors.cvText.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("apply.coverLetter")}</label>
              <textarea {...form.register("coverLetter")} rows={4} className={`${inputCls} resize-y`} placeholder={t("apply.coverLetterPlaceholder")} />
            </div>
            <button type="submit" disabled={isPending || jobsLoading} className="w-full gold-gradient-bg py-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {isPending ? <><Loader2 className="w-5 h-5 animate-spin text-white" /> {t("apply.submitting")}</> : <span className="text-white">{t("apply.submit")}</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
