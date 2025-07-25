import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import InteractiveDashboard from "@/pages/interactive-dashboard";
import HyperliquidAnalysis from "@/pages/hyperliquid-analysis";
import MonteCarlo from "@/pages/monte-carlo";
import RevenueAnalysis from "@/pages/revenue-analysis";
import FailureAnalysis from "@/pages/failure-analysis";
import InterestingProjects from "@/pages/interesting-projects";
import BlofinCompetition from "@/pages/blofin-competition";
import RevenueDashboard from "@/pages/revenue-dashboard";
import PumpfunDashboard from "@/pages/pumpfun-dashboard";

import VeloDashboard from "@/pages/velo-dashboard";
import EnhancedVeloDashboard from "@/pages/enhanced-dashboard";
import VeloNewsDashboard from "@/pages/velo-news-dashboard";
import AltseasonDashboard from "@/pages/altseason-dashboard";
import TradingAnalysis from "@/pages/trading-analysis";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={InteractiveDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/interactive" component={InteractiveDashboard} />
      <Route path="/hyperliquid" component={HyperliquidAnalysis} />
      <Route path="/monte-carlo" component={MonteCarlo} />
      <Route path="/revenue-analysis" component={RevenueAnalysis} />
      <Route path="/failure-analysis" component={FailureAnalysis} />
      <Route path="/rainmaker" component={InterestingProjects} />
      <Route path="/interesting-projects" component={InterestingProjects} />
      <Route path="/blofin-competition" component={BlofinCompetition} />
      <Route path="/revenue-dashboard" component={RevenueDashboard} />
      <Route path="/pumpfun" component={PumpfunDashboard} />

      <Route path="/velo-dashboard" component={VeloNewsDashboard} />
      <Route path="/velo-news" component={VeloNewsDashboard} />
      <Route path="/altseason" component={AltseasonDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
