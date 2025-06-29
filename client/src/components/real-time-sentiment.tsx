import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Brain, Users, AlertTriangle } from "lucide-react";
import { Line } from "react-chartjs-2";

interface SentimentData {
  timestamp: number;
  overall: number;
  fear: number;
  greed: number;
  uncertainty: number;
}

export function RealTimeSentiment() {
  const [sentimentHistory, setSentimentHistory] = useState<SentimentData[]>([]);
  const [currentSentiment, setCurrentSentiment] = useState<SentimentData>({
    timestamp: Date.now(),
    overall: 25,
    fear: 75,
    greed: 20,
    uncertainty: 65,
  });
  
  // Simulate real-time sentiment updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSentiment(prev => {
        const marketCondition = Math.random();
        const volatility = Math.random() * 10;
        
        // Simulate market psychology based on failure analysis
        const newSentiment = {
          timestamp: Date.now(),
          overall: Math.max(0, Math.min(100, prev.overall + (Math.random() - 0.7) * volatility)),
          fear: Math.max(0, Math.min(100, prev.fear + (Math.random() - 0.3) * volatility)),
          greed: Math.max(0, Math.min(100, prev.greed + (Math.random() - 0.8) * volatility)),
          uncertainty: Math.max(0, Math.min(100, prev.uncertainty + (Math.random() - 0.4) * volatility)),
        };
        
        setSentimentHistory(history => [...history.slice(-50), newSentiment]);
        return newSentiment;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getSentimentColor = (value: number) => {
    if (value < 25) return "#ef4444"; // Red - Extreme Fear
    if (value < 50) return "#f59e0b"; // Orange - Fear
    if (value < 75) return "#10b981"; // Green - Neutral to Greed
    return "#22c55e"; // Bright Green - Extreme Greed
  };
  
  const getSentimentLabel = (value: number) => {
    if (value < 25) return "Extreme Fear";
    if (value < 50) return "Fear";
    if (value < 75) return "Greed";
    return "Extreme Greed";
  };
  
  const chartData = {
    labels: sentimentHistory.slice(-20).map(() => ""),
    datasets: [
      {
        label: "Market Sentiment",
        data: sentimentHistory.slice(-20).map(s => s.overall),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Fear Index",
        data: sentimentHistory.slice(-20).map(s => s.fear),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: "#94a3b8",
          stepSize: 25,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
      },
    },
  };
  
  const psychologyIndicators = [
    {
      label: "FOMO Level",
      value: Math.max(0, 100 - currentSentiment.fear),
      icon: TrendingUp,
      description: "Fear of Missing Out",
    },
    {
      label: "Panic Selling",
      value: currentSentiment.fear,
      icon: TrendingDown,
      description: "Market Capitulation Risk",
    },
    {
      label: "Herd Mentality",
      value: currentSentiment.uncertainty,
      icon: Users,
      description: "Following the Crowd",
    },
    {
      label: "Risk Awareness",
      value: 100 - currentSentiment.greed,
      icon: AlertTriangle,
      description: "Market Vigilance",
    },
  ];
  
  return (
    <Card className="bg-slate-900/80 border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            Market Psychology Analysis
          </h3>
          <p className="text-sm text-gray-400 mt-1">Real-time behavioral sentiment indicators</p>
        </div>
        <Badge
          variant="outline"
          className="animate-pulse"
          style={{
            borderColor: getSentimentColor(currentSentiment.overall),
            color: getSentimentColor(currentSentiment.overall),
          }}
        >
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>
      
      {/* Main Sentiment Gauge */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-white">Overall Market Sentiment</span>
          <span
            className="text-2xl font-bold"
            style={{ color: getSentimentColor(currentSentiment.overall) }}
          >
            {currentSentiment.overall.toFixed(0)}
          </span>
        </div>
        <Progress
          value={currentSentiment.overall}
          className="h-4"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #10b981 75%, #22c55e 100%)`,
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Extreme Fear</span>
          <span className="font-semibold" style={{ color: getSentimentColor(currentSentiment.overall) }}>
            {getSentimentLabel(currentSentiment.overall)}
          </span>
          <span>Extreme Greed</span>
        </div>
      </div>
      
      {/* Psychology Indicators Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {psychologyIndicators.map((indicator) => (
          <div
            key={indicator.label}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <indicator.icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-white">
                {indicator.value.toFixed(0)}%
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-300">{indicator.label}</h4>
            <p className="text-xs text-gray-500 mt-1">{indicator.description}</p>
            <Progress value={indicator.value} className="h-1 mt-2" />
          </div>
        ))}
      </div>
      
      {/* Live Chart */}
      <div className="h-48 mb-4">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      {/* Market Psychology Insights */}
      <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
        <h4 className="text-sm font-semibold text-red-400 mb-2">Behavioral Analysis</h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          Current market shows {currentSentiment.fear > 70 ? "extreme" : "high"} fear levels 
          at {currentSentiment.fear.toFixed(0)}%, indicating potential capitulation. 
          Low float tokenomics exploit this psychology by creating artificial scarcity 
          during high FOMO periods ({(100 - currentSentiment.fear).toFixed(0)}%).
        </p>
      </div>
    </Card>
  );
}