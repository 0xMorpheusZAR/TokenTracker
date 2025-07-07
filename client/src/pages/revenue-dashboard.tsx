import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ArrowLeft, TrendingUp, DollarSign, BarChart3, PieChart, Activity, Layers, FileText } from "lucide-react";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

interface ProtocolRevenue {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  category?: string;
  chains: string[];
  revenue24h: number;
  revenue7d: number;
  revenue30d: number;
  totalRevenue: number;
  tvl?: number;
  change24h?: number;
  change7d?: number;
  change30d?: number;
}

interface CategoryRevenue {
  category: string;
  totalRevenue24h: number;
  totalRevenue7d: number;
  totalRevenue30d: number;
  protocolCount: number;
  topProtocols: ProtocolRevenue[];
}

export default function RevenueDashboard() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'category' | 'protocol' | 'chain'>('category');

  const { data: categoryRevenues, isLoading: categoriesLoading } = useQuery<CategoryRevenue[]>({
    queryKey: ['/api/defillama/category-revenues'],
  });

  const { data: protocolRevenues, isLoading: protocolsLoading } = useQuery<ProtocolRevenue[]>({
    queryKey: ['/api/defillama/protocol-revenues'],
  });

  const { data: chainRevenues, isLoading: chainsLoading } = useQuery({
    queryKey: ['/api/defillama/chain-revenues'],
  });

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1e9) return `$${(revenue / 1e9).toFixed(2)}B`;
    if (revenue >= 1e6) return `$${(revenue / 1e6).toFixed(2)}M`;
    if (revenue >= 1e3) return `$${(revenue / 1e3).toFixed(2)}K`;
    return `$${revenue.toFixed(2)}`;
  };

  const formatTVL = (tvl: number) => {
    if (!tvl || tvl === 0) return '-';
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(2)}K`;
    return `$${tvl.toFixed(2)}`;
  };

  const getRevenueByTimeframe = (item: any) => {
    switch (timeframe) {
      case '24h': return item.revenue24h || item.totalRevenue24h || 0;
      case '7d': return item.revenue7d || item.totalRevenue7d || 0;
      case '30d': return item.revenue30d || item.totalRevenue30d || 0;
      default: return 0;
    }
  };

  // Chart data for category distribution
  const categoryChartData = categoryRevenues ? {
    labels: categoryRevenues.slice(0, 10).map(cat => cat.category),
    datasets: [{
      label: `Revenue (${timeframe})`,
      data: categoryRevenues.slice(0, 10).map(cat => getRevenueByTimeframe(cat)),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(255, 99, 255, 0.8)',
        'rgba(99, 255, 132, 0.8)',
      ],
    }]
  } : null;

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${formatRevenue(context.parsed)}`;
          }
        }
      }
    }
  };

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return categoryRevenues?.reduce((sum, cat) => sum + getRevenueByTimeframe(cat), 0) || 0;
  }, [categoryRevenues, timeframe]);

  // Memoize sorted protocols for better performance
  const sortedProtocols = useMemo(() => {
    if (!protocolRevenues) return [];
    return [...protocolRevenues].sort((a, b) => {
      const aRevenue = getRevenueByTimeframe(a);
      const bRevenue = getRevenueByTimeframe(b);
      return bRevenue - aRevenue;
    });
  }, [protocolRevenues, timeframe]);

  // Show loading only on initial load
  const isInitialLoading = categoriesLoading && !categoryRevenues && !protocolRevenues && !chainRevenues;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-green-500" />
              <h1 className="text-2xl font-bold">Multi-Category Revenue Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-6 h-6 text-green-400" />
              <span className="text-xs text-green-400">Total Revenue</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{formatRevenue(totalRevenue)}</div>
            <div className="text-sm text-gray-400 mt-2">{timeframe} revenue</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Layers className="w-6 h-6 text-blue-400" />
              <span className="text-xs text-blue-400">Categories</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{categoryRevenues?.length || 0}</div>
            <div className="text-sm text-gray-400 mt-2">Active categories</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400">Protocols</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{protocolRevenues?.length || 0}</div>
            <div className="text-sm text-gray-400 mt-2">Revenue generating</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-6 h-6 text-orange-400" />
              <span className="text-xs text-orange-400">Chains</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">{chainRevenues?.length || 0}</div>
            <div className="text-sm text-gray-400 mt-2">Active chains</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('category')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'category' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode('protocol')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'protocol' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Protocols
            </button>
            <button
              onClick={() => setViewMode('chain')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'chain' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Chains
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('24h')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === '24h' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === '7d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === '30d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              30d
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          {categoryChartData && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Revenue Distribution</h3>
              <div style={{ height: '400px' }}>
                <Doughnut data={categoryChartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Top Performers */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Top Revenue Generators</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sortedProtocols.slice(0, 10).map((protocol, index) => (
                <div key={protocol.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <div className="font-medium">{protocol.displayName}</div>
                      <div className="text-sm text-gray-400">{protocol.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">
                      {formatRevenue(getRevenueByTimeframe(protocol))}
                    </div>
                    <div className="text-sm text-gray-400">
                      {protocol.chains.length} chain{protocol.chains.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Details */}
        {viewMode === 'category' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryRevenues?.map((category) => (
              <div key={category.category} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">{category.category}</h4>
                  <span className="text-sm text-gray-400">{category.protocolCount} protocols</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Revenue:</span>
                    <span className="font-medium text-green-400">{formatRevenue(category.totalRevenue24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">7d Revenue:</span>
                    <span className="font-medium text-blue-400">{formatRevenue(category.totalRevenue7d)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">30d Revenue:</span>
                    <span className="font-medium text-purple-400">{formatRevenue(category.totalRevenue30d)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Top Protocols:</div>
                  <div className="space-y-1">
                    {category.topProtocols.slice(0, 3).map((protocol) => (
                      <div key={protocol.id} className="text-sm flex justify-between">
                        <span className="text-gray-300 truncate">{protocol.displayName}</span>
                        <span className="text-green-400">{formatRevenue(getRevenueByTimeframe(protocol))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Protocol Table View */}
        {viewMode === 'protocol' && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Protocol</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Chains</th>
                    <th className="text-right py-3 px-4">24h Revenue</th>
                    <th className="text-right py-3 px-4">7d Revenue</th>
                    <th className="text-right py-3 px-4">30d Revenue</th>
                    <th className="text-right py-3 px-4">TVL</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProtocols.map((protocol) => (
                    <tr key={protocol.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-3 px-4 font-medium">{protocol.displayName}</td>
                      <td className="py-3 px-4 text-gray-400">{protocol.category}</td>
                      <td className="py-3 px-4 text-gray-400">{protocol.chains.join(', ')}</td>
                      <td className="py-3 px-4 text-right text-green-400">{formatRevenue(protocol.revenue24h)}</td>
                      <td className="py-3 px-4 text-right text-blue-400">{formatRevenue(protocol.revenue7d)}</td>
                      <td className="py-3 px-4 text-right text-purple-400">{formatRevenue(protocol.revenue30d)}</td>
                      <td className="py-3 px-4 text-right text-gray-400">{formatTVL(protocol.tvl || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chain View */}
        {viewMode === 'chain' && chainRevenues && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(chainRevenues as any[]).map((chain) => (
              <div key={chain.chain} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all">
                <h4 className="text-lg font-bold mb-4">{chain.chain}</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Revenue:</span>
                    <span className="font-medium text-green-400">{formatRevenue(chain.revenue24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">7d Revenue:</span>
                    <span className="font-medium text-blue-400">{formatRevenue(chain.revenue7d)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">30d Revenue:</span>
                    <span className="font-medium text-purple-400">{formatRevenue(chain.revenue30d)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protocols:</span>
                    <span className="font-medium">{chain.protocolCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}