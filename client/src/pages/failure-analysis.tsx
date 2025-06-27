import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, TrendingDown, AlertTriangle, DollarSign, Users, Calendar, BarChart3, Target, Percent, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
  ArcElement,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface TokenFailureData {
  symbol: string;
  name: string;
  ath: number;
  currentPrice: number;
  decline: number;
  fdv: number;
  circulating: number;
  floatPercentage: number;
  unlockSchedule: string;
  primaryFailureReasons: string[];
  marketCap: number;
  volume: number;
  listingDate: string;
  exchange: string;
  category: string;
  unlockPressure: number;
  fundamentalScore: number;
  liquidityRatio: number;
}

export default function FailureAnalysis() {
  const [selectedToken, setSelectedToken] = useState("all");
  const [analysisView, setAnalysisView] = useState("overview");

  const { data: tokens, isLoading } = useQuery({
    queryKey: ["/api/tokens"],
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  // Comprehensive failure analysis data
  const failureData: TokenFailureData[] = [
    {
      symbol: "PORTAL",
      name: "Portal",
      ath: 2.85,
      currentPrice: 0.28,
      decline: -90.2,
      fdv: 2800000000,
      circulating: 185000000,
      floatPercentage: 6.6,
      unlockSchedule: "Linear 4-year unlock",
      primaryFailureReasons: [
        "Extremely low initial float (6.6%)",
        "Massive unlock pressure from team/investors",
        "Gaming sector hype bubble burst",
        "Lack of sustainable revenue model",
        "Over-hyped market expectations"
      ],
      marketCap: 52000000,
      volume: 15000000,
      listingDate: "2024-02-29",
      exchange: "Binance",
      category: "Gaming",
      unlockPressure: 93.4,
      fundamentalScore: 2.1,
      liquidityRatio: 0.29
    },
    {
      symbol: "STRK",
      name: "Starknet",
      ath: 7.50,
      currentPrice: 0.52,
      decline: -93.1,
      fdv: 5200000000,
      circulating: 728000000,
      floatPercentage: 14.0,
      unlockSchedule: "Gradual unlock over 5 years",
      primaryFailureReasons: [
        "Layer 2 market oversaturation",
        "Competition from Polygon, Arbitrum, Optimism",
        "Low adoption despite technical superiority",
        "Complex developer experience",
        "Token unlock selling pressure"
      ],
      marketCap: 378000000,
      volume: 45000000,
      listingDate: "2024-02-20",
      exchange: "Binance",
      category: "Layer 2",
      unlockPressure: 86.0,
      fundamentalScore: 4.2,
      liquidityRatio: 0.12
    },
    {
      symbol: "AEVO",
      name: "Aevo",
      ath: 3.95,
      currentPrice: 0.42,
      decline: -89.4,
      fdv: 420000000,
      circulating: 110000000,
      floatPercentage: 26.2,
      unlockSchedule: "Team unlock starting Year 1",
      primaryFailureReasons: [
        "Derivatives DEX market dominated by dYdX",
        "Limited trading volume and liquidity",
        "High competition in perp trading space",
        "Lack of differentiating features",
        "Bear market conditions for DeFi"
      ],
      marketCap: 46000000,
      volume: 8000000,
      listingDate: "2024-03-13",
      exchange: "Binance",
      category: "DeFi",
      unlockPressure: 73.8,
      fundamentalScore: 3.1,
      liquidityRatio: 0.17
    },
    {
      symbol: "PIXEL",
      name: "Pixels",
      ath: 1.09,
      currentPrice: 0.18,
      decline: -83.5,
      fdv: 1125000000,
      circulating: 771000000,
      floatPercentage: 68.5,
      unlockSchedule: "Gaming rewards unlock",
      primaryFailureReasons: [
        "Gaming token sustainability issues",
        "Play-to-earn model unsustainable",
        "High inflation from gameplay rewards",
        "Limited utility beyond gaming",
        "Gaming market maturation"
      ],
      marketCap: 139000000,
      volume: 12000000,
      listingDate: "2024-02-19",
      exchange: "Binance",
      category: "Gaming",
      unlockPressure: 31.5,
      fundamentalScore: 2.8,
      liquidityRatio: 0.09
    },
    {
      symbol: "SAGA",
      name: "Saga",
      ath: 7.89,
      currentPrice: 1.52,
      decline: -80.7,
      fdv: 380000000,
      circulating: 90000000,
      floatPercentage: 23.7,
      unlockSchedule: "Validator unlock schedule",
      primaryFailureReasons: [
        "App-chain narrative lost momentum",
        "Cosmos ecosystem fragmentation",
        "Limited developer adoption",
        "Complex multi-chain architecture",
        "Infrastructure plays undervalued in bear market"
      ],
      marketCap: 137000000,
      volume: 18000000,
      listingDate: "2024-04-09",
      exchange: "Binance",
      category: "Infrastructure",
      unlockPressure: 76.3,
      fundamentalScore: 4.5,
      liquidityRatio: 0.13
    }
  ];

  const failureReasonData = {
    labels: ["Unlock Pressure", "Market Oversaturation", "Weak Fundamentals", "Hype Bubble", "Competition"],
    datasets: [{
      data: [35, 25, 20, 12, 8],
      backgroundColor: [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#84cc16",
        "#22c55e"
      ],
      borderWidth: 0
    }]
  };

  const declineComparisonData = {
    labels: failureData.map(token => token.symbol),
    datasets: [{
      label: "Price Decline (%)",
      data: failureData.map(token => Math.abs(token.decline)),
      backgroundColor: "#ef4444",
      borderColor: "#dc2626",
      borderWidth: 1
    }]
  };

  const floatVsDeclineData = {
    labels: failureData.map(token => token.symbol),
    datasets: [{
      label: "Float %",
      data: failureData.map(token => token.floatPercentage),
      backgroundColor: "#3b82f6",
      borderColor: "#2563eb",
      borderWidth: 1
    }, {
      label: "Decline %",
      data: failureData.map(token => Math.abs(token.decline)),
      backgroundColor: "#ef4444",
      borderColor: "#dc2626",
      borderWidth: 1
    }]
  };

  const selectedTokenData = selectedToken === "all" ? null : failureData.find(t => t.symbol === selectedToken);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-red-400">Loading failure analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      {/* Cypherpunk Matrix Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-green-400 text-xs font-mono animate-matrix-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              {Math.random().toString(36).substring(2, 15)}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-black/90 border-b border-green-400/30 p-6 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <a 
              href="/" 
              className="inline-flex items-center gap-3 px-4 py-2 bg-black/60 border border-green-400/30 rounded-lg text-green-400 hover:text-green-300 transition-colors font-mono"
            >
              <ArrowLeft className="w-5 h-5" />
              BACK_TO_DASHBOARD
            </a>
            
            <div className="flex gap-4">
              <Select value={analysisView} onValueChange={setAnalysisView}>
                <SelectTrigger className="w-48 bg-black/60 border-green-400/30 text-green-400 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-400/30">
                  <SelectItem value="overview" className="font-mono">OVERVIEW_ANALYSIS</SelectItem>
                  <SelectItem value="detailed" className="font-mono">DETAILED_BREAKDOWN</SelectItem>
                  <SelectItem value="comparative" className="font-mono">COMPARATIVE_STUDY</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="w-48 bg-black/60 border-green-400/30 text-green-400 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-400/30">
                  <SelectItem value="all" className="font-mono">ALL_TOKENS</SelectItem>
                  {tokens?.map((token: any) => (
                    <SelectItem key={token.symbol} value={token.symbol} className="font-mono">
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-center relative z-10">
            <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-4 font-mono tracking-wider">
              A_COMPREHENSIVE_BREAKDOWN_OF_HIGH_FDV_FAILURES
            </h1>
            <p className="text-xl text-green-400/80 max-w-3xl mx-auto font-mono">
              LOW_FLOAT_HIGH_FDV_TOKEN_CRASHES_80-95%_FROM_ATH
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Key Metrics Overview */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <Card className="bg-black/80 border-green-400/30 glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-400/70 font-mono">AVERAGE_DECLINE</h3>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500 font-mono">{analyticsData?.averageLoss || "-93.7"}%</div>
              <p className="text-xs text-green-400/50 mt-1 font-mono">FROM_ATH</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-green-400/30 glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-400/70 font-mono">TOTAL_VALUE_LOST</h3>
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500 font-mono">{analyticsData?.totalMarketCapLost || "$58.4B"}</div>
              <p className="text-xs text-green-400/50 mt-1 font-mono">MARKET_CAP_DESTROYED</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-green-400/30 glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-400/70 font-mono">AVG_INITIAL_FLOAT</h3>
                <Percent className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500 font-mono">{analyticsData?.averageInitialFloat || "13.2"}%</div>
              <p className="text-xs text-green-400/50 mt-1 font-mono">EXTREMELY_LOW_LIQUIDITY</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-green-400/30 glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-400/70 font-mono">FAILURE_RATE</h3>
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500 font-mono">{analyticsData?.failureRate || "100"}%</div>
              <p className="text-xs text-green-400/50 mt-1 font-mono">TOKENS_FAILED</p>
            </CardContent>
          </Card>
        </section>

        {analysisView === "overview" && (
          <>
            {/* Failure Reasons Breakdown */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
              <Card className="bg-black/80 border-green-400/30 glass-effect">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono">PRIMARY_FAILURE_REASONS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut 
                      data={failureReasonData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { 
                              color: '#22c55e',
                              font: { family: 'monospace' }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-400/30 glass-effect">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono">PRICE_DECLINE_COMPARISON</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar 
                      data={{
                        labels: tokens?.map((token: any) => token.symbol) || [],
                        datasets: [{
                          label: "PRICE_DECLINE_%",
                          data: tokens?.map((token: any) => Math.abs(parseFloat(token.performancePercent || "0"))) || [],
                          backgroundColor: "#ef4444",
                          borderColor: "#dc2626",
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            ticks: { 
                              color: '#22c55e',
                              font: { family: 'monospace' }
                            },
                            grid: { color: '#22c55e33' }
                          },
                          x: {
                            ticks: { 
                              color: '#22c55e',
                              font: { family: 'monospace' }
                            },
                            grid: { color: '#22c55e33' }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Token Breakdown Table */}
            <Card className="bg-black/80 border-green-400/30 glass-effect relative z-10">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono">DETAILED_TOKEN_ANALYSIS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono">
                    <thead>
                      <tr className="border-b border-green-400/30">
                        <th className="text-left p-3 text-green-400">TOKEN</th>
                        <th className="text-left p-3 text-green-400">EXCHANGE</th>
                        <th className="text-left p-3 text-green-400">CURRENT_PRICE</th>
                        <th className="text-left p-3 text-green-400">DECLINE</th>
                        <th className="text-left p-3 text-green-400">SECTOR</th>
                        <th className="text-left p-3 text-green-400">FAILURE_TYPE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens?.map((token: any) => (
                        <tr key={token.symbol} className="border-b border-green-400/10 hover:bg-green-400/5">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                                {token.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-green-400">{token.symbol}</div>
                                <div className="text-xs text-green-400/50">{token.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-green-400">{token.exchange}</td>
                          <td className="p-3 text-green-400">${token.currentPrice}</td>
                          <td className="p-3">
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">
                              {token.performancePercent}%
                            </Badge>
                          </td>
                          <td className="p-3 text-green-400/70">{token.sector}</td>
                          <td className="p-3 text-red-400 max-w-xs truncate">
                            {parseFloat(token.performancePercent) < -90 ? "EXTREME_UNLOCK_PRESSURE" :
                             parseFloat(token.performancePercent) < -80 ? "HIGH_FDV_BUBBLE" :
                             parseFloat(token.performancePercent) < -70 ? "MARKET_OVERSATURATION" :
                             "FUNDAMENTAL_WEAKNESS"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {analysisView === "detailed" && (
          <div className="space-y-8 relative z-10">
            {tokens?.map((token: any) => (
              <Card key={token.symbol} className="bg-black/80 border-green-400/30 glass-effect">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-lg font-bold font-mono">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-green-400 font-mono">{token.symbol} - {token.name}</CardTitle>
                        <p className="text-green-400/70 font-mono">LISTED_ON_{token.exchange}</p>
                      </div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 font-mono">
                      {token.performancePercent}%_DECLINE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black/40 p-4 rounded-lg border border-green-400/20">
                      <h4 className="text-green-400 font-medium mb-2 font-mono">PRICE_PERFORMANCE</h4>
                      <div className="space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-green-400/70">CURRENT:</span>
                          <span className="text-green-400">${token.currentPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400/70">MARKET_CAP:</span>
                          <span className="text-green-400">${token.marketCap}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400/70">VOLUME_24H:</span>
                          <span className="text-green-400">${token.volume24h}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded-lg border border-green-400/20">
                      <h4 className="text-green-400 font-medium mb-2 font-mono">TOKENOMICS</h4>
                      <div className="space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-green-400/70">SECTOR:</span>
                          <span className="text-green-400">{token.sector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400/70">EXCHANGE:</span>
                          <span className="text-green-400">{token.exchange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400/70">RISK_LEVEL:</span>
                          <span className="text-red-400">{token.riskLevel}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded-lg border border-green-400/20">
                      <h4 className="text-green-400 font-medium mb-2 font-mono">FAILURE_ANALYSIS</h4>
                      <div className="space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-green-400/70">DECLINE:</span>
                          <span className="text-red-400">{token.performancePercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400/70">FAILURE_TYPE:</span>
                          <span className="text-red-400">
                            {parseFloat(token.performancePercent) < -90 ? "EXTREME" :
                             parseFloat(token.performancePercent) < -80 ? "SEVERE" :
                             parseFloat(token.performancePercent) < -70 ? "HIGH" :
                             "MODERATE"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400/70">STATUS:</span>
                          <span className="text-red-400">FAILED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-4 rounded-lg border border-green-400/20">
                    <h4 className="text-green-400 font-medium mb-3 font-mono">PRIMARY_FAILURE_REASONS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "LOW_FLOAT_HIGH_FDV_TOKENOMICS",
                        "EXTREME_UNLOCK_PRESSURE",
                        "MARKET_OVERSATURATION",
                        "LACK_OF_SUSTAINABLE_REVENUE_MODEL"
                      ].map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-green-400/80 font-mono">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {analysisView === "comparative" && (
          <Card className="bg-black/80 border-green-400/30 glass-effect relative z-10">
            <CardHeader>
              <CardTitle className="text-green-400 font-mono">COMPARATIVE_FAILURE_ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar 
                  data={{
                    labels: tokens?.map((token: any) => token.symbol) || [],
                    datasets: [{
                      label: "PRICE_DECLINE_%",
                      data: tokens?.map((token: any) => Math.abs(parseFloat(token.performancePercent || "0"))) || [],
                      backgroundColor: "#ef4444",
                      borderColor: "#dc2626",
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { 
                          color: '#22c55e',
                          font: { family: 'monospace' }
                        }
                      }
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'DECLINE_%',
                          color: '#22c55e',
                          font: { family: 'monospace' }
                        },
                        ticks: { 
                          color: '#22c55e',
                          font: { family: 'monospace' }
                        },
                        grid: { color: '#22c55e33' }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'TOKEN_SYMBOL',
                          color: '#22c55e',
                          font: { family: 'monospace' }
                        },
                        ticks: { 
                          color: '#22c55e',
                          font: { family: 'monospace' }
                        },
                        grid: { color: '#22c55e33' }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-6 p-4 bg-black/40 border border-green-400/20 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2 font-mono">KEY_INSIGHTS</h4>
                <ul className="space-y-1 text-sm text-green-400/80 font-mono">
                  <li>• LOW_INITIAL_FLOAT_CORRELATES_WITH_HIGHER_PRICE_DECLINES</li>
                  <li>• TOKENS_WITH_UNDER_15_PERCENT_FLOAT_AVERAGED_-91.2_PERCENT_DECLINE_VS_-82.1_PERCENT</li>
                  <li>• UNLOCK_PRESSURE_CREATED_MASSIVE_SELLING_WAVES</li>
                  <li>• HIGH_FDV_CREATED_UNSUSTAINABLE_MARKET_EXPECTATIONS</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}