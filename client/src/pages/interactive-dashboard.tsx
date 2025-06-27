import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { TrendingDown, RefreshCw, BarChart3, Grid3X3, Table, Unlock, DollarSign, Users, Rocket, LineChart } from "lucide-react";
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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-red-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading market data...</p>
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
              <a 
                href="/hyperliquid" 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Hyperliquid Success Story
              </a>
              
              <a 
                href="/monte-carlo" 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Price Simulations
              </a>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              
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
              

            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Key Metrics */}
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
    </div>
  );
}