import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
  ComposedChart, Scatter, ScatterChart, ZAxis, ReferenceLine, ReferenceArea, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, PieChart as PieChartIcon,
  BarChart3, AlertCircle, Info, Calendar, Zap, Target, Shield, Bitcoin,
  ArrowUpRight, ArrowDownRight, Clock, Rocket, ChevronDown, ChevronUp,
  Eye, EyeOff, Moon, Sun, Wind, Flame, Snowflake, Sparkles, Timer,
  RefreshCw, Globe, TrendingUpIcon, Gauge, Waves, AlertTriangle,
  Crown, Trophy, Star, Heart, Lightbulb, BookOpen, Layers, Filter,
  CircleDot, Crosshair, Navigation
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

// TradingView Widget Component
const TradingViewWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
      script.type = 'text/javascript';
      script.async = true;
      
      script.innerHTML = JSON.stringify({
        "symbol": "CRYPTOCAP:BTC.D",
        "width": "100%",
        "height": 90,
        "colorTheme": "dark",
        "isTransparent": false,
        "locale": "en",
        "largeChartUrl": ""
      });

      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg blur-xl"></div>
      <div className="relative bg-gray-900/50 rounded-lg border border-orange-700/30 overflow-hidden backdrop-blur-sm">
        <div className="tradingview-widget-container p-4" ref={containerRef}>
          <div className="tradingview-widget-container__widget"></div>
        </div>
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Live from TradingView</span>
          </div>
          <Bitcoin className="w-4 h-4 text-orange-400/50" />
        </div>
      </div>
    </div>
  );
};

// Enhanced Helper functions
const formatNumber = (num: number) => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPercentage = (num: number) => {
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const formatCompactNumber = (num: number) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(0);
};

// Market sentiment colors
const getSentimentColor = (value: number) => {
  if (value >= 75) return 'text-green-400';
  if (value >= 50) return 'text-yellow-400';
  if (value >= 25) return 'text-orange-400';
  return 'text-red-400';
};

// Advanced gradient backgrounds
const gradients = {
  altseason: 'from-purple-600 via-pink-500 to-red-500',
  neutral: 'from-blue-600 via-indigo-500 to-purple-500',
  bearish: 'from-gray-600 via-slate-500 to-zinc-500',
};

// Enhanced Custom Tooltips
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
        className="bg-gray-900/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-700"
      >
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-4">
            <span className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-sm font-bold text-white">
              {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

const PercentageTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-xl shadow-2xl border border-gray-600"
      >
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium text-gray-300">{entry.name}:</span>
            <span className={cn("text-sm font-bold", entry.value > 0 ? "text-green-400" : "text-red-400")}>
              {formatPercentage(entry.value)}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }: { 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef(Date.now());
  const animationDuration = 1000; // 1 second

  useEffect(() => {
    startTime.current = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime.current) / animationDuration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(value * easeOutQuart);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="text-white">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

export default function AltseasonDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'analysis' | 'education'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);

  // Fetch altseason metrics with enhanced error handling
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['/api/altseason/metrics'],
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch ETH/BTC ratio data
  const { data: ethBtcData, isLoading: ethBtcLoading } = useQuery({
    queryKey: ['/api/altseason/eth-btc-ratio'],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Fetch OTHERS/BTC ratio data
  const { data: othersBtcData, isLoading: othersBtcLoading } = useQuery({
    queryKey: ['/api/altseason/others-btc-ratio'],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Fetch altcoins performance
  const { data: performance, isLoading: perfLoading } = useQuery({
    queryKey: ['/api/altseason/altcoins-performance', selectedTimeframe],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Fetch historical patterns
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['/api/altseason/historical-patterns'],
    refetchInterval: autoRefresh ? 300000 : false,
  });

  // Fetch market cap breakdown
  const { data: marketCapData, isLoading: marketCapLoading } = useQuery({
    queryKey: ['/api/altseason/market-cap-breakdown'],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Calculate derived metrics
  const marketMomentum = metrics ? {
    score: (metrics.altseasonIndex / 100) * 40 + 
           (100 - metrics.bitcoinDominance) * 0.6,
    trend: metrics.altseasonIndex > 60 ? 'bullish' : 
           metrics.altseasonIndex > 40 ? 'neutral' : 'bearish'
  } : null;

  // Enhanced chart data preparation
  const altseasonIndexData = [{
    name: 'Altseason Index',
    value: metrics?.altseasonIndex || 0,
    fullMark: 100,
    fill: metrics?.altseasonIndex >= 75 ? '#10B981' : 
          metrics?.altseasonIndex >= 50 ? '#F59E0B' : '#EF4444'
  }];

  const pieData = marketCapData ? [
    { name: 'Bitcoin', value: marketCapData.breakdown.bitcoin.percentage, color: '#F7931A' },
    { name: 'Ethereum', value: marketCapData.breakdown.ethereum.percentage, color: '#627EEA' },
    { name: 'Top 10 Alts', value: marketCapData.breakdown.top10Alts?.percentage || 15, color: '#8B5CF6' },
    { name: 'Other Altcoins', value: marketCapData.breakdown.otherAltcoins.percentage, color: '#10B981' }
  ] : [];

  // Enhanced ETH/BTC ratio data with moving averages
  const ethBtcChartData = ethBtcData?.historicalData?.map((point: any, index: number, array: any[]) => {
    const ma7 = index >= 6 ? 
      array.slice(index - 6, index + 1).reduce((sum, p) => sum + p.ratio, 0) / 7 : null;
    const ma30 = index >= 29 ? 
      array.slice(index - 29, index + 1).reduce((sum, p) => sum + p.ratio, 0) / 30 : null;
    
    return {
      date: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ratio: point.ratio,
      ma7,
      ma30
    };
  }) || [];

  // Enhanced OTHERS/BTC ratio data with moving averages
  const othersBtcChartData = othersBtcData?.historicalData?.map((point: any, index: number, array: any[]) => {
    const ma7 = index >= 6 ? 
      array.slice(index - 6, index + 1).reduce((sum, p) => sum + p.ratio, 0) / 7 : null;
    const ma30 = index >= 29 ? 
      array.slice(index - 29, index + 1).reduce((sum, p) => sum + p.ratio, 0) / 30 : null;
    
    return {
      date: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ratio: point.ratio,
      ma7,
      ma30
    };
  }) || [];

  // Get top performing altcoins with enhanced metrics
  const topPerformers = performance?.altcoins
    ?.sort((a: any, b: any) => b.performanceVsBtc[selectedTimeframe] - a.performanceVsBtc[selectedTimeframe])
    ?.slice(0, 10) || [];

  // Calculate altseason probability score
  const altseasonProbability = metrics ? {
    score: Math.min(100, 
      (metrics.altseasonIndex * 0.4) + 
      ((100 - metrics.bitcoinDominance) * 0.3) +
      (ethBtcData?.currentRatio > 0.07 ? 20 : 0) +
      (metrics.outperformingCount > 35 ? 10 : 0)
    ),
    factors: [
      { name: 'Altseason Index', value: metrics.altseasonIndex, weight: 40 },
      { name: 'BTC Dominance', value: 100 - metrics.bitcoinDominance, weight: 30 },
      { name: 'ETH/BTC Ratio', value: ethBtcData?.currentRatio > 0.07 ? 100 : 50, weight: 20 },
      { name: 'Outperformers', value: (metrics.outperformingCount / 49) * 100, weight: 10 }
    ]
  } : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-gradient-x">
                Altseason Analysis Dashboard
              </h1>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className="hidden sm:inline">Real-time tracking of altcoin season indicators and market dynamics</span>
                <span className="sm:hidden">Real-time altseason tracking</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "text-white border-gray-600 hover:bg-gray-700",
                  autoRefresh && "bg-green-900/20 border-green-700 text-green-400"
                )}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>

            </div>
          </div>

          {/* Enhanced Key Alert */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className={cn(
                  "mb-6 border backdrop-blur-md",
                  metrics?.isAltseason 
                    ? "bg-green-900/20 border-green-700" 
                    : "bg-orange-900/20 border-orange-700"
                )}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-lg font-semibold text-white">
                    {metrics?.isAltseason ? "🚀 ALTSEASON ACTIVE!" : "⏳ Pre-Altseason Phase"}
                  </AlertTitle>
                  <AlertDescription className="mt-2 text-white">
                    {metrics?.isAltseason 
                      ? `${metrics.outperformingCount} out of top 50 altcoins (${metrics.altseasonIndex}%) are outperforming Bitcoin over the last 30 days. This officially qualifies as an altseason!`
                      : `Currently ${metrics?.outperformingCount || 0} out of top 50 altcoins (${metrics?.altseasonIndex || 0}%) are outperforming Bitcoin. We need 75% to officially enter altseason.`
                    }
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-full sm:max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">View</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Analysis</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Learn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Enhanced Altseason Index Gauge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-purple-600 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center text-sm sm:text-base">
                        <Gauge className="mr-1 sm:mr-2 text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
                        Altseason Index
                      </span>
                      <Badge className={cn(
                        "font-bold text-lg px-3 py-1",
                        metrics?.isAltseason 
                          ? "bg-green-600 text-white animate-pulse" 
                          : "bg-gray-600 text-gray-200"
                      )}>
                        <AnimatedCounter value={metrics?.altseasonIndex || 0} suffix="%" />
                      </Badge>
                    </CardTitle>
                    <CardDescription>75% threshold for official altseason</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={altseasonIndexData}>
                          <PolarGrid gridType="dots" radialLines={false} />
                          <RadialBar
                            dataKey="value"
                            cornerRadius={10}
                            fill={altseasonIndexData[0].fill}
                            background={{ fill: '#1F2937' }}
                          />
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold" fill="#FFFFFF">
                            {metrics?.altseasonIndex || 0}%
                          </text>
                          <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="text-sm" fill="#9CA3AF">
                            {metrics?.isAltseason ? 'Active' : 'Inactive'}
                          </text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Outperforming BTC:</span>
                        <span className="font-medium text-purple-400">{metrics?.outperformingCount || 0}/50 coins</span>
                      </div>
                      <Progress 
                        value={metrics?.altseasonIndex || 0} 
                        className="h-2 mt-3"
                        indicatorClassName={metrics?.altseasonIndex >= 75 ? "bg-green-500" : "bg-purple-500"}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Bitcoin Dominance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-orange-600 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center text-sm sm:text-base">
                        <Bitcoin className="mr-1 sm:mr-2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                        Bitcoin Dominance
                      </span>
                      <HoverCard>
                        <HoverCardTrigger>
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 bg-gray-900/95 border-gray-700">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-white">Bitcoin Dominance Explained</h4>
                            <p className="text-xs text-gray-400">
                              Bitcoin dominance represents BTC's percentage of the total crypto market cap. Lower dominance often indicates capital flowing into altcoins, a key altseason signal.
                            </p>
                            <div className="pt-2 border-t border-gray-700">
                              <p className="text-xs font-medium text-white">Key Levels:</p>
                              <ul className="text-xs text-gray-400 mt-1 space-y-1">
                                <li>• Above 65%: Strong BTC dominance</li>
                                <li>• 55-65%: Balanced market</li>
                                <li>• Below 55%: Altcoin strength</li>
                              </ul>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </CardTitle>
                    <CardDescription>Market share of total crypto market cap</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* TradingView BTC.D Widget */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TradingViewWidget />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Market Cap Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-green-600 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <PieChartIcon className="mr-1 sm:mr-2 text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Market Cap Distribution</span>
                    </CardTitle>
                    <CardDescription>Current market share breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-gray-900/95 p-3 rounded-lg shadow-lg border border-gray-700">
                                  <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
                                    {payload[0].name}
                                  </p>
                                  <p className="text-sm font-bold text-white">
                                    {payload[0].value?.toFixed(1)}%
                                  </p>
                                  {marketCapData && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatNumber(marketCapData.totalMarketCap * (payload[0].value / 100))}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      <AnimatePresence>
                        {pieData.map((entry, index) => (
                          <motion.div
                            key={entry.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-700/30 transition-colors"
                          >
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-gray-400">{entry.name}</span>
                            </div>
                            <span className="font-medium text-white">{entry.value.toFixed(1)}%</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ETH/BTC Ratio Chart */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 lg:mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-indigo-600 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center">
                        <Target className="mr-2 text-indigo-400" />
                        <span className="text-base sm:text-lg">ETH/BTC Ratio - Key Altseason Indicator</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-bold text-white">
                            <AnimatedCounter value={ethBtcData?.currentRatio || 0} decimals={4} />
                          </p>
                          <p className="text-xs text-gray-400">Current Ratio</p>
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Historical ETH/BTC price ratio movement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={ethBtcChartData}>
                        <defs>
                          <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="resistanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3}/>
                            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05}/>
                          </linearGradient>
                          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="10" height="10">
                            <path d="M0,10 l10,-10 M-2.5,2.5 l5,-5 M7.5,12.5 l5,-5" stroke="#EF4444" strokeWidth="0.5" opacity="0.2"/>
                          </pattern>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#374151" 
                          opacity={0.1}
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="date" 
                          stroke="transparent"
                          axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                          tick={{ 
                            fontSize: 11, 
                            fill: '#9CA3AF',
                            fontWeight: 500
                          }}
                          tickLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                          dy={10}
                        />
                        <YAxis 
                          stroke="transparent"
                          axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                          tick={{ 
                            fontSize: 11, 
                            fill: '#9CA3AF',
                            fontWeight: 500
                          }}
                          tickLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                          domain={[0.025, 0.040]}
                          ticks={[0.025, 0.030, 0.032, 0.035, 0.040]}
                          tickFormatter={(value) => value.toFixed(3)}
                          dx={-10}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        
                        {/* Resistance Zones */}
                        <ReferenceArea 
                          y1={0.032} 
                          y2={0.0325}
                          fill="url(#resistanceGradient)"
                          strokeOpacity={0}
                          label={{
                            value: "Immediate Resistance",
                            position: "right",
                            style: { 
                              fill: "#EF4444", 
                              fontSize: 11, 
                              fontWeight: 600,
                              textShadow: "0 0 4px rgba(0,0,0,0.8)"
                            }
                          }}
                        />
                        <ReferenceArea 
                          y1={0.035} 
                          y2={0.036}
                          fill="url(#diagonalHatch)"
                          fillOpacity={0.5}
                          strokeOpacity={0}
                          label={{
                            value: "Major HTF Resistance",
                            position: "right",
                            style: { 
                              fill: "#F59E0B", 
                              fontSize: 11, 
                              fontWeight: 600,
                              textShadow: "0 0 4px rgba(0,0,0,0.8)"
                            }
                          }}
                        />
                        
                        {/* Current Price Indicator */}
                        <ReferenceLine 
                          y={ethBtcData?.currentRatio || 0.0317}
                          stroke="#10B981"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                        
                        <Area 
                          type="monotone" 
                          dataKey="ratio" 
                          stroke="#6366F1"
                          fillOpacity={1}
                          fill="url(#colorRatio)"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ma7" 
                          stroke="#10B981"
                          strokeWidth={1}
                          dot={false}
                          name="7D MA"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ma30" 
                          stroke="#F59E0B"
                          strokeWidth={1}
                          dot={false}
                          name="30D MA"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* OTHERS/BTC Ratio Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-indigo-600 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center">
                        <Activity className="mr-2 text-indigo-400" />
                        <span className="text-sm sm:text-base">OTHERS/BTC Ratio - Total Altcoin Market Cap vs Bitcoin</span>
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 border-gray-700 max-w-xs text-gray-200">
                            <p>The OTHERS/BTC ratio compares the total market cap of all altcoins (excluding Bitcoin) to Bitcoin's market cap. A rising ratio indicates altcoins are gaining dominance.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Current Ratio</p>
                          <p className="text-2xl font-bold text-indigo-400">
                            {othersBtcData?.currentRatio?.toFixed(3) || '0.000'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Bitcoin Dominance</p>
                          <p className="text-lg font-semibold text-orange-400">
                            {othersBtcData?.btcDominance?.toFixed(1) || '0.0'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Market Status</p>
                          <p className={cn(
                            "text-lg font-semibold",
                            othersBtcData?.currentRatio > 1.2 ? "text-green-400" :
                            othersBtcData?.currentRatio > 1.0 ? "text-yellow-400" :
                            othersBtcData?.currentRatio > 0.8 ? "text-orange-400" : "text-red-400"
                          )}>
                            {othersBtcData?.currentRatio > 1.2 ? "Strong Altseason" :
                             othersBtcData?.currentRatio > 1.0 ? "Altseason Starting" :
                             othersBtcData?.currentRatio > 0.8 ? "Neutral" : "BTC Dominant"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={othersBtcChartData}>
                        <defs>
                          <linearGradient id="colorOthersRatio" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#E5E7EB' }}
                          itemStyle={{ color: '#E5E7EB' }}
                        />
                        
                        {/* Critical Level Lines */}
                        <ReferenceLine 
                          y={1.5} 
                          stroke="#10B981" 
                          strokeDasharray="5 5"
                          label={{ 
                            value: "Extreme Greed (1.5)",
                            position: "right",
                            style: { fill: "#10B981", fontSize: 12 }
                          }}
                        />
                        <ReferenceLine 
                          y={1.2} 
                          stroke="#F59E0B" 
                          strokeDasharray="5 5"
                          label={{ 
                            value: "Strong Altseason (1.2)",
                            position: "right",
                            style: { fill: "#F59E0B", fontSize: 12 }
                          }}
                        />
                        <ReferenceLine 
                          y={1.0} 
                          stroke="#6366F1" 
                          strokeDasharray="5 5"
                          label={{ 
                            value: "Equilibrium (1.0)",
                            position: "right",
                            style: { fill: "#6366F1", fontSize: 12 }
                          }}
                        />
                        <ReferenceLine 
                          y={0.6} 
                          stroke="#EF4444" 
                          strokeDasharray="5 5"
                          label={{ 
                            value: "BTC Dominance (0.6)",
                            position: "right",
                            style: { fill: "#EF4444", fontSize: 12 }
                          }}
                        />
                        
                        {/* Current Ratio Indicator */}
                        <ReferenceLine 
                          y={othersBtcData?.currentRatio || 0.95}
                          stroke="#8B5CF6"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                        
                        <Area 
                          type="monotone" 
                          dataKey="ratio" 
                          stroke="#8B5CF6"
                          fillOpacity={1}
                          fill="url(#colorOthersRatio)"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ma7" 
                          stroke="#10B981"
                          strokeWidth={1}
                          dot={false}
                          name="7D MA"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ma30" 
                          stroke="#F59E0B"
                          strokeWidth={1}
                          dot={false}
                          name="30D MA"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-6">
            <div className="space-y-6">
              {/* Top Altcoins Performance */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-yellow-600 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center">
                      <Rocket className="mr-2 text-yellow-400" />
                      <span className="text-sm sm:text-base">Top Altcoins vs Bitcoin Performance</span>
                    </span>
                    <div className="flex gap-2">
                      {['7d', '30d', '90d'].map(tf => (
                        <Button
                          key={tf}
                          variant={selectedTimeframe === tf ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeframe(tf)}
                          className={cn(
                            "font-bold px-4 py-2 transition-all duration-300",
                            selectedTimeframe === tf 
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25 text-white" 
                              : "bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-purple-500 text-gray-100"
                          )}
                          style={{ color: selectedTimeframe === tf ? '#ffffff' : '#f3f4f6' }}
                        >
                          <span className="font-bold">{tf.toUpperCase()}</span>
                        </Button>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {topPerformers.map((coin: any, index: number) => (
                        <motion.div
                          key={coin.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={cn(
                            "p-4 rounded-xl transition-all duration-300 cursor-pointer",
                            "bg-gradient-to-br from-gray-800/50 to-gray-900/50",
                            "border border-gray-700/50 hover:border-purple-500/50",
                            "hover:shadow-xl hover:shadow-purple-500/10",
                            coin.performanceVsBtc[selectedTimeframe] > 20 && "ring-2 ring-green-500/30 bg-gradient-to-br from-green-900/20 to-gray-900/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50"></div>
                                <img 
                                  src={coin.image} 
                                  alt={coin.name} 
                                  className="w-12 h-12 rounded-full relative z-10 ring-2 ring-gray-700"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-2 py-0.5 text-xs font-bold shadow-lg z-20">
                                  #{index + 1}
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold flex items-center text-white">
                                  {coin.name} 
                                  <span className="text-gray-400 text-sm ml-2">
                                    {coin.symbol.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400">
                                  ${coin.currentPrice.toFixed(coin.currentPrice < 1 ? 6 : 2)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                "text-xl font-bold flex items-center justify-end",
                                coin.performanceVsBtc[selectedTimeframe] > 0 ? "text-green-400" : "text-red-400"
                              )}>
                                {coin.performanceVsBtc[selectedTimeframe] > 0 ? 
                                  <TrendingUp className="w-5 h-5 mr-1" /> : 
                                  <TrendingDown className="w-5 h-5 mr-1" />
                                }
                                {formatPercentage(coin.performanceVsBtc[selectedTimeframe])}
                              </div>
                              <div className="text-xs text-gray-400 font-medium mt-1">
                                Outperformance vs BTC
                              </div>
                            </div>
                          </div>
                          
                          {/* Performance Metrics */}
                          <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">{selectedTimeframe.toUpperCase()} Price Change</span>
                              <div className={cn(
                                "text-sm font-bold",
                                coin.priceChange[selectedTimeframe] > 0 ? "text-green-400" : "text-red-400"
                              )}>
                                {formatPercentage(coin.priceChange[selectedTimeframe])}
                              </div>
                            </div>
                          </div>
                          
                          {/* Market Stats */}
                          <div className="mt-3 flex justify-between text-xs">
                            <div>
                              <span className="text-gray-500">Market Cap</span>
                              <div className="font-medium text-gray-300">{formatNumber(coin.marketCap)}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-500">24h Volume</span>
                              <div className="font-medium text-gray-300">{formatNumber(coin.volume24h)}</div>
                            </div>
                          </div>
                          
                          {/* Outperformance Indicator */}
                          {coin.performanceVsBtc[selectedTimeframe] > 20 && (
                            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5 flex items-center justify-center">
                              <Star className="w-4 h-4 text-green-400 mr-1" />
                              <span className="text-xs font-medium text-green-400">Strong Outperformer</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* What is Altseason? */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Lightbulb className="mr-2 text-yellow-400" />
                    <span className="text-sm sm:text-base">What is Altseason?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">
                    Altseason is a period in the cryptocurrency market cycle when altcoins (alternatives to Bitcoin) significantly outperform Bitcoin.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-700/30 rounded-lg">
                      <h4 className="font-semibold text-purple-400 mb-1">Key Characteristics</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Bitcoin dominance drops below 65%</li>
                        <li>• 75% of top altcoins outperform BTC</li>
                        <li>• Capital rotation from BTC to alts</li>
                        <li>• Increased retail investor activity</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-gray-700/30 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-1">Historical Patterns</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Typically follows Bitcoin rallies</li>
                        <li>• Lasts 2-3 months on average</li>
                        <li>• Most common: Q1 and Q4</li>
                        <li>• Can see 5-10x gains in alts</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Strategy Guide */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="mr-2 text-cyan-400" />
                    Altseason Trading Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-700/30 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-2">Entry Signals</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• BTC dominance breaking key support</li>
                        <li>• ETH/BTC ratio above 0.065</li>
                        <li>• Volume flowing into mid-caps</li>
                        <li>• Social sentiment shifting to alts</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-gray-700/30 rounded-lg">
                      <h4 className="font-semibold text-yellow-400 mb-2">Risk Management</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Diversify across sectors</li>
                        <li>• Use position sizing (5-10%)</li>
                        <li>• Set stop losses at -15%</li>
                        <li>• Take profits in tranches</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-gray-700/30 rounded-lg">
                      <h4 className="font-semibold text-red-400 mb-2">Exit Signals</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Extreme greed (Fear & Greed &gt; 85)</li>
                        <li>• BTC dominance reversal</li>
                        <li>• Altseason Index &lt; 50%</li>
                        <li>• Macro bearish events</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Indicators */}
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Crosshair className="mr-2 text-indigo-400" />
                    Key Altseason Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-700"
                    >
                      <h4 className="font-semibold text-purple-400 mb-2">Altseason Index</h4>
                      <p className="text-sm text-gray-300">
                        Tracks what percentage of top 50 altcoins are outperforming Bitcoin over 30 days. 
                        Above 75% = Official Altseason.
                      </p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gradient-to-br from-orange-900/20 to-yellow-900/20 rounded-lg border border-orange-700"
                    >
                      <h4 className="font-semibold text-orange-400 mb-2">Bitcoin Dominance</h4>
                      <p className="text-sm text-gray-300">
                        BTC's share of total crypto market cap. Below 55% historically signals strong altcoin momentum.
                      </p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-lg border border-indigo-700"
                    >
                      <h4 className="font-semibold text-indigo-400 mb-2">ETH/BTC Ratio</h4>
                      <p className="text-sm text-gray-300">
                        Leading indicator for altseason. Breaking above 0.075 often precedes broader alt rallies.
                      </p>
                    </motion.div>
                  </div>
                  <Alert className="mt-6 bg-yellow-900/20 border-yellow-700">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Remember: Past performance doesn't guarantee future results. Always do your own research and never invest more than you can afford to lose.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="max-w-7xl mx-auto mt-12 text-center">
          <div className="text-gray-500 text-sm">
            <p>Data provided by CoinGecko Pro API • Updates every 30 seconds</p>
            <p className="mt-2">
              Created by{' '}
              <a 
                href="https://twitter.com/0xMorpheusXBT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                @0xMorpheusXBT
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
