import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Activity,
  Lock,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Wallet,
  LineChart,
  Droplets,
  Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function UnifiedAssetDashboard() {
  const [selectedToken, setSelectedToken] = useState<string>('hyperliquid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch available tokens
  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['/api/coingecko/detailed'],
    refetchInterval: 60000,
  });

  // Fetch unified asset data for selected token
  const { data: assetData, isLoading: assetLoading, refetch: refetchAsset, error: assetError } = useQuery({
    queryKey: [`/api/unified-asset/${selectedToken}`],
    enabled: !!selectedToken,
    refetchInterval: 30000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchAsset();
    toast({
      title: "Data refreshed",
      description: "Asset data has been updated with the latest information.",
    });
    setIsRefreshing(false);
  };

  const formatNumber = (num: number | null | undefined, decimals = 2): string => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const formatPercent = (num: number | null | undefined): string => {
    if (!num && num !== 0) return 'N/A';
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Prepare chart data
  const chartData = assetData?.priceHistory ? {
    labels: assetData.priceHistory.slice(-30).map((_, i) => `${30 - i}d`),
    datasets: [
      {
        label: 'Price',
        data: assetData.priceHistory.slice(-30).map(([_, price]) => price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null;

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
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(tickValue: any) {
            return '$' + tickValue.toFixed(2);
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <a 
              href="/" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </a>
            
            <h1 className="text-3xl font-bold text-white">Unified Asset Dashboard</h1>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Token Selector */}
          <div className="max-w-md mx-auto">
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {tokens?.map((token: any) => (
                  <SelectItem 
                    key={token.id} 
                    value={token.id}
                    className="text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      {token.image && (
                        <img src={token.image} alt={token.symbol} className="w-5 h-5 rounded-full" />
                      )}
                      <span>{token.symbol.toUpperCase()} - {token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {assetError && (
          <Card className="bg-red-900/20 border-red-800 p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">Failed to load asset data. Please try again.</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {assetLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 bg-gray-800" />
            ))}
          </div>
        )}

        {/* Main Content */}
        {assetData && !assetLoading && (
          <>
            {/* Token Header */}
            <div className="flex items-center gap-4 mb-8">
              {assetData.image && (
                <img src={assetData.image} alt={assetData.symbol} className="w-16 h-16 rounded-full" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {assetData.name} ({assetData.symbol?.toUpperCase()})
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl text-white">{formatNumber(assetData.currentPrice)}</span>
                  <Badge
                    variant={assetData.priceChange24h >= 0 ? "default" : "destructive"}
                    className={assetData.priceChange24h >= 0 ? "bg-green-600" : "bg-red-600"}
                  >
                    {formatPercent(assetData.priceChange24h)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 4 Main Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Price, Volume, Market Cap */}
              <Card className="bg-gray-800/90 border-gray-700 p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">Price, volume, market cap</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Market Cap</p>
                    <p className="text-white text-xl font-bold">{formatNumber(assetData.marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">24h Volume</p>
                    <p className="text-white text-xl font-bold">{formatNumber(assetData.totalVolume)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">FDV</p>
                    <p className="text-white text-xl font-bold">{formatNumber(assetData.fullyDilutedValuation)}</p>
                  </div>
                </div>
              </Card>

              {/* TVL, Users, Revenue */}
              <Card className="bg-gray-800/90 border-gray-700 p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">TVL, users, revenue</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Value Locked</p>
                    <p className="text-white text-xl font-bold">
                      {formatNumber(assetData.tvl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Active Users (24h)</p>
                    <p className="text-white text-xl font-bold">
                      {assetData.activeUsers ? assetData.activeUsers.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Revenue (24h)</p>
                    <p className="text-white text-xl font-bold">
                      {formatNumber(assetData.revenue24h)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* DEX Pools, Depth */}
              <Card className="bg-gray-800/90 border-gray-700 p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Droplets className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">DEX pools, depth</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Liquidity</p>
                    <p className="text-white text-xl font-bold">
                      {formatNumber(assetData.totalLiquidity)}
                    </p>
                  </div>
                  {assetData.topLiquidityPools?.slice(0, 2).map((pool, i) => (
                    <div key={i}>
                      <p className="text-gray-400 text-xs uppercase tracking-wider">{pool.pool}</p>
                      <p className="text-white text-lg font-semibold">{formatNumber(pool.liquidity)}</p>
                    </div>
                  ))}
                  {(!assetData.topLiquidityPools || assetData.topLiquidityPools.length === 0) && (
                    <p className="text-gray-500 text-sm">No liquidity data available</p>
                  )}
                </div>
              </Card>

              {/* Vesting Schedules */}
              <Card className="bg-gray-800/90 border-gray-700 p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Lock className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">Vesting schedules</span>
                </div>
                <div className="space-y-3">
                  {assetData.upcomingUnlocks && assetData.upcomingUnlocks.length > 0 ? (
                    assetData.upcomingUnlocks.slice(0, 3).map((unlock, i) => (
                      <div key={i}>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">
                          {new Date(unlock.date).toLocaleDateString()}
                        </p>
                        <p className="text-white text-lg font-semibold">{unlock.amount}</p>
                        <Badge
                          variant={unlock.impact === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {unlock.percentage}% • {unlock.impact} impact
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming unlocks</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="defi">DeFi Analytics</TabsTrigger>
                <TabsTrigger value="liquidity">Liquidity Details</TabsTrigger>
                <TabsTrigger value="unlocks">Token Unlocks</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="bg-gray-800/50 border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Price Chart (30 Days)</h3>
                  {chartData ? (
                    <div className="h-64">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-400">No price history available</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div>
                      <p className="text-gray-400 text-sm">ATH</p>
                      <p className="text-white font-semibold">{formatNumber(assetData.ath)}</p>
                      <p className="text-gray-500 text-xs">
                        {assetData.athDate ? new Date(assetData.athDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">ATL</p>
                      <p className="text-white font-semibold">{formatNumber(assetData.atl)}</p>
                      <p className="text-gray-500 text-xs">
                        {assetData.atlDate ? new Date(assetData.atlDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">7D Change</p>
                      <p className={`font-semibold ${assetData.priceChange7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(assetData.priceChange7d)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">30D Change</p>
                      <p className={`font-semibold ${assetData.priceChange30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(assetData.priceChange30d)}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="defi" className="mt-6">
                <Card className="bg-gray-800/50 border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">DeFi Protocol Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-3">Value Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Value Locked</span>
                          <span className="text-white">{formatNumber(assetData.tvl)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">TVL Change (24h)</span>
                          <span className={assetData.tvlChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatPercent(assetData.tvlChange24h)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Users</span>
                          <span className="text-white">
                            {assetData.activeUsers ? assetData.activeUsers.toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-3">Revenue & Fees</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fees (24h)</span>
                          <span className="text-white">{formatNumber(assetData.fees24h)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Revenue (24h)</span>
                          <span className="text-white">{formatNumber(assetData.revenue24h)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Revenue (30d)</span>
                          <span className="text-white">{formatNumber(assetData.revenue30d)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="liquidity" className="mt-6">
                <Card className="bg-gray-800/50 border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Liquidity Distribution</h3>
                  {assetData.topLiquidityPools && assetData.topLiquidityPools.length > 0 ? (
                    <div className="space-y-4">
                      {assetData.topLiquidityPools.map((pool, i) => (
                        <div key={i} className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white font-medium">{pool.pool}</p>
                              <p className="text-gray-400 text-sm">{pool.chain}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{formatNumber(pool.liquidity)}</p>
                              <p className="text-gray-400 text-sm">
                                {assetData.totalLiquidity ? 
                                  `${((pool.liquidity / assetData.totalLiquidity) * 100).toFixed(1)}% of total` : 
                                  'N/A'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No liquidity data available</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="unlocks" className="mt-6">
                <Card className="bg-gray-800/50 border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Upcoming Token Unlocks</h3>
                  {assetData.upcomingUnlocks && assetData.upcomingUnlocks.length > 0 ? (
                    <div className="space-y-4">
                      {assetData.upcomingUnlocks.map((unlock, i) => (
                        <div key={i} className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">
                                {new Date(unlock.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <p className="text-gray-400 text-sm mt-1">{unlock.type || 'Token Unlock'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{unlock.amount}</p>
                              <Badge
                                variant={unlock.impact === 'high' ? 'destructive' : unlock.impact === 'medium' ? 'default' : 'secondary'}
                                className="mt-1"
                              >
                                {unlock.percentage}% • {unlock.impact} impact
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No upcoming token unlocks</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}