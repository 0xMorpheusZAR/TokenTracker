import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  TrendingUp,
  Activity,
  DollarSign,
  BarChart3,
  Database,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(...registerables);

interface VeloMarketData {
  time: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price?: number;
  volume?: number;
  dollar_volume?: number;
}

interface VeloCapData {
  coin: string;
  time: number;
  circ: number;
  circ_dollars: number;
  fdv: number;
  fdv_dollars: number;
}

interface VeloProduct {
  exchange: string;
  coin: string;
  product: string;
  begin?: number;
}

interface VeloOptionsData {
  time: number;
  strike?: number;
  mark_price?: number;
  volume?: number;
  open_interest?: number;
  implied_volatility?: number;
  expiry?: string;
  type?: string;
}

// Define the top 10 cryptocurrencies to track
const TOP_10_COINS = ['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'AVAX', 'DOT', 'UNI', 'AAVE', 'MATIC'];

function VeloDashboard() {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [selectedExchange, setSelectedExchange] = useState('coinbase');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [refreshTime, setRefreshTime] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch market caps
  const { data: marketCaps, isLoading: capsLoading } = useQuery({
    queryKey: ['/api/velo/caps', refreshTime],
    refetchInterval: 30000,
  });

  // Fetch comprehensive top 10 data
  const { data: top10Data, isLoading: top10Loading } = useQuery({
    queryKey: ['/api/velo/top10', refreshTime],
    refetchInterval: 30000,
  });

  // Fetch spot products
  const { data: spotProducts } = useQuery({
    queryKey: ['/api/velo/spot'],
  });

  // Fetch futures products
  const { data: futuresProducts } = useQuery({
    queryKey: ['/api/velo/futures'],
  });

  // Fetch options products
  const { data: optionsProducts } = useQuery({
    queryKey: ['/api/velo/options'],
  });

  // Fetch market data for selected coin
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/velo/market-data', selectedCoin, selectedExchange, selectedTimeframe, refreshTime],
    queryFn: async () => {
      const endTime = Date.now();
      const beginTime = endTime - (24 * 60 * 60 * 1000); // 24 hours ago
      
      const params = new URLSearchParams({
        type: 'spot',
        exchanges: selectedExchange,
        products: `${selectedCoin}-USD`,
        columns: 'close_price',
        resolution: selectedTimeframe,
        begin: beginTime.toString(),
        end: endTime.toString(),
      });
      const response = await fetch(`/api/velo/market-data?${params}`);
      if (!response.ok) throw new Error('Failed to fetch market data');
      return response.json();
    },
    enabled: !!selectedCoin && !!selectedExchange,
  });

  // Options data disabled - not supported by current API
  const optionsData = null;

  // Get unique coins from products
  const availableCoins = React.useMemo(() => {
    const coins = new Set<string>();
    if (spotProducts) {
      spotProducts.forEach((p: VeloProduct) => coins.add(p.coin));
    }
    return Array.from(coins).filter(coin => 
      ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE'].includes(coin)
    );
  }, [spotProducts]);

  // Get exchanges for selected coin
  const availableExchanges = React.useMemo(() => {
    if (!spotProducts || !selectedCoin) return [];
    const exchanges = new Set<string>();
    spotProducts
      .filter((p: VeloProduct) => p.coin === selectedCoin)
      .forEach((p: VeloProduct) => exchanges.add(p.exchange));
    return Array.from(exchanges);
  }, [spotProducts, selectedCoin]);

  // Format price chart data
  const priceChartData = React.useMemo(() => {
    if (!marketData || !marketData.data || marketData.data.length === 0) {
      return null;
    }

    const sortedData = [...marketData.data].sort((a: VeloMarketData, b: VeloMarketData) => a.time - b.time);
    
    return {
      labels: sortedData.map((d: VeloMarketData) => 
        new Date(d.time).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      ),
      datasets: [{
        label: `${selectedCoin} Price`,
        data: sortedData.map((d: VeloMarketData) => d.close_price || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      }],
    };
  }, [marketData, selectedCoin]);

  // Volume chart disabled - data not available
  const volumeChartData = null;

  // Calculate price change
  const priceChange = React.useMemo(() => {
    if (!marketData || !marketData.data || marketData.data.length < 2) return null;
    
    const sortedData = [...marketData.data].sort((a: VeloMarketData, b: VeloMarketData) => a.time - b.time);
    const firstPrice = sortedData[0]?.close_price || 0;
    const lastPrice = sortedData[sortedData.length - 1]?.close_price || 0;
    
    if (firstPrice === 0) return null;
    
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    return {
      value: change,
      isPositive: change >= 0,
    };
  }, [marketData]);

  const formatNumber = (num: number | string) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(value) || value === null || value === undefined) return '$0.00';
    
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-gray-950 to-cyan-900/20" />
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between backdrop-blur-sm bg-gray-900/30 rounded-xl p-6 border border-gray-800">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Velo Data Dashboard
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Powered exclusively by Velo Data API • Cross-exchange market analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border-emerald-400/50">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">{refreshTime.toLocaleTimeString()}</span>
            </Badge>
            <Button
              onClick={() => setRefreshTime(new Date())}
              variant="outline"
              size="icon"
              className="border-emerald-400/50 hover:bg-emerald-400/10 hover:border-emerald-400 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </Button>
          </div>
        </div>

        {/* Market Caps Overview */}
        <Card className="backdrop-blur-sm bg-gray-900/30 border-gray-800 hover:border-gray-700 transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-emerald-400/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              Market Capitalizations
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time market cap data from CoinGecko • Top 10 cryptocurrencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {top10Loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {(top10Data?.data || marketCaps?.data?.slice(0, 10))?.map((coin: any, index: number) => (
                  <div
                    key={coin.coin}
                    className="group relative p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-emerald-400/50 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-xl text-white">{coin.coin}</span>
                        <Badge className={`text-xs ${coin.rank <= 3 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900' : 'bg-gray-700'}`}>
                          #{coin.rank || index + 1}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Market Cap</span>
                          <span className="text-emerald-400 font-semibold">
                            {coin.marketCapFormatted || formatNumber(coin.market_cap || 0)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">FDV</span>
                          <span className="text-cyan-400">
                            {coin.fdvFormatted || formatNumber(coin.fdv || 0)}
                          </span>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-700">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Supply</span>
                            <span className="text-gray-300">
                              {coin.supplyFormatted || formatNumber(coin.supply || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="spot" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-gray-800/50">
            <TabsTrigger value="spot" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Spot Markets
            </TabsTrigger>
            <TabsTrigger value="futures" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Futures
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Options
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Spot Markets Tab */}
          <TabsContent value="spot" className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCoins.map(coin => (
                    <SelectItem key={coin} value={coin}>{coin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableExchanges.map(exchange => (
                    <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="30m">30 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Display */}
            {marketData?.data && marketData.data.length > 0 && (
              <Card className="backdrop-blur-sm bg-gray-900/30 border-gray-800 hover:border-gray-700 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-baseline justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        {selectedCoin}/USD · {selectedExchange.toUpperCase()}
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        ${marketData.data[marketData.data.length - 1]?.close_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    {priceChange && (
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        priceChange.isPositive 
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' 
                          : 'bg-red-400/10 text-red-400 border border-red-400/20'
                      }`}>
                        {priceChange.isPositive ? (
                          <ArrowUpRight className="w-6 h-6" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6" />
                        )}
                        <span className="text-2xl font-semibold">
                          {Math.abs(priceChange.value).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-xs text-gray-500">24h High</p>
                      <p className="text-sm font-medium text-emerald-400">
                        ${Math.max(...marketData.data.map((d: VeloMarketData) => d.close_price)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">24h Low</p>
                      <p className="text-sm font-medium text-red-400">
                        ${Math.min(...marketData.data.map((d: VeloMarketData) => d.close_price)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Data Points</p>
                      <p className="text-sm font-medium text-gray-300">{marketData.data.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Timeframe</p>
                      <p className="text-sm font-medium text-gray-300">{selectedTimeframe.toUpperCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Chart */}
            {priceChartData && (
              <Card className="backdrop-blur-sm bg-gray-900/30 border-gray-800 hover:border-gray-700 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-400/10 rounded-lg">
                      <LineChart className="w-5 h-5 text-cyan-400" />
                    </div>
                    Price Movement
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {selectedCoin}/USD price over the last 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] p-4 bg-gray-950/50 rounded-lg border border-gray-800">
                    <Line 
                      data={priceChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: 'index',
                          intersect: false,
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#e5e7eb',
                            borderColor: 'rgba(52, 211, 153, 0.3)',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                              label: function(context: any) {
                                return `Price: $${context.parsed.y.toFixed(2)}`;
                              }
                            }
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.05)',
                              drawBorder: false,
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.4)',
                              font: {
                                size: 11,
                              },
                            },
                          },
                          y: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.05)',
                              drawBorder: false,
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.4)',
                              font: {
                                size: 11,
                              },
                              callback: function(value: any) {
                                return '$' + value.toFixed(0);
                              }
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Volume Chart */}
            {volumeChartData && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Volume Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar 
                      data={volumeChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.6)',
                            },
                          },
                          y: {
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)',
                            },
                            ticks: {
                              color: 'rgba(255, 255, 255, 0.6)',
                              callback: function(value) {
                                return formatNumber(value as number).replace('$', '');
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Futures Tab */}
          <TabsContent value="futures" className="space-y-6">
            <Card className="backdrop-blur-sm bg-gray-900/30 border-gray-800 hover:border-gray-700 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-blue-400/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  Available Futures Contracts
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Cross-exchange futures products • {futuresProducts?.length || 0} total contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {futuresProducts?.slice(0, 40).map((product: VeloProduct, idx: number) => (
                    <div
                      key={`${product.exchange}-${product.product}-${idx}`}
                      className="group relative p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-lg text-white">{product.coin}</span>
                          <Badge className={`text-xs ${
                            product.exchange === 'binance' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' :
                            product.exchange === 'bybit' ? 'bg-orange-600/20 text-orange-400 border-orange-600/30' :
                            product.exchange === 'okex' ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' :
                            product.exchange === 'hyperliquid' ? 'bg-purple-600/20 text-purple-400 border-purple-600/30' :
                            'bg-gray-700'
                          }`}>
                            {product.exchange.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-300 font-mono">{product.product}</p>
                        
                        {product.begin && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-gray-500">
                              <Clock className="inline w-3 h-3 mr-1" />
                              Since {new Date(product.begin).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Options Overview</CardTitle>
                <CardDescription>BTC and ETH options from Deribit</CardDescription>
              </CardHeader>
              <CardContent>
                {optionsProducts && (
                  <div className="space-y-4">
                    {optionsProducts.map((product: VeloProduct) => (
                      <div
                        key={`${product.exchange}-${product.coin}`}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{product.coin} Options</h3>
                            <p className="text-sm text-gray-400">Exchange: {product.exchange}</p>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {optionsData && optionsData.data && optionsData.data.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Options Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optionsData.data.slice(0, 10).map((option: VeloOptionsData, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {option.strike && (
                              <div>
                                <span className="text-gray-400">Strike:</span>
                                <span className="ml-2">${option.strike}</span>
                              </div>
                            )}
                            {option.mark_price && (
                              <div>
                                <span className="text-gray-400">Mark:</span>
                                <span className="ml-2">${option.mark_price.toFixed(2)}</span>
                              </div>
                            )}
                            {option.volume && (
                              <div>
                                <span className="text-gray-400">Volume:</span>
                                <span className="ml-2">{option.volume.toFixed(0)}</span>
                              </div>
                            )}
                            {option.implied_volatility && (
                              <div>
                                <span className="text-gray-400">IV:</span>
                                <span className="ml-2">{(option.implied_volatility * 100).toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-gray-900/30 border-gray-800 hover:border-gray-700 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-purple-400/10 rounded-lg">
                      <Database className="w-5 h-5 text-purple-400" />
                    </div>
                    Data Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Spot Products</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400" style={{ width: '75%' }} />
                        </div>
                        <span className="font-bold text-purple-400">{spotProducts?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Futures Contracts</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: '85%' }} />
                        </div>
                        <span className="font-bold text-blue-400">{futuresProducts?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Options Products</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-green-400" style={{ width: '25%' }} />
                        </div>
                        <span className="font-bold text-emerald-400">{optionsProducts?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Cap Coverage:</span>
                      <span className="font-medium">{marketCaps?.data?.length || 0} coins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    API Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Connection:</span>
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Data Quality:</span>
                      <Badge className="bg-blue-500/20 text-blue-400">High Resolution</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Coverage:</span>
                      <Badge className="bg-purple-500/20 text-purple-400">Multi-Exchange</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Market Stats */}
            {marketCaps?.data && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Market Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Total Market Cap</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatNumber(
                          marketCaps.data.reduce((sum: number, cap: VeloCapData) => sum + cap.circ_dollars, 0)
                        )}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Total FDV</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatNumber(
                          marketCaps.data.reduce((sum: number, cap: VeloCapData) => sum + cap.fdv_dollars, 0)
                        )}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">BTC Dominance</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {marketCaps.data.length > 0 && (
                          <>
                            {(
                              (marketCaps.data.find((c: VeloCapData) => c.coin === 'BTC')?.circ_dollars || 0) /
                              marketCaps.data.reduce((sum: number, cap: VeloCapData) => sum + cap.circ_dollars, 0) *
                              100
                            ).toFixed(1)}%
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-800">
          <p className="text-gray-400 text-sm">
            Created by <span className="text-blue-400 font-medium">@0xMorpheusXBT</span> • 
            Powered by <span className="text-cyan-400 font-medium">Velo Data API</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Cross-exchange data aggregation with 1-minute resolution
          </p>
        </div>
      </div>
    </div>
  );
}

export default VeloDashboard;