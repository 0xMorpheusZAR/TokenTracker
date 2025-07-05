import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Wallet, Users, Lock, Coins, BarChart3, Activity, Info } from "lucide-react";
import { useLocation } from "wouter";
import { Line, Bar } from "react-chartjs-2";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export function EthenaDashboard() {
  const [, setLocation] = useLocation();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  // Fetch Ethena protocol data from DefiLlama
  const { data: ethenaData, isLoading: isLoadingProtocol } = useQuery({
    queryKey: ["/api/defillama/protocol/ethena"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch ENA token price from CoinGecko
  const { data: enaPrice, isLoading: isLoadingPrice } = useQuery({
    queryKey: ["/api/coingecko/ethena-price"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch historical price data
  const { data: priceHistory } = useQuery({
    queryKey: ["/api/coingecko/history/ethena"],
  });

  const isLoading = isLoadingProtocol || isLoadingPrice;

  // Calculate TVL chart data
  const tvlChartData = {
    labels: ethenaData?.protocol?.tvl?.[0]?.data?.map((d: any) => 
      new Date(d.date * 1000).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: "Total Value Locked",
        data: ethenaData?.protocol?.tvl?.[0]?.data?.map((d: any) => d.totalLiquidityUSD) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Calculate token allocation data
  const tokenAllocationData = ethenaData?.tvlBreakdown?.tokens || {};
  const tokenChartData = {
    labels: Object.keys(tokenAllocationData),
    datasets: [
      {
        label: "Token Values (USD)",
        data: Object.values(tokenAllocationData).map((v: any) => v.totalUSD || 0),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
      },
    ],
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}b`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}m`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}k`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/unified-asset-dashboard-v2")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">ENA</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Ethena Protocol Dashboard</h1>
                <p className="text-purple-200">Comprehensive DeFi Protocol Analytics</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedTimeframe === "24h" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe("24h")}
              className="border-purple-700"
            >
              24H
            </Button>
            <Button
              variant={selectedTimeframe === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe("7d")}
              className="border-purple-700"
            >
              7D
            </Button>
            <Button
              variant={selectedTimeframe === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe("30d")}
              className="border-purple-700"
            >
              30D
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* TVL Card */}
              <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Total Value Locked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(ethenaData?.metrics?.tvl || 0)}
                  </div>
                  <div className="text-xs text-purple-300 mt-1">
                    {ethenaData?.protocol?.change_1d !== undefined && (
                      <span className={ethenaData.protocol.change_1d >= 0 ? "text-green-400" : "text-red-400"}>
                        {ethenaData.protocol.change_1d >= 0 ? "+" : ""}{ethenaData.protocol.change_1d.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fees Card */}
              <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Fees (Annualized)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(ethenaData?.metrics?.feesAnnualized || 0)}
                  </div>
                  <div className="text-xs text-purple-300 mt-1">
                    24h: {formatNumber(ethenaData?.metrics?.fees24h || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Card */}
              <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Revenue (Annualized)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(ethenaData?.metrics?.revenueAnnualized || 0)}
                  </div>
                  <div className="text-xs text-purple-300 mt-1">
                    24h: {formatNumber(ethenaData?.metrics?.revenue24h || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* Market Cap Card */}
              <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(enaPrice?.marketCap || 0)}
                  </div>
                  <div className="text-xs text-purple-300 mt-1">
                    FDV: {formatNumber(enaPrice?.fdv || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* ENA Price */}
              <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200">$ENA Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-white">
                    ${enaPrice?.price?.toFixed(4) || "0.0000"}
                  </div>
                  <div className={`text-sm mt-1 ${(enaPrice?.priceChange24h || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {(enaPrice?.priceChange24h || 0) >= 0 ? "+" : ""}{enaPrice?.priceChange24h?.toFixed(2) || "0.00"}%
                  </div>
                </CardContent>
              </Card>

              {/* Volume */}
              <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200">$ENA Volume 24h</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-white">
                    {formatNumber(enaPrice?.volume24h || 0)}
                  </div>
                </CardContent>
              </Card>

              {/* Liquidity */}
              <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-200">$ENA Liquidity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-white">
                    {formatNumber(ethenaData?.protocol?.liquidity || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-slate-900/50 border border-purple-700/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tvl">TVL Analysis</TabsTrigger>
                <TabsTrigger value="yields">Yield Farming</TabsTrigger>
                <TabsTrigger value="unlocks">Token Unlocks</TabsTrigger>
                <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* TVL Chart */}
                  <Card className="bg-slate-900/50 border-purple-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Total Value Locked</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {tvlChartData.labels.length > 0 && (
                          <Line
                            data={tvlChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                              },
                              scales: {
                                y: {
                                  ticks: {
                                    callback: (value) => formatNumber(Number(value)),
                                    color: "rgba(255, 255, 255, 0.7)",
                                  },
                                  grid: { color: "rgba(255, 255, 255, 0.1)" },
                                },
                                x: {
                                  ticks: { color: "rgba(255, 255, 255, 0.7)" },
                                  grid: { display: false },
                                },
                              },
                            }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Token Allocation */}
                  <Card className="bg-slate-900/50 border-purple-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Token Values (USD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {tokenChartData.labels.length > 0 && (
                          <Bar
                            data={tokenChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                              },
                              scales: {
                                y: {
                                  ticks: {
                                    callback: (value) => formatNumber(Number(value)),
                                    color: "rgba(255, 255, 255, 0.7)",
                                  },
                                  grid: { color: "rgba(255, 255, 255, 0.1)" },
                                },
                                x: {
                                  ticks: { color: "rgba(255, 255, 255, 0.7)" },
                                  grid: { display: false },
                                },
                              },
                            }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Protocol Info */}
                <Card className="bg-slate-900/50 border-purple-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Protocol Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-purple-200 text-sm">Category</p>
                        <p className="text-white font-medium">
                          {ethenaData?.protocol?.category || "CDP"}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">Chains</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ethenaData?.protocol?.chains?.map((chain: string) => (
                            <Badge key={chain} variant="secondary" className="text-xs">
                              {chain}
                            </Badge>
                          )) || <Badge variant="secondary">Ethereum</Badge>}
                        </div>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">Rank</p>
                        <p className="text-white font-medium">
                          #{ethenaData?.protocol?.rank || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TVL Analysis Tab */}
              <TabsContent value="tvl" className="space-y-6">
                <Card className="bg-slate-900/50 border-purple-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">TVL Breakdown by Token</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(tokenAllocationData).map(([token, data]: [string, any]) => (
                        <div key={token} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{token}</span>
                            <span className="text-purple-200">
                              {formatNumber(data.totalUSD || 0)}
                            </span>
                          </div>
                          <Progress
                            value={(data.totalUSD / ethenaData?.metrics?.tvl) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Yield Farming Tab */}
              <TabsContent value="yields" className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {ethenaData?.yields?.length > 0 ? (
                    ethenaData.yields.map((pool: any, index: number) => (
                      <Card key={index} className="bg-slate-900/50 border-purple-700/50">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-white text-lg">{pool.symbol}</CardTitle>
                            <Badge className="bg-green-500/20 text-green-400">
                              APY: {pool.apy?.toFixed(2)}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-purple-200 text-sm">TVL</p>
                              <p className="text-white font-medium">
                                {formatNumber(pool.tvlUsd || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-purple-200 text-sm">Base APY</p>
                              <p className="text-white font-medium">
                                {pool.apyBase?.toFixed(2) || "0.00"}%
                              </p>
                            </div>
                            <div>
                              <p className="text-purple-200 text-sm">Reward APY</p>
                              <p className="text-white font-medium">
                                {pool.apyReward?.toFixed(2) || "0.00"}%
                              </p>
                            </div>
                            <div>
                              <p className="text-purple-200 text-sm">Chain</p>
                              <p className="text-white font-medium">{pool.chain}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-slate-900/50 border-purple-700/50">
                      <CardContent className="text-center py-8">
                        <p className="text-purple-200">No yield farming opportunities found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Token Unlocks Tab */}
              <TabsContent value="unlocks" className="space-y-6">
                <Card className="bg-slate-900/50 border-purple-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Token Unlock Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ethenaData?.unlocks?.length > 0 ? (
                      <div className="space-y-4">
                        {ethenaData.unlocks.map((unlock: any, index: number) => (
                          <div key={index} className="border-b border-purple-700/30 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white font-medium">
                                  {new Date(unlock.date).toLocaleDateString()}
                                </p>
                                <p className="text-purple-200 text-sm">{unlock.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-medium">
                                  {formatNumber(unlock.amount || 0)}
                                </p>
                                <p className="text-purple-200 text-sm">
                                  {unlock.percentage?.toFixed(2)}% of supply
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-purple-200 text-center py-4">
                        No upcoming token unlocks
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stablecoins Tab */}
              <TabsContent value="stablecoins" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* USDe Card */}
                  <Card className="bg-slate-900/50 border-purple-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Ethena USDe
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-purple-200">Market Cap</span>
                          <span className="text-white font-medium">
                            {formatNumber(ethenaData?.tvlBreakdown?.tokens?.USDe?.totalUSD || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">Supply</span>
                          <span className="text-white font-medium">
                            {(ethenaData?.tvlBreakdown?.tokens?.USDe?.total || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* USDtb Card */}
                  <Card className="bg-slate-900/50 border-purple-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Ethena USDtb
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-purple-200">Market Cap</span>
                          <span className="text-white font-medium">
                            {formatNumber(ethenaData?.tvlBreakdown?.tokens?.USDtb?.totalUSD || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200">Supply</span>
                          <span className="text-white font-medium">
                            {(ethenaData?.tvlBreakdown?.tokens?.USDtb?.total || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}