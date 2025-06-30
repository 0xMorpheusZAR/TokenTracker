import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import InteractiveDashboard from "@/pages/interactive-dashboard";
import HyperliquidAnalysis from "@/pages/hyperliquid-analysis";
import MonteCarlo from "@/pages/monte-carlo";
import RevenueAnalysis from "@/pages/revenue-analysis";
import FailureAnalysis from "@/pages/failure-analysis";
import InterestingProjects from "@/pages/interesting-projects";
import BlofinCompetition from "@/pages/blofin-competition";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AuthRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>{() => <Redirect to="/login" />}</Route>
      </Switch>
    );
  }

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
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
