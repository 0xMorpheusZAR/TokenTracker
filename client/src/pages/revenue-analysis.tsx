import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Users, Zap, Target, BarChart3, PieChart, Activity } from "lucide-react";
import { Line, Bar, Pie } from "react-chartjs-2";
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
} from "chart.js";

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

interface ProtocolData {
  symbol: string;
  protocol_name: string;
  category: string;
  total_supply: number;
  key_value_capture: string;
  current_price: number;
  market_cap: number;
  annualized_revenue: number;
  monthly_revenue_30d: number;
  revenue_growth_30d: number;
  revenue_growth_90d: number;
  revenue_growth_1y: number;
  fees_to_revenue_ratio: number;
  pe_ratio: number;
  price_change_30d: number;
  price_change_90d: number;
  price_change_1y: number;
}

export default function RevenueAnalysis() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'growth' | 'efficiency'>('revenue');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [compareToHype, setCompareToHype] = useState(true);

  // Simulated data based on the SQL query structure - in real implementation, this would come from the API
  const protocolData: ProtocolData[] = [
    {
      symbol: 'HYPE',
      protocol_name: 'hyperliquid',
      category: 'PERPS',
      total_supply: 999990391,
      key_value_capture: 'Fee Burns',
      current_price: 36.50,
      market_cap: 12070000000,
      annualized_revenue: 1150000000,
      monthly_revenue_30d: 95833333,
      revenue_growth_30d: 28.5,
      revenue_growth_90d: 145.2,
      revenue_growth_1y: 890.3,
      fees_to_revenue_ratio: 0.65,
      pe_ratio: 10.5,
      price_change_30d: 15.8,
      price_change_90d: 245.6,
      price_change_1y: 1029.5
    },
    {
      symbol: 'UNI',
      protocol_name: 'uniswap',
      category: 'DEX',
      total_supply: 1000000000,
      key_value_capture: 'Staking (Soon)',
      current_price: 15.20,
      market_cap: 15200000000,
      annualized_revenue: 180000000,
      monthly_revenue_30d: 15000000,
      revenue_growth_30d: -12.3,
      revenue_growth_90d: -8.7,
      revenue_growth_1y: 23.4,
      fees_to_revenue_ratio: 0.15,
      pe_ratio: 84.4,
      price_change_30d: -8.2,
      price_change_90d: 12.5,
      price_change_1y: 45.8
    },
    {
      symbol: 'AAVE',
      protocol_name: 'aave',
      category: 'LENDING',
      total_supply: 16000000,
      key_value_capture: 'Rev Share',
      current_price: 285.50,
      market_cap: 4568000000,
      annualized_revenue: 95000000,
      monthly_revenue_30d: 7916667,
      revenue_growth_30d: 8.9,
      revenue_growth_90d: 15.2,
      revenue_growth_1y: 78.3,
      fees_to_revenue_ratio: 0.42,
      pe_ratio: 48.1,
      price_change_30d: 12.4,
      price_change_90d: 28.7,
      price_change_1y: 89.2
    },
    {
      symbol: 'MKR',
      protocol_name: 'makerdao',
      category: 'STABLECOIN',
      total_supply: 879609,
      key_value_capture: 'Rev Share',
      current_price: 2450.00,
      market_cap: 2155041050,
      annualized_revenue: 125000000,
      monthly_revenue_30d: 10416667,
      revenue_growth_30d: 18.7,
      revenue_growth_90d: 32.1,
      revenue_growth_1y: 156.8,
      fees_to_revenue_ratio: 0.78,
      pe_ratio: 17.2,
      price_change_30d: 25.3,
      price_change_90d: 45.1,
      price_change_1y: 125.7
    },
    {
      symbol: 'GMX',
      protocol_name: 'gmx',
      category: 'PERPS',
      total_supply: 10135105,
      key_value_capture: 'Rev Share',
      current_price: 28.45,
      market_cap: 288343267,
      annualized_revenue: 45000000,
      monthly_revenue_30d: 3750000,
      revenue_growth_30d: 35.8,
      revenue_growth_90d: 78.9,
      revenue_growth_1y: 234.5,
      fees_to_revenue_ratio: 0.85,
      pe_ratio: 6.4,
      price_change_30d: 42.1,
      price_change_90d: 89.3,
      price_change_1y: 189.7
    },
    {
      symbol: 'PENDLE',
      protocol_name: 'pendle',
      category: 'YIELDS',
      total_supply: 281527448,
      key_value_capture: 'Rev Share',
      current_price: 5.85,
      market_cap: 1646935572,
      annualized_revenue: 78000000,
      monthly_revenue_30d: 6500000,
      revenue_growth_30d: 125.6,
      revenue_growth_90d: 289.4,
      revenue_growth_1y: 1250.8,
      fees_to_revenue_ratio: 0.72,
      pe_ratio: 21.1,
      price_change_30d: 89.7,
      price_change_90d: 156.2,
      price_change_1y: 456.9
    }
  ];

  const { data: hyperliquidData } = useQuery({
    queryKey: ["/api/hyperliquid/comprehensive"],
  });

  const { data: coinGeckoStatus } = useQuery({
    queryKey: ["/api/coingecko/status"],
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['all', ...Array.from(new Set(protocolData.map(p => p.category)))];
  const filteredData = selectedCategory === 'all' 
    ? protocolData 
    : protocolData.filter(p => p.category === selectedCategory);

  // Dynamic data based on selected metric
  const getChartData = () => {
    const sortedData = [...filteredData];
    
    if (selectedMetric === 'revenue') {
      sortedData.sort((a, b) => b.annualized_revenue - a.annualized_revenue);
      return {
        labels: sortedData.map(p => p.symbol),
        datasets: [{
          label: 'Annualized Revenue (USD)',
          data: sortedData.map(p => p.annualized_revenue / 1000000),
          backgroundColor: sortedData.map(p => 
            p.symbol === 'HYPE' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(99, 102, 241, 0.6)'
          ),
          borderColor: sortedData.map(p => 
            p.symbol === 'HYPE' ? 'rgba(34, 197, 94, 1)' : 'rgba(99, 102, 241, 1)'
          ),
          borderWidth: 2,
          borderRadius: 8,
        }]
      };
    } else if (selectedMetric === 'growth') {
      sortedData.sort((a, b) => b.revenue_growth_1y - a.revenue_growth_1y);
      return {
        labels: sortedData.map(p => p.symbol),
        datasets: [{
          label: 'Revenue Growth YoY (%)',
          data: sortedData.map(p => p.revenue_growth_1y),
          backgroundColor: sortedData.map(p => 
            p.revenue_growth_1y > 100 ? 'rgba(34, 197, 94, 0.8)' : 
            p.revenue_growth_1y > 50 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(239, 68, 68, 0.6)'
          ),
          borderColor: sortedData.map(p => 
            p.revenue_growth_1y > 100 ? 'rgba(34, 197, 94, 1)' : 
            p.revenue_growth_1y > 50 ? 'rgba(251, 191, 36, 1)' : 'rgba(239, 68, 68, 1)'
          ),
          borderWidth: 2,
          borderRadius: 8,
        }]
      };
    } else { // efficiency
      sortedData.sort((a, b) => a.pe_ratio - b.pe_ratio);
      return {
        labels: sortedData.map(p => p.symbol),
        datasets: [{
          label: 'P/E Ratio (Lower = Better)',
          data: sortedData.map(p => p.pe_ratio),
          backgroundColor: sortedData.map(p => 
            p.pe_ratio < 15 ? 'rgba(34, 197, 94, 0.8)' : 
            p.pe_ratio < 30 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(239, 68, 68, 0.6)'
          ),
          borderColor: sortedData.map(p => 
            p.pe_ratio < 15 ? 'rgba(34, 197, 94, 1)' : 
            p.pe_ratio < 30 ? 'rgba(251, 191, 36, 1)' : 'rgba(239, 68, 68, 1)'
          ),
          borderWidth: 2,
          borderRadius: 8,
        }]
      };
    }
  };

  const chartData = getChartData();

  const peRatioData = {
    labels: protocolData.map(p => p.symbol),
    datasets: [
      {
        label: 'P/E Ratio',
        data: protocolData.map(p => p.pe_ratio),
        backgroundColor: protocolData.map(p => {
          if (p.pe_ratio < 15) return 'rgba(34, 197, 94, 0.8)'; // Green for low P/E
          if (p.pe_ratio < 30) return 'rgba(251, 191, 36, 0.8)'; // Yellow for medium P/E
          return 'rgba(239, 68, 68, 0.8)'; // Red for high P/E
        }),
        borderColor: protocolData.map(p => {
          if (p.pe_ratio < 15) return 'rgba(34, 197, 94, 1)';
          if (p.pe_ratio < 30) return 'rgba(251, 191, 36, 1)';
          return 'rgba(239, 68, 68, 1)';
        }),
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const categoryDistribution = {
    labels: categories.filter(c => c !== 'all'),
    datasets: [
      {
        data: categories.filter(c => c !== 'all').map(category => 
          protocolData.filter(p => p.category === category).length
        ),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(14, 165, 233, 0.8)'
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative flex flex-wrap items-center justify-between mb-8">
            <a 
              href="/" 
              className="group inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 text-slate-300 hover:text-white transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Dashboard</span>
            </a>
            
            <div className="flex gap-3">
              <a 
                href="/hyperliquid" 
                className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/25 flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                <span>Success Story</span>
              </a>
              
              <a 
                href="/monte-carlo" 
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Price Simulations</span>
              </a>
            </div>
          </div>
          
          <div className="relative text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/20">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 font-semibold uppercase tracking-wider text-sm">Revenue Analysis</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 leading-tight tracking-tight">
              Cash Cows
            </h1>
            
            <div className="space-y-3">
              <p className="text-3xl font-bold text-white">Revenue-Generating DeFi Protocols</p>
              <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Deep dive analysis of <span className="text-blue-400 font-semibold">protocols generating real revenue</span> vs traditional tokens with no cash flows
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Real Revenue Streams</span>
              </div>
              <div className="w-1 h-4 bg-slate-600"></div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">P/E Ratio Analysis</span>
              </div>
              <div className="w-1 h-4 bg-slate-600"></div>
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Growth Comparison</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex gap-2">
              {['revenue', 'growth', 'efficiency'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric as any)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedMetric === metric
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 text-white font-medium"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-slate-800">
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-green-400 mb-2">$1.67B</div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">Total Revenue</div>
              <div className="text-xs text-green-400 font-medium">Combined annualized</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-blue-400 mb-2">28.5x</div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">Avg P/E Ratio</div>
              <div className="text-xs text-blue-400 font-medium">Revenue multiple</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-purple-400 mb-2">6</div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">Categories</div>
              <div className="text-xs text-purple-400 font-medium">Protocol types</div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              <Zap className="w-8 h-8 text-cyan-500" />
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-cyan-400 mb-2">89%</div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-3">Revenue Growth</div>
              <div className="text-xs text-cyan-400 font-medium">Median YoY</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Dynamic Chart */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              {selectedMetric === 'revenue' ? 'Annualized Revenue Comparison' :
               selectedMetric === 'growth' ? 'Revenue Growth Analysis' :
               'Valuation Efficiency (P/E Ratios)'}
            </h3>
            <div className="h-80">
              <Bar 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      titleColor: '#e2e8f0',
                      bodyColor: '#e2e8f0',
                      borderColor: '#334155',
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => {
                          if (selectedMetric === 'revenue') {
                            return `$${context.parsed.y}M annualized`;
                          } else if (selectedMetric === 'growth') {
                            return `${context.parsed.y.toFixed(1)}% YoY growth`;
                          } else {
                            return `${context.parsed.y.toFixed(1)}x P/E ratio`;
                          }
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { 
                        color: '#94a3b8',
                        callback: (value) => {
                          if (selectedMetric === 'revenue') {
                            return `$${value}M`;
                          } else if (selectedMetric === 'growth') {
                            return `${value}%`;
                          } else {
                            return `${value}x`;
                          }
                        }
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: '#94a3b8' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* P/E Ratio Analysis */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Price-to-Earnings Ratios
            </h3>
            <div className="h-80">
              <Bar 
                data={peRatioData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      titleColor: '#e2e8f0',
                      bodyColor: '#e2e8f0',
                      borderColor: '#334155',
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => `P/E: ${context.parsed.y.toFixed(1)}x`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { 
                        color: '#94a3b8',
                        callback: (value) => `${value}x`
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: '#94a3b8' }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Protocol Analysis Table */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-8 border-b border-slate-700/50">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <PieChart className="w-6 h-6 text-purple-400" />
              Detailed Protocol Analysis
            </h3>
            <p className="text-slate-400 mt-2">Comprehensive revenue metrics and growth analysis</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left p-6 text-slate-300 font-semibold">Protocol</th>
                  <th className="text-right p-6 text-slate-300 font-semibold">Revenue (30d)</th>
                  <th className="text-right p-6 text-slate-300 font-semibold">Annualized</th>
                  <th className="text-right p-6 text-slate-300 font-semibold">Growth (30d)</th>
                  <th className="text-right p-6 text-slate-300 font-semibold">P/E Ratio</th>
                  <th className="text-right p-6 text-slate-300 font-semibold">Price (30d)</th>
                  <th className="text-left p-6 text-slate-300 font-semibold">Value Capture</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((protocol, index) => (
                  <tr key={protocol.symbol} className="border-t border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-200">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          protocol.symbol === 'HYPE' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {protocol.symbol}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{protocol.symbol}</div>
                          <div className="text-sm text-slate-400">{protocol.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="font-semibold text-white">${(protocol.monthly_revenue_30d / 1000000).toFixed(1)}M</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="font-semibold text-white">${(protocol.annualized_revenue / 1000000).toFixed(0)}M</div>
                    </td>
                    <td className="p-6 text-right">
                      <div className={`font-semibold ${protocol.revenue_growth_30d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {protocol.revenue_growth_30d > 0 ? '+' : ''}{protocol.revenue_growth_30d.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className={`font-semibold ${
                        protocol.pe_ratio < 15 ? 'text-green-400' : 
                        protocol.pe_ratio < 30 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {protocol.pe_ratio.toFixed(1)}x
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className={`font-semibold ${protocol.price_change_30d > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {protocol.price_change_30d > 0 ? '+' : ''}{protocol.price_change_30d.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm text-slate-300">{protocol.key_value_capture}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="mt-12 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
          <h3 className="text-2xl font-bold text-white mb-6">Key Insights & Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-4">Revenue Leaders</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span><strong className="text-white">Hyperliquid (HYPE)</strong> leads with $1.15B annualized revenue from perpetual trading fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span><strong className="text-white">Uniswap (UNI)</strong> generates $180M annually but lacks direct token value capture</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span><strong className="text-white">MakerDAO (MKR)</strong> shows strong revenue efficiency with direct token burns</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-4">Valuation Efficiency</h4>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <span><strong className="text-white">GMX</strong> trades at 6.4x P/E - most undervalued revenue-generating protocol</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <span><strong className="text-white">Hyperliquid</strong> at 10.5x P/E represents fair value for growth rate</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <span><strong className="text-white">UNI</strong> at 84.4x P/E shows premium for potential fee switch activation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}