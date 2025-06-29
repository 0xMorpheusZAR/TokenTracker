import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface SpiralPoint {
  x: number;
  y: number;
  price: number;
  supply: number;
  time: number;
}

export function EconomicDeathSpiral() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [initialFloat, setInitialFloat] = useState([13]);
  const [unlockRate, setUnlockRate] = useState([5]);
  const [sellPressure, setSellPressure] = useState([75]);
  
  const generateSpiralData = (): SpiralPoint[] => {
    const points: SpiralPoint[] = [];
    const totalTime = 365; // days
    let price = 100;
    let circulatingSupply = initialFloat[0];
    
    for (let t = 0; t <= totalTime; t++) {
      // Economic model: price impact from supply increase
      const dailyUnlock = t > 30 ? unlockRate[0] / 30 : 0; // Unlocks start after 30 days
      const sellingPercentage = sellPressure[0] / 100;
      const priceImpact = dailyUnlock * sellingPercentage * 0.1; // 10% price impact per 1% sold
      
      price = Math.max(5, price * (1 - priceImpact));
      circulatingSupply = Math.min(100, circulatingSupply + dailyUnlock);
      
      // Convert to spiral coordinates
      const radius = (100 - price) * 3;
      const angle = t * 0.1;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      points.push({ x, y, price, supply: circulatingSupply, time: t });
    }
    
    return points;
  };
  
  const [spiralData] = useState<SpiralPoint[]>(generateSpiralData());
  
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw spiral up to current time
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < spiralData.length && spiralData[i].time <= currentTime; i++) {
      const point = spiralData[i];
      const x = centerX + point.x;
      const y = centerY + point.y;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Color gradient based on price decline
        const priceRatio = point.price / 100;
        const red = 239;
        const green = Math.floor(68 + (255 - 68) * priceRatio);
        const blue = Math.floor(68 + (255 - 68) * priceRatio);
        ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
      
      // Draw point
      if (i % 10 === 0) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.stroke();
    
    // Update time
    if (isPlaying && currentTime < 365) {
      setCurrentTime(prev => Math.min(365, prev + 2));
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  useEffect(() => {
    if (isPlaying) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime]);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const reset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  const currentData = spiralData.find(d => d.time >= currentTime) || spiralData[spiralData.length - 1];
  
  return (
    <Card className="bg-slate-900/80 border-slate-700/50 p-6">
      <h3 className="text-2xl font-bold text-white mb-6">Interactive Economic Death Spiral</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full border border-slate-700 rounded-lg bg-black/50"
          />
          
          <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-sm space-y-1">
              <div className="text-red-400">Day: {Math.floor(currentTime)}</div>
              <div className="text-orange-400">Price: ${currentData.price.toFixed(2)}</div>
              <div className="text-yellow-400">Float: {currentData.supply.toFixed(1)}%</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Economic Parameters</h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Initial Float: {initialFloat[0]}%
                </label>
                <Slider
                  value={initialFloat}
                  onValueChange={setInitialFloat}
                  min={5}
                  max={30}
                  step={1}
                  className="mb-4"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Monthly Unlock Rate: {unlockRate[0]}%
                </label>
                <Slider
                  value={unlockRate}
                  onValueChange={setUnlockRate}
                  min={1}
                  max={15}
                  step={0.5}
                  className="mb-4"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Unlock Sell Pressure: {sellPressure[0]}%
                </label>
                <Slider
                  value={sellPressure}
                  onValueChange={setSellPressure}
                  min={25}
                  max={100}
                  step={5}
                  className="mb-4"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={togglePlay}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            
            <Button
              onClick={reset}
              variant="outline"
              className="border-slate-600 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <h5 className="text-sm font-semibold text-red-400 mb-2">Economic Insights</h5>
            <p className="text-xs text-gray-300 leading-relaxed">
              The death spiral accelerates as unlock events create persistent sell pressure. 
              With {initialFloat[0]}% initial float and {unlockRate[0]}% monthly unlocks, 
              the token loses {(100 - currentData.price).toFixed(1)}% of its value by day {Math.floor(currentTime)}.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}