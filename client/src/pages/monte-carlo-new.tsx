import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Target, Activity, Zap, BarChart3, Brain, Calculator, Play, Settings } from "lucide-react";
import { Link } from "wouter";
import { Line, Bar, Scatter, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AdvancedMonteCarlo } from "@/components/advanced-monte-carlo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Filler
} from "chart.js";

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

interface SimulationResult {
  scenario: string;
  probability: number;
  endPrice: number;
  priceChange: number;
  marketCap: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  valueAtRisk: number;
  maxDrawdown: number;
  probabilityAbove50: number;
  fundamentalFactors: {
    marketShareImpact: number;
    userGrowthImpact: number;
    revenueGrowthImpact: number;
  };
}

export default function MonteCarloNew() {
  const [selectedScenario, setSelectedScenario] = useState("base");
  const [isAdvancedMode, setIsAdvancedMode] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);
  const [customParams, setCustomParams] = useState({
    volatility: 0.65,
    drift: 0.0015,
    timeHorizon: 365,
    numSimulations: 10000,
    marketShareGrowth: 0.15,
    userGrowthRate: 0.5,
    revenueGrowthRate: 0.8,
  });

  const { data: hyperliquidData } = useQuery({
    queryKey: ["/api/hyperliquid/comprehensive"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = Number(hyperliquidData?.basicData?.market_data?.current_price || 36.50);

  // Simulated results for demonstration
  const simulationResults: SimulationResult[] = [
    {
      scenario: "Bearish (15th percentile)",
      probability: 15,
      endPrice: currentPrice * 0.65,
      priceChange: -35,
      marketCap: 7.2e9,
      confidenceInterval: { lower: currentPrice * 0.5, upper: currentPrice * 0.8 },
      valueAtRisk: currentPrice * 0.5,
      maxDrawdown: 45,
      probabilityAbove50: 5,
      fundamentalFactors: {
        marketShareImpact: -0.1,
        userGrowthImpact: 0.2,
        revenueGrowthImpact: 0.3,
      },
    },
    {
      scenario: "Base Case (50th percentile)",
      probability: 50,
      endPrice: currentPrice * 1.4,
      priceChange: 40,
      marketCap: 15.4e9,
      confidenceInterval: { lower: currentPrice * 1.1, upper: currentPrice * 1.7 },
      valueAtRisk: currentPrice * 0.9,
      maxDrawdown: 25,
      probabilityAbove50: 48,
      fundamentalFactors: {
        marketShareImpact: 0.15,
        userGrowthImpact: 0.5,
        revenueGrowthImpact: 0.8,
      },
    },
    {
      scenario: "Bullish (85th percentile)",
      probability: 85,
      endPrice: currentPrice * 2.5,
      priceChange: 150,
      marketCap: 27.5e9,
      confidenceInterval: { lower: currentPrice * 2, upper: currentPrice * 3 },
      valueAtRisk: currentPrice * 1.2,
      maxDrawdown: 15,
      probabilityAbove50: 82,
      fundamentalFactors: {
        marketShareImpact: 0.3,
        userGrowthImpact: 0.8,
        revenueGrowthImpact: 1.2,
      },
    },
  ];

  const selectedResult = simulationResults.find(r => 
    r.scenario.toLowerCase().includes(selectedScenario.toLowerCase())
  ) || simulationResults[1];

  // Chart data
  const priceDistributionData = {
    labels: ["$10-20", "$20-30", "$30-40", "$40-50", "$50-60", "$60-70", "$70-80", "$80-90", "$90-100", "$100+"],
    datasets: [{
      label: "Price Distribution",
      data: [2, 5, 12, 18, 25, 20, 10, 5, 2, 1],
      backgroundColor: "rgba(59, 130, 246, 0.8)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1,
    }],
  };

  const pathEvolutionData = {
    labels: Array.from({ length: 100 }, (_, i) => i),
    datasets: [
      {
        label: "Bearish Path",
        data: Array.from({ length: 100 }, (_, i) => currentPrice * (1 - 0.35 * (i / 100))),
        borderColor: "rgba(239, 68, 68, 0.8)",
        backgroundColor: "transparent",
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Base Path",
        data: Array.from({ length: 100 }, (_, i) => currentPrice * (1 + 0.4 * (i / 100))),
        borderColor: "rgba(59, 130, 246, 0.8)",
        backgroundColor: "transparent",
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Bullish Path",
        data: Array.from({ length: 100 }, (_, i) => currentPrice * (1 + 1.5 * (i / 100))),
        borderColor: "rgba(34, 197, 94, 0.8)",
        backgroundColor: "transparent",
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const riskMetricsData = {
    labels: ["VaR (95%)", "CVaR", "Max Drawdown", "Sharpe Ratio", "Sortino Ratio"],
    datasets: [{
      label: "Risk Metrics",
      data: [25, 35, selectedResult.maxDrawdown, 1.2, 1.5],
      backgroundColor: [
        "rgba(239, 68, 68, 0.8)",
        "rgba(249, 115, 22, 0.8)",
        "rgba(251, 191, 36, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(59, 130, 246, 0.8)",
      ],
      borderWidth: 0,
    }],
  };

  const confidenceIntervalData = {
    labels: ["5%", "25%", "50%", "75%", "95%"],
    datasets: [{
      label: "Confidence Intervals",
      data: [
        currentPrice * 0.5,
        currentPrice * 0.8,
        currentPrice * 1.4,
        currentPrice * 2.0,
        currentPrice * 3.0,
      ],
      backgroundColor: "rgba(59, 130, 246, 0.3)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
      fill: true,
    }],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          >
            <div className="w-1 h-1 bg-blue-400 rounded-full opacity-50"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/interactive-dashboard">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Live Price: ${currentPrice.toFixed(2)}
          </Badge>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Advanced Monte Carlo Simulation
          </h1>
          <p className="text-xl text-gray-300">
            10,000+ simulations with Geometric Brownian Motion and fundamental adjustments
          </p>
        </div>

        {/* Control Panel */}
        <Card className="bg-slate-900/80 border-slate-700/50 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Simulation Parameters
              </span>
              <Switch
                checked={isAdvancedMode}
                onCheckedChange={setIsAdvancedMode}
                className="data-[state=checked]:bg-blue-500"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-300">Volatility (σ)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[customParams.volatility * 100]}
                    onValueChange={(v) => setCustomParams({ ...customParams, volatility: v[0] / 100 })}
                    min={20}
                    max={150}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-white font-mono w-12">{(customParams.volatility * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Drift (μ)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[customParams.drift * 10000]}
                    onValueChange={(v) => setCustomParams({ ...customParams, drift: v[0] / 10000 })}
                    min={-50}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-white font-mono w-12">{(customParams.drift * 365 * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Time Horizon</Label>
                <Select
                  value={customParams.timeHorizon.toString()}
                  onValueChange={(v) => setCustomParams({ ...customParams, timeHorizon: parseInt(v) })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">1 Month</SelectItem>
                    <SelectItem value="90">3 Months</SelectItem>
                    <SelectItem value="180">6 Months</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAdvancedMode && (
                <>
                  <div>
                    <Label className="text-gray-300">Market Share Growth</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[customParams.marketShareGrowth * 100]}
                        onValueChange={(v) => setCustomParams({ ...customParams, marketShareGrowth: v[0] / 100 })}
                        min={-20}
                        max={50}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-white font-mono w-12">{(customParams.marketShareGrowth * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">User Growth Rate</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[customParams.userGrowthRate * 100]}
                        onValueChange={(v) => setCustomParams({ ...customParams, userGrowthRate: v[0] / 100 })}
                        min={0}
                        max={200}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-white font-mono w-12">{(customParams.userGrowthRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Revenue Growth Rate</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[customParams.revenueGrowthRate * 100]}
                        onValueChange={(v) => setCustomParams({ ...customParams, revenueGrowthRate: v[0] / 100 })}
                        min={0}
                        max={200}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-white font-mono w-12">{(customParams.revenueGrowthRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Visualization */}
        {isAdvancedMode && (
          <div className="mb-8">
            <AdvancedMonteCarlo
              currentPrice={currentPrice}
              volatility={customParams.volatility}
              drift={customParams.drift}
              timeHorizon={customParams.timeHorizon}
            />
          </div>
        )}

        {/* Results Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="paths">Paths</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {simulationResults.map((result, index) => (
                <Card
                  key={index}
                  className={`bg-slate-900/80 border-slate-700/50 cursor-pointer transition-all ${
                    selectedScenario === result.scenario.split(" ")[0].toLowerCase()
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedScenario(result.scenario.split(" ")[0].toLowerCase())}
                >
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>{result.scenario}</span>
                      <Badge
                        variant="outline"
                        className={
                          index === 0
                            ? "text-red-400 border-red-400"
                            : index === 1
                            ? "text-blue-400 border-blue-400"
                            : "text-green-400 border-green-400"
                        }
                      >
                        {result.probability}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">End Price</p>
                        <p className="text-2xl font-bold text-white">${result.endPrice.toFixed(2)}</p>
                        <p className={`text-sm ${result.priceChange > 0 ? "text-green-400" : "text-red-400"}`}>
                          {result.priceChange > 0 ? "+" : ""}{result.priceChange}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Market Cap</p>
                        <p className="text-lg font-semibold text-white">
                          ${(result.marketCap / 1e9).toFixed(1)}B
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-sm text-gray-400">95% Confidence</p>
                        <p className="text-sm text-white">
                          ${result.confidenceInterval.lower.toFixed(2)} - ${result.confidenceInterval.upper.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Price Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <Bar
                    data={priceDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        x: {
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                          ticks: { color: "rgba(255, 255, 255, 0.7)" },
                        },
                        y: {
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                          ticks: { color: "rgba(255, 255, 255, 0.7)" },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paths">
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Simulation Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <Line
                    data={pathEvolutionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: { color: "rgba(255, 255, 255, 0.7)" },
                        },
                      },
                      scales: {
                        x: {
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                          ticks: { color: "rgba(255, 255, 255, 0.7)" },
                        },
                        y: {
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                          ticks: {
                            color: "rgba(255, 255, 255, 0.7)",
                            callback: (value) => `$${value}`,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/80 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut
                      data={riskMetricsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                            labels: { color: "rgba(255, 255, 255, 0.7)" },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Key Risk Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Value at Risk (95%)</span>
                        <span className="text-white font-semibold">
                          ${selectedResult.valueAtRisk.toFixed(2)}
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Maximum Drawdown</span>
                        <span className="text-white font-semibold">
                          {selectedResult.maxDrawdown}%
                        </span>
                      </div>
                      <Progress value={selectedResult.maxDrawdown} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Probability {'>'} 50% Gain</span>
                        <span className="text-white font-semibold">
                          {selectedResult.probabilityAbove50}%
                        </span>
                      </div>
                      <Progress value={selectedResult.probabilityAbove50} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios">
            <Card className="bg-slate-900/80 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-white mb-2">Market Share Impact</h4>
                      <div className="relative h-32">
                        <div
                          className="absolute inset-0 rounded-full border-4 border-blue-500/20"
                          style={{
                            background: `conic-gradient(rgba(59, 130, 246, 0.8) ${
                              selectedResult.fundamentalFactors.marketShareImpact * 100
                            }%, transparent 0)`,
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {(selectedResult.fundamentalFactors.marketShareImpact * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-white mb-2">User Growth Impact</h4>
                      <div className="relative h-32">
                        <div
                          className="absolute inset-0 rounded-full border-4 border-green-500/20"
                          style={{
                            background: `conic-gradient(rgba(34, 197, 94, 0.8) ${
                              selectedResult.fundamentalFactors.userGrowthImpact * 100
                            }%, transparent 0)`,
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {(selectedResult.fundamentalFactors.userGrowthImpact * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-white mb-2">Revenue Growth Impact</h4>
                      <div className="relative h-32">
                        <div
                          className="absolute inset-0 rounded-full border-4 border-purple-500/20"
                          style={{
                            background: `conic-gradient(rgba(168, 85, 247, 0.8) ${
                              selectedResult.fundamentalFactors.revenueGrowthImpact * 100
                            }%, transparent 0)`,
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {(selectedResult.fundamentalFactors.revenueGrowthImpact * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-slate-800/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-4">Confidence Intervals</h4>
                    <div className="h-64">
                      <Line
                        data={confidenceIntervalData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            x: {
                              grid: { color: "rgba(255, 255, 255, 0.1)" },
                              ticks: { color: "rgba(255, 255, 255, 0.7)" },
                            },
                            y: {
                              grid: { color: "rgba(255, 255, 255, 0.1)" },
                              ticks: {
                                color: "rgba(255, 255, 255, 0.7)",
                                callback: (value) => `$${value}`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}