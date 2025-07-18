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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Velo Data Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Powered exclusively by Velo Data API • Cross-exchange market analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <Clock className="w-4 h-4" />
              {refreshTime.toLocaleTimeString()}
            </Badge>
            <Button
              onClick={() => setRefreshTime(new Date())}
              variant="outline"
              size="icon"
              className="animate-pulse"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Market Caps Overview */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Market Capitalizations
            </CardTitle>
            <CardDescription>Real-time market cap data from Velo</CardDescription>
          </CardHeader>
          <CardContent>
            {capsLoading ? (
              <div className="text-center py-8">Loading market caps...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketCaps?.data?.map((cap: VeloCapData) => (
                  <div
                    key={cap.coin}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{cap.coin}</span>
                      <Badge variant="outline" className="text-xs">
                        #{marketCaps.data.indexOf(cap) + 1}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Market Cap:</span>
                        <span className="text-green-400 font-medium">
                          {formatNumber(cap.circ_dollars)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">FDV:</span>
                        <span className="text-blue-400">
                          {formatNumber(cap.fdv_dollars)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Circulating:</span>
                        <span className="text-gray-300">
                          {(cap.circ / 1e6).toFixed(2)}M
                        </span>
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
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        {selectedCoin}/USD · {selectedExchange.toUpperCase()}
                      </p>
                      <p className="text-3xl font-bold">
                        ${marketData.data[marketData.data.length - 1]?.close_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    {priceChange && (
                      <div className={`flex items-center gap-2 ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {priceChange.isPositive ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                        <span className="text-xl font-semibold">
                          {Math.abs(priceChange.value).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Chart */}
            {priceChartData && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Price Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Line 
                      data={priceChartData} 
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
                              color: 'rgba(255, 255, 255, 0.1)',
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
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Available Futures Contracts</CardTitle>
                <CardDescription>Cross-exchange futures products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {futuresProducts?.slice(0, 30).map((product: VeloProduct, idx: number) => (
                    <div
                      key={`${product.exchange}-${product.product}-${idx}`}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{product.coin}</span>
                        <Badge variant="secondary" className="text-xs">
                          {product.exchange}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{product.product}</p>
                      {product.begin && (
                        <p className="text-xs text-gray-500 mt-1">
                          Since: {new Date(product.begin).toLocaleDateString()}
                        </p>
                      )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Spot Products:</span>
                      <span className="font-medium">{spotProducts?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Futures Contracts:</span>
                      <span className="font-medium">{futuresProducts?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Options Products:</span>
                      <span className="font-medium">{optionsProducts?.length || 0}</span>
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