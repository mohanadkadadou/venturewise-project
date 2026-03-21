import { Link, useLocation } from "wouter";
import { Briefcase, BarChart3, BriefcaseBusiness, Lightbulb, Shield, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const [location] = useLocation();
  const isActive = href === "/" ? location === "/" : location.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(212,175,55,0.1)]"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const isAdminActive = location === "/admin";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  }, [location]);

  const navItems = [
    { href: "/", label: t("nav.analyze"), icon: BarChart3 },
    { href: "/projects", label: t("nav.projects"), icon: Briefcase },
    { href: "/jobs", label: t("nav.jobs"), icon: BriefcaseBusiness },
    { href: "/startup-ideas", label: t("nav.ideas"), icon: Lightbulb },
  ];

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
  const isDark = theme === "dark";

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "glass-panel border-border py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-colors">
              <img
                src={`${import.meta.env.BASE_URL}images/logo-mark.png`}
                alt="VentureWise"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-display font-bold text-xl tracking-wide text-foreground">
              Venture<span className="gold-gradient-text">Wise</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-card/60 backdrop-blur-md border border-border rounded-full px-2 py-1.5">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute end-0 top-full mt-2 glass-panel rounded-2xl py-2 min-w-[160px] shadow-2xl border border-border">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangMenuOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent/10",
                        i18n.language === lang.code ? "text-primary font-semibold" : "text-foreground"
                      )}
                    >
                      <span className="text-base">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin */}
            <Link
              href="/admin"
              className={cn(
                "p-2.5 rounded-full transition-colors",
                isAdminActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
              )}
            >
              <Shield className="w-5 h-5" />
            </Link>

            {/* Apply CTA */}
            <Link
              href="/apply"
              className="gold-gradient-bg px-6 py-2.5 rounded-full text-sm hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 ms-2"
            >
              {t("nav.applyNow")}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 text-muted-foreground"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel absolute top-full start-0 end-0 border-t border-border py-4 px-4 flex flex-col gap-2 shadow-2xl">
          {[...navItems, { href: "/admin", label: t("nav.admin"), icon: Shield }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-colors"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          <div className="mt-2 pt-3 border-t border-border flex flex-col gap-3">
            <div className="flex items-center gap-2 px-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); }}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-medium transition-colors text-center",
                    i18n.language === lang.code ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang.flag} {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full gold-gradient-bg px-6 py-3 rounded-xl"
            >
              {t("nav.applyNow")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
