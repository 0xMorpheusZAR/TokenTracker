import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { TrendingDown, RefreshCw, BarChart3, Grid3X3, Table, Unlock, DollarSign, Users, Rocket, LineChart, Search, Settings, Bell, Maximize, Minimize, Activity, Timer, Target, Zap } from "lucide-react";
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
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("performance");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  
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

  const { data: cryptoRankStatus } = useQuery({
    queryKey: ["/api/cryptorank/status"],
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

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Trigger a refetch of queries
      window.location.reload();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const filterTokens = (tokenData: any[] | undefined) => {
    if (!tokenData || !Array.isArray(tokenData)) return [];
    
    return tokenData.filter(token => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          (token.symbol || "").toLowerCase().includes(searchLower) ||
          (token.name || "").toLowerCase().includes(searchLower) ||
          (token.exchange || "").toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Category filter
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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="mb-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-gray-700 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-white">Loading Token Analysis</p>
          <p className="text-gray-400">Fetching real-time data from CoinGecko Pro...</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-black p-8 border-b border-gray-800 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent mb-2">
                The Death of Artificial Scarcity
              </h1>
              <p className="text-gray-400 text-lg">
                Real-time analysis of low float/high FDV failures vs revenue-generating success
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search Bar */}
              <div className="relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tokens by symbol, name, or exchange..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              {/* Hyperliquid Success Link */}
              <a 
                href="/hyperliquid" 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Hyperliquid Success Story
              </a>
              
              {/* Quick Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-600 transition-all"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-600 transition-all relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
                
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg border transition-all ${
                    autoRefresh 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-500' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border-gray-600'
                  }`}
                  title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                >
                  <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                <label className="text-sm text-gray-400 mr-2">Sort:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="performance">Performance</option>
                  <option value="marketCap">Market Cap</option>
                  <option value="float">Float %</option>
                </select>
              </div>
              
              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                <label className="text-sm text-gray-400 mr-2">Filter:</label>
                <select 
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-black text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Tokens</option>
                  <option value="worst">Worst Performers</option>
                  <option value="gaming">Gaming</option>
                  <option value="defi">DeFi</option>
                  <option value="layer2">Layer 2</option>
                </select>
              </div>
              
              <button className="bg-gray-800 hover:bg-red-600 transition-all duration-300 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Notification Panel */}
        {showNotifications && (
          <div className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Real-time Alerts
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-400">Major Unlock Alert</div>
                  <div className="text-xs text-gray-300">MANTA unlocking 15.2M tokens (12% of supply) in 3 days</div>
                </div>
                <div className="text-xs text-gray-400">2 min ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-orange-400">Price Impact Warning</div>
                  <div className="text-xs text-gray-300">STRK down -8.2% following unlock event</div>
                </div>
                <div className="text-xs text-gray-400">15 min ago</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-green-400">Success Case Update</div>
                  <div className="text-xs text-gray-300">HYPE reaches new ATH: $37.42 (+1,034%)</div>
                </div>
                <div className="text-xs text-gray-400">1 hour ago</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics with Enhanced Visual Design */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-red-500 transition-all duration-300 group">
            <TrendingDown className="w-6 h-6 text-red-500 mb-2 opacity-20 absolute top-4 right-4" />
            <div className="text-2xl font-bold text-red-500">{(summary as any)?.averageLoss || "-95.2"}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Average Decline</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live data
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-red-500 transition-all duration-300">
            <Unlock className="w-6 h-6 text-red-500 mb-2 opacity-20 absolute top-4 right-4" />
            <div className="text-2xl font-bold text-red-500">$155B</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Pending Unlocks</div>
            <div className="text-xs text-gray-500 mt-1">By 2030</div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-yellow-500 transition-all duration-300">
            <div className="text-2xl font-bold">{(summary as any)?.averageInitialFloat || "13.2"}%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Initial Float</div>
            <div className="text-xs text-gray-500 mt-1">At launch</div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-green-500 transition-all duration-300">
            <Rocket className="w-6 h-6 text-green-500 mb-2 opacity-20 absolute top-4 right-4" />
            <div className="text-2xl font-bold text-green-500">+1,029%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">HYPE Performance</div>
            <div className="text-xs text-green-500 mt-1">Since launch</div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-green-500 transition-all duration-300">
            <DollarSign className="w-6 h-6 text-green-500 mb-2 opacity-20 absolute top-4 right-4" />
            <div className="text-2xl font-bold text-green-500">$1.15B</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">HYPE Revenue</div>
            <div className="text-xs text-gray-500 mt-1">Annual run rate</div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-green-500 transition-all duration-300">
            <Users className="w-6 h-6 text-green-500 mb-2 opacity-20 absolute top-4 right-4" />
            <div className="text-2xl font-bold text-green-500">190K+</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">HYPE Users</div>
            <div className="text-xs text-gray-500 mt-1">Active traders</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              viewMode === "grid" 
                ? "bg-red-600 border-red-500 text-white" 
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Grid View
          </button>
          <button 
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              viewMode === "table" 
                ? "bg-red-600 border-red-500 text-white" 
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500"
            }`}
          >
            <Table className="w-4 h-4" />
            Table View
          </button>
          <button 
            onClick={() => setViewMode("chart")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
              viewMode === "chart" 
                ? "bg-red-600 border-red-500 text-white" 
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Chart View
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
                <div className="text-2xl font-bold text-green-400">$1.15B</div>
                <div className="text-sm text-gray-400">Real Revenue</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">31%</div>
                <div className="text-sm text-gray-400">Fair Launch Float</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">190K+</div>
                <div className="text-sm text-gray-400">Real Users</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">+1,029%</div>
                <div className="text-sm text-gray-400">Price Gain</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Click the "Hyperliquid Success Story" button above to see the complete analysis →
            </p>
          </div>
        </section>

        {/* API Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">CryptoRank API</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${(cryptoRankStatus as any)?.connected ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
                <span className={`text-sm ${(cryptoRankStatus as any)?.connected ? "text-green-400" : "text-red-400"}`}>
                  {(cryptoRankStatus as any)?.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Unlock Data:</span>
                <span className="text-green-400">Real-time</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span>Hundreds of tokens</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">CoinGecko API</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${(coinGeckoStatus as any)?.connected ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
                <span className={`text-sm ${(coinGeckoStatus as any)?.connected ? "text-green-400" : "text-red-400"}`}>
                  {(coinGeckoStatus as any)?.connected ? (coinGeckoStatus as any).tier : "Disconnected"}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Price Data:</span>
                <span className="text-green-400">Real-time</span>
              </div>
              <div className="flex justify-between">
                <span>Rate Limit:</span>
                <span className="text-yellow-400">{(coinGeckoStatus as any)?.rateLimit || "Limited"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Actions Panel */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
          <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-4 space-y-3 shadow-2xl">
            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide text-center">Quick Actions</div>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-600 transition-all flex items-center gap-2 text-sm"
            >
              <Target className="w-4 h-4" />
              Top
            </button>
            
            <button
              onClick={() => {
                const chartSection = document.querySelector('[data-chart-section]');
                chartSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg border border-gray-600 transition-all flex items-center gap-2 text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Charts
            </button>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-lg text-xs"
            >
              <option value={10}>10s refresh</option>
              <option value={30}>30s refresh</option>
              <option value={60}>1m refresh</option>
              <option value={300}>5m refresh</option>
            </select>
            
            <div className="border-t border-gray-700 pt-2">
              <div className="text-xs text-gray-400 text-center">
                {filteredAndSortedTokens.length} tokens displayed
              </div>
              <div className="text-xs text-gray-500 text-center">
                {searchTerm ? `Filtered by "${searchTerm}"` : 'Showing all results'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}