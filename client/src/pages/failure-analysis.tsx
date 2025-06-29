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
  const [selectedModel, setSelectedModel] = useState("low-float");
  const [analysisView, setAnalysisView] = useState("overview");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(false);

  const { data: analyticsData, isLoading } = useQuery({
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

  const getModelDescription = (model: string) => {
    switch (model) {
      case "low-float":
        return "Low Float/High FDV model - Tokens with less than 20% initial circulation";
      case "aggressive-vesting":
        return "Aggressive vesting schedules with monthly unlocks exceeding 10% of supply";
      case "team-heavy":
        return "Team/investor allocation exceeding 50% of total supply";
      default:
        return "";
    }
  };

  const selectedModelData = selectedModel === "all" ? null : {
    name: selectedModel,
    description: getModelDescription(selectedModel)
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/10 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative flex flex-wrap items-center justify-between mb-8">
            <a 
              href="/" 
              className="group inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 text-white hover:text-white transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Dashboard</span>
            </a>
            
            <div className="flex gap-3">
              <Select value={analysisView} onValueChange={setAnalysisView}>
                <SelectTrigger className="w-48 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="overview">Failure Reasons</SelectItem>
                  <SelectItem value="detailed">Economic Analysis</SelectItem>
                  <SelectItem value="comparative">Model Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-full border border-red-500/20">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-semibold uppercase tracking-wider text-sm">Failure Analysis</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500 mb-4 leading-tight tracking-tight">
              A Comprehensive Breakdown of High FDV Failures
            </h1>
            
            <div className="space-y-4">
              <p className="text-3xl font-bold text-white">Economic Analysis of Systematic Tokenomics Failures</p>
              <p className="text-xl text-white max-w-5xl mx-auto leading-relaxed">
                Deep dive into why <span className="text-red-400 font-semibold">high FDV/low float models</span> systematically destroy investor capital through <span className="text-orange-400 font-semibold">mathematical inevitability</span> and behavioral exploitation patterns.
              </p>
              <div className="text-lg text-slate-400 max-w-4xl mx-auto">
                <span className="text-yellow-400 font-semibold">Core failure mechanisms</span> • <span className="text-cyan-400 font-semibold">Economic death spiral</span> • <span className="text-purple-400 font-semibold">Model comparisons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-orange-500/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-400">Economic Model</h3>
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-500">Broken</div>
              <p className="text-xs text-slate-400 mt-1">Fundamentally flawed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-red-500/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-red-400">Supply Dynamics</h3>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">Critical</div>
              <p className="text-xs text-slate-400 mt-1">Artificial scarcity</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-yellow-500/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-yellow-400">Market Psychology</h3>
                <Users className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-yellow-500">Exploited</div>
              <p className="text-xs text-slate-400 mt-1">Behavioral traps</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-400">Outcome</h3>
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-purple-500">Inevitable</div>
              <p className="text-xs text-slate-400 mt-1">Mathematical certainty</p>
            </CardContent>
          </Card>
        </section>

        {analysisView === "overview" && (
          <div className="space-y-12">
            {/* The High FDV Model Explained */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                  The High FDV/Low Float Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-white text-lg leading-relaxed">
                    The high Fully Diluted Valuation (FDV) with low initial float model has become a dominant tokenomics structure in crypto. 
                    This model launches projects with extremely high theoretical valuations based on total supply, while only releasing 5-15% of tokens initially.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
                    <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Typical Structure
                    </h4>
                    <ul className="space-y-2 text-white">
                      <li>• Total supply: 1B+ tokens</li>
                      <li>• Initial float: 50-150M tokens (5-15%)</li>
                      <li>• FDV at launch: $1B-10B+</li>
                      <li>• Unlock schedule: 24-48 months</li>
                      <li>• Monthly unlock: 2-8% of total supply</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Immediate Problems
                    </h4>
                    <ul className="space-y-2 text-white">
                      <li>• Artificial scarcity inflates price</li>
                      <li>• Market cap doesn't reflect reality</li>
                      <li>• Unsustainable token velocity</li>
                      <li>• Future supply overhang pressure</li>
                      <li>• Misaligned incentives for holders</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Economic Failures */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-red-400" />
                  Economic Failure Mechanisms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold">1</div>
                      <h4 className="font-semibold text-red-400">Supply Shock Theory</h4>
                    </div>
                    <p className="text-white text-sm">
                      When massive token unlocks occur, the sudden increase in circulating supply far exceeds natural demand absorption capacity, 
                      creating inevitable downward price pressure regardless of project fundamentals.
                    </p>
                  </div>
                  
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold">2</div>
                      <h4 className="font-semibold text-orange-400">Liquidity Mirage</h4>
                    </div>
                    <p className="text-white text-sm">
                      Low float creates artificial scarcity, making small buy orders disproportionately impact price. 
                      This false price discovery mechanism attracts retail buyers who mistake scarcity for value.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold">3</div>
                      <h4 className="font-semibold text-yellow-400">Reflexivity Trap</h4>
                    </div>
                    <p className="text-white text-sm">
                      Higher prices from artificial scarcity increase paper valuations, attracting more buyers, 
                      creating a self-reinforcing cycle that amplifies the eventual correction when reality sets in.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analysisView === "detailed" && (
          <div className="space-y-12">
            {/* Mathematical Analysis */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  Mathematical Inevitability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-blue-400 mb-4">Supply-Demand Mathematics</h4>
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                      <div className="space-y-4 text-white">
                        <div className="flex justify-between">
                          <span>Initial Float:</span>
                          <span className="text-blue-400 font-semibold">100M tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Unlock:</span>
                          <span className="text-orange-400 font-semibold">50M tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Supply Increase:</span>
                          <span className="text-red-400 font-semibold">+50% monthly</span>
                        </div>
                        <div className="border-t border-slate-600 pt-3">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Required Demand Growth:</span>
                            <span className="text-red-500">+50% monthly</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-purple-400 mb-4">Economic Reality Check</h4>
                    <div className="space-y-4">
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-400 mb-2">Sustainable Growth Rates</h5>
                        <ul className="text-white text-sm space-y-1">
                          <li>• Healthy businesses: 20-50% annual growth</li>
                          <li>• Crypto bull markets: 100-300% annual growth</li>
                          <li>• High FDV model requires: 600%+ annual growth</li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-red-400 mb-2">Mathematical Impossibility</h5>
                        <p className="text-white text-sm">
                          For prices to remain stable, new demand must consistently exceed supply increases. 
                          The required growth rates are mathematically unsustainable in any economic environment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavioral Economics */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-green-400" />
                  Behavioral Exploitation Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-green-400 mb-4">Psychological Mechanisms</h4>
                    <div className="space-y-4">
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-green-400 mb-2">Scarcity Bias</h5>
                        <p className="text-white text-sm">
                          Low float triggers scarcity bias, making assets appear more valuable due to limited availability, 
                          even when the scarcity is artificially engineered.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-400 mb-2">Anchoring Effect</h5>
                        <p className="text-white text-sm">
                          High FDV creates an anchor point that makes current prices seem reasonable compared to "full dilution," 
                          masking the true supply economics.
                        </p>
                      </div>
                      
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-400 mb-2">FOMO Amplification</h5>
                        <p className="text-white text-sm">
                          Rising prices from artificial scarcity create fear of missing out, driving irrational buying behavior 
                          that temporarily sustains the unsustainable model.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-orange-400 mb-4">Information Asymmetries</h4>
                    <div className="space-y-4">
                      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-400 mb-2">Hidden Unlock Schedules</h5>
                        <p className="text-white text-sm">
                          Complex vesting schedules and unclear documentation hide the true extent of future selling pressure 
                          from retail investors who focus on current metrics.
                        </p>
                      </div>
                      
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-red-400 mb-2">Insider Knowledge</h5>
                        <p className="text-white text-sm">
                          VCs, team members, and early investors understand the supply dynamics and time their exits accordingly, 
                          while retail investors remain unaware of the inevitable correction.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-400 mb-2">Marketing Obfuscation</h5>
                        <p className="text-white text-sm">
                          Marketing focuses on current valuation, partnerships, and technology while downplaying tokenomics, 
                          creating information asymmetry that favors informed participants.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analysisView === "comparative" && (
          <div className="space-y-12">
            {/* Model Comparison */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Target className="w-6 h-6 text-emerald-400" />
                  Tokenomics Model Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left p-4 text-white font-semibold">Characteristic</th>
                        <th className="text-center p-4 text-white font-semibold">High FDV/Low Float</th>
                        <th className="text-center p-4 text-white font-semibold">Fair Launch</th>
                        <th className="text-center p-4 text-white font-semibold">Revenue Sharing</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-700/30">
                        <td className="p-4 text-white font-medium">Initial Float</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                            5-15%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                            80-100%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                            Variable
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t border-slate-700/30">
                        <td className="p-4 text-white font-medium">Price Discovery</td>
                        <td className="p-4 text-center text-red-400">Artificial</td>
                        <td className="p-4 text-center text-green-400">Market-driven</td>
                        <td className="p-4 text-center text-blue-400">Fundamental</td>
                      </tr>
                      <tr className="border-t border-slate-700/30">
                        <td className="p-4 text-white font-medium">Sustainability</td>
                        <td className="p-4 text-center text-red-400">Unsustainable</td>
                        <td className="p-4 text-center text-green-400">Sustainable</td>
                        <td className="p-4 text-center text-blue-400">Highly Sustainable</td>
                      </tr>
                      <tr className="border-t border-slate-700/30">
                        <td className="p-4 text-white font-medium">Investor Alignment</td>
                        <td className="p-4 text-center text-red-400">Misaligned</td>
                        <td className="p-4 text-center text-green-400">Aligned</td>
                        <td className="p-4 text-center text-blue-400">Highly Aligned</td>
                      </tr>
                      <tr className="border-t border-slate-700/30">
                        <td className="p-4 text-white font-medium">Long-term Viability</td>
                        <td className="p-4 text-center text-red-400">Low</td>
                        <td className="p-4 text-center text-green-400">Medium</td>
                        <td className="p-4 text-center text-blue-400">High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Models */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-green-400">Sustainable Alternatives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Revenue-Based Tokens
                      </h5>
                      <p className="text-white text-sm">
                        Tokens that capture actual business value through fee sharing, buybacks, or direct revenue distribution. 
                        Value derives from cash flows, not speculation.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Gradual Distribution
                      </h5>
                      <p className="text-white text-sm">
                        Launch with 60-80% of tokens in circulation, with remaining supply distributed based on usage, 
                        community contributions, or ecosystem development milestones.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Utility-First Design
                      </h5>
                      <p className="text-white text-sm">
                        Tokens serve clear utility functions within the ecosystem, creating organic demand 
                        that grows with platform adoption rather than speculative interest.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-red-400">Red Flags to Avoid</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Complex Vesting Schedules
                      </h5>
                      <p className="text-white text-sm">
                        Convoluted unlock mechanisms with multiple tranches, cliffs, and conditions designed to 
                        obscure the true extent of future selling pressure.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {"FDV > $1B at Launch"}
                      </h5>
                      <p className="text-white text-sm">
                        Extremely high fully diluted valuations that require unrealistic growth assumptions 
                        to justify, indicating unsustainable tokenomics from launch.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        No Clear Value Accrual
                      </h5>
                      <p className="text-white text-sm">
                        Tokens without clear mechanisms for capturing business value, relying purely on 
                        speculation and narrative rather than fundamental value creation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}