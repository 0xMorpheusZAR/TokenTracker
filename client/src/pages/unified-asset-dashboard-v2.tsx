import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Activity, DollarSign, TrendingUp, Lock, 
  Coins, Users, BarChart3, Droplets, 
  LineChart, PieChart, Calendar, AlertCircle,
  Zap, Globe, Shield, Wallet
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
  ChartOptions,
} from "chart.js";

// Register Chart.js components
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

// Available tokens for analysis
const availableTokens = [
  { id: "hyperliquid", name: "Hyperliquid", symbol: "HYPE" },
  { id: "ethena", name: "Ethena", symbol: "ENA" },
  { id: "manta-network", name: "Manta Network", symbol: "MANTA" },
  { id: "portal", name: "Portal", symbol: "PORTAL" },
  { id: "starknet", name: "Starknet", symbol: "STRK" },
  { id: "aevo", name: "Aevo", symbol: "AEVO" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "uniswap", name: "Uniswap", symbol: "UNI" },
  { id: "aave", name: "Aave", symbol: "AAVE" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB" },
  { id: "optimism", name: "Optimism", symbol: "OP" },
];

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0%";
  return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
}

export default function UnifiedAssetDashboardV2() {
  const [selectedToken, setSelectedToken] = useState("hyperliquid");
  const [, setLocation] = useLocation();

  // Fetch comprehensive token data
  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: [`/api/unified-asset/${selectedToken}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch additional market data
  const { data: marketOverview } = useQuery({
    queryKey: ['/api/defi/market-overview'],
    refetchInterval: 60000,
  });

  // Fetch historical price data for charts
  const { data: priceHistory } = useQuery({
    queryKey: [`/api/coingecko/history/${selectedToken}`],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-pulse text-white text-xl">Loading comprehensive asset data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-900/20 border-red-500/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-6 w-6" />
                <span>Error loading data. Please try again.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Price chart data
  const priceChartData = {
    labels: tokenData.priceHistory?.map(([timestamp]: [number, number]) => 
      new Date(timestamp).toLocaleDateString()
    ).slice(-30) || [],
    datasets: [{
      label: 'Price (USD)',
      data: tokenData.priceHistory?.map(([_, price]: [number, number]) => price).slice(-30) || [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { 
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
    },
  };

  // TVL breakdown chart
  const tvlChartData = {
    labels: ['Main Protocol', 'Derivatives', 'Lending', 'Staking', 'Other'],
    datasets: [{
      data: [45, 25, 15, 10, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)', 
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(156, 163, 175, 0.8)',
      ],
    }],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Unified Asset Analytics
            </h1>
            <p className="text-gray-400">
              Comprehensive DeFi & Market Intelligence Dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="w-[250px] bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.name} ({token.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedToken === "ethena" && (
              <Button
                onClick={() => setLocation("/ethena-dashboard")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                View Protocol Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Token Header Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {tokenData.image && (
                  <img 
                    src={tokenData.image} 
                    alt={tokenData.symbol}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {tokenData.name} ({tokenData.symbol?.toUpperCase()})
                  </h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-3xl font-bold text-white">
                      ${tokenData.currentPrice?.toFixed(4) || '0'}
                    </span>
                    <Badge 
                      variant={tokenData.priceChange24h >= 0 ? "default" : "destructive"}
                      className="text-lg px-3 py-1"
                    >
                      {formatPercentage(tokenData.priceChange24h)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-right">
                <div>
                  <p className="text-gray-400 text-sm">Market Cap</p>
                  <p className="text-white font-semibold">{formatNumber(tokenData.marketCap)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">24h Volume</p>
                  <p className="text-white font-semibold">{formatNumber(tokenData.totalVolume)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full bg-slate-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="defi">DeFi Analytics</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="unlocks">Vesting/Unlocks</TabsTrigger>
            <TabsTrigger value="yields">Yield Farming</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Price Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Price History (30D)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line data={priceChartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Circulating Supply</p>
                        <p className="text-white font-semibold text-lg">
                          {tokenData.circulatingSupply?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <Coins className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">FDV</p>
                        <p className="text-white font-semibold text-lg">
                          {formatNumber(tokenData.fullyDilutedValuation)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">ATH</p>
                        <p className="text-white font-semibold text-lg">
                          ${tokenData.ath?.toFixed(4) || 'N/A'}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">7D Change</p>
                        <p className={`font-semibold text-lg ${
                          tokenData.priceChange7d >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPercentage(tokenData.priceChange7d)}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Market Performance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Market Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">24h Change</p>
                    <p className={`font-semibold ${
                      tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercentage(tokenData.priceChange24h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">7d Change</p>
                    <p className={`font-semibold ${
                      tokenData.priceChange7d >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercentage(tokenData.priceChange7d)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">30d Change</p>
                    <p className={`font-semibold ${
                      tokenData.priceChange30d >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercentage(tokenData.priceChange30d)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Volume/MCap</p>
                    <p className="text-white font-semibold">
                      {((tokenData.totalVolume / tokenData.marketCap) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DeFi Analytics Tab */}
          <TabsContent value="defi" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* TVL Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Total Value Locked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {formatNumber(tokenData.tvl)}
                      </span>
                      {tokenData.tvlChange24h && (
                        <Badge variant={tokenData.tvlChange24h >= 0 ? "default" : "destructive"}>
                          {formatPercentage(tokenData.tvlChange24h)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="h-[200px]">
                      <Doughnut data={tvlChartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: { color: 'rgba(255, 255, 255, 0.7)' }
                          },
                        },
                      }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Protocol Revenue */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Protocol Revenue & Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-sm">24h Fees</p>
                        <p className="text-white font-semibold text-lg">
                          {formatNumber(tokenData.fees24h)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">30d Fees</p>
                        <p className="text-white font-semibold">
                          {formatNumber(tokenData.fees30d)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-sm">24h Revenue</p>
                        <p className="text-white font-semibold text-lg">
                          {formatNumber(tokenData.revenue24h)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">30d Revenue</p>
                        <p className="text-white font-semibold">
                          {formatNumber(tokenData.revenue30d)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">24h Active Users</span>
                      <span className="text-white font-semibold">
                        {tokenData.activeUsers?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    {tokenData.activeUsersChange24h && (
                      <Progress 
                        value={Math.abs(tokenData.activeUsersChange24h)} 
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* P/E Ratio & Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Valuation Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">P/E Ratio</span>
                      <span className="text-white font-semibold">
                        {tokenData.revenue30d ? 
                          (tokenData.marketCap / (tokenData.revenue30d * 12)).toFixed(2) : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">TVL/MCap</span>
                      <span className="text-white font-semibold">
                        {tokenData.tvl && tokenData.marketCap ? 
                          (tokenData.tvl / tokenData.marketCap).toFixed(3) : 
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Liquidity Tab */}
          <TabsContent value="liquidity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Total Liquidity */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Total Liquidity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-white">
                      {formatNumber(tokenData.totalLiquidity)}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Top Liquidity Pools</p>
                      {tokenData.topLiquidityPools?.map((pool: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700">
                          <div>
                            <p className="text-white font-medium">{pool.pool}</p>
                            <p className="text-gray-400 text-sm">{pool.chain}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white">{formatNumber(pool.liquidity)}</p>
                            {pool.apy && (
                              <p className="text-green-400 text-sm">{pool.apy.toFixed(2)}% APY</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liquidity Distribution */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Liquidity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">DEX Liquidity</span>
                      <span className="text-white font-semibold">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">CEX Liquidity</span>
                      <span className="text-white font-semibold">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Bridge Liquidity</span>
                      <span className="text-white font-semibold">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vesting/Unlocks Tab */}
          <TabsContent value="unlocks" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Token Vesting Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokenData.nextUnlock && (
                  <div className="mb-6 p-4 bg-orange-900/20 border border-orange-500/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-400 font-semibold">Next Unlock Event</p>
                        <p className="text-white text-lg">
                          {new Date(tokenData.nextUnlock.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{tokenData.nextUnlock.amount}</p>
                        <Badge variant={tokenData.nextUnlock.impact === 'High' ? 'destructive' : 'default'}>
                          {tokenData.nextUnlock.percentage}% • {tokenData.nextUnlock.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-gray-400 mb-3">Upcoming Unlocks</p>
                  {tokenData.upcomingUnlocks?.map((unlock: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700">
                      <div>
                        <p className="text-white">{new Date(unlock.date).toLocaleDateString()}</p>
                        <p className="text-gray-400 text-sm">{unlock.amount} tokens</p>
                      </div>
                      <Badge variant="outline" className="text-gray-300">
                        {unlock.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yield Farming Tab */}
          <TabsContent value="yields" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Yield Farming Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2 text-sm text-gray-400 pb-2 border-b border-slate-700">
                    <span>Pool</span>
                    <span>Chain</span>
                    <span>TVL</span>
                    <span>Base APY</span>
                    <span>Total APY</span>
                  </div>
                  
                  {/* Example yield opportunities */}
                  <div className="grid grid-cols-5 gap-2 py-2">
                    <span className="text-white">HYPE-USDC</span>
                    <span className="text-gray-300">Arbitrum</span>
                    <span className="text-gray-300">$45.2M</span>
                    <span className="text-green-400">12.5%</span>
                    <span className="text-green-400 font-semibold">28.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* On-Chain Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    On-Chain Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Holder Count</span>
                      <span className="text-white font-semibold">125,432</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Whale Concentration</span>
                      <span className="text-white font-semibold">23.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Exchange Balance</span>
                      <span className="text-white font-semibold">18.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Volatility (30D)</span>
                      <Badge variant="destructive">High</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Liquidity Score</span>
                      <Badge variant="default">Good</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Security Audit</span>
                      <Badge variant="default">Passed</Badge>
                    </div>
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