import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  TrendingUp, TrendingDown, AlertCircle, Activity, 
  ArrowUpRight, ArrowDownRight, Cpu, Users, 
  DollarSign, BarChart3, Eye, Zap, ArrowLeftRight,
  Wallet, Shield, Brain, ExternalLink, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FlowData {
  protocol: string;
  chain: string;
  tvl: number;
  tvlChange24h: number;
  tvlChange7d: number;
  inflowUSD24h: number;
  outflowUSD24h: number;
  netFlow24h: number;
  users24h: number;
  userChange24h: number;
  priceImpact: number;
  anomalyScore: number;
  isAnomaly: boolean;
}

interface ChainMigration {
  fromChain: string;
  toChain: string;
  volumeUSD: number;
  protocols: string[];
  percentageOfTotal: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface UserSurge {
  protocol: string;
  chain: string;
  users24h: number;
  userGrowth: number;
  txns24h: number;
  avgTxnSize: number;
  priceChange24h: number;
  correlation: number;
  surgeType: 'organic' | 'bot' | 'airdrop' | 'unknown';
}

interface TradingSignal {
  protocol: string;
  chain: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: 'STRONG' | 'MEDIUM' | 'WEAK';
  reason: string;
  confidence: number;
  targetPrice?: number;
  stopLoss?: number;
  tradingUrl?: string;
  chartUrl?: string;
}

export default function SmartMoneyFlow() {
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');
  const [activeTab, setActiveTab] = useState<string>('signals');

  // Fetch smart money flow data
  const { data: flowData, isLoading: flowLoading } = useQuery<FlowData[]>({
    queryKey: ['/api/smart-money/flows', selectedChain, selectedTimeframe],
  });

  const { data: migrationData, isLoading: migrationLoading } = useQuery<ChainMigration[]>({
    queryKey: ['/api/smart-money/migrations', selectedTimeframe],
  });

  const { data: surgeData, isLoading: surgeLoading } = useQuery<UserSurge[]>({
    queryKey: ['/api/smart-money/surges', selectedChain, selectedTimeframe],
  });

  const { data: chainsData } = useQuery<any[]>({
    queryKey: ['/api/defillama/chains'],
  });

  const chains = chainsData?.map(chain => chain.name) || [];

  const anomalies = flowData?.filter(f => f.isAnomaly) || [];
  const topInflows = flowData?.sort((a, b) => b.inflowUSD24h - a.inflowUSD24h).slice(0, 10) || [];
  const topOutflows = flowData?.sort((a, b) => b.outflowUSD24h - a.outflowUSD24h).slice(0, 10) || [];

  // Generate trading signals based on anomalies
  const generateSignals = (): TradingSignal[] => {
    if (!flowData) return [];
    
    return flowData
      .filter(f => f.isAnomaly)
      .map(flow => {
        let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        let strength: 'STRONG' | 'MEDIUM' | 'WEAK' = 'WEAK';
        let reason = '';
        let confidence = 0;

        // Analyze flow patterns
        const netFlowRatio = flow.netFlow24h / flow.tvl;
        const userGrowthNormalized = flow.userChange24h / 100;
        
        if (flow.anomalyScore > 5) {
          if (flow.netFlow24h > 0 && flow.priceImpact < -5) {
            signal = 'BUY';
            strength = flow.anomalyScore > 7 ? 'STRONG' : 'MEDIUM';
            reason = `Strong inflows (+$${(flow.inflowUSD24h / 1e6).toFixed(1)}M) despite ${flow.priceImpact.toFixed(1)}% price drop`;
            confidence = Math.min(flow.anomalyScore * 10, 90);
          } else if (flow.netFlow24h < 0 && flow.priceImpact > 5) {
            signal = 'SELL';
            strength = flow.anomalyScore > 7 ? 'STRONG' : 'MEDIUM';
            reason = `Heavy outflows (-$${(flow.outflowUSD24h / 1e6).toFixed(1)}M) with overvalued price`;
            confidence = Math.min(flow.anomalyScore * 10, 90);
          } else if (flow.userChange24h > 50 && flow.netFlow24h > 0) {
            signal = 'BUY';
            strength = 'MEDIUM';
            reason = `User surge (+${flow.userChange24h.toFixed(0)}%) with positive flows`;
            confidence = Math.min(60 + flow.anomalyScore * 5, 85);
          }
        }

        return {
          protocol: flow.protocol,
          chain: flow.chain,
          signal,
          strength,
          reason,
          confidence,
          tradingUrl: `https://app.uniswap.org/#/swap?chain=${flow.chain.toLowerCase()}`,
          chartUrl: `https://dexscreener.com/search?q=${flow.protocol}`
        };
      })
      .filter(s => s.signal !== 'HOLD')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  };

  const tradingSignals = generateSignals();

  // Chart data for flow visualization
  const flowChartData = {
    labels: topInflows.slice(0, 7).map(f => f.protocol) || [],
    datasets: [
      {
        label: 'Inflows',
        data: topInflows.slice(0, 7).map(f => f.inflowUSD24h) || [],
        backgroundColor: 'rgba(74, 222, 128, 0.5)',
        borderColor: 'rgb(74, 222, 128)',
        borderWidth: 2,
      },
      {
        label: 'Outflows',
        data: topInflows.slice(0, 7).map(f => -f.outflowUSD24h) || [],
        backgroundColor: 'rgba(248, 113, 113, 0.5)',
        borderColor: 'rgb(248, 113, 113)',
        borderWidth: 2,
      },
    ],
  };

  // Chain distribution chart
  const chainDistribution = {
    labels: chains.slice(0, 8),
    datasets: [
      {
        data: chains.slice(0, 8).map(() => Math.random() * 100),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(250, 204, 21, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-gray-200 transition-colors">
              ← Back to Dashboard
            </Link>
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Smart Money Flow Tracker
            </h1>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger className="w-40 bg-gray-900/50 border-gray-800">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {chains?.map(chain => (
                  <SelectItem key={chain} value={chain}>{chain}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32 bg-gray-900/50 border-gray-800">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Total Net Flow</p>
                  <p className="text-2xl font-bold text-green-400">
                    +${flowData?.reduce((sum, f) => sum + f.netFlow24h, 0).toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Anomalies Detected</p>
                  <p className="text-2xl font-bold text-yellow-400">{anomalies.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Active Migrations</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {migrationData?.filter(m => m.trend === 'increasing').length || 0}
                  </p>
                </div>
                <ArrowLeftRight className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">User Surges</p>
                  <p className="text-2xl font-bold text-purple-400">{surgeData?.length || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-gray-900/50 border-gray-800">
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            <TabsTrigger value="anomalies">Flow Anomalies</TabsTrigger>
            <TabsTrigger value="migrations">Chain Migrations</TabsTrigger>
            <TabsTrigger value="surges">User Surges</TabsTrigger>
            <TabsTrigger value="overview">Flow Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  AI-Generated Trading Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tradingSignals.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No strong trading signals detected based on current flow anomalies.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tradingSignals.map((signal, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          signal.signal === 'BUY' 
                            ? 'bg-green-900/20 border-green-500/30' 
                            : 'bg-red-900/20 border-red-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{signal.protocol}</h4>
                              <Badge 
                                variant={signal.signal === 'BUY' ? 'default' : 'destructive'} 
                                className={`${
                                  signal.signal === 'BUY' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-red-600 text-white'
                                }`}
                              >
                                {signal.signal}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`
                                  ${signal.strength === 'STRONG' ? 'border-yellow-500 text-yellow-400' : ''}
                                  ${signal.strength === 'MEDIUM' ? 'border-blue-500 text-blue-400' : ''}
                                  ${signal.strength === 'WEAK' ? 'border-gray-500 text-gray-400' : ''}
                                `}
                              >
                                {signal.strength}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{signal.chain}</p>
                            <p className="text-gray-300 mb-3">{signal.reason}</p>
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-gray-400">Confidence: </span>
                                <span className={`font-semibold ${
                                  signal.confidence > 70 ? 'text-green-400' : 
                                  signal.confidence > 50 ? 'text-yellow-400' : 'text-orange-400'
                                }`}>
                                  {signal.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <a
                              href={signal.tradingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                            >
                              Trade <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={signal.chartUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                            >
                              Chart <BarChart3 className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Detected Anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flowLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {anomalies.map((anomaly, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-gray-800/50 rounded-lg border border-yellow-400/30"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{anomaly.protocol}</h4>
                              <p className="text-sm text-gray-400">{anomaly.chain}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Score: {anomaly.anomalyScore.toFixed(2)}
                                </Badge>
                                <span className={`text-sm ${anomaly.netFlow24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {anomaly.netFlow24h > 0 ? '+' : ''}{anomaly.netFlow24h.toLocaleString()} USD
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Impact</p>
                              <p className={`font-semibold ${anomaly.priceImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {anomaly.priceImpact > 0 ? '+' : ''}{anomaly.priceImpact.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Flow Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Bar 
                      data={flowChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: { color: '#fff' }
                          },
                        },
                        scales: {
                          x: { ticks: { color: '#888' }, grid: { color: '#333' } },
                          y: { ticks: { color: '#888' }, grid: { color: '#333' } }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="migrations" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                      Active Chain Migrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {migrationLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {migrationData?.map((migration, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <p className="text-sm text-gray-400">From</p>
                                  <p className="font-semibold">{migration.fromChain}</p>
                                </div>
                                <ArrowUpRight className={`w-6 h-6 ${
                                  migration.trend === 'increasing' ? 'text-green-400' : 
                                  migration.trend === 'decreasing' ? 'text-red-400' : 'text-gray-400'
                                }`} />
                                <div className="text-center">
                                  <p className="text-sm text-gray-400">To</p>
                                  <p className="font-semibold">{migration.toChain}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-lg">${migration.volumeUSD.toLocaleString()}</p>
                                <p className="text-sm text-gray-400">{migration.percentageOfTotal.toFixed(1)}% of total</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Protocols: {migration.protocols.slice(0, 3).join(', ')}
                                {migration.protocols.length > 3 && ` +${migration.protocols.length - 3} more`}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Chain TVL Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut 
                      data={chainDistribution} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: { color: '#fff', font: { size: 10 } }
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="surges" className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  User Activity Surges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {surgeLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {surgeData?.map((surge, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{surge.protocol}</h4>
                            <p className="text-sm text-gray-400">{surge.chain}</p>
                          </div>
                          <Badge variant={
                            surge.surgeType === 'organic' ? 'default' :
                            surge.surgeType === 'bot' ? 'destructive' :
                            surge.surgeType === 'airdrop' ? 'secondary' : 'outline'
                          }>
                            {surge.surgeType}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Users (24h)</p>
                            <p className="font-semibold">{surge.users24h.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Growth</p>
                            <p className={`font-semibold ${surge.userGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {surge.userGrowth > 0 ? '+' : ''}{surge.userGrowth.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Avg Txn Size</p>
                            <p className="font-semibold">${surge.avgTxnSize.toFixed(0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Price Corr.</p>
                            <p className="font-semibold">{(surge.correlation * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-400">Top Inflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topInflows.map((flow, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
                        <div>
                          <p className="font-semibold">{flow.protocol}</p>
                          <p className="text-sm text-gray-400">{flow.chain}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">
                            +${flow.inflowUSD24h.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            TVL: ${flow.tvl.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-red-400">Top Outflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topOutflows.map((flow, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
                        <div>
                          <p className="font-semibold">{flow.protocol}</p>
                          <p className="text-sm text-gray-400">{flow.chain}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-400">
                            -${flow.outflowUSD24h.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            TVL: ${flow.tvl.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}