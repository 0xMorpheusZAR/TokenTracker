import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingDown, Zap, DollarSign, Users, Lock } from "lucide-react";
import { Line, Doughnut, Bar } from "react-chartjs-2";

interface TokenomicsModel {
  initialSupply: number;
  initialFloat: number;
  vestingMonths: number;
  monthlyUnlockRate: number;
  teamAllocation: number;
  investorAllocation: number;
  communityAllocation: number;
  liquidityAllocation: number;
  burnRate: number;
  stakingAPY: number;
}

interface SimulationResult {
  month: number;
  price: number;
  circulatingSupply: number;
  marketCap: number;
  stakedPercentage: number;
  burnedTokens: number;
  liquidityDepth: number;
}

export function TokenomicsSimulator() {
  const [model, setModel] = useState<TokenomicsModel>({
    initialSupply: 1000000000,
    initialFloat: 15,
    vestingMonths: 48,
    monthlyUnlockRate: 2.5,
    teamAllocation: 20,
    investorAllocation: 30,
    communityAllocation: 35,
    liquidityAllocation: 15,
    burnRate: 0.5,
    stakingAPY: 12,
  });
  
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<"bear" | "base" | "bull">("base");
  
  const runSimulation = () => {
    const results: SimulationResult[] = [];
    let circulatingSupply = (model.initialSupply * model.initialFloat) / 100;
    let price = 1.0; // Starting price
    let burnedTokens = 0;
    let stakedPercentage = 20; // Initial staking percentage
    
    for (let month = 0; month <= 60; month++) {
      // Calculate monthly unlock
      const monthlyUnlock = month > 0 && month <= model.vestingMonths
        ? (model.initialSupply * model.monthlyUnlockRate) / 100
        : 0;
      
      circulatingSupply = Math.min(model.initialSupply - burnedTokens, circulatingSupply + monthlyUnlock);
      
      // Price impact model based on supply changes
      const supplyImpact = monthlyUnlock > 0 ? -0.02 : 0; // 2% price drop per unlock
      const marketSentiment = selectedScenario === "bull" ? 0.02 : selectedScenario === "bear" ? -0.03 : -0.01;
      const stakingImpact = (stakedPercentage / 100) * 0.01; // Positive price pressure from staking
      
      price = Math.max(0.01, price * (1 + supplyImpact + marketSentiment + stakingImpact));
      
      // Update burned tokens
      const monthlyBurn = circulatingSupply * (model.burnRate / 100);
      burnedTokens += monthlyBurn;
      
      // Update staking percentage (tends to increase in bear markets)
      stakedPercentage = Math.min(80, stakedPercentage + (price < 0.5 ? 2 : -0.5));
      
      // Calculate liquidity depth
      const liquidityDepth = (circulatingSupply * model.liquidityAllocation) / 100 * price;
      
      results.push({
        month,
        price,
        circulatingSupply,
        marketCap: circulatingSupply * price,
        stakedPercentage,
        burnedTokens,
        liquidityDepth,
      });
    }
    
    setSimulationResults(results);
  };
  
  useEffect(() => {
    runSimulation();
  }, [model, selectedScenario]);
  
  const priceChartData = {
    labels: simulationResults.map(r => `M${r.month}`).filter((_, i) => i % 6 === 0),
    datasets: [
      {
        label: "Token Price",
        data: simulationResults.filter((_, i) => i % 6 === 0).map(r => r.price),
        borderColor: selectedScenario === "bull" ? "#22c55e" : selectedScenario === "bear" ? "#ef4444" : "#3b82f6",
        backgroundColor: selectedScenario === "bull" ? "rgba(34, 197, 94, 0.1)" : selectedScenario === "bear" ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };
  
  const supplyChartData = {
    labels: simulationResults.map(r => `M${r.month}`).filter((_, i) => i % 6 === 0),
    datasets: [
      {
        label: "Circulating Supply",
        data: simulationResults.filter((_, i) => i % 6 === 0).map(r => (r.circulatingSupply / model.initialSupply) * 100),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Staked %",
        data: simulationResults.filter((_, i) => i % 6 === 0).map(r => r.stakedPercentage),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };
  
  const allocationData = {
    labels: ["Team", "Investors", "Community", "Liquidity"],
    datasets: [
      {
        data: [
          model.teamAllocation,
          model.investorAllocation,
          model.communityAllocation,
          model.liquidityAllocation,
        ],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"],
        borderWidth: 0,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#e2e8f0",
        bodyColor: "#e2e8f0",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148, 163, 184, 0.1)" },
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148, 163, 184, 0.1)" },
      },
    },
  };
  
  const finalResult = simulationResults[simulationResults.length - 1] || {
    price: 0,
    marketCap: 0,
    circulatingSupply: 0,
  };
  
  const priceChange = finalResult.price ? ((finalResult.price - 1) / 1) * 100 : -100;
  
  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
          <Calculator className="w-6 h-6 text-blue-400" />
          Interactive Tokenomics Simulator
        </CardTitle>
        <p className="text-sm text-gray-400">Explore how different economic models impact token performance</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selector */}
        <div className="flex gap-2">
          <Button
            variant={selectedScenario === "bear" ? "default" : "outline"}
            onClick={() => setSelectedScenario("bear")}
            className={selectedScenario === "bear" ? "bg-red-600 hover:bg-red-700" : ""}
            size="sm"
          >
            Bear Market
          </Button>
          <Button
            variant={selectedScenario === "base" ? "default" : "outline"}
            onClick={() => setSelectedScenario("base")}
            className={selectedScenario === "base" ? "bg-blue-600 hover:bg-blue-700" : ""}
            size="sm"
          >
            Base Case
          </Button>
          <Button
            variant={selectedScenario === "bull" ? "default" : "outline"}
            onClick={() => setSelectedScenario("bull")}
            className={selectedScenario === "bull" ? "bg-green-600 hover:bg-green-700" : ""}
            size="sm"
          >
            Bull Market
          </Button>
        </div>
        
        {/* Tabs for different views */}
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Initial Float: {model.initialFloat}%
                </label>
                <Slider
                  value={[model.initialFloat]}
                  onValueChange={(v) => setModel({ ...model, initialFloat: v[0] })}
                  min={5}
                  max={50}
                  step={1}
                  className="mb-4"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Monthly Unlock Rate: {model.monthlyUnlockRate}%
                </label>
                <Slider
                  value={[model.monthlyUnlockRate]}
                  onValueChange={(v) => setModel({ ...model, monthlyUnlockRate: v[0] })}
                  min={0.5}
                  max={10}
                  step={0.5}
                  className="mb-4"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Vesting Period: {model.vestingMonths} months
                </label>
                <Slider
                  value={[model.vestingMonths]}
                  onValueChange={(v) => setModel({ ...model, vestingMonths: v[0] })}
                  min={12}
                  max={84}
                  step={6}
                  className="mb-4"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Burn Rate: {model.burnRate}% monthly
                </label>
                <Slider
                  value={[model.burnRate]}
                  onValueChange={(v) => setModel({ ...model, burnRate: v[0] })}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mb-4"
                />
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <TrendingDown className="w-3 h-3" />
                  Final Price
                </div>
                <div className={`text-lg font-bold ${priceChange < 0 ? "text-red-400" : "text-green-400"}`}>
                  ${finalResult.price.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">
                  {priceChange > 0 ? "+" : ""}{priceChange.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <DollarSign className="w-3 h-3" />
                  Market Cap
                </div>
                <div className="text-lg font-bold text-white">
                  ${(finalResult.marketCap / 1000000).toFixed(1)}M
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Lock className="w-3 h-3" />
                  Float
                </div>
                <div className="text-lg font-bold text-white">
                  {((finalResult.circulatingSupply / model.initialSupply) * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Zap className="w-3 h-3" />
                  Burned
                </div>
                <div className="text-lg font-bold text-orange-400">
                  {((finalResult.burnedTokens / model.initialSupply) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="h-64">
              <Line data={priceChartData} options={chartOptions} />
            </div>
            
            <div className="h-64">
              <Line 
                data={supplyChartData} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      type: 'linear' as const,
                      display: true,
                      position: 'left' as const,
                      ticks: { color: "#94a3b8" },
                      grid: { color: "rgba(148, 163, 184, 0.1)" },
                      title: {
                        display: true,
                        text: "Circulating Supply %",
                        color: "#94a3b8",
                      },
                    },
                    y1: {
                      type: 'linear' as const,
                      display: true,
                      position: 'right' as const,
                      ticks: { color: "#94a3b8" },
                      grid: { drawOnChartArea: false },
                      title: {
                        display: true,
                        text: "Staked %",
                        color: "#94a3b8",
                      },
                    },
                  },
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="allocation" className="space-y-4 mt-4">
            <div className="h-64 flex items-center justify-center">
              <div className="w-64 h-64">
                <Doughnut data={allocationData} options={chartOptions} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <label className="text-xs text-gray-400">Team Allocation</label>
                <Slider
                  value={[model.teamAllocation]}
                  onValueChange={(v) => setModel({ ...model, teamAllocation: v[0] })}
                  min={5}
                  max={40}
                  step={5}
                  className="mt-2"
                />
                <div className="text-sm font-semibold text-white mt-1">{model.teamAllocation}%</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3">
                <label className="text-xs text-gray-400">Investor Allocation</label>
                <Slider
                  value={[model.investorAllocation]}
                  onValueChange={(v) => setModel({ ...model, investorAllocation: v[0] })}
                  min={10}
                  max={50}
                  step={5}
                  className="mt-2"
                />
                <div className="text-sm font-semibold text-white mt-1">{model.investorAllocation}%</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Economic Insights */}
        <div className={`rounded-lg p-4 border ${
          priceChange < -50 ? "bg-red-900/20 border-red-500/30" : "bg-blue-900/20 border-blue-500/30"
        }`}>
          <h4 className={`text-sm font-semibold mb-2 ${
            priceChange < -50 ? "text-red-400" : "text-blue-400"
          }`}>
            Economic Model Analysis
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            {priceChange < -50 ? (
              <>
                This model shows classic failure patterns: {model.initialFloat}% initial float creates 
                artificial scarcity, but {model.monthlyUnlockRate}% monthly unlocks over {model.vestingMonths} months 
                result in {priceChange.toFixed(0)}% price decline. The death spiral accelerates as unlock 
                pressure overwhelms demand.
              </>
            ) : (
              <>
                With {model.initialFloat}% initial float and controlled {model.monthlyUnlockRate}% monthly unlocks, 
                this model achieves better stability. The {model.burnRate}% burn rate and staking incentives 
                help offset inflation, resulting in only {Math.abs(priceChange).toFixed(0)}% price decline.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}