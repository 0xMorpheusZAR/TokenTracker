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
import RainmakerAnalysis from "@/pages/rainmaker-analysis";
import Terminal from "@/pages/terminal";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Terminal} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/interactive" component={InteractiveDashboard} />
      <Route path="/hyperliquid" component={HyperliquidAnalysis} />
      <Route path="/monte-carlo" component={MonteCarlo} />
      <Route path="/revenue-analysis" component={RevenueAnalysis} />
      <Route path="/failure-analysis" component={FailureAnalysis} />
      <Route path="/rainmaker" component={RainmakerAnalysis} />
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
