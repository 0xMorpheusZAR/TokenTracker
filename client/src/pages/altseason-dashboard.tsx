import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, PieChart as PieChartIcon,
  BarChart3, AlertCircle, Info, Calendar, Zap, Target, Shield, Bitcoin,
  ArrowUpRight, ArrowDownRight, Clock, Rocket, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

// Helper functions
const formatNumber = (num: number) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPercentage = (num: number) => {
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-sm text-gray-400">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(4)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AltseasonDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('90d');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Fetch altseason metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/altseason/metrics'],
    refetchInterval: 30000,
  });

  // Fetch ETH/BTC ratio data
  const { data: ethBtcData, isLoading: ethBtcLoading } = useQuery({
    queryKey: ['/api/altseason/eth-btc-ratio'],
    refetchInterval: 60000,
  });

  // Fetch altcoins performance
  const { data: performance, isLoading: perfLoading } = useQuery({
    queryKey: ['/api/altseason/altcoins-performance', selectedTimeframe],
    refetchInterval: 60000,
  });

  // Fetch historical patterns
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['/api/altseason/historical-patterns'],
    refetchInterval: 300000,
  });

  // Fetch market cap breakdown
  const { data: marketCapData, isLoading: marketCapLoading } = useQuery({
    queryKey: ['/api/altseason/market-cap-breakdown'],
    refetchInterval: 60000,
  });

  // Prepare data for charts
  const altseasonIndexData = [
    { name: 'Current', value: metrics?.altseasonIndex || 0, fullMark: 100 }
  ];

  const pieData = marketCapData ? [
    { name: 'Bitcoin', value: marketCapData.breakdown.bitcoin.percentage, color: '#F7931A' },
    { name: 'Ethereum', value: marketCapData.breakdown.ethereum.percentage, color: '#627EEA' },
    { name: 'Other Altcoins', value: marketCapData.breakdown.otherAltcoins.percentage, color: '#10B981' }
  ] : [];

  // Process ETH/BTC ratio data for chart
  const ethBtcChartData = ethBtcData?.historicalData?.map((point: any) => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    ratio: point.ratio
  })) || [];

  // Get top performing altcoins
  const topPerformers = performance?.altcoins
    ?.sort((a: any, b: any) => b.performanceVsBtc[selectedTimeframe] - a.performanceVsBtc[selectedTimeframe])
    ?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Altseason Analysis Dashboard
            </h1>
            <p className="text-gray-400">Real-time tracking of altcoin season indicators and market dynamics</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-800">
              Back to Main Dashboard
            </Button>
          </Link>
        </div>

        {/* Key Alert */}
        <Alert className={cn(
          "mb-6 border",
          metrics?.isAltseason 
            ? "bg-green-900/20 border-green-700" 
            : "bg-orange-900/20 border-orange-700"
        )}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-lg font-semibold">
            {metrics?.isAltseason ? "🚀 ALTSEASON ACTIVE!" : "⏳ Pre-Altseason Phase"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {metrics?.isAltseason 
              ? `${metrics.outperformingCount} out of 49 top altcoins (${metrics.altseasonIndex}%) are outperforming Bitcoin over the last 90 days. This officially qualifies as an altseason!`
              : `Currently ${metrics?.outperformingCount || 0} out of 49 top altcoins (${metrics?.altseasonIndex || 0}%) are outperforming Bitcoin. We need 75% to officially enter altseason.`
            }
          </AlertDescription>
        </Alert>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Altseason Index Gauge */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-gray-600 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="mr-2 text-blue-400" />
                Altseason Index
              </span>
              <Badge variant={metrics?.isAltseason ? "default" : "secondary"}>
                {metrics?.altseasonIndex || 0}%
              </Badge>
            </CardTitle>
            <CardDescription>75% threshold for official altseason</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={altseasonIndexData}>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={metrics?.altseasonIndex >= 75 ? "#10B981" : 
                          metrics?.altseasonIndex >= 50 ? "#F59E0B" : "#EF4444"}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-white">
                    {metrics?.altseasonIndex || 0}%
                  </text>
                  <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-400">
                    {metrics?.isAltseason ? "ALTSEASON" : "BITCOIN SEASON"}
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Outperforming BTC:</span>
                <span className="font-medium">{metrics?.outperformingCount || 0}/49 coins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">BTC 90d Change:</span>
                <span className={cn("font-medium", metrics?.btcChange90d > 0 ? "text-green-400" : "text-red-400")}>
                  {formatPercentage(metrics?.btcChange90d || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bitcoin Dominance */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-gray-600 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bitcoin className="mr-2 text-orange-400" />
              Bitcoin Dominance
            </CardTitle>
            <CardDescription>Market share of total crypto market cap</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="text-4xl font-bold mb-2">
                {metrics?.bitcoinDominance?.toFixed(2) || 0}%
              </div>
              <Progress 
                value={metrics?.bitcoinDominance || 0} 
                className="h-3"
              />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Market Cap</span>
                  <span className="font-medium">{formatNumber(metrics?.totalMarketCap || 0)}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">24h Volume</span>
                  <span className="font-medium">{formatNumber(metrics?.totalVolume || 0)}</span>
                </div>
              </div>
              <Alert className="bg-blue-900/20 border-blue-700">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Lower BTC dominance typically indicates capital rotation into altcoins
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Market Cap Breakdown */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-gray-600 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 text-purple-400" />
              Market Cap Distribution
            </CardTitle>
            <CardDescription>Current market share breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-400">{entry.name}</span>
                  </div>
                  <span className="font-medium">{entry.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ETH/BTC Ratio Chart */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-gray-600 transition-all lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Target className="mr-2 text-indigo-400" />
                ETH/BTC Ratio - Key Altseason Indicator
              </span>
              <div className="text-2xl font-bold">
                {ethBtcData?.currentRatio?.toFixed(4) || 0}
              </div>
            </CardTitle>
            <CardDescription>
              Critical resistance at 0.075 BTC • Support at 0.065 BTC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ethBtcChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="ratio" 
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={false}
                />
                {/* Critical levels */}
                <Line 
                  type="monotone" 
                  dataKey={() => 0.075} 
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Resistance"
                />
                <Line 
                  type="monotone" 
                  dataKey={() => 0.065} 
                  stroke="#10B981"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Support"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Historical High (2017)</div>
                <div className="font-medium">{ethBtcData?.criticalLevels?.historicalHigh || 0.15}</div>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Recent High (2021)</div>
                <div className="font-medium">{ethBtcData?.criticalLevels?.recentHigh || 0.088}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Seasonal Patterns */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-gray-600 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 text-green-400" />
              Seasonal Altseason Pattern
            </CardTitle>
            <CardDescription>Historical monthly BTC dominance averages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={historicalData?.seasonalPattern || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar 
                  dataKey="avgBtcDominance" 
                  fill={(data: any) => data.isAltseasonMonth ? "#10B981" : "#6B7280"}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <Alert className="mt-4 bg-green-900/20 border-green-700">
              <Zap className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Historically, January-May shows the strongest altcoin performance
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Top Performing Altcoins */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-gray-600 transition-all lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Rocket className="mr-2 text-orange-400" />
                Top Altcoins vs Bitcoin Performance
              </span>
              <div className="flex gap-2">
                {['24h', '7d', '30d', '90d'].map(tf => (
                  <Button
                    key={tf}
                    variant={selectedTimeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {topPerformers.map((coin: any, index: number) => (
                  <div 
                    key={coin.id} 
                    className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={coin.image} 
                            alt={coin.name} 
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full px-1 text-xs font-bold">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold flex items-center">
                            {coin.name} 
                            <span className="text-gray-400 text-sm ml-2">
                              {coin.symbol.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            ${coin.currentPrice.toFixed(coin.currentPrice < 1 ? 6 : 2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-lg font-bold flex items-center",
                          coin.performanceVsBtc[selectedTimeframe] > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {coin.performanceVsBtc[selectedTimeframe] > 0 ? 
                            <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                          }
                          {formatPercentage(coin.performanceVsBtc[selectedTimeframe])}
                        </div>
                        <div className="text-xs text-gray-500">
                          vs BTC
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Price Change:</span>
                        <div className={cn(
                          "font-medium",
                          coin.priceChange[selectedTimeframe] > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {formatPercentage(coin.priceChange[selectedTimeframe])}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">BTC Change:</span>
                        <div className={cn(
                          "font-medium",
                          performance?.btcPerformance[selectedTimeframe] > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {formatPercentage(performance?.btcPerformance[selectedTimeframe] || 0)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Market Cap:</span>
                        <div className="font-medium">{formatNumber(coin.marketCap)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">24h Volume:</span>
                        <div className="font-medium">{formatNumber(coin.volume24h)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Altseason Strategy Guide */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-gray-600 transition-all lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 text-cyan-400" />
              Altseason Trading Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-400">Entry Signals</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• BTC dominance breaks below 64%</li>
                  <li>• ETH/BTC ratio above 0.065</li>
                  <li>• Altseason Index rising above 50%</li>
                  <li>• Major alts outperforming BTC</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-400">Risk Management</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Position size: 5-10% per alt</li>
                  <li>• Stop loss: 15-20% below entry</li>
                  <li>• Take profits in tranches</li>
                  <li>• Rebalance weekly</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-700/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-400">Exit Signals</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• BTC dominance rising above 70%</li>
                  <li>• ETH/BTC ratio below 0.065</li>
                  <li>• Altseason Index below 25%</li>
                  <li>• Extreme greed indicators</li>
                </ul>
              </div>
            </div>
            
            <Alert className="mt-4 bg-yellow-900/20 border-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Remember: Altseasons are typically short-lived (2-3 months). Always have an exit strategy and never invest more than you can afford to lose.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>Data provided by CoinGecko Pro API • Updates every 30 seconds</p>
        <p className="mt-2">Created by @0xMorpheusXBT</p>
      </div>
    </div>
  );
}