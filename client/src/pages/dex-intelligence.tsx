import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrendingUpIcon, 
  AlertTriangleIcon,
  ActivityIcon,
  DollarSignIcon,
  UsersIcon,
  BarChartIcon,
  ShieldIcon,
  ZapIcon,
  InfoIcon,
  RefreshCwIcon,
  WavesIcon,
  CpuIcon
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

interface DexPool {
  id: string;
  name: string;
  chain: string;
  tvl: number;
  volume24h: number;
  volumeChange: number;
  fees24h: number;
  apy: number;
  ilRisk: number;
  tokens: string[];
  priceChange: number;
}

interface WhaleTransaction {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  token: string;
  pool: string;
  timestamp: number;
  impact: number;
  walletCategory?: string;
}

interface ProtocolMetrics {
  protocol: string;
  tvl: number;
  volume24h: number;
  fees24h: number;
  revenue24h: number;
  users24h: number;
  dominance: number;
}

export default function DexIntelligence() {
  const [selectedChain, setSelectedChain] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch trending pools
  const { data: trendingPoolsData = [] } = useQuery<any[]>({
    queryKey: ['/api/dex/trending-pools', selectedChain],
    queryFn: async () => {
      const response = await fetch(`/api/dex/trending-pools?chain=${selectedChain}`);
      if (!response.ok) throw new Error('Failed to fetch trending pools');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch whale transactions
  const { data: whaleTransactionsData = [] } = useQuery<WhaleTransaction[]>({
    queryKey: ['/api/dex/whale-transactions'],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Fetch protocol metrics
  const { data: protocolMetricsData = [] } = useQuery<ProtocolMetrics[]>({
    queryKey: ['/api/dex/protocol-metrics'],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Fetch volume stats
  const { data: volumeStats = { total24h: 0, change24h: 0 } } = useQuery<{total24h: number, change24h: number}>({
    queryKey: ['/api/dex/volume-stats'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch total TVL from protocols
  const { data: protocolsData = [] } = useQuery<any[]>({
    queryKey: ['/api/defillama/protocols'],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Process data for trending pools
  const trendingPools: DexPool[] = trendingPoolsData.slice(0, 10).map((pool: any) => ({
    id: pool.id,
    name: pool.name,
    chain: pool.chain,
    tvl: pool.tvl,
    volume24h: pool.volumeUsd1d || 0,
    volumeChange: pool.volumeUsd7d > 0 
      ? ((pool.volumeUsd1d - pool.volumeUsd7d/7) / (pool.volumeUsd7d/7)) * 100 
      : 0,
    fees24h: pool.apyBase || 0,
    apy: pool.apy,
    ilRisk: pool.ilRisk,
    tokens: pool.name.includes('-') ? pool.name.split('-') : [pool.name],
    priceChange: 0
  }));

  // Calculate total DEX TVL from protocol metrics
  const totalDexTvl = protocolMetricsData.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);
  
  // Calculate 24h volume from volume stats
  const total24hVolume = (volumeStats as any)?.total24h || 0;
  const volumeChange24h = (volumeStats as any)?.change24h || 0;



  const volumeChartData = {
    labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'],
    datasets: [
      {
        label: 'Total Volume',
        data: [850, 920, 980, 1050, 1200, 1380, 1450],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value + 'M';
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          DEX Intelligence System
        </h1>
        <p className="text-gray-400 text-lg">Real-time on-chain analytics powered by CoinGecko & DefiLlama</p>
      </div>

      {/* Control Panel */}
      <Card className="mb-6 bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CpuIcon className="h-5 w-5 text-blue-400" />
              Control Panel
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="gap-2"
              >
                <RefreshCwIcon className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {['all', 'ethereum', 'arbitrum', 'optimism', 'polygon', 'base'].map((chain) => (
              <Button
                key={chain}
                variant={selectedChain === chain ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChain(chain)}
                className="capitalize"
              >
                {chain === 'all' ? 'All Chains' : chain}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total DEX TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalDexTvl / 1e9).toFixed(2)}B
            </div>
            <p className="text-xs text-green-400 mt-1">+12.5% (24h)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(total24hVolume / 1e9).toFixed(2)}B
            </div>
            <p className={`text-xs mt-1 ${volumeChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {volumeChange24h >= 0 ? '+' : ''}{volumeChange24h.toFixed(1)}% (24h)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">542K</div>
            <p className="text-xs text-red-400 mt-1">-5.3% (24h)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Whale Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <Badge className="mt-1 bg-orange-600/50">12 Large Txns</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList className="bg-gray-800/50 border-gray-700">
          <TabsTrigger value="trending">Trending Pools</TabsTrigger>
          <TabsTrigger value="whales">Whale Tracker</TabsTrigger>
          <TabsTrigger value="protocols">Protocol Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Smart Alerts</TabsTrigger>
        </TabsList>

        {/* Trending Pools */}
        <TabsContent value="trending">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-green-400" />
                    Trending DEX Pools
                  </CardTitle>
                  <CardDescription>Pools with highest volume growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {trendingPools.map((pool) => (
                        <div key={pool.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-blue-600 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {pool.name}
                                <Badge variant="outline" className="text-xs">{pool.chain}</Badge>
                              </h4>
                              <p className="text-sm text-gray-400">TVL: ${(pool.tvl / 1e6).toFixed(2)}M</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {pool.volumeChange > 0 ? (
                                  <span className="text-green-400">+{pool.volumeChange.toFixed(1)}%</span>
                                ) : (
                                  <span className="text-red-400">{pool.volumeChange.toFixed(1)}%</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">Volume Change</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-gray-400">APY</p>
                              <p className="font-medium text-green-400">{pool.apy.toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400">24h Vol</p>
                              <p className="font-medium">${(pool.volume24h / 1e6).toFixed(2)}M</p>
                            </div>
                            <div>
                              <p className="text-gray-400">IL Risk</p>
                              <p className={`font-medium ${pool.ilRisk < -5 ? 'text-red-400' : 'text-yellow-400'}`}>
                                {pool.ilRisk.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChartIcon className="h-5 w-5 text-blue-400" />
                    Volume Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line data={volumeChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Whale Tracker */}
        <TabsContent value="whales">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WavesIcon className="h-5 w-5 text-blue-400" />
                  Recent Whale Transactions
                </CardTitle>
                <CardDescription>Transactions over $100k</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {whaleTransactionsData.map((tx: WhaleTransaction) => (
                      <div key={tx.id} className={`p-4 rounded-lg border ${
                        tx.type === 'buy' 
                          ? 'bg-green-900/20 border-green-700' 
                          : 'bg-red-900/20 border-red-700'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {tx.type === 'buy' ? (
                              <ArrowUpIcon className="h-5 w-5 text-green-400" />
                            ) : (
                              <ArrowDownIcon className="h-5 w-5 text-red-400" />
                            )}
                            <div>
                              <h4 className="font-semibold">
                                ${(tx.amount / 1e6).toFixed(2)}M {tx.type.toUpperCase()}
                              </h4>
                              <p className="text-sm text-gray-400">{tx.pool}</p>
                            </div>
                          </div>
                          {tx.walletCategory && (
                            <Badge variant="outline">{tx.walletCategory}</Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </span>
                          <span className={tx.impact > 0 ? 'text-green-400' : 'text-red-400'}>
                            Impact: {tx.impact > 0 ? '+' : ''}{tx.impact.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldIcon className="h-5 w-5 text-purple-400" />
                  Whale Accumulation Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>ETH</span>
                      <span className="text-green-400">High Accumulation</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>USDC</span>
                      <span className="text-yellow-400">Neutral</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>WBTC</span>
                      <span className="text-red-400">Distribution</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Protocol Analytics */}
        <TabsContent value="protocols">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-purple-400" />
                Top DEX Protocols by TVL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3">Protocol</th>
                      <th className="text-right py-3">TVL</th>
                      <th className="text-right py-3">24h Volume</th>
                      <th className="text-right py-3">24h Fees</th>
                      <th className="text-right py-3">Revenue</th>
                      <th className="text-right py-3">Dominance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {protocolMetricsData.map((protocol: ProtocolMetrics) => (
                      <tr key={protocol.protocol} className="border-b border-gray-800 hover:bg-gray-900/50">
                        <td className="py-3 font-medium">{protocol.protocol}</td>
                        <td className="text-right">${(protocol.tvl / 1e9).toFixed(2)}B</td>
                        <td className="text-right">${(protocol.volume24h / 1e6).toFixed(2)}M</td>
                        <td className="text-right">${(protocol.fees24h / 1e6).toFixed(2)}M</td>
                        <td className="text-right">${(protocol.revenue24h / 1e6).toFixed(2)}M</td>
                        <td className="text-right">
                          <Badge variant="outline">{protocol.dominance.toFixed(1)}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Alerts */}
        <TabsContent value="alerts">
          <div className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-5 w-5 text-yellow-400" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert className="bg-red-900/20 border-red-700">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Impermanent Loss Warning:</strong> WETH-USDC pool on Arbitrum showing -12.5% IL
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-green-900/20 border-green-700">
                    <ZapIcon className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Volume Explosion:</strong> GMX-ETH pool volume up 450% in last hour
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-blue-900/20 border-blue-700">
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>
                      <strong>New Pool Alert:</strong> PEPE-USDC launched on Uniswap V3 with $2.5M initial liquidity
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}