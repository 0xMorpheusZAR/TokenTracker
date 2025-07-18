import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Globe, 
  Newspaper,
  Database,
  Zap,
  Target,
  LineChart,
  PieChart,
  Clock
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
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
  Filler
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
  Filler
);

interface VeloMarketData {
  time: number;
  close_price?: number;
  high_price?: number;
  low_price?: number;
  dollar_volume?: number;
}

interface VeloCapData {
  coin: string;
  time: number;
  circ?: string;
  circ_dollars?: string;
  fdv?: string;
  fdv_dollars?: string;
  market_cap?: number;
}

interface VeloNewsItem {
  id: number;
  time: number;
  headline: string;
  source: string;
  priority: string;
  coins: string[];
  summary: string;
  link: string;
}

interface DashboardData {
  market_caps: VeloCapData[];
  btc_24h: VeloMarketData[];
  eth_24h: VeloMarketData[];
  news: VeloNewsItem[];
  multi_asset_data: Record<string, VeloMarketData[]>;
  assets: string[];
  provider: string;
  timestamp: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (price: number): string => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 100) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString()}`;
};

const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-gray-400';
};

function CustomDashboard() {
  const [selectedAssets, setSelectedAssets] = useState(['BTC', 'ETH', 'SOL', 'ADA', 'DOT']);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Velo Dashboard Data
  const { data: veloDashboard, isLoading: veloLoading, refetch: refetchVelo } = useQuery({
    queryKey: ['/api/velo/dashboard', selectedAssets.join(',')],
    queryFn: async (): Promise<DashboardData> => {
      const response = await fetch(`/api/velo/dashboard?assets=${selectedAssets.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch Velo dashboard data');
      return response.json();
    },
    refetchInterval: refreshInterval,
    staleTime: 20000,
  });

  // CoinGecko Status
  const { data: cgStatus } = useQuery({
    queryKey: ['/api/coingecko/status'],
    queryFn: async () => {
      const response = await fetch('/api/coingecko/status');
      if (!response.ok) throw new Error('Failed to fetch CoinGecko status');
      return response.json();
    },
    refetchInterval: 60000,
  });

  // CoinGecko Market Data for percentage changes
  const { data: cgMarketData } = useQuery({
    queryKey: ['/api/coingecko/detailed'],
    queryFn: async () => {
      const response = await fetch('/api/coingecko/detailed');
      if (!response.ok) throw new Error('Failed to fetch CoinGecko market data');
      return response.json();
    },
    refetchInterval: refreshInterval,
  });

  // Velo Status
  const { data: veloStatus } = useQuery({
    queryKey: ['/api/velo/status'],
    queryFn: async () => {
      const response = await fetch('/api/velo/status');
      if (!response.ok) throw new Error('Failed to fetch Velo status');
      return response.json();
    },
    refetchInterval: 60000,
  });

  // DefiLlama Protocols
  const { data: defiProtocols } = useQuery({
    queryKey: ['/api/defillama/protocols'],
    queryFn: async () => {
      const response = await fetch('/api/defillama/protocols');
      if (!response.ok) throw new Error('Failed to fetch DeFi protocols');
      return response.json();
    },
    refetchInterval: 300000, // 5 minutes
  });

  // Auto-refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastRefresh(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate price changes for BTC and ETH
  const getBTCChange = (): number => {
    if (!veloDashboard?.btc_24h || veloDashboard.btc_24h.length < 2) return 0;
    const latest = veloDashboard.btc_24h[veloDashboard.btc_24h.length - 1];
    const previous = veloDashboard.btc_24h[0];
    if (!latest?.close_price || !previous?.close_price) return 0;
    return ((latest.close_price - previous.close_price) / previous.close_price) * 100;
  };

  const getETHChange = (): number => {
    if (!veloDashboard?.eth_24h || veloDashboard.eth_24h.length < 2) return 0;
    const latest = veloDashboard.eth_24h[veloDashboard.eth_24h.length - 1];
    const previous = veloDashboard.eth_24h[0];
    if (!latest?.close_price || !previous?.close_price) return 0;
    return ((latest.close_price - previous.close_price) / previous.close_price) * 100;
  };

  // Chart configurations
  const createPriceChart = (data: VeloMarketData[], label: string, color: string) => {
    return {
      labels: data.map(d => new Date(d.time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })),
      datasets: [
        {
          label: `${label} Price`,
          data: data.map(d => d.close_price || 0),
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return formatPrice(value);
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const handleAssetToggle = (asset: string) => {
    setSelectedAssets(prev => 
      prev.includes(asset) 
        ? prev.filter(a => a !== asset)
        : [...prev, asset]
    );
  };

  const getTimeSinceLastRefresh = (): string => {
    const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-400" />
                Custom Analytics Dashboard
              </h1>
              <p className="text-gray-400 text-sm">
                Multi-Source Crypto Data Integration • Velo Pro • CoinGecko Pro • Dune Analytics • DefiLlama Pro
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Data Provider Status */}
              <div className="flex items-center gap-2">
                <Badge variant={cgStatus?.connected ? "default" : "destructive"} className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  CoinGecko {cgStatus?.tier || 'Unknown'}
                </Badge>
                <Badge variant={veloStatus ? "default" : "destructive"} className="text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  Velo Pro
                </Badge>
                <Badge variant="default" className="text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  DefiLlama
                </Badge>
              </div>
              
              {/* Last Update */}
              <div className="text-right">
                <p className="text-xs text-gray-400">Last Update</p>
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeSinceLastRefresh()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* BTC Stats */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Bitcoin</p>
                  <p className="text-xl font-bold text-white">
                    {veloDashboard?.btc_24h?.length > 0 
                      ? formatPrice(veloDashboard.btc_24h[veloDashboard.btc_24h.length - 1]?.close_price || 0)
                      : 'Loading...'}
                  </p>
                  <p className={`text-sm ${getChangeColor(getBTCChange())}`}>
                    {getBTCChange() > 0 ? '+' : ''}{getBTCChange().toFixed(2)}% (24h)
                  </p>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ETH Stats */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Ethereum</p>
                  <p className="text-xl font-bold text-white">
                    {veloDashboard?.eth_24h?.length > 0 
                      ? formatPrice(veloDashboard.eth_24h[veloDashboard.eth_24h.length - 1]?.close_price || 0)
                      : 'Loading...'}
                  </p>
                  <p className={`text-sm ${getChangeColor(getETHChange())}`}>
                    {getETHChange() > 0 ? '+' : ''}{getETHChange().toFixed(2)}% (24h)
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Market Cap */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Market Cap</p>
                  <p className="text-xl font-bold text-white">
                    {veloDashboard?.market_caps?.length > 0 
                      ? formatNumber(veloDashboard.market_caps.reduce((sum, cap) => sum + cap.market_cap, 0))
                      : 'Loading...'}
                  </p>
                  <p className="text-sm text-gray-400">Top 10 Assets</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DeFi Protocols */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">DeFi Protocols</p>
                  <p className="text-xl font-bold text-white">
                    {defiProtocols?.length || 'Loading...'}
                  </p>
                  <p className="text-sm text-gray-400">Tracked by DefiLlama</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-gray-800/50 border-gray-700/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="price-charts" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Price Charts
            </TabsTrigger>
            <TabsTrigger value="market-caps" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Market Caps
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              News Feed
            </TabsTrigger>
            <TabsTrigger value="defi" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              DeFi Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* BTC 24h Chart */}
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    Bitcoin 24h Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {veloDashboard?.btc_24h && veloDashboard.btc_24h.length > 0 ? (
                      <Line 
                        data={createPriceChart(veloDashboard.btc_24h, 'BTC', '#f97316')} 
                        options={chartOptions} 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        {veloLoading ? 'Loading chart data...' : 'No data available'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ETH 24h Chart */}
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Ethereum 24h Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {veloDashboard?.eth_24h && veloDashboard.eth_24h.length > 0 ? (
                      <Line 
                        data={createPriceChart(veloDashboard.eth_24h, 'ETH', '#3b82f6')} 
                        options={chartOptions} 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        {veloLoading ? 'Loading chart data...' : 'No data available'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Selection */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Multi-Asset Data Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Selected Assets:</p>
                    <div className="flex flex-wrap gap-2">
                      {['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE'].map(asset => (
                        <Badge
                          key={asset}
                          variant={selectedAssets.includes(asset) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selectedAssets.includes(asset) 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'hover:bg-gray-700'
                          }`}
                          onClick={() => handleAssetToggle(asset)}
                        >
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Refresh Interval:</p>
                    <div className="flex gap-2">
                      {[10000, 30000, 60000, 300000].map(interval => (
                        <Button
                          key={interval}
                          size="sm"
                          variant={refreshInterval === interval ? "default" : "outline"}
                          onClick={() => setRefreshInterval(interval)}
                        >
                          {interval / 1000}s
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Charts Tab */}
          <TabsContent value="price-charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(veloDashboard?.multi_asset_data || {}).map(([asset, data]) => (
                <Card key={asset} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">{asset} Price Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      {data && data.length > 0 ? (
                        <Line 
                          data={createPriceChart(data, asset, '#10b981')} 
                          options={chartOptions} 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Caps Tab */}
          <TabsContent value="market-caps" className="space-y-6">
            {/* Market Cap Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {veloDashboard?.market_caps?.map((cap) => {
                const marketCap = parseFloat(cap.circ_dollars || cap.market_cap?.toString() || '0');
                const fdv = parseFloat(cap.fdv_dollars || '0');
                const circSupply = parseFloat(cap.circ || '0');
                const circulatingRatio = fdv > 0 ? (marketCap / fdv) * 100 : 100;
                
                // Get real percentage changes from CoinGecko data
                const cgToken = cgMarketData?.find((token: any) => 
                  token.symbol?.toUpperCase() === cap.coin.toUpperCase()
                );
                const change24h = cgToken?.price_change_percentage_24h || 0;
                const change7d = cgToken?.price_change_percentage_7d || 0;
                
                return (
                  <Card key={cap.coin} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{cap.coin.charAt(0)}</span>
                          </div>
                          <h3 className="font-bold text-white text-lg">{cap.coin}</h3>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${change24h >= 0 ? 'text-green-400 border-green-400/50' : 'text-red-400 border-red-400/50'}`}
                        >
                          {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-400">Market Cap</p>
                          <p className="text-xl font-bold text-white">{formatNumber(marketCap)}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">24h Change</p>
                            <p className={getChangeColor(change24h)}>
                              {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">7d Change</p>
                            <p className={getChangeColor(change7d)}>
                              {change7d >= 0 ? '+' : ''}{change7d.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Circulating Supply</p>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${circulatingRatio}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{circulatingRatio.toFixed(1)}% of Total Supply</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Market Dominance Chart */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Market Dominance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    {veloDashboard?.market_caps && veloDashboard.market_caps.length > 0 ? (
                      <Bar
                        data={{
                          labels: veloDashboard.market_caps.map(cap => cap.coin),
                          datasets: [{
                            label: 'Market Cap (Billions)',
                            data: veloDashboard.market_caps.map(cap => {
                              const marketCap = parseFloat(cap.circ_dollars || cap.market_cap?.toString() || '0');
                              return marketCap / 1e9; // Convert to billions
                            }),
                            backgroundColor: [
                              'rgba(249, 115, 22, 0.5)',  // Orange for BTC
                              'rgba(59, 130, 246, 0.5)',  // Blue for ETH
                              'rgba(168, 85, 247, 0.5)',  // Purple for SOL
                              'rgba(236, 72, 153, 0.5)',  // Pink for others
                              'rgba(34, 197, 94, 0.5)',   // Green
                            ],
                            borderColor: [
                              'rgba(249, 115, 22, 1)',
                              'rgba(59, 130, 246, 1)',
                              'rgba(168, 85, 247, 1)',
                              'rgba(236, 72, 153, 1)',
                              'rgba(34, 197, 94, 1)',
                            ],
                            borderWidth: 1,
                          }]
                        }}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              display: true,
                              text: 'Market Capitalization Comparison',
                              color: '#fff',
                            },
                          },
                          scales: {
                            ...chartOptions.scales,
                            y: {
                              ...chartOptions.scales?.y,
                              title: {
                                display: true,
                                text: 'Market Cap (Billions USD)',
                                color: '#9ca3af',
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Loading market dominance data...
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-400">Market Share Breakdown</h4>
                    {veloDashboard?.market_caps?.map((cap, index) => {
                      const marketCap = parseFloat(cap.circ_dollars || cap.market_cap?.toString() || '0');
                      const totalMarketCap = veloDashboard.market_caps.reduce((sum, c) => {
                        return sum + parseFloat(c.circ_dollars || c.market_cap?.toString() || '0');
                      }, 0);
                      const dominance = (marketCap / totalMarketCap) * 100;
                      
                      return (
                        <div key={cap.coin} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{cap.coin}</span>
                            <span className="text-sm text-gray-400">{dominance.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${dominance}%`,
                                backgroundColor: [
                                  '#f97316', // Orange
                                  '#3b82f6', // Blue
                                  '#a855f7', // Purple
                                  '#ec4899', // Pink
                                  '#22c55e', // Green
                                ][index % 5]
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Updates Status */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg animate-pulse">
                      <Activity className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Live Market Data</p>
                      <p className="text-xs text-gray-400">Updates every {refreshInterval / 1000} seconds</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm text-white">
                      {veloDashboard?.timestamp ? new Date(veloDashboard.timestamp).toLocaleTimeString() : 'Loading...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Newspaper className="w-5 h-5" />
                  Latest Crypto News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {veloDashboard?.news && veloDashboard.news.length > 0 ? (
                    veloDashboard.news.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/40 transition-all duration-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-white mb-2 text-lg">{item.headline}</h3>
                            <p className="text-gray-400 text-sm mb-3 leading-relaxed">{item.summary}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <Badge variant={
                                item.source === 'CoinGecko Trending' ? 'default' : 
                                item.source === 'Market Overview' ? 'secondary' :
                                item.source === 'Price Alert' ? 'destructive' : 'outline'
                              } className="text-xs">
                                {item.source}
                              </Badge>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.time).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {item.priority && (
                                <>
                                  <span>•</span>
                                  <span className={`font-medium ${
                                    item.priority === 1 ? 'text-red-400' :
                                    item.priority === 2 ? 'text-orange-400' :
                                    item.priority === 3 ? 'text-yellow-400' :
                                    'text-gray-400'
                                  }`}>
                                    {item.priority === 1 ? 'High' :
                                     item.priority === 2 ? 'Medium' :
                                     item.priority === 3 ? 'Low' : 'Info'}
                                  </span>
                                </>
                              )}
                            </div>
                            {item.coins && item.coins.length > 0 && (
                              <div className="flex gap-1 mt-3">
                                {item.coins.map(coin => (
                                  <Badge key={coin} variant="secondary" className="text-xs">
                                    {coin}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {item.link && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-gray-700/50"
                              onClick={() => window.open(item.link, '_blank')}
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No news items available</p>
                      <p className="text-gray-500 text-sm mt-2">News will appear here once data is loaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DeFi Tab */}
          <TabsContent value="defi" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5" />
                  DeFi Protocol Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {defiProtocols?.slice(0, 12).map((protocol: any, index: number) => (
                    <div key={protocol.name || index} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{protocol.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {protocol.category}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">TVL:</span>
                          <span className="text-green-400">{formatNumber(protocol.tvl || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Chain:</span>
                          <span className="text-gray-300">{protocol.chain || 'Multi'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-gray-400 text-sm">
            Powered by <span className="text-blue-400 font-medium">Velo Pro API</span> • 
            <span className="text-green-400 font-medium"> CoinGecko Pro</span> • 
            <span className="text-purple-400 font-medium"> Dune Analytics</span> • 
            <span className="text-orange-400 font-medium"> DefiLlama Pro</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Created by <span className="text-blue-400 font-medium">@0xMorpheusXBT</span> • 
            Multi-Source Crypto Analytics Framework
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomDashboard;