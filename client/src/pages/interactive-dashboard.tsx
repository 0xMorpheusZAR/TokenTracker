import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { TrendingDown, RefreshCw, BarChart3, Grid3X3, Table, Unlock, DollarSign, Users, Rocket, LineChart, Video, Cpu, Trophy } from "lucide-react";
import SiteFooter from "@/components/site-footer";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Scatter, Bubble, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function InteractiveDashboard() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("performance");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  
  // Chart controls state
  const [performanceChartType, setPerformanceChartType] = useState("bar");
  const [floatChartType, setFloatChartType] = useState("scatter");
  const [sectorChartType, setSectorChartType] = useState("doughnut");
  const [timelinePeriod, setTimelinePeriod] = useState("1m");

  const { data: tokens } = useQuery({
    queryKey: ["/api/tokens"],
  });

  const { data: summary } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });



  const { data: coinGeckoStatus } = useQuery({
    queryKey: ["/api/coingecko/status"],
  });

  const { data: hyperliquidData } = useQuery({
    queryKey: ["/api/hyperliquid/comprehensive"],
  });

  const { data: detailedTokenData } = useQuery({
    queryKey: ["/api/coingecko/detailed"],
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefresh;
    const RATE_LIMIT_MS = 30000; // 30 seconds rate limit

    if (timeSinceLastRefresh < RATE_LIMIT_MS) {
      const remainingTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastRefresh) / 1000);
      alert(`Please wait ${remainingTime} seconds before refreshing again to respect API rate limits.`);
      return;
    }

    setIsRefreshing(true);
    try {
      // Invalidate all queries to force refresh
      await queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/coingecko/detailed"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/hyperliquid/comprehensive"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/coingecko/status"] });
      
      setLastRefresh(now);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000); // Minimum 1 second to show loading state
    }
  };

  const filterTokens = (tokenData: any[] | undefined) => {
    if (!tokenData || !Array.isArray(tokenData)) return [];
    
    return tokenData.filter(token => {
      if (filterBy === "all") return true;
      if (filterBy === "worst") return parseFloat(token.performancePercent || "0") < -90;
      if (filterBy === "gaming") return (token.sector || "").toLowerCase().includes("gaming");
      if (filterBy === "defi") return (token.sector || "").toLowerCase().includes("defi");
      if (filterBy === "layer2") return (token.sector || "").toLowerCase().includes("layer");
      return true;
    });
  };

  const sortTokens = (tokenData: any[]) => {
    if (!tokenData || !Array.isArray(tokenData)) return [];
    
    return [...tokenData].sort((a, b) => {
      switch (sortBy) {
        case "performance":
          return parseFloat(a.performancePercent || "0") - parseFloat(b.performancePercent || "0");
        case "marketCap":
          return parseFloat(b.currentPrice || "0") - parseFloat(a.currentPrice || "0");
        case "float":
          return parseFloat(a.initialFloat || "0") - parseFloat(b.initialFloat || "0");
        default:
          return 0;
      }
    });
  };

  const toggleTokenSelection = (tokenId: string) => {
    setSelectedTokens(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const getPerformanceColor = (performance: string) => {
    const perf = parseFloat(performance);
    if (perf < -90) return "text-red-500";
    if (perf < -50) return "text-orange-500";
    return "text-yellow-500";
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num < 0.001) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  const filteredAndSortedTokens = sortTokens(filterTokens(tokens as any[]));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header skeleton */}
        <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-b border-slate-700/50 backdrop-blur-xl">
          <div className="relative max-w-7xl mx-auto p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm font-medium uppercase tracking-wider animate-pulse">Loading Analysis</span>
                </div>
                
                <div className="space-y-4">
                  <div className="h-16 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-lg animate-pulse"></div>
                  <div className="h-8 bg-slate-700/50 rounded-lg animate-pulse max-w-2xl"></div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="h-12 w-32 bg-slate-700/50 rounded-xl animate-pulse"></div>
                <div className="h-12 w-32 bg-slate-700/50 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content skeleton */}
        <main className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Stats cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded animate-pulse"></div>
                  <div className="h-8 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </section>

          {/* Charts section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="space-y-4">
                <div className="h-6 bg-slate-700/50 rounded animate-pulse w-48"></div>
                <div className="h-64 bg-slate-700/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <div className="space-y-4">
                <div className="h-6 bg-slate-700/50 rounded animate-pulse w-48"></div>
                <div className="h-64 bg-slate-700/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </section>

          {/* Table section */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="space-y-4">
              <div className="h-6 bg-slate-700/50 rounded animate-pulse w-64"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-slate-700/50 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </section>

          {/* Loading indicator */}
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 text-lg">Loading market data...</p>
            <p className="text-slate-500 text-sm mt-2">Fetching real-time prices and analytics</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-b border-slate-700/50 backdrop-blur-xl sticky top-0 z-40">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8">
            <div className="flex-1 space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-xs sm:text-sm font-medium uppercase tracking-wider">Live Analysis</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500 mb-2 sm:mb-4 leading-tight tracking-tight">
                A Comprehensive Breakdown of High FDV Failures
              </h1>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pt-1 sm:pt-2">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">CoinGecko Pro API</span>
                </div>
                <div className="hidden sm:block w-0.5 h-4 bg-slate-600"></div>
                <div className="text-slate-400 text-xs sm:text-sm">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <a 
                  href="/revenue-analysis" 
                  className="group relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">Cash Cows</span>
                </a>
                
                <a 
                  href="/hyperliquid" 
                  className="group relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/25 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">Success</span>
                </a>
                
                <a 
                  href="/monte-carlo" 
                  className="group relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">Simulation</span>
                </a>
                
                <a 
                  href="/failure-analysis" 
                  className="group relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/25 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">Failures</span>
                </a>
                
                <a 
                  href="/interesting-projects" 
                  className="group relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600/80 via-violet-600/80 to-indigo-600/80 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden backdrop-blur-sm border border-purple-500/20 hover:border-purple-400/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.3)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:animate-pulse" />
                  <span className="relative z-10">Projects</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-75"></div>
                </a>
                
                <a 
                  href="/blofin-competition" 
                  className="group relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600/80 via-amber-600/80 to-yellow-600/80 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/40 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden backdrop-blur-sm border border-orange-500/20 hover:border-orange-400/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/20 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.3)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:animate-pulse" />
                  <span className="relative z-10">BloFin</span>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse opacity-75"></div>
                </a>
                
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="group relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/25 flex items-center justify-center gap-1 sm:gap-2 overflow-hidden disabled:cursor-not-allowed col-span-2 sm:col-span-1"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="relative z-10">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <label className="text-xs sm:text-sm text-slate-400 font-medium">Sort:</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="ml-1 sm:ml-2 bg-transparent text-white border-none outline-none text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    <option value="performance" className="bg-slate-800">Performance</option>
                    <option value="marketCap" className="bg-slate-800">Market Cap</option>
                    <option value="float" className="bg-slate-800">Float %</option>
                  </select>
                </div>
                
                <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <label className="text-xs sm:text-sm text-slate-400 font-medium">Filter:</label>
                  <select 
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="ml-1 sm:ml-2 bg-transparent text-white border-none outline-none text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    <option value="all" className="bg-slate-800">All Tokens</option>
                    <option value="worst" className="bg-slate-800">Worst Performers</option>
                    <option value="gaming" className="bg-slate-800">Gaming</option>
                    <option value="defi" className="bg-slate-800">DeFi</option>
                    <option value="layer2" className="bg-slate-800">Layer 2</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-slate-700/50 hover:border-red-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-500" />
            </div>
            <div className="relative z-10">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-400 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                {(summary as any)?.averageLoss || "-95.2"}%
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1 sm:mb-3">Average Decline</div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Live data</span>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-slate-700/50 hover:border-red-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <Unlock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-500" />
            </div>
            <div className="relative z-10">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-400 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">$155B</div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1 sm:mb-3">Pending Unlocks</div>
              <div className="text-xs text-slate-500 font-medium">By 2030</div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 font-bold text-sm">%</span>
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                {(summary as any)?.averageInitialFloat || "13.2"}%
              </div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">Avg Initial Float</div>
              <div className="text-xs text-slate-500 font-medium">At launch</div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <Rocket className="w-8 h-8 text-green-500" />
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">+1,029%</div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">HYPE Performance</div>
              <div className="text-xs text-green-400 font-medium">Since launch</div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">$1.15B</div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">HYPE Revenue</div>
              <div className="text-xs text-green-400 font-medium">Annual run rate</div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <Users className="w-8 h-8 text-cyan-500" />
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-cyan-400 mb-2 group-hover:scale-110 transition-transform duration-300">190K+</div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">HYPE Users</div>
              <div className="text-xs text-cyan-400 font-medium">Active traders</div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap text-xs sm:text-sm ${
              viewMode === "grid" 
                ? "bg-red-600 border-red-500 text-white" 
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500"
            }`}
          >
            <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid View</span>
            <span className="inline sm:hidden">Grid</span>
          </button>
          <button 
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap text-xs sm:text-sm ${
              viewMode === "table" 
                ? "bg-red-600 border-red-500 text-white" 
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500"
            }`}
          >
            <Table className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Table View</span>
            <span className="inline sm:hidden">Table</span>
          </button>
          <button 
            onClick={() => setViewMode("chart")}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap text-xs sm:text-sm ${
              viewMode === "chart" 
                ? "bg-red-600 border-red-500 text-white" 
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500"
            }`}
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Chart View</span>
            <span className="inline sm:hidden">Charts</span>
          </button>
        </div>

        {/* Token Grid */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredAndSortedTokens.map((token: any, index: number) => (
              <div 
                key={token.id}
                onClick={() => toggleTokenSelection(token.id)}
                className={`bg-gray-900 border rounded-xl p-6 transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-2 hover:shadow-xl ${
                  selectedTokens.includes(token.id) 
                    ? "border-blue-500 shadow-blue-500/20" 
                    : "border-gray-800 hover:border-red-500 hover:shadow-red-500/20"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{token.name}</h3>
                    <div className="text-sm text-gray-400">
                      {token.symbol} • {token.exchange} • {token.listingDate}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getPerformanceColor(token.performancePercent)}`}>
                    {token.performancePercent}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Listing Price</div>
                    <div className="text-lg font-semibold">${formatPrice(token.listingPrice)}</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Price</div>
                    <div className={`text-lg font-semibold ${getPerformanceColor(token.performancePercent)}`}>
                      ${formatPrice(token.currentPrice)}
                    </div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Initial Float</div>
                    <div className="text-lg font-semibold">{token.initialFloat}%</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Peak FDV</div>
                    <div className="text-lg font-semibold">{token.peakFdv}</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        parseFloat(token.performancePercent) < 0 ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(Math.abs(parseFloat(token.performancePercent)), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wide">Token</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wide">Exchange</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400 uppercase tracking-wide">Listing Price</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400 uppercase tracking-wide">Current Price</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400 uppercase tracking-wide">Performance</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400 uppercase tracking-wide">Float</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400 uppercase tracking-wide">Peak FDV</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTokens.map((token: any) => (
                    <tr 
                      key={token.id}
                      className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => toggleTokenSelection(token.id)}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-sm text-gray-400">{token.symbol}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{token.exchange}</td>
                      <td className="p-4 text-right">${formatPrice(token.listingPrice)}</td>
                      <td className={`p-4 text-right ${getPerformanceColor(token.performancePercent)}`}>
                        ${formatPrice(token.currentPrice)}
                      </td>
                      <td className={`p-4 text-right font-bold ${getPerformanceColor(token.performancePercent)}`}>
                        {token.performancePercent}%
                      </td>
                      <td className="p-4 text-right">{token.initialFloat}%</td>
                      <td className="p-4 text-right">{token.peakFdv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chart View */}
        {viewMode === "chart" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance Bar Chart */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Token Performance</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPerformanceChartType("bar")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      performanceChartType === "bar" 
                        ? "bg-red-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Bar
                  </button>
                  <button 
                    onClick={() => setPerformanceChartType("line")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      performanceChartType === "line" 
                        ? "bg-red-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>
              <div className="h-80">
                {performanceChartType === "bar" ? (
                  <Bar 
                    data={{
                      labels: filteredAndSortedTokens.slice(0, 8).map((token: any) => token.symbol),
                      datasets: [{
                        label: 'Performance %',
                        data: filteredAndSortedTokens.slice(0, 8).map((token: any) => parseFloat(token.performancePercent || "0")),
                        backgroundColor: filteredAndSortedTokens.slice(0, 8).map((token: any) => {
                          const perf = parseFloat(token.performancePercent || "0");
                          return perf < -90 ? '#ff0040' : perf < -50 ? '#ff6b6b' : '#fbbf24';
                        }),
                        borderColor: '#333',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#1a1a1a',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#333',
                          borderWidth: 1
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        },
                        x: {
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        }
                      }
                    }}
                  />
                ) : (
                  <Line 
                    data={{
                      labels: filteredAndSortedTokens.slice(0, 8).map((token: any) => token.symbol),
                      datasets: [{
                        label: 'Performance %',
                        data: filteredAndSortedTokens.slice(0, 8).map((token: any) => parseFloat(token.performancePercent || "0")),
                        borderColor: '#ff0040',
                        backgroundColor: 'rgba(255, 0, 64, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#ff0040',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#1a1a1a',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#333',
                          borderWidth: 1
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        },
                        x: {
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Float vs Performance Scatter */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Float vs Performance</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFloatChartType("scatter")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      floatChartType === "scatter" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Scatter
                  </button>
                  <button 
                    onClick={() => setFloatChartType("bubble")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      floatChartType === "bubble" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Bubble
                  </button>
                </div>
              </div>
              <div className="h-80">
                {floatChartType === "scatter" ? (
                  <Scatter 
                    data={{
                      datasets: [{
                        label: 'Float vs Performance',
                        data: filteredAndSortedTokens.slice(0, 8).map((token: any) => ({
                          x: parseFloat(token.initialFloat || "0"),
                          y: parseFloat(token.performancePercent || "0")
                        })),
                        backgroundColor: '#0088ff',
                        borderColor: '#0088ff',
                        pointRadius: 6
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#1a1a1a',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#333',
                          borderWidth: 1,
                          callbacks: {
                            title: () => 'Token Analysis',
                            label: (context: any) => {
                              const token = filteredAndSortedTokens[context.dataIndex];
                              return [
                                `${token?.symbol || 'Unknown'}`,
                                `Float: ${context.parsed.x}%`,
                                `Performance: ${context.parsed.y}%`
                              ];
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Initial Float %',
                            color: '#888'
                          },
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Performance %',
                            color: '#888'
                          },
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        }
                      }
                    }}
                  />
                ) : (
                  <Bubble 
                    data={{
                      datasets: [{
                        label: 'Float vs Performance vs Market Cap',
                        data: filteredAndSortedTokens.slice(0, 8).map((token: any) => ({
                          x: parseFloat(token.initialFloat || "0"),
                          y: parseFloat(token.performancePercent || "0"),
                          r: Math.max(5, Math.min(25, (token.marketCap || 1000000000) / 100000000))
                        })),
                        backgroundColor: 'rgba(0, 136, 255, 0.6)',
                        borderColor: '#0088ff',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#1a1a1a',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#333',
                          borderWidth: 1,
                          callbacks: {
                            title: () => 'Token Analysis',
                            label: (context: any) => {
                              const token = filteredAndSortedTokens[context.dataIndex];
                              return [
                                `${token?.symbol || 'Unknown'}`,
                                `Float: ${context.parsed.x}%`,
                                `Performance: ${context.parsed.y}%`,
                                `Market Cap: $${((token?.marketCap || 0) / 1e9).toFixed(2)}B`
                              ];
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Initial Float %',
                            color: '#888'
                          },
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Performance %',
                            color: '#888'
                          },
                          grid: { color: '#333' },
                          ticks: { color: '#888' }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Market Cap Distribution */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sector Distribution</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSectorChartType("doughnut")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      sectorChartType === "doughnut" 
                        ? "bg-purple-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Doughnut
                  </button>
                  <button 
                    onClick={() => setSectorChartType("pie")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      sectorChartType === "pie" 
                        ? "bg-purple-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Pie
                  </button>
                </div>
              </div>
              <div className="h-80">
                {sectorChartType === "doughnut" ? (
                  <Doughnut 
                    data={{
                      labels: ['Gaming', 'DeFi', 'Layer 2', 'Infrastructure'],
                      datasets: [{
                        data: [25, 35, 25, 15],
                        backgroundColor: ['#ff0040', '#ff6b6b', '#fbbf24', '#8b5cf6'],
                        borderColor: '#1a1a1a',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#888' }
                        },
                        tooltip: {
                          backgroundColor: '#1a1a1a',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#333',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                ) : (
                  <Pie 
                    data={{
                      labels: ['Gaming', 'DeFi', 'Layer 2', 'Infrastructure'],
                      datasets: [{
                        data: [25, 35, 25, 15],
                        backgroundColor: ['#ff0040', '#ff6b6b', '#fbbf24', '#8b5cf6'],
                        borderColor: '#1a1a1a',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#888' }
                        },
                        tooltip: {
                          backgroundColor: '#1a1a1a',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#333',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Timeline Analysis */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Price Timeline</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTimelinePeriod("1m")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      timelinePeriod === "1m" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    1M
                  </button>
                  <button 
                    onClick={() => setTimelinePeriod("3m")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      timelinePeriod === "3m" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    3M
                  </button>
                  <button 
                    onClick={() => setTimelinePeriod("6m")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      timelinePeriod === "6m" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    6M
                  </button>
                  <button 
                    onClick={() => setTimelinePeriod("1y")}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      timelinePeriod === "1y" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    1Y
                  </button>
                </div>
              </div>
              <div className="h-80">
                <Line 
                  data={{
                    labels: timelinePeriod === "1m" 
                      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
                      : timelinePeriod === "3m" 
                      ? ['Month 1', 'Month 2', 'Month 3']
                      : timelinePeriod === "6m"
                      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                      : ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                      label: 'Average Performance Decline',
                      data: timelinePeriod === "1m" 
                        ? [-15, -35, -55, -75]
                        : timelinePeriod === "3m" 
                        ? [-30, -65, -85]
                        : timelinePeriod === "6m"
                        ? [-10, -25, -45, -65, -80, -90]
                        : [-45, -75, -90, -95],
                      borderColor: '#ff0040',
                      backgroundColor: 'rgba(255, 0, 64, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: '#ff0040',
                      pointBorderColor: '#1a1a1a',
                      pointBorderWidth: 2,
                      pointRadius: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#333',
                        borderWidth: 1
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        grid: { color: '#333' },
                        ticks: { color: '#888' }
                      },
                      x: {
                        grid: { color: '#333' },
                        ticks: { color: '#888' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Hyperliquid Teaser Section */}
        <section className="bg-gradient-to-br from-green-900/10 to-gray-900 border border-green-500/30 rounded-xl p-6 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-400 mb-4">
              Why Did Hyperliquid Succeed While Others Failed?
            </h2>
            <p className="text-gray-300 mb-6">
              While low float tokens lost -95.2% on average, Hyperliquid gained +1,029% with real revenue and fair tokenomics.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">76.07%</div>
                <div className="text-sm text-gray-400">Market Share</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">$830M</div>
                <div className="text-sm text-gray-400">Annual Revenue</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">511K+</div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">+1,129%</div>
                <div className="text-sm text-gray-400">Price Gain</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Click the "Hyperliquid Success Story" button above to see the complete analysis →
            </p>
          </div>
        </section>

        {/* Data Source Status */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${(coinGeckoStatus as any)?.connected ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
              <span className="text-white font-semibold">CoinGecko Pro API</span>
              <span className="text-green-400 text-sm">({(coinGeckoStatus as any)?.tier} Tier)</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Real-time pricing data with enhanced accuracy and rate limits
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}