import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, Activity, ChevronRight } from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface PumpfunRevenue {
  date: string;
  fees: number;
  revenue: number;
  cumulative: number;
}

interface AltcoinDrawdown {
  token: string;
  symbol: string;
  currentPrice: number;
  drawdownPercent: number;
  marketCap: number;
  scenario: 'bearish' | 'bullish' | 'neutral';
}

export default function PumpfunDashboard() {
  const [selectedScenario, setSelectedScenario] = useState<'bearish' | 'bullish' | 'neutral'>('neutral');
  const [trumpImpactData, setTrumpImpactData] = useState<any>(null);

  // Fetch Pump.fun revenue data from DefiLlama
  const { data: pumpfunData, isLoading: loadingPumpfun } = useQuery({
    queryKey: ['/api/defillama/protocol/pump'],
    queryFn: async () => {
      const response = await fetch('/api/defillama/protocol/pump');
      if (!response.ok) throw new Error('Failed to fetch Pump.fun data');
      return response.json();
    },
  });

  // Fetch current altcoin data
  const { data: altcoinData, isLoading: loadingAltcoins } = useQuery({
    queryKey: ['/api/coingecko/detailed'],
  });

  // Chart configuration
  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  // Calculate altcoin drawdown scenarios
  const calculateDrawdowns = () => {
    if (!altcoinData) return [];

    const scenarios = {
      bearish: { min: 0.05, max: 0.15 }, // 5-15% drawdown
      neutral: { min: 0.02, max: 0.08 }, // 2-8% drawdown
      bullish: { min: 0, max: 0.03 } // 0-3% drawdown
    };

    return altcoinData.map((token: any) => {
      const scenario = scenarios[selectedScenario];
      const drawdownPercent = Math.random() * (scenario.max - scenario.min) + scenario.min;
      
      return {
        token: token.name,
        symbol: token.symbol.toUpperCase(),
        currentPrice: token.current_price,
        drawdownPercent: drawdownPercent * 100,
        marketCap: token.market_cap,
        scenario: selectedScenario,
        projectedPrice: token.current_price * (1 - drawdownPercent),
        impactValue: token.market_cap * drawdownPercent
      };
    }).sort((a: any, b: any) => b.drawdownPercent - a.drawdownPercent);
  };

  const drawdowns = calculateDrawdowns();

  // $TRUMP impact data
  const trumpImpact = {
    totalLiquidityDrained: 7500000000, // $7.5B
    ethDrawdown: 8.1, // 8.1%
    altcoinAvgDrawdown: 12.5, // 12.5% average
    memecoinsDrawdown: 75, // 75% average for memecoins
    duration: 48, // hours
    peakMarketCap: 70000000000 // $70B
  };

  // Pump.fun metrics
  const pumpfunMetrics = {
    totalRevenue: 700000000, // $700M total
    peakDailyRevenue: 14000000, // $14M peak
    currentDailyRevenue: 1000000, // $1M current
    tgeValuation: 4000000000, // $4B FDV
    tokenSupply: 1000000000000, // 1T total
    publicSalePercent: 15, // 15%
    salePrice: 0.004, // $0.004 per token
    expectedRaise: 600000000 // $600M expected
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Pump.fun TGE Analysis Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Analyzing $PUMP token launch scenarios and potential market impact
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 border-purple-500 text-purple-400">
            TGE: July 12, 2025
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(pumpfunMetrics.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Since launch</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">TGE Valuation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(pumpfunMetrics.tgeValuation)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Fully diluted</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Expected Raise</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(pumpfunMetrics.expectedRaise)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Public sale target</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Revenue Multiple</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-400">
                {(pumpfunMetrics.tgeValuation / pumpfunMetrics.totalRevenue).toFixed(1)}x
              </p>
              <p className="text-xs text-gray-500 mt-1">Valuation/Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="trump-impact" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="trump-impact">$TRUMP Impact Analysis</TabsTrigger>
            <TabsTrigger value="drawdown-scenarios">Drawdown Scenarios</TabsTrigger>
            <TabsTrigger value="pump-metrics">Pump.fun Metrics</TabsTrigger>
            <TabsTrigger value="competition">Bonk.fun Competition</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="valuation-debate">Valuation Analysis</TabsTrigger>
          </TabsList>

          {/* $TRUMP Impact Analysis */}
          <TabsContent value="trump-impact" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  The $TRUMP Liquidity Blackhole Event
                </CardTitle>
                <CardDescription>
                  Analysis of the January 17, 2025 market impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/50">
                    <p className="text-sm text-gray-400 mb-1">Liquidity Drained</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency(trumpImpact.totalLiquidityDrained)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">In 48 hours</p>
                  </div>
                  <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800/50">
                    <p className="text-sm text-gray-400 mb-1">ETH Drawdown</p>
                    <p className="text-2xl font-bold text-orange-400">
                      -{trumpImpact.ethDrawdown}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">$3,494 → $3,130</p>
                  </div>
                  <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/50">
                    <p className="text-sm text-gray-400 mb-1">Memecoin Collapse</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      -{trumpImpact.memecoinsDrawdown}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Average decline</p>
                  </div>
                </div>

                {/* Impact Timeline */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Impact Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Hour 0-6: Initial Frenzy</p>
                        <p className="text-sm text-gray-400">
                          $TRUMP launches, immediate sell-off in altcoins begins. SOL surges to ATH.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Hour 6-24: Peak Rotation</p>
                        <p className="text-sm text-gray-400">
                          Maximum liquidity drain, ETH drops 5%, smaller alts down 15-20%.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Hour 24-48: Continued Pressure</p>
                        <p className="text-sm text-gray-400">
                          $TRUMP hits $70B FDV, total altcoin market cap down $7.5B.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drawdown Scenarios */}
          <TabsContent value="drawdown-scenarios" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Altcoin Drawdown Simulation</CardTitle>
                <CardDescription>
                  Select a scenario to see potential impact on altcoins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button
                    variant={selectedScenario === 'bearish' ? 'destructive' : 'outline'}
                    onClick={() => setSelectedScenario('bearish')}
                    className="flex items-center gap-2"
                  >
                    <TrendingDown className="h-4 w-4" />
                    Bearish (5-15%)
                  </Button>
                  <Button
                    variant={selectedScenario === 'neutral' ? 'secondary' : 'outline'}
                    onClick={() => setSelectedScenario('neutral')}
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Neutral (2-8%)
                  </Button>
                  <Button
                    variant={selectedScenario === 'bullish' ? 'default' : 'outline'}
                    onClick={() => setSelectedScenario('bullish')}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Bullish (0-3%)
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {drawdowns.map((token, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-500">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{token.symbol}</p>
                            <p className="text-sm text-gray-400">{token.token}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            selectedScenario === 'bearish' ? 'text-red-400' :
                            selectedScenario === 'neutral' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            -{token.drawdownPercent.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-400">
                            ${formatNumber(token.impactValue)} impact
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Total Market Impact</p>
                  <p className="text-2xl font-bold">
                    ${formatNumber(
                      drawdowns.reduce((sum, token) => sum + token.impactValue, 0)
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pump.fun Metrics */}
          <TabsContent value="pump-metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>
                    Historical revenue performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line
                      data={{
                        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                        datasets: [{
                          label: 'Monthly Revenue',
                          data: [1.5, 8.2, 15.3, 25.7, 42.1, 38.9, 45.2, 67.3, 89.4, 125.7, 137.2],
                          borderColor: 'rgb(168, 85, 247)',
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          tension: 0.4
                        }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle>Token Distribution</CardTitle>
                  <CardDescription>
                    $PUMP token allocation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Doughnut
                      data={{
                        labels: ['Public Sale', 'Team', 'Treasury', 'Ecosystem', 'Advisors'],
                        datasets: [{
                          data: [15, 20, 30, 30, 5],
                          backgroundColor: [
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(251, 146, 60, 0.8)'
                          ],
                          borderWidth: 0
                        }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Tokens Created</p>
                    <p className="text-xl font-bold">11M+</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Combined Market Cap</p>
                    <p className="text-xl font-bold">$4.5B+</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Peak Daily Revenue</p>
                    <p className="text-xl font-bold">$14M</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current Daily Revenue</p>
                    <p className="text-xl font-bold">$1M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bearish Case */}
              <Card className="bg-red-900/20 border-red-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <TrendingDown className="h-5 w-5" />
                    Bearish Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Market Impact</p>
                    <Progress value={75} className="h-2 bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">High liquidity drain risk</p>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span>$600M+ rotated from existing altcoins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span>5-15% average altcoin drawdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span>Memecoin sector drops 20-30%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span>$PUMP dumps 50%+ post-launch</span>
                    </li>
                  </ul>

                  <div className="p-3 bg-red-900/30 rounded-lg">
                    <p className="text-xs text-red-300">
                      Risk: Another liquidity vacuum event similar to $TRUMP
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bullish Case */}
              <Card className="bg-green-900/20 border-green-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    Bullish Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Value Recognition</p>
                    <Progress value={85} className="h-2 bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Strong fundamentals support</p>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span>Fresh capital enters from sidelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span>0-3% minimal altcoin impact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span>Revenue sharing attracts investors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span>$PUMP appreciates 2-3x on fundamentals</span>
                    </li>
                  </ul>

                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <p className="text-xs text-green-300">
                      Opportunity: Undervalued at 6x revenue multiple
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Factors */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Key Determining Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-purple-400 mb-2" />
                    <h4 className="font-semibold mb-1">Market Liquidity</h4>
                    <p className="text-sm text-gray-400">
                      Current sidelined capital vs. rotation from existing positions
                    </p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-400 mb-2" />
                    <h4 className="font-semibold mb-1">Revenue Sustainability</h4>
                    <p className="text-sm text-gray-400">
                      Pump.fun's ability to maintain or grow $1M+ daily revenue
                    </p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-yellow-400 mb-2" />
                    <h4 className="font-semibold mb-1">Market Sentiment</h4>
                    <p className="text-sm text-gray-400">
                      Overall crypto market conditions and risk appetite
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competition Analysis */}
          <TabsContent value="competition" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  The Bonk.fun Disruption
                </CardTitle>
                <CardDescription>
                  How a new competitor collapsed Pump.fun's dominance in days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Market Share Collapse */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/50">
                    <p className="text-sm text-gray-400 mb-1">Previous Market Share</p>
                    <p className="text-2xl font-bold text-red-400">90-100%</p>
                    <p className="text-xs text-gray-500 mt-1">Near monopoly</p>
                  </div>
                  <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800/50">
                    <p className="text-sm text-gray-400 mb-1">Current Market Share</p>
                    <p className="text-2xl font-bold text-orange-400">20-35%</p>
                    <p className="text-xs text-gray-500 mt-1">Lost in 8 days</p>
                  </div>
                  <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/50">
                    <p className="text-sm text-gray-400 mb-1">Bonk.fun Market Share</p>
                    <p className="text-2xl font-bold text-yellow-400">55%+</p>
                    <p className="text-xs text-gray-500 mt-1">By volume</p>
                  </div>
                </div>

                {/* Competition Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Competition Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm">Daily Token Launches</span>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="text-orange-400">Bonk.fun: 21,000</span> vs 
                          <span className="text-gray-400 ml-2">Pump.fun: 9,000</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm">Graduated Tokens Ratio</span>
                      <div className="text-right">
                        <p className="text-sm text-orange-400">Bonk.fun leads 3:1</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-sm">Fee Model</span>
                      <div className="text-right">
                        <p className="text-sm text-green-400">58% revenue sharing</p>
                        <p className="text-xs text-gray-500">vs Pump.fun's extractive model</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BONK Token Performance */}
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">BONK Token Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Market Cap</p>
                        <p className="text-lg font-bold text-green-400">$1.8B</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">7-Day Performance</p>
                        <p className="text-lg font-bold text-green-400">+50%</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-900/20 rounded-lg">
                      <p className="text-xs text-green-300">
                        BONK benefits from fee buybacks and burns, creating sustainable value
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pump.fun's Response */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pump.fun's Counter-Strategy</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span>Expanding to Ethereum (EVM) chains</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span>New features: Subscription model, social functions, order books</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span>$PUMP token launch to regain momentum</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Valuation Debate */}
          <TabsContent value="valuation-debate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bull Case */}
              <Card className="bg-green-900/20 border-green-800/50">
                <CardHeader>
                  <CardTitle className="text-green-400">Bull Case for $PUMP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Revenue Foundation</p>
                      <p className="text-xs text-gray-400">$700M+ total revenue generated</p>
                      <p className="text-xs text-gray-400">Peak daily: $14M (Jan 2025)</p>
                    </div>
                    
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Valuation Models</p>
                      <p className="text-xs text-gray-400">Messari fair value: $7B FDV</p>
                      <p className="text-xs text-gray-400">OTC trading: $7-8B implied</p>
                      <p className="text-xs text-gray-400">Trading desk projections: Up to $10B</p>
                    </div>

                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Platform Metrics</p>
                      <p className="text-xs text-gray-400">15M+ tokens minted</p>
                      <p className="text-xs text-gray-400">$4.5B+ combined market cap</p>
                      <p className="text-xs text-gray-400">Millions of active wallets</p>
                    </div>
                  </div>

                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <p className="text-sm font-semibold text-green-300 mb-1">Bull Thesis</p>
                    <p className="text-xs text-green-200">
                      $4B FDV = 6x revenue multiple (cheap for crypto)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bear Case */}
              <Card className="bg-red-900/20 border-red-800/50">
                <CardHeader>
                  <CardTitle className="text-red-400">Bear Case for $PUMP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Competition Risk</p>
                      <p className="text-xs text-gray-400">Lost 70% market share to Bonk.fun</p>
                      <p className="text-xs text-gray-400">Revenue declining: $14M → $1M daily</p>
                    </div>
                    
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Valuation Concerns</p>
                      <p className="text-xs text-gray-400">$4B starting FDV limits upside</p>
                      <p className="text-xs text-gray-400">BONK at $1.8B offers better risk/reward</p>
                      <p className="text-xs text-gray-400">High bot activity inflates metrics</p>
                    </div>

                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Market Risks</p>
                      <p className="text-xs text-gray-400">Memecoin frenzy cooling</p>
                      <p className="text-xs text-gray-400">No clear value accrual mechanism</p>
                      <p className="text-xs text-gray-400">History of high-FDV dumps</p>
                    </div>
                  </div>

                  <div className="p-3 bg-red-900/30 rounded-lg">
                    <p className="text-sm font-semibold text-red-300 mb-1">Bear Thesis</p>
                    <p className="text-xs text-red-200">
                      "Asymmetric bet skewed to the downside"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Community Sentiment */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Community Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium">Excitement Level</p>
                      <p className="text-sm text-gray-400">Most anticipated TGE in a long time</p>
                    </div>
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      High FOMO
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium">Skepticism</p>
                      <p className="text-sm text-gray-400">"Depressing" hype over fundamentals</p>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-400">
                      Mixed
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium">Airdrop Speculation</p>
                      <p className="text-sm text-gray-400">15M wallets hoping for rewards</p>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      Unconfirmed
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
                  <p className="text-sm font-semibold text-purple-300 mb-2">Market Signal</p>
                  <p className="text-xs text-purple-200">
                    $PUMP performance will indicate broader market appetite for high-FDV launches and memecoin infrastructure plays
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}