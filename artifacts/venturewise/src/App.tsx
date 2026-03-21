import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRTL } from "./i18n";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Jobs from "@/pages/Jobs";
import Apply from "@/pages/Apply";
import StartupIdeas from "@/pages/StartupIdeas";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  }
});

function RTLHandler() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const dir = isRTL(i18n.language) ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", i18n.language);
  }, [i18n.language]);
  return null;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <RTLHandler />
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard/:id" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/apply" component={Apply} />
          <Route path="/startup-ideas" component={StartupIdeas} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="vw-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
