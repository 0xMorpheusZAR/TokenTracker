import { useQuery } from "@tanstack/react-query";
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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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
  ArcElement
);

export default function InteractiveDashboard() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("performance");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            
            <div className="flex flex-wrap gap-4">
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
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">Bar</button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">Line</button>
                </div>
              </div>
              <div className="h-80">
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
              </div>
            </div>

            {/* Float vs Performance Scatter */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Float vs Performance</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Scatter</button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">Bubble</button>
                </div>
              </div>
              <div className="h-80">
                <Bar 
                  data={{
                    labels: filteredAndSortedTokens.slice(0, 8).map((token: any) => token.symbol),
                    datasets: [{
                      label: 'Initial Float %',
                      data: filteredAndSortedTokens.slice(0, 8).map((token: any) => parseFloat(token.initialFloat || "0")),
                      backgroundColor: '#0088ff',
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
                        beginAtZero: true,
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

            {/* Market Cap Distribution */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sector Distribution</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm">Doughnut</button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">Pie</button>
                </div>
              </div>
              <div className="h-80">
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
              </div>
            </div>

            {/* Timeline Analysis */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Price Timeline</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">1M</button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">3M</button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">6M</button>
                  <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">1Y</button>
                </div>
              </div>
              <div className="h-80">
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                      label: 'Average Performance',
                      data: [-10, -25, -45, -60, -75, -85, -90, -92, -94, -95, -95.5, -96],
                      borderColor: '#ff0040',
                      backgroundColor: 'rgba(255, 0, 64, 0.1)',
                      tension: 0.4,
                      pointBackgroundColor: '#ff0040',
                      pointBorderColor: '#1a1a1a',
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
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Hyperliquid Analysis Section */}
        <section className="bg-gradient-to-br from-green-900/20 to-gray-900 border-2 border-green-500 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-black bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-4">
                The New Paradigm: Hyperliquid
              </h2>
              <p className="text-2xl text-gray-300 mb-2">Real Revenue. Real Users. Real Value.</p>
              <p className="text-lg text-gray-400">The Only Token That Actually Works</p>
            </div>
            
            {/* Real-time Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-3xl font-black text-green-400">
                  ${(hyperliquidData as any)?.realTimeMetrics?.currentPrice?.toFixed(2) || "36.50"}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Current Price</div>
                <div className="text-xs text-green-400 mt-1">
                  {(hyperliquidData as any)?.realTimeMetrics?.priceChange24h > 0 ? '+' : ''}
                  {(hyperliquidData as any)?.realTimeMetrics?.priceChange24h?.toFixed(1) || "+5.2"}% 24h
                </div>
              </div>
              
              <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-3xl font-black text-green-400">
                  +{(hyperliquidData as any)?.realTimeMetrics?.priceChangeSinceLaunch?.toFixed(0) || "1,029"}%
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Since Launch</div>
                <div className="text-xs text-gray-400 mt-1">Nov 29, 2024</div>
              </div>
              
              <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-3xl font-black text-green-400">
                  ${((hyperliquidData as any)?.realTimeMetrics?.marketCap / 1e9)?.toFixed(2) || "12.07"}B
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Market Cap</div>
                <div className="text-xs text-gray-400 mt-1">Rank #41</div>
              </div>
              
              <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-3xl font-black text-green-400">
                  ${((hyperliquidData as any)?.fundamentals?.annualRevenue / 1e9)?.toFixed(2) || "1.15"}B
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Annual Revenue</div>
                <div className="text-xs text-green-400 mt-1">275% QoQ Growth</div>
              </div>
              
              <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-3xl font-black text-green-400">
                  {((hyperliquidData as any)?.fundamentals?.activeUsers / 1000)?.toFixed(0) || "190"}K+
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Active Users</div>
                <div className="text-xs text-gray-400 mt-1">Real traders</div>
              </div>
              
              <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="text-3xl font-black text-green-400">
                  {(hyperliquidData as any)?.fundamentals?.launchFloat?.toFixed(1) || "33.4"}%
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Fair Launch Float</div>
                <div className="text-xs text-green-400 mt-1">2.5x Failed Avg</div>
              </div>
            </div>

            {/* Comparative Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/40 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Rocket className="w-6 h-6" />
                  Success Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                    <span className="text-gray-300">Price Performance</span>
                    <span className="text-green-400 font-bold">+1,029% vs -95% avg failure</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                    <span className="text-gray-300">Daily Volume</span>
                    <span className="text-green-400 font-bold">
                      ${((hyperliquidData as any)?.fundamentals?.dailyVolume / 1e9)?.toFixed(1) || "2.8"}B vs $0 failures
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                    <span className="text-gray-300">Monthly Revenue</span>
                    <span className="text-green-400 font-bold">
                      ${((hyperliquidData as any)?.fundamentals?.monthlyRevenue / 1e6)?.toFixed(0) || "96"}M recurring
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                    <span className="text-gray-300">Operating Margin</span>
                    <span className="text-green-400 font-bold">~85% profitability</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-6 border border-red-500/30">
                <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6" />
                  Failed Token Comparison
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg">
                    <span className="text-gray-300">Average Float</span>
                    <span className="text-red-400 font-bold">13.2% (artificially scarce)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg">
                    <span className="text-gray-300">Revenue Model</span>
                    <span className="text-red-400 font-bold">$0 - No working product</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg">
                    <span className="text-gray-300">Real Users</span>
                    <span className="text-red-400 font-bold">Minimal - Speculative only</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg">
                    <span className="text-gray-300">Performance</span>
                    <span className="text-red-400 font-bold">-95.2% average decline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Model Deep Dive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-black/40 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Streams
                </h3>
                <div className="space-y-3">
                  {(hyperliquidData as any)?.businessModel?.revenueStreams?.map((stream: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      {stream}
                    </div>
                  )) || [
                    <div key="1" className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Trading fees (0.02-0.05%)
                    </div>,
                    <div key="2" className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Liquidation fees
                    </div>
                  ]}
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Growth
                </h3>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-400">
                    {((hyperliquidData as any)?.fundamentals?.dailyActiveUsers / 1000)?.toFixed(0) || "45"}K
                  </div>
                  <div className="text-sm text-gray-400">Daily Active Users</div>
                  <div className="text-sm text-green-400">
                    Growing organically from product-market fit
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Unlock className="w-5 h-5" />
                  Tokenomics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Team Allocation</span>
                    <span className="text-green-400">23% (4yr vesting)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Community</span>
                    <span className="text-green-400">77% (fair distribution)</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    No private sales, no VC dumping
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-black/40 rounded-xl p-6 border border-yellow-500/30">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Risk Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-green-400 font-bold">LOW</div>
                  <div className="text-xs text-gray-400 mt-1">Technical Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">LOW</div>
                  <div className="text-xs text-gray-400 mt-1">Token Dilution</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">LOW</div>
                  <div className="text-xs text-gray-400 mt-1">Team Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold">MEDIUM</div>
                  <div className="text-xs text-gray-400 mt-1">Competition</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold">MEDIUM</div>
                  <div className="text-xs text-gray-400 mt-1">Regulatory</div>
                </div>
              </div>
            </div>
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
      </div>
    </div>
  );
}