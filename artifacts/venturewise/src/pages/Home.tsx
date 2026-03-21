import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateProject } from "@workspace/api-client-react";
import { Loader2, ArrowRight, Target, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [analysisStep, setAnalysisStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STEPS = [
    t("analysis.step1"),
    t("analysis.step2"),
    t("analysis.step3"),
    t("analysis.step4"),
    t("analysis.step5"),
    t("analysis.step6"),
  ];

  const formSchema = z.object({
    name: z.string().min(2),
    ownerName: z.string().min(2),
    ownerEmail: z.string().email(),
    businessType: z.string().min(2),
    category: z.string().min(2),
    location: z.string().min(2),
    citySize: z.enum(["small", "medium", "large", "metro"]),
    budget: z.coerce.number().min(1000),
    targetMarket: z.string().min(5),
    description: z.string().min(20),
  });

  type FormData = z.infer<typeof formSchema>;

  const { mutate: createProject, isPending } = useCreateProject({
    mutation: {
      onSuccess: (data) => {
        if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
        setCompletedSteps([0, 1, 2, 3, 4, 5]);
        setTimeout(() => {
          toast({ title: t("home.toastSuccess"), description: t("home.toastSuccessDesc") });
          setLocation(`/dashboard/${data.project.id}`);
        }, 600);
      },
      onError: (err) => {
        if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
        setAnalysisStep(0);
        setCompletedSteps([]);
        toast({ variant: "destructive", title: t("home.toastError"), description: (err as Error).message || t("common.error") });
      }
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { citySize: "medium", budget: 50000 }
  });

  useEffect(() => {
    if (isPending) {
      setAnalysisStep(0);
      setCompletedSteps([]);
      let step = 0;
      stepIntervalRef.current = setInterval(() => {
        setCompletedSteps(prev => [...prev, step]);
        step++;
        setAnalysisStep(Math.min(step, STEPS.length - 1));
        if (step >= STEPS.length) {
          if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
        }
      }, 900);
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [isPending]);

  const onSubmit = (data: FormData) => createProject({ data });

  const inputCls = "w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all";
  const selectCls = "w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/60 transition-all";

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="fixed inset-0 z-[-1]">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-20 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="pt-10 lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t("home.badge")}
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold leading-[1.1] mb-6 text-foreground">
              {t("home.headline1")}{" "}
              <span className="gold-gradient-text">{t("home.headline2")}</span>{" "}
              {t("home.headline3")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              {t("home.subheadline")}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-card border border-border text-primary flex-shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("home.featureMarketFit")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home.featureMarketFitDesc")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-card border border-border text-primary flex-shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("home.featureFinancials")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home.featureFinancialsDesc")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form / Loading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden"
          >
            {/* Loading overlay */}
            <AnimatePresence>
              {isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-card/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{t("home.submitting")}</h3>
                  <p className="text-sm text-muted-foreground mb-8 text-center">{t("analysis.stepsDone")}</p>
                  <div className="w-full max-w-xs space-y-3">
                    {STEPS.map((step, i) => {
                      const isDone = completedSteps.includes(i);
                      const isCurrent = analysisStep === i && !isDone;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: isDone || isCurrent ? 1 : 0.3, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? "bg-emerald-500" : isCurrent ? "bg-primary" : "bg-white/10"}`}>
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            ) : isCurrent ? (
                              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-white/30" />
                            )}
                          </div>
                          <span className={`text-sm transition-colors ${isDone ? "text-emerald-400 line-through opacity-70" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {step}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-8 w-full max-w-xs">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {completedSteps.length} / {STEPS.length}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">{t("home.formTitle")}</h2>
              <p className="text-muted-foreground text-sm">{t("home.formSubtitle")}</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.projectName")}</label>
                  <input {...form.register("name")} className={inputCls} placeholder={t("home.projectNamePlaceholder")} />
                  {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.category")}</label>
                  <select {...form.register("category")} className={selectCls}>
                    <option value="">{t("home.categoryPlaceholder")}</option>
                    <option value="technology">{t("home.catTech")}</option>
                    <option value="retail">{t("home.catRetail")}</option>
                    <option value="food">{t("home.catFood")}</option>
                    <option value="health">{t("home.catHealth")}</option>
                    <option value="finance">{t("home.catFinance")}</option>
                    <option value="other">{t("home.catOther")}</option>
                  </select>
                  {form.formState.errors.category && <p className="text-destructive text-xs">{form.formState.errors.category.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.yourName")}</label>
                  <input {...form.register("ownerName")} className={inputCls} placeholder={t("home.yourNamePlaceholder")} />
                  {form.formState.errors.ownerName && <p className="text-destructive text-xs">{form.formState.errors.ownerName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.email")}</label>
                  <input type="email" {...form.register("ownerEmail")} className={inputCls} placeholder="mail@example.com" />
                  {form.formState.errors.ownerEmail && <p className="text-destructive text-xs">{form.formState.errors.ownerEmail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.businessType")}</label>
                  <input {...form.register("businessType")} className={inputCls} placeholder={t("home.businessTypePlaceholder")} />
                  {form.formState.errors.businessType && <p className="text-destructive text-xs">{form.formState.errors.businessType.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.budget")}</label>
                  <input type="number" {...form.register("budget")} className={inputCls} placeholder="50000" />
                  {form.formState.errors.budget && <p className="text-destructive text-xs">{form.formState.errors.budget.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.targetLocation")}</label>
                  <input {...form.register("location")} className={inputCls} placeholder={t("home.targetLocationPlaceholder")} />
                  {form.formState.errors.location && <p className="text-destructive text-xs">{form.formState.errors.location.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{t("home.citySize")}</label>
                  <select {...form.register("citySize")} className={selectCls}>
                    <option value="small">{t("home.citySmall")}</option>
                    <option value="medium">{t("home.cityMedium")}</option>
                    <option value="large">{t("home.cityLarge")}</option>
                    <option value="metro">{t("home.cityMetro")}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">{t("home.targetMarket")}</label>
                <input {...form.register("targetMarket")} className={inputCls} placeholder={t("home.targetMarketPlaceholder")} />
                {form.formState.errors.targetMarket && <p className="text-destructive text-xs">{form.formState.errors.targetMarket.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">{t("home.description")}</label>
                <textarea
                  {...form.register("description")}
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder={t("home.descriptionPlaceholder")}
                />
                {form.formState.errors.description && <p className="text-destructive text-xs">{form.formState.errors.description.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full gold-gradient-bg py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-base text-white">{t("home.submitting")}</span>
                  </>
                ) : (
                  <>
                    <span className="text-base text-white">{t("home.submit")}</span>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
