import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Play, 
  Pause,
  AlertTriangle,
  Timer,
  Target,
  Fuel,
  ArrowUpDown,
  RefreshCcw,
  ChevronLeft
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface MevOpportunity {
  id: number;
  type: string;
  status: string;
  tokenA: string;
  tokenB: string;
  chain: string;
  dexA: string;
  dexB: string;
  estimatedProfit: string;
  gasCost: string;
  netProfit: string;
  confidenceScore: string;
  executionWindow: number;
  priceA: string;
  priceB: string;
  liquidityA?: string;
  liquidityB?: string;
  metadata: string;
  createdAt: string;
}

interface MevStats {
  type: string;
  count: number;
  totalProfit: number;
  avgProfit: number;
  avgConfidence: number;
}

interface GasPrice {
  chain: string;
  standard: string;
  fast: string;
  rapid: string;
  baseFee?: string;
  priorityFee?: string;
  updatedAt: string;
}

const CHAIN_COLORS = {
  ethereum: "#627EEA",
  polygon: "#8247E5",
  arbitrum: "#28A0F0",
  optimism: "#FF0420",
  default: "#666"
};

const OPPORTUNITY_COLORS = {
  arbitrage: "#10B981",
  sandwich: "#F59E0B",
  liquidation: "#EF4444"
};

export default function MEVDashboard() {
  const [isScannerRunning, setIsScannerRunning] = useState(true);
  const [selectedChain, setSelectedChain] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch opportunities
  const { data: opportunities = [], isLoading: loadingOpportunities } = useQuery<MevOpportunity[]>({
    queryKey: ["/api/mev/opportunities"],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch stats
  const { data: stats = [], isLoading: loadingStats } = useQuery<MevStats[]>({
    queryKey: ["/api/mev/stats"],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Fetch gas prices
  const { data: gasPrices = [], isLoading: loadingGas } = useQuery<GasPrice[]>({
    queryKey: ["/api/mev/gas-prices"],
    refetchInterval: autoRefresh ? 15000 : false,
  });

  // Scanner control mutations
  const startScanner = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mev/scanner/start");
      return res.json();
    },
    onSuccess: () => {
      setIsScannerRunning(true);
      queryClient.invalidateQueries({ queryKey: ["/api/mev/opportunities"] });
    }
  });

  const stopScanner = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mev/scanner/stop");
      return res.json();
    },
    onSuccess: () => {
      setIsScannerRunning(false);
    }
  });

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedChain !== "all" && opp.chain !== selectedChain) return false;
    if (selectedType !== "all" && opp.type !== selectedType) return false;
    return true;
  });

  // Calculate total stats
  const totalProfit = stats.reduce((sum, stat) => sum + stat.totalProfit, 0);
  const totalOpportunities = stats.reduce((sum, stat) => sum + stat.count, 0);
  const avgConfidence = stats.length > 0 
    ? stats.reduce((sum, stat) => sum + stat.avgConfidence * stat.count, 0) / totalOpportunities
    : 0;

  // Prepare chart data
  const profitByType = stats.map((stat) => ({
    name: stat.type.charAt(0).toUpperCase() + stat.type.slice(1),
    value: stat.totalProfit,
    count: stat.count,
    avgProfit: stat.avgProfit
  }));

  const recentProfits = filteredOpportunities
    .slice(0, 20)
    .map((opp, index) => ({
      time: new Date(opp.createdAt).toLocaleTimeString(),
      profit: parseFloat(opp.netProfit),
      type: opp.type
    }))
    .reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MEV Bot Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto-refresh: {autoRefresh ? "ON" : "OFF"}
            </Button>
            
            {isScannerRunning ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => stopScanner.mutate()}
                disabled={stopScanner.isPending}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Stop Scanner
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => startScanner.mutate()}
                disabled={startScanner.isPending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="h-4 w-4" />
                Start Scanner
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Net of gas costs</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Opportunities Found</CardTitle>
              <Target className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{totalOpportunities}</div>
              <p className="text-xs text-gray-500 mt-1">Since scanner started</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Confidence</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {(avgConfidence * 100).toFixed(1)}%
              </div>
              <Progress value={avgConfidence * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Scanner Status</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isScannerRunning ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}></div>
                <span className="text-lg font-semibold">
                  {isScannerRunning ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Real-time monitoring</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-700">
            <TabsTrigger value="opportunities">Live Opportunities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="gas">Gas Tracker</TabsTrigger>
          </TabsList>

          {/* Live Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Chains</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="optimism">Optimism</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="arbitrage">Arbitrage</option>
                <option value="sandwich">Sandwich</option>
                <option value="liquidation">Liquidation</option>
              </select>
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              {loadingOpportunities ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Scanning for opportunities...</p>
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                  <CardContent className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-400">No opportunities found with current filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredOpportunities.slice(0, 10).map((opp: MevOpportunity) => {
                  const metadata = JSON.parse(opp.metadata);
                  const confidence = parseFloat(opp.confidenceScore);
                  const priceDiff = ((parseFloat(opp.priceB) - parseFloat(opp.priceA)) / parseFloat(opp.priceA) * 100);
                  
                  return (
                    <Card key={opp.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-emerald-500 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge 
                                className="px-3 py-1"
                                style={{ 
                                  backgroundColor: `${OPPORTUNITY_COLORS[opp.type as keyof typeof OPPORTUNITY_COLORS]}20`,
                                  color: OPPORTUNITY_COLORS[opp.type as keyof typeof OPPORTUNITY_COLORS]
                                }}
                              >
                                {opp.type.toUpperCase()}
                              </Badge>
                              <Badge 
                                variant="outline"
                                style={{ borderColor: CHAIN_COLORS[opp.chain as keyof typeof CHAIN_COLORS] || CHAIN_COLORS.default }}
                              >
                                {opp.chain}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(opp.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-lg">
                              <span className="font-semibold">{opp.tokenA}</span>
                              <ArrowUpDown className="h-5 w-5 text-gray-500" />
                              <span className="font-semibold">{opp.tokenB}</span>
                            </div>
                            
                            <div className="flex gap-6 text-sm text-gray-400">
                              <div>
                                <span className="text-gray-500">DEX A:</span> {opp.dexA}
                                <span className="ml-2 text-white">${parseFloat(opp.priceA).toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">DEX B:</span> {opp.dexB}
                                <span className="ml-2 text-white">${parseFloat(opp.priceB).toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Price Diff:</span>
                                <span className="ml-2 text-emerald-400">{priceDiff.toFixed(2)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <div className="text-2xl font-bold text-emerald-400">
                              ${parseFloat(opp.netProfit).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Gas: ${parseFloat(opp.gasCost).toFixed(2)}
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <Timer className="h-4 w-4 text-yellow-400" />
                              <span className="text-sm">{opp.executionWindow}s window</span>
                            </div>
                            <Progress 
                              value={confidence * 100} 
                              className="h-2 w-24"
                              style={{ 
                                backgroundColor: "#374151",
                              }}
                            />
                            <span className="text-xs text-gray-500">
                              {(confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                        
                        {opp.status === "pending" && (
                          <div className="mt-4 flex justify-end">
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700"
                              disabled
                            >
                              Execute Trade (Coming Soon)
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profit by Type */}
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle>Profit Distribution by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={profitByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {profitByType.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={OPPORTUNITY_COLORS[entry.name.toLowerCase() as keyof typeof OPPORTUNITY_COLORS] || "#666"} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Profits */}
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <CardTitle>Recent Profit Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={recentProfits}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                        labelStyle={{ color: "#9CA3AF" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#10B981" 
                        fill="#10B98130" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Stats by Type */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle>Performance Metrics by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">Count</th>
                        <th className="text-right py-3 px-4">Total Profit</th>
                        <th className="text-right py-3 px-4">Avg Profit</th>
                        <th className="text-right py-3 px-4">Avg Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((stat: MevStats) => (
                        <tr key={stat.type} className="border-b border-gray-800">
                          <td className="py-3 px-4">
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: OPPORTUNITY_COLORS[stat.type as keyof typeof OPPORTUNITY_COLORS],
                                color: OPPORTUNITY_COLORS[stat.type as keyof typeof OPPORTUNITY_COLORS]
                              }}
                            >
                              {stat.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-right py-3 px-4">{stat.count}</td>
                          <td className="text-right py-3 px-4 text-emerald-400">
                            ${stat.totalProfit.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4">
                            ${stat.avgProfit.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {(stat.avgConfidence * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gas Tracker Tab */}
          <TabsContent value="gas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingGas ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
                </div>
              ) : (
                gasPrices.map((gas: GasPrice) => (
                  <Card key={gas.chain} className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{gas.chain.charAt(0).toUpperCase() + gas.chain.slice(1)}</span>
                        <Fuel className="h-4 w-4 text-orange-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Standard</span>
                        <span className="font-mono">{gas.standard} Gwei</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Fast</span>
                        <span className="font-mono text-yellow-400">{gas.fast} Gwei</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Rapid</span>
                        <span className="font-mono text-orange-400">{gas.rapid} Gwei</span>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500">
                          Updated: {new Date(gas.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Gas Price History Chart */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle>Gas Price Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Historical gas price tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}