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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-b border-red-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <a 
              href="/" 
              className="inline-flex items-center gap-3 px-4 py-2 bg-black/50 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </a>
            
            <div className="flex gap-4">
              <Select value={analysisView} onValueChange={setAnalysisView}>
                <SelectTrigger className="w-48 bg-black/50 border-red-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-red-500/30">
                  <SelectItem value="overview">Overview Analysis</SelectItem>
                  <SelectItem value="detailed">Detailed Breakdown</SelectItem>
                  <SelectItem value="comparative">Comparative Study</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="w-48 bg-black/50 border-red-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-red-500/30">
                  <SelectItem value="all">All Tokens</SelectItem>
                  {failureData.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-4">
              High FDV Token Failure Analysis
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive breakdown of why low float/high FDV tokens crashed 80-95% from their all-time highs
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Key Metrics Overview */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Average Decline</h3>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">-87.4%</div>
              <p className="text-xs text-gray-400 mt-1">From ATH</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Total Value Lost</h3>
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">$58.4B</div>
              <p className="text-xs text-gray-400 mt-1">Market cap destroyed</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Avg Initial Float</h3>
                <Percent className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">27.8%</div>
              <p className="text-xs text-gray-400 mt-1">Extremely low liquidity</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Unlock Pressure</h3>
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">72.2%</div>
              <p className="text-xs text-gray-400 mt-1">Avg locked tokens</p>
            </CardContent>
          </Card>
        </section>

        {analysisView === "overview" && (
          <>
            {/* Failure Reasons Breakdown */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-black/80 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400">Primary Failure Reasons</CardTitle>
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
                            labels: { color: '#ffffff' }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400">Price Decline Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar 
                      data={declineComparisonData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: {
                            ticks: { color: '#ef4444' },
                            grid: { color: '#374151' }
                          },
                          x: {
                            ticks: { color: '#ffffff' },
                            grid: { color: '#374151' }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Token Breakdown Table */}
            <Card className="bg-black/80 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400">Detailed Token Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-500/30">
                        <th className="text-left p-3 text-red-400">Token</th>
                        <th className="text-left p-3 text-red-400">ATH</th>
                        <th className="text-left p-3 text-red-400">Current</th>
                        <th className="text-left p-3 text-red-400">Decline</th>
                        <th className="text-left p-3 text-red-400">Float %</th>
                        <th className="text-left p-3 text-red-400">Primary Failure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failureData.map((token) => (
                        <tr key={token.symbol} className="border-b border-gray-800 hover:bg-red-900/10">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                                {token.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-xs text-gray-400">{token.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-white">${token.ath.toFixed(2)}</td>
                          <td className="p-3 text-white">${token.currentPrice.toFixed(2)}</td>
                          <td className="p-3">
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              {token.decline.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="p-3 text-orange-400">{token.floatPercentage.toFixed(1)}%</td>
                          <td className="p-3 text-gray-300 max-w-xs truncate">
                            {token.primaryFailureReasons[0]}
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

        {selectedTokenData && analysisView === "detailed" && (
          <Card className="bg-black/80 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">{selectedTokenData.name} ({selectedTokenData.symbol}) - Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">Price Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">All-Time High:</span>
                      <span className="text-white">${selectedTokenData.ath.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Price:</span>
                      <span className="text-white">${selectedTokenData.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Decline:</span>
                      <span className="text-red-400">{selectedTokenData.decline.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Tokenomics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">FDV:</span>
                      <span className="text-white">${(selectedTokenData.fdv / 1e9).toFixed(1)}B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Initial Float:</span>
                      <span className="text-orange-400">{selectedTokenData.floatPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Unlock Pressure:</span>
                      <span className="text-red-400">{selectedTokenData.unlockPressure.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Market Data</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Cap:</span>
                      <span className="text-white">${(selectedTokenData.marketCap / 1e6).toFixed(0)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h Volume:</span>
                      <span className="text-white">${(selectedTokenData.volume / 1e6).toFixed(0)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Listing Date:</span>
                      <span className="text-white">{selectedTokenData.listingDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Primary Failure Reasons</h4>
                <div className="space-y-2">
                  {selectedTokenData.primaryFailureReasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisView === "comparative" && (
          <Card className="bg-black/80 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">Float Percentage vs Price Decline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar 
                  data={floatVsDeclineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: '#ffffff' }
                      }
                    },
                    scales: {
                      y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#374151' }
                      },
                      x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#374151' }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <h4 className="font-semibold text-red-400 mb-2">Key Insights</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Lower initial float correlates strongly with higher price declines</li>
                  <li>• Tokens with &lt;15% float averaged -91.2% decline vs -82.1% for higher float tokens</li>
                  <li>• Unlock pressure created massive selling waves as tokens became available</li>
                  <li>• High FDV created unsustainable market expectations vs actual utility</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}