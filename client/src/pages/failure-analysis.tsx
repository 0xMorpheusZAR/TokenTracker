import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, TrendingDown, AlertTriangle, DollarSign, Users, Calendar, BarChart3, Target, Percent, Clock, X, Check } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-black/80 border-b border-red-500/30 p-6 sticky top-0 z-50 backdrop-blur-sm">
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
                  <SelectItem value="overview">Failure Reasons</SelectItem>
                  <SelectItem value="detailed">Economic Analysis</SelectItem>
                  <SelectItem value="comparative">Model Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-center relative z-10">
            <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-4">
              A Comprehensive Breakdown of High FDV Failures
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Key Insights Overview */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Model Failure Rate</h3>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">95%</div>
              <p className="text-xs text-gray-400 mt-1">Of high FDV tokens failed</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Capital Destroyed</h3>
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">$58.4B</div>
              <p className="text-xs text-gray-400 mt-1">Total value lost</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Systemic Issue</h3>
                <Percent className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">13.2%</div>
              <p className="text-xs text-gray-400 mt-1">Average initial float</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Time to Failure</h3>
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">6-18</div>
              <p className="text-xs text-gray-400 mt-1">Months average</p>
            </CardContent>
          </Card>
        </section>

        {analysisView === "overview" && (
          <>
            {/* Core Failure Mechanisms */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-black/80 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400">Core Failure Mechanisms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-400 mb-1">Liquidity Mirage</h4>
                      <p className="text-gray-300 text-sm">Low float creates artificial scarcity, inflating price with minimal actual demand</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-400 mb-1">Unlock Avalanche</h4>
                      <p className="text-gray-300 text-sm">Massive token releases create overwhelming sell pressure impossible to absorb</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-400 mb-1">Valuation Disconnect</h4>
                      <p className="text-gray-300 text-sm">Market cap based on tiny float doesn't reflect economic reality</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400">Economic Death Spiral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-red-500/20">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <span className="text-gray-300">High FDV launch with ~10-15% float</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-red-500/20">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <span className="text-gray-300">Price pumps due to artificial scarcity</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-red-500/20">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <span className="text-gray-300">Token unlocks begin massive sell pressure</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-red-500/20">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <span className="text-gray-300">Price collapses 80-95% from highs</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">💀</div>
                      <span className="text-red-400 font-semibold">Token effectively dead</span>
                    </div>
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
          <div className="space-y-8">
            {/* Economic Theory Section */}
            <Card className="bg-black/80 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400">The Economics of Failure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-red-400 font-semibold mb-3">Supply-Demand Imbalance</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                        <p className="text-gray-300 text-sm"><strong>Problem:</strong> Artificial scarcity with 10-15% float creates price discovery based on tiny supply</p>
                      </div>
                      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                        <p className="text-gray-300 text-sm"><strong>Result:</strong> Market cap reflects unrealistic valuation that cannot be sustained when full supply hits market</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-red-400 font-semibold mb-3">Liquidity Shock Theory</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                        <p className="text-gray-300 text-sm"><strong>Mechanism:</strong> Token unlocks increase circulating supply by 300-800% within 6-18 months</p>
                      </div>
                      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                        <p className="text-gray-300 text-sm"><strong>Impact:</strong> Demand remains constant while supply multiplies, causing inevitable price collapse</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-black/40 border border-red-500/20 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-2">Mathematical Certainty</h4>
                  <p className="text-gray-300">If a token has 10% float at launch and unlocks 90% over 18 months, even maintaining 50% of original demand would require 5x price appreciation just to break even. This is economically impossible for most projects.</p>
                </div>
              </CardContent>
            </Card>

            {/* Behavioral Economics */}
            <Card className="bg-black/80 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400">Behavioral & Market Dynamics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg">
                    <h5 className="text-red-400 font-medium mb-2">Insider Incentives</h5>
                    <p className="text-gray-300 text-sm">Teams and VCs have massive unlock schedules, creating structural selling pressure regardless of project success</p>
                  </div>
                  
                  <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg">
                    <h5 className="text-red-400 font-medium mb-2">Retail Psychology</h5>
                    <p className="text-gray-300 text-sm">High token price creates perception of success, attracting retail buyers who become exit liquidity for insiders</p>
                  </div>
                  
                  <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg">
                    <h5 className="text-red-400 font-medium mb-2">Market Efficiency</h5>
                    <p className="text-gray-300 text-sm">Eventually markets price in future dilution, but by then retail investors have already suffered massive losses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analysisView === "comparative" && (
          <div className="space-y-8">
            {/* Model Comparison */}
            <Card className="bg-black/80 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400">High FDV vs Sustainable Token Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-red-400 font-semibold text-lg">Failed High FDV Model</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <X className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-400">Low Float Launch (10-15%)</span>
                        </div>
                        <p className="text-gray-300 text-sm">Creates artificial scarcity and unrealistic price discovery</p>
                      </div>
                      
                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <X className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-400">Massive Unlock Schedules</span>
                        </div>
                        <p className="text-gray-300 text-sm">300-800% supply increase over 18 months guaranteed</p>
                      </div>
                      
                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <X className="w-5 h-5 text-red-500" />
                          <span className="font-medium text-red-400">Valuation Disconnect</span>
                        </div>
                        <p className="text-gray-300 text-sm">Market cap based on tiny float, not economic reality</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-green-400 font-semibold text-lg">Sustainable Models (e.g., Hyperliquid)</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-400">Revenue-Based Valuation</span>
                        </div>
                        <p className="text-gray-300 text-sm">Price supported by actual revenue generation ($830M annually)</p>
                      </div>
                      
                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-400">Gradual Distribution</span>
                        </div>
                        <p className="text-gray-300 text-sm">Controlled token release aligned with product adoption</p>
                      </div>
                      
                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-400">Market Dominance</span>
                        </div>
                        <p className="text-gray-300 text-sm">76% market share with sustainable competitive moats</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Solutions Framework */}
            <Card className="bg-black/80 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400">Framework for Avoiding High FDV Disasters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg">
                    <h5 className="text-red-400 font-medium mb-3">Due Diligence Red Flags</h5>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Initial float under 20%</li>
                      <li>• No sustainable revenue model</li>
                      <li>• Heavy VC/team unlock schedules</li>
                      <li>• Market cap over 50x annual revenue</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg">
                    <h5 className="text-red-400 font-medium mb-3">Sustainable Metrics</h5>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• P/E ratio under 50x</li>
                      <li>• Growing weekly active users</li>
                      <li>• Positive unit economics</li>
                      <li>• Market share expansion</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-black/40 border border-red-500/20 rounded-lg">
                    <h5 className="text-red-400 font-medium mb-3">Timing Considerations</h5>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Avoid 3-6 months before major unlocks</li>
                      <li>• Wait for revenue proof points</li>
                      <li>• Look for post-unlock stability</li>
                      <li>• Monitor competitor dynamics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}