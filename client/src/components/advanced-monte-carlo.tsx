import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Zap, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface SimulationPath {
  id: number;
  path: number[];
  finalPrice: number;
  color: string;
  opacity: number;
}

interface AdvancedMonteCarloProps {
  currentPrice: number;
  volatility: number;
  drift: number;
  timeHorizon: number;
}

export function AdvancedMonteCarlo({ currentPrice, volatility, drift, timeHorizon }: AdvancedMonteCarloProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [paths, setPaths] = useState<SimulationPath[]>([]);
  const [numSimulations, setNumSimulations] = useState([1000]);
  const [speed, setSpeed] = useState([50]);
  const [selectedPath, setSelectedPath] = useState<SimulationPath | null>(null);
  
  // Statistics
  const [statistics, setStatistics] = useState({
    mean: 0,
    median: 0,
    percentile5: 0,
    percentile95: 0,
    var95: 0,
    maxDrawdown: 0,
    probability50Plus: 0,
  });
  
  const generatePath = (id: number): SimulationPath => {
    const path: number[] = [currentPrice];
    let price = currentPrice;
    const dt = 1 / 252; // Daily steps
    const numSteps = Math.floor(timeHorizon * 252);
    
    for (let i = 0; i < numSteps; i++) {
      const epsilon = Math.random() * 2 - 1;
      const normalRandom = epsilon * Math.sqrt(3); // Approximation
      const change = price * (drift * dt + volatility * Math.sqrt(dt) * normalRandom);
      price = Math.max(0.01, price + change);
      
      if (i % 5 === 0) { // Sample every 5 days for performance
        path.push(price);
      }
    }
    
    const finalPrice = price;
    
    // Color based on performance
    let color;
    const performance = (finalPrice - currentPrice) / currentPrice;
    if (performance > 0.5) {
      color = "#22c55e"; // Green
    } else if (performance > 0) {
      color = "#3b82f6"; // Blue
    } else if (performance > -0.5) {
      color = "#f59e0b"; // Orange
    } else {
      color = "#ef4444"; // Red
    }
    
    return {
      id,
      path,
      finalPrice,
      color,
      opacity: 0.1,
    };
  };
  
  const runSimulations = () => {
    const newPaths: SimulationPath[] = [];
    const batchSize = 50;
    let completed = 0;
    
    const generateBatch = () => {
      for (let i = 0; i < batchSize && completed < numSimulations[0]; i++) {
        newPaths.push(generatePath(completed));
        completed++;
      }
      
      setPaths([...newPaths]);
      setProgress((completed / numSimulations[0]) * 100);
      
      // Calculate statistics
      if (completed === numSimulations[0]) {
        const finalPrices = newPaths.map(p => p.finalPrice).sort((a, b) => a - b);
        const mean = finalPrices.reduce((a, b) => a + b, 0) / finalPrices.length;
        const median = finalPrices[Math.floor(finalPrices.length / 2)];
        const percentile5 = finalPrices[Math.floor(finalPrices.length * 0.05)];
        const percentile95 = finalPrices[Math.floor(finalPrices.length * 0.95)];
        const var95 = percentile5;
        
        // Calculate max drawdown
        let maxDrawdown = 0;
        newPaths.forEach(p => {
          let peak = p.path[0];
          p.path.forEach(price => {
            peak = Math.max(peak, price);
            const drawdown = (peak - price) / peak;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
          });
        });
        
        const probability50Plus = finalPrices.filter(p => p > currentPrice * 1.5).length / finalPrices.length;
        
        setStatistics({
          mean,
          median,
          percentile5,
          percentile95,
          var95,
          maxDrawdown: maxDrawdown * 100,
          probability50Plus: probability50Plus * 100,
        });
        
        setIsRunning(false);
      } else if (isRunning) {
        animationRef.current = requestAnimationFrame(generateBatch);
      }
    };
    
    generateBatch();
  };
  
  const drawPaths = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 12; i++) {
      const x = (canvas.width / 12) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Scale factors
    const priceMin = currentPrice * 0.2;
    const priceMax = currentPrice * 3;
    const priceRange = priceMax - priceMin;
    
    // Draw paths
    paths.forEach(simPath => {
      ctx.strokeStyle = simPath.color;
      ctx.globalAlpha = selectedPath?.id === simPath.id ? 1 : simPath.opacity;
      ctx.lineWidth = selectedPath?.id === simPath.id ? 3 : 1;
      
      ctx.beginPath();
      simPath.path.forEach((price, i) => {
        const x = (i / (simPath.path.length - 1)) * canvas.width;
        const y = canvas.height - ((price - priceMin) / priceRange) * canvas.height;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
    
    // Draw current price line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const currentY = canvas.height - ((currentPrice - priceMin) / priceRange) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(canvas.width, currentY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw percentile bands
    if (statistics.percentile5 > 0 && statistics.percentile95 > 0) {
      const p5Y = canvas.height - ((statistics.percentile5 - priceMin) / priceRange) * canvas.height;
      const p95Y = canvas.height - ((statistics.percentile95 - priceMin) / priceRange) * canvas.height;
      
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.fillRect(0, p95Y, canvas.width, p5Y - p95Y);
      
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, p5Y);
      ctx.lineTo(canvas.width, p5Y);
      ctx.moveTo(0, p95Y);
      ctx.lineTo(canvas.width, p95Y);
      ctx.stroke();
    }
  };
  
  useEffect(() => {
    drawPaths();
  }, [paths, selectedPath]);
  
  const handleStart = () => {
    setIsRunning(true);
    setPaths([]);
    setProgress(0);
    runSimulations();
  };
  
  const handleStop = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  const handleReset = () => {
    handleStop();
    setPaths([]);
    setProgress(0);
    setStatistics({
      mean: 0,
      median: 0,
      percentile5: 0,
      percentile95: 0,
      var95: 0,
      maxDrawdown: 0,
      probability50Plus: 0,
    });
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find nearest path
    let nearestPath: SimulationPath | null = null;
    let minDistance = Infinity;
    
    paths.forEach(path => {
      const index = Math.floor((x / canvas.width) * (path.path.length - 1));
      if (index >= 0 && index < path.path.length) {
        const priceMin = currentPrice * 0.2;
        const priceMax = currentPrice * 3;
        const priceRange = priceMax - priceMin;
        const pathY = canvas.height - ((path.path[index] - priceMin) / priceRange) * canvas.height;
        const distance = Math.abs(y - pathY);
        
        if (distance < minDistance && distance < 20) {
          minDistance = distance;
          nearestPath = path;
        }
      }
    });
    
    setSelectedPath(nearestPath);
  };
  
  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-400" />
              Advanced Monte Carlo Visualization
            </h3>
            <p className="text-sm text-gray-400 mt-1">Interactive path exploration with real-time statistics</p>
          </div>
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            {numSimulations[0]} Simulations
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full border border-slate-700 rounded-lg bg-black/50 cursor-crosshair"
                onClick={handleCanvasClick}
                style={{ maxHeight: "500px" }}
              />
              
              {isRunning && (
                <div className="absolute top-4 right-4 bg-black/80 rounded-lg px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="text-sm text-white">Simulating...</span>
                  </div>
                </div>
              )}
              
              {selectedPath && (
                <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs space-y-1">
                    <div className="text-white">Selected Path #{selectedPath.id}</div>
                    <div className="text-gray-300">
                      Final: ${selectedPath.finalPrice.toFixed(2)}
                    </div>
                    <div className={`font-semibold ${
                      selectedPath.finalPrice > currentPrice ? "text-green-400" : "text-red-400"
                    }`}>
                      {((selectedPath.finalPrice - currentPrice) / currentPrice * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {progress > 0 && progress < 100 && (
              <Progress value={progress} className="mt-2" />
            )}
          </div>
          
          {/* Controls and Statistics */}
          <div className="space-y-4">
            {/* Controls */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Simulation Controls</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Simulations: {numSimulations[0].toLocaleString()}
                  </label>
                  <Slider
                    value={numSimulations}
                    onValueChange={setNumSimulations}
                    min={100}
                    max={10000}
                    step={100}
                    disabled={isRunning}
                    className="mb-2"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Animation Speed: {speed[0]}%
                  </label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    className="mb-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                ) : (
                  <Button
                    onClick={handleStop}
                    size="sm"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
                
                <Button
                  onClick={handleReset}
                  size="sm"
                  variant="outline"
                  className="border-slate-600 hover:bg-slate-800"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Statistics</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mean Price:</span>
                  <span className="text-white font-semibold">
                    ${statistics.mean.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Median Price:</span>
                  <span className="text-white font-semibold">
                    ${statistics.median.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">5th Percentile:</span>
                  <span className="text-red-400 font-semibold">
                    ${statistics.percentile5.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">95th Percentile:</span>
                  <span className="text-green-400 font-semibold">
                    ${statistics.percentile95.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">VaR (95%):</span>
                  <span className="text-orange-400 font-semibold">
                    ${statistics.var95.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown:</span>
                  <span className="text-red-400 font-semibold">
                    {statistics.maxDrawdown.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">P({'>'}50% gain):</span>
                  <span className="text-blue-400 font-semibold">
                    {statistics.probability50Plus.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Path Colors</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-300">Strong gain ({'>'}50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-300">Moderate gain (0-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-300">Moderate loss (0 to -50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-300">Severe loss ({'>'}-50%)</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-3">
                Click on any path to highlight and view details
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}