import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
  ComposedChart, Scatter, ScatterChart, ZAxis, ReferenceLine, ReferenceArea, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Label
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, PieChart as PieChartIcon,
  BarChart3, AlertCircle, Info, Calendar, Zap, Target, Shield, Bitcoin,
  ArrowUpRight, ArrowDownRight, Clock, Rocket, ChevronDown, ChevronUp,
  Eye, EyeOff, Moon, Sun, Wind, Flame, Snowflake, Sparkles, Timer,
  RefreshCw, Globe, TrendingUpIcon, Gauge, Waves, AlertTriangle,
  Crown, Trophy, Star, Heart, Lightbulb, BookOpen, Layers, Filter,
  CircleDot, Crosshair, Navigation, Calculator
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import TradingViewAdvancedWidget from '@/components/TradingViewAdvancedWidget';



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
  const [selectedTimeframeEth, setSelectedTimeframeEth] = useState('30d');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'analysis' | 'education'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [tradingPairs, setTradingPairs] = useState<Record<string, any>>({});
  const [chartModalOpen, setChartModalOpen] = useState<Record<string, boolean>>({});

  // Fetch altseason metrics with enhanced error handling
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['/api/altseason/metrics'],
    refetchInterval: autoRefresh ? 5000 : false, // Update every 5 seconds for real-time ratio display
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch ETH/BTC ratio data
  const { data: ethBtcData, isLoading: ethBtcLoading } = useQuery({
    queryKey: ['/api/altseason/eth-btc-ratio'],
    refetchInterval: autoRefresh ? 5000 : false, // Update every 5 seconds for real-time ratio display
  });

  // Fetch OTHERS/BTC ratio data
  const { data: othersBtcData, isLoading: othersBtcLoading } = useQuery({
    queryKey: ['/api/altseason/others-btc-ratio'],
    refetchInterval: autoRefresh ? 5000 : false, // Update every 5 seconds for real-time ratio display
  });

  // Fetch OTHERS/ETH ratio data
  const { data: othersEthData, isLoading: othersEthLoading } = useQuery({
    queryKey: ['/api/altseason/others-eth-ratio'],
    refetchInterval: autoRefresh ? 5000 : false, // Update every 5 seconds for real-time ratio display
  });

  // Fetch altcoins performance vs Bitcoin
  const { data: performance, isLoading: perfLoading } = useQuery({
    queryKey: ['/api/altseason/altcoins-performance', selectedTimeframe],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Fetch altcoins performance vs Ethereum
  const { data: performanceEth, isLoading: perfEthLoading } = useQuery({
    queryKey: ['/api/altseason/altcoins-performance-eth', selectedTimeframeEth],
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

  // Calculate top ETH outperformers for 30-day period
  const topPerformersEth30d = performanceEth?.altcoins
    ?.filter(coin => coin.performanceVsEth?.["30d"] > 0)
    ?.sort((a, b) => (b.performanceVsEth?.["30d"] || 0) - (a.performanceVsEth?.["30d"] || 0))
    ?.slice(0, 10) || [];

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

  // Get top performing altcoins vs Bitcoin from performance API
  const topPerformers = useMemo(() => {
    if (!performance?.altcoins) return [];
    
    // Filter only coins that outperform BTC in the selected timeframe
    // and return top 50
    return performance.altcoins
      .filter(coin => coin.performanceVsBtc[selectedTimeframe] > 0)
      .slice(0, 50);
  }, [performance?.altcoins, selectedTimeframe]);

  // Get top performing altcoins vs Ethereum
  const topPerformersEth = useMemo(() => {
    if (!performanceEth?.altcoins) return [];
    
    // Return top performers sorted by performance vs ETH
    return performanceEth.altcoins
      .filter(coin => coin.performanceVsEth[selectedTimeframeEth] > 0)
      .slice(0, 50);
  }, [performanceEth?.altcoins, selectedTimeframeEth]);

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
            <Link href="/">
              <Button 
                variant="outline" 
                className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-white transition-all duration-200"
              >
                <ArrowDownRight className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
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
          <TabsList className="grid w-full grid-cols-4 max-w-full sm:max-w-lg mx-auto bg-gray-800/50 backdrop-blur-lg">
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
            <TabsTrigger value="montecarlo" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs sm:text-sm">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Monte Carlo</span>
              <span className="sm:hidden">MC</span>
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

              {/* Outperforming Altcoins Mini Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-emerald-600 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center text-sm sm:text-base">
                        <TrendingUp className="mr-1 sm:mr-2 text-emerald-400 w-4 h-4 sm:w-5 sm:h-5" />
                        Top Performers vs BTC
                      </span>
                      <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500">
                        {metrics?.outperformingCount || 0} coins
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>30-day outperformance leaders</span>
                      <span className="text-xs text-gray-500">
                        <RefreshCw className="w-3 h-3 inline-block mr-1 animate-spin" />
                        Live updates
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[340px] overflow-y-auto custom-scrollbar relative">
                      <div className="space-y-1 p-4">
                        {metrics?.outperformingCoins?.map((coin, index) => (
                          <motion.div
                            key={coin.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(index * 0.01, 0.2) }}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg transition-all duration-200",
                              "hover:bg-gray-700/30 hover:scale-[1.02]",
                              coin.outperformance > 50 ? "bg-green-600/10" : 
                              coin.outperformance > 20 ? "bg-emerald-600/10" : 
                              "bg-gray-700/20"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <img 
                                src={coin.image} 
                                alt={coin.symbol} 
                                className="w-6 h-6 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = `https://via.placeholder.com/24?text=${coin.symbol.charAt(0)}`;
                                }}
                              />
                              <div>
                                <p className="text-xs font-medium text-white">
                                  {coin.symbol.toUpperCase()}
                                  <span className="text-gray-400 ml-1">#{coin.rank}</span>
                                </p>
                                <p className="text-xs text-gray-400 truncate max-w-[100px]">{coin.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-sm font-bold",
                                coin.outperformance > 0 ? "text-emerald-400" : "text-red-400"
                              )}>
                                +{coin.outperformance.toFixed(1)}%
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>



              {/* Top Performers vs ETH */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-indigo-600 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center text-sm sm:text-base">
                        <TrendingUp className="mr-1 sm:mr-2 text-indigo-400 w-4 h-4 sm:w-5 sm:h-5" />
                        Top Performers vs ETH
                      </span>
                      <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500">
                        {topPerformersEth30d?.length || 0} coins
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center justify-between">
                      <span>30-day outperformance leaders</span>
                      <span className="text-xs text-gray-500">
                        <RefreshCw className="w-3 h-3 inline-block mr-1 animate-spin" />
                        Live updates
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[340px] overflow-y-auto custom-scrollbar relative">
                      <div className="space-y-1 p-4">
                        {topPerformersEth30d.map((coin, index) => (
                          <motion.div
                            key={coin.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(index * 0.01, 0.2) }}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg transition-all duration-200",
                              "hover:bg-gray-700/30 hover:scale-[1.02]",
                              coin.performanceVsEth?.["30d"] > 50 ? "bg-indigo-600/10" : 
                              coin.performanceVsEth?.["30d"] > 20 ? "bg-blue-600/10" : 
                              "bg-gray-700/20"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <img 
                                src={coin.image} 
                                alt={coin.symbol} 
                                className="w-6 h-6 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = `https://via.placeholder.com/24?text=${coin.symbol.charAt(0)}`;
                                }}
                              />
                              <div>
                                <p className="text-xs font-medium text-white">
                                  {coin.symbol.toUpperCase()}
                                  <span className="text-gray-400 ml-1">#{coin.rank}</span>
                                </p>
                                <p className="text-xs text-gray-400 truncate max-w-[100px]">{coin.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-sm font-bold",
                                coin.performanceVsEth?.["30d"] > 0 ? "text-indigo-400" : "text-red-400"
                              )}>
                                +{coin.performanceVsEth?.["30d"]?.toFixed(1)}%
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* BTC.D - Bitcoin Dominance Chart */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 lg:mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-orange-600 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Bitcoin className="mr-2 text-orange-500" />
                      <span className="text-sm sm:text-base">BTC.D - Key Altseason Indicator</span>
                    </CardTitle>
                    <CardDescription>
                      Historical BTC.d price ratio movement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* TradingView Widget for BTC.D */}
                    <div className="bg-gray-900/50 rounded-lg p-2" style={{ height: "700px", minWidth: "100%" }}>
                      <iframe
                        src={`https://s.tradingview.com/embed-widget/advanced-chart/?locale=en#%7B%22interval%22%3A%22D%22%2C%22timezone%22%3A%22Etc%2FUTC%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22locale%22%3A%22en%22%2C%22toolbar_bg%22%3A%22%23f1f3f6%22%2C%22enable_publishing%22%3Afalse%2C%22allow_symbol_change%22%3Atrue%2C%22save_image%22%3Atrue%2C%22hide_side_toolbar%22%3Afalse%2C%22support_host%22%3A%22https%3A%2F%2Fwww.tradingview.com%22%2C%22watchlist%22%3A%5B%5D%2C%22details%22%3Atrue%2C%22hotlist%22%3Atrue%2C%22calendar%22%3Atrue%2C%22show_popup_button%22%3Atrue%2C%22popup_width%22%3A%221200%22%2C%22popup_height%22%3A%22750%22%2C%22symbol%22%3A%22CRYPTOCAP%3ABTC.D%22%2C%22studies%22%3A%5B%22STD%3BMA%22%2C%22STD%3BRSI%22%5D%2C%22container_id%22%3A%22tradingview_btc_d%22%7D`}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          minWidth: "1000px",
                        }}
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ETH/BTC Ratio Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-6"
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-indigo-600 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Target className="mr-2 text-indigo-400" />
                      <span className="text-sm sm:text-base">ETH/BTC Ratio - Key Altseason Indicator</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* TradingView Widget for ETH/BTC */}
                    <div className="bg-gray-900/50 rounded-lg p-2" style={{ height: "700px", minWidth: "100%" }}>
                      <iframe
                        src={`https://s.tradingview.com/embed-widget/advanced-chart/?locale=en#%7B%22interval%22%3A%22D%22%2C%22timezone%22%3A%22Etc%2FUTC%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22locale%22%3A%22en%22%2C%22toolbar_bg%22%3A%22%23f1f3f6%22%2C%22enable_publishing%22%3Afalse%2C%22allow_symbol_change%22%3Atrue%2C%22save_image%22%3Atrue%2C%22hide_side_toolbar%22%3Afalse%2C%22support_host%22%3A%22https%3A%2F%2Fwww.tradingview.com%22%2C%22watchlist%22%3A%5B%5D%2C%22details%22%3Atrue%2C%22hotlist%22%3Atrue%2C%22calendar%22%3Atrue%2C%22show_popup_button%22%3Atrue%2C%22popup_width%22%3A%221200%22%2C%22popup_height%22%3A%22750%22%2C%22symbol%22%3A%22ETHBTC%22%2C%22studies%22%3A%5B%22STD%3BMA%22%2C%22STD%3BRSI%22%5D%2C%22container_id%22%3A%22tradingview_eth_btc%22%7D`}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          minWidth: "1000px",
                        }}
                        allowFullScreen
                      />
                    </div>
                    

                  </CardContent>
                </Card>
              </motion.div>

              {/* OTHERS/BTC Ratio Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6"
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-indigo-600 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center">
                        <Activity className="mr-2 text-indigo-400" />
                        <span className="text-sm sm:text-base">OTHERS/BTC Ratio - Key Alt Season Indicator</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 border-gray-700 max-w-xs text-gray-200">
                              <p>The OTHERS/BTC ratio compares the total market cap of all altcoins (excluding Bitcoin) to Bitcoin's market cap. When this ratio rises above 1.0, it means altcoins collectively have more market cap than Bitcoin.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    
                    {/* TradingView Widget for OTHERS/BTC */}
                    <div className="bg-gray-900/50 rounded-lg p-2" style={{ height: "700px", minWidth: "100%" }}>
                      <iframe
                        src={`https://s.tradingview.com/embed-widget/advanced-chart/?locale=en#%7B%22interval%22%3A%22D%22%2C%22timezone%22%3A%22Etc%2FUTC%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22locale%22%3A%22en%22%2C%22toolbar_bg%22%3A%22%23f1f3f6%22%2C%22enable_publishing%22%3Afalse%2C%22allow_symbol_change%22%3Atrue%2C%22save_image%22%3Atrue%2C%22hide_side_toolbar%22%3Afalse%2C%22support_host%22%3A%22https%3A%2F%2Fwww.tradingview.com%22%2C%22watchlist%22%3A%5B%5D%2C%22details%22%3Atrue%2C%22hotlist%22%3Atrue%2C%22calendar%22%3Atrue%2C%22show_popup_button%22%3Atrue%2C%22popup_width%22%3A%221200%22%2C%22popup_height%22%3A%22750%22%2C%22symbol%22%3A%22CRYPTOCAP%3AOTHERS%2FCRYPTOCAP%3ABTC%22%2C%22studies%22%3A%5B%22STD%3BMA%22%2C%22STD%3BRSI%22%5D%2C%22container_id%22%3A%22tradingview_others_btc%22%7D`}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          minWidth: "1000px",
                        }}
                        allowFullScreen
                      />
                    </div>
                    

                  </CardContent>
                </Card>
              </motion.div>

              {/* OTHERS/ETH Ratio Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6"
              >
                <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 hover:border-indigo-600 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center">
                        <Activity className="mr-2 text-purple-400" />
                        <span className="text-sm sm:text-base">OTHERS/ETH Ratio - Key Alt Season Indicator</span>
                      </span>
                      <div className="flex items-center gap-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900 border-gray-700 max-w-xs text-gray-200">
                              <p>The OTHERS/ETH ratio compares the total market cap of all altcoins (excluding Bitcoin) to Ethereum's market cap. When this ratio rises, it indicates smaller altcoins are outperforming Ethereum.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* TradingView Widget for OTHERS/ETH */}
                    <div className="bg-gray-900/50 rounded-lg p-2" style={{ height: "700px", minWidth: "100%", overflowX: "auto" }}>
                      <iframe
                        src={`https://s.tradingview.com/embed-widget/advanced-chart/?locale=en#%7B%22interval%22%3A%22D%22%2C%22timezone%22%3A%22Etc%2FUTC%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22locale%22%3A%22en%22%2C%22toolbar_bg%22%3A%22%23f1f3f6%22%2C%22enable_publishing%22%3Afalse%2C%22allow_symbol_change%22%3Atrue%2C%22save_image%22%3Atrue%2C%22hide_side_toolbar%22%3Afalse%2C%22support_host%22%3A%22https%3A%2F%2Fwww.tradingview.com%22%2C%22watchlist%22%3A%5B%5D%2C%22details%22%3Atrue%2C%22hotlist%22%3Atrue%2C%22calendar%22%3Atrue%2C%22show_popup_button%22%3Atrue%2C%22popup_width%22%3A%221200%22%2C%22popup_height%22%3A%22750%22%2C%22symbol%22%3A%22CRYPTOCAP%3AOTHERS%2FCRYPTOCAP%3AETH%22%2C%22studies%22%3A%5B%22STD%3BMA%22%2C%22STD%3BRSI%22%5D%2C%22container_id%22%3A%22tradingview_others_eth%22%7D`}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          minWidth: "1000px",
                        }}
                        allowFullScreen
                      />
                    </div>
                    

                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-6">
            {/* Sub-tabs for Bitcoin and Ethereum comparisons */}
            <Tabs defaultValue="bitcoin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700">
                <TabsTrigger 
                  value="bitcoin" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white font-bold"
                >
                  <Bitcoin className="w-4 h-4 mr-2" />
                  Top Altcoins vs Bitcoin
                </TabsTrigger>
                <TabsTrigger 
                  value="ethereum" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-bold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Top Altcoins vs Ethereum
                </TabsTrigger>
              </TabsList>

              {/* Bitcoin Comparison Tab */}
              <TabsContent value="bitcoin" className="mt-0">
                {/* Top Altcoins Performance vs Bitcoin */}
                <Card className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 shadow-2xl overflow-hidden">
                {/* Premium background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
                
                <CardHeader className="relative z-10">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                  
                  <CardTitle className="flex items-center justify-between text-white relative z-10">
                    <span className="flex items-center">
                      <div className="relative mr-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 blur-xl opacity-70"></div>
                        <div className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 p-2 rounded-lg border border-yellow-500/30">
                          <Rocket className="text-yellow-400 w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
                          Top Altcoins vs Bitcoin
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Performance Analysis</p>
                      </div>
                    </span>
                    <div className="flex gap-2">
                      {['7d', '30d', '90d'].map(tf => (
                        <Button
                          key={tf}
                          variant={selectedTimeframe === tf ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeframe(tf)}
                          className={cn(
                            "font-bold px-5 py-2.5 transition-all duration-300 relative overflow-hidden group",
                            selectedTimeframe === tf 
                              ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-600 shadow-lg shadow-yellow-500/30 text-white border-0 scale-105" 
                              : "bg-gray-800/80 backdrop-blur-sm border-gray-600/50 hover:bg-gray-700/80 hover:border-yellow-500/50 text-gray-200"
                          )}
                        >
                          <span className="relative z-10 font-bold tracking-wide">{tf.toUpperCase()}</span>
                          {selectedTimeframe === tf && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 blur-md"></div>
                            </>
                          )}
                        </Button>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ScrollArea className="h-[500px] pr-2">
                    <div className="space-y-4 p-1">
                      {topPerformers.map((coin: any, index: number) => (
                        <motion.div
                          key={coin.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 100 }}
                          className={cn(
                            "relative p-5 rounded-2xl transition-all duration-500 cursor-pointer group",
                            "bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90",
                            "border border-gray-700/30 hover:border-yellow-500/50",
                            "hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-[1.02]",
                            "backdrop-blur-xl overflow-hidden",
                            coin.performanceVsBtc[selectedTimeframe] > 20 && "ring-2 ring-green-500/40 border-green-500/30"
                          )}
                        >
                          {/* Premium gradient background for outperformers */}
                          {coin.performanceVsBtc[selectedTimeframe] > 20 && (
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent rounded-2xl"></div>
                          )}
                          
                          {/* Animated background pattern */}
                          <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,white_0,transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,white_0,transparent_50%)]"></div>
                          </div>
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                {/* Premium coin image with effects */}
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-1 rounded-full">
                                  <img 
                                    src={coin.image} 
                                    alt={coin.name} 
                                    className="w-14 h-14 rounded-full relative z-10 border-2 border-gray-700 group-hover:border-yellow-500/50 transition-colors"
                                  />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg z-20 border border-gray-800">
                                  #{index + 1}
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-lg text-white flex items-center">
                                  {coin.name} 
                                  <span className="text-gray-400 text-sm ml-2 font-medium bg-gray-800/50 px-2 py-0.5 rounded-md">
                                    {coin.symbol.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400 font-medium">
                                  ${coin.currentPrice.toFixed(coin.currentPrice < 1 ? 6 : 2)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn(
                                "text-2xl font-bold flex items-center justify-end",
                                coin.performanceVsBtc[selectedTimeframe] > 0 ? "text-green-400" : "text-red-400"
                              )}>
                                {coin.performanceVsBtc[selectedTimeframe] > 0 ? 
                                  <TrendingUp className="w-6 h-6 mr-1.5" /> : 
                                  <TrendingDown className="w-6 h-6 mr-1.5" />
                                }
                                <span className="font-mono">{formatPercentage(coin.performanceVsBtc[selectedTimeframe])}</span>
                              </div>
                              <div className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">
                                vs Bitcoin
                              </div>
                            </div>
                          </div>
                          
                          {/* Performance Metrics - Premium Design */}
                          <div className="mt-5 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl blur-xl"></div>
                            <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                  {selectedTimeframe} Performance
                                </span>
                                <div className={cn(
                                  "text-lg font-bold font-mono flex items-center",
                                  coin.priceChange[selectedTimeframe] > 0 ? "text-green-400" : "text-red-400"
                                )}>
                                  {coin.priceChange[selectedTimeframe] > 0 ? "+" : ""}
                                  {formatPercentage(coin.priceChange[selectedTimeframe])}
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                    coin.priceChange[selectedTimeframe] > 0 
                                      ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                                      : "bg-gradient-to-r from-red-500 to-pink-400"
                                  )}
                                  style={{ 
                                    width: `${Math.min(Math.abs(coin.priceChange[selectedTimeframe]), 100)}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Market Stats - Enhanced Grid */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400 font-medium">Market Cap</span>
                                <DollarSign className="w-3 h-3 text-yellow-500/50" />
                              </div>
                              <div className="font-bold text-white text-sm">{formatNumber(coin.marketCap)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400 font-medium">24h Volume</span>
                                <Activity className="w-3 h-3 text-purple-500/50" />
                              </div>
                              <div className="font-bold text-white text-sm">{formatNumber(coin.volume24h)}</div>
                            </div>
                          </div>
                          
                          {/* Trading Actions - Premium Design */}
                          <div className="mt-5 space-y-3">
                            {/* Trade Now Button - BloFin */}
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                              <a
                                href={`https://blofin.com/futures/${coin.symbol.toUpperCase()}-USDT`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative block w-full"
                              >
                                <button className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:via-amber-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
                                  <span className="text-sm tracking-wide font-bold relative z-10 flex items-center justify-center">
                                    <div className="relative">
                                      <Rocket className="w-5 h-5 mr-2" />
                                      <div className="absolute inset-0 bg-white blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                                    </div>
                                    TRADE {coin.symbol.toUpperCase()} ON BLOFIN
                                  </span>
                                </button>
                              </a>
                            </div>
                            
                            {/* Chart Analysis Button - TradingView */}
                            <Dialog 
                              key={`chart-dialog-${coin.id}`}
                              open={chartModalOpen[coin.id]} 
                              onOpenChange={(open) => setChartModalOpen({...chartModalOpen, [coin.id]: open})}
                            >
                              <DialogTrigger asChild>
                                <div className="relative group">
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                                  <button 
                                    onClick={async () => {
                                      // Fetch correct trading pair info for this coin
                                      try {
                                        const res = await fetch(`/api/altseason/coin-trading-info/${coin.id}`);
                                        const tradingInfo = await res.json();
                                        setTradingPairs(prev => ({...prev, [coin.id]: tradingInfo}));
                                      } catch (error) {
                                        console.error('Failed to fetch trading info:', error);
                                      }
                                      setChartModalOpen({...chartModalOpen, [coin.id]: true});
                                    }}
                                    className="relative w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 hover:from-blue-800 hover:via-indigo-800 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
                                    <span className="text-sm tracking-wide font-medium relative z-10 flex items-center justify-center">
                                      <BarChart3 className="w-5 h-5 mr-2" />
                                      TRADINGVIEW CHART ANALYSIS
                                    </span>
                                  </button>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl w-full bg-black border-gray-800">
                                <DialogHeader>
                                  <DialogTitle className="text-white text-xl font-bold">
                                    {coin.name} ({coin.symbol.toUpperCase()}) - Advanced Chart Analysis
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="mt-4" style={{ height: '600px' }}>
                                  <TradingViewAdvancedWidget
                                    symbol={tradingPairs[coin.id]?.tradingViewSymbol || `BINANCE:${coin.symbol.toUpperCase()}USDT`}
                                    interval="240"
                                    theme="dark"
                                    height={600}
                                    toolbar_bg="#000000"
                                    container_id={`altcoin_chart_${coin.symbol}_${coin.id}`}
                                    overrides={{
                                      "mainSeriesProperties.candleStyle.upColor": "#00FF00",
                                      "mainSeriesProperties.candleStyle.downColor": "#FF0000",
                                      "mainSeriesProperties.candleStyle.borderUpColor": "#00FF00",
                                      "mainSeriesProperties.candleStyle.borderDownColor": "#FF0000",
                                      "mainSeriesProperties.candleStyle.wickUpColor": "#00FF00",
                                      "mainSeriesProperties.candleStyle.wickDownColor": "#FF0000",
                                      "paneProperties.background": "#000000",
                                      "paneProperties.backgroundType": "solid",
                                      "paneProperties.vertGridProperties.color": "#1a1a1a",
                                      "paneProperties.horzGridProperties.color": "#1a1a1a",
                                      "scalesProperties.textColor": "#999999",
                                      "scalesProperties.backgroundColor": "#000000",
                                      "scalesProperties.lineColor": "#1a1a1a"
                                    }}
                                    enabled_features={[
                                      "study_templates",
                                      "use_localstorage_for_settings",
                                      "save_chart_properties_to_local_storage",
                                      "create_volume_indicator_by_default",
                                      "drawing_templates"
                                    ]}
                                    allow_symbol_change={true}
                                    save_image={true}
                                    details={true}
                                    hotlist={true}
                                    calendar={true}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          {/* Outperformance Indicator - Premium Badge */}
                          {coin.performanceVsBtc[selectedTimeframe] > 20 && (
                            <div className="mt-5 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl"></div>
                              <div className="relative bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-green-500/40 rounded-xl px-4 py-3 flex items-center justify-center shadow-lg shadow-green-500/10">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-pulse"></div>
                                <Star className="w-5 h-5 text-green-400 mr-2 relative z-10" />
                                <span className="text-sm font-bold text-green-400 uppercase tracking-wide relative z-10">
                                  Strong Outperformer
                                </span>
                                <div className="absolute -top-1 -right-1">
                                  <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              </TabsContent>

              {/* Ethereum Comparison Tab */}
              <TabsContent value="ethereum" className="mt-0">
                {/* Top Altcoins Performance vs Ethereum */}
                <Card className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-indigo-600/30 hover:border-indigo-500/50 transition-all duration-300 shadow-2xl overflow-hidden">
                {/* Premium background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-blue-600/10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                
                <CardHeader className="relative z-10">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                  
                  <CardTitle className="flex items-center justify-between text-white relative z-10">
                    <span className="flex items-center">
                      <div className="relative mr-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 blur-xl opacity-70"></div>
                        <div className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 p-2 rounded-lg border border-indigo-500/30">
                          <Zap className="text-indigo-400 w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                          Top Altcoins vs Ethereum
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Performance Analysis</p>
                      </div>
                    </span>
                    <div className="flex gap-2">
                      {['7d', '30d', '90d'].map(tf => (
                        <Button
                          key={tf}
                          variant={selectedTimeframeEth === tf ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeframeEth(tf)}
                          className={cn(
                            "font-bold px-5 py-2.5 transition-all duration-300 relative overflow-hidden group",
                            selectedTimeframeEth === tf 
                              ? "bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 hover:from-indigo-600 hover:via-blue-600 hover:to-indigo-600 shadow-lg shadow-indigo-500/30 text-white border-0 scale-105" 
                              : "bg-gray-800/80 backdrop-blur-sm border-gray-600/50 hover:bg-gray-700/80 hover:border-indigo-500/50 text-gray-200"
                          )}
                        >
                          <span className="relative z-10 font-bold tracking-wide">{tf.toUpperCase()}</span>
                          {selectedTimeframeEth === tf && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 blur-md"></div>
                            </>
                          )}
                        </Button>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ScrollArea className="h-[500px] pr-2">
                    <div className="space-y-4 p-1">
                      {perfEthLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : topPerformersEth.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>No altcoins outperforming ETH in {selectedTimeframeEth}</p>
                        </div>
                      ) : (
                        topPerformersEth.map((coin: any, index: number) => (
                          <motion.div
                            key={coin.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 100 }}
                            className={cn(
                              "relative p-5 rounded-2xl transition-all duration-500 cursor-pointer group",
                              "bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90",
                              "border border-gray-700/30 hover:border-indigo-500/50",
                              "hover:shadow-2xl hover:shadow-indigo-500/20 hover:scale-[1.02]",
                              "backdrop-blur-xl overflow-hidden",
                              coin.performanceVsEth[selectedTimeframeEth] > 20 && "ring-2 ring-green-500/40 border-green-500/30"
                            )}
                          >
                            {/* Premium gradient background for outperformers */}
                            {coin.performanceVsEth[selectedTimeframeEth] > 20 && (
                              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent rounded-2xl"></div>
                            )}
                            
                            {/* Animated background pattern */}
                            <div className="absolute inset-0 opacity-5">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,white_0,transparent_50%)]"></div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,white_0,transparent_50%)]"></div>
                            </div>
                            
                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  {/* Premium coin image with effects */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-1 rounded-full">
                                    <img 
                                      src={coin.image} 
                                      alt={coin.name} 
                                      className="w-14 h-14 rounded-full relative z-10 border-2 border-gray-700 group-hover:border-indigo-500/50 transition-colors"
                                    />
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg z-20 border border-gray-800">
                                    #{index + 1}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold text-lg text-white flex items-center">
                                    {coin.name} 
                                    <span className="text-gray-400 text-sm ml-2 font-medium bg-gray-800/50 px-2 py-0.5 rounded-md">
                                      {coin.symbol.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-400 font-medium">
                                    ${coin.currentPrice.toFixed(coin.currentPrice < 1 ? 6 : 2)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={cn(
                                  "text-2xl font-bold flex items-center justify-end",
                                  coin.performanceVsEth[selectedTimeframeEth] > 0 ? "text-green-400" : "text-red-400"
                                )}>
                                  {coin.performanceVsEth[selectedTimeframeEth] > 0 ? 
                                    <TrendingUp className="w-6 h-6 mr-1.5" /> : 
                                    <TrendingDown className="w-6 h-6 mr-1.5" />
                                  }
                                  <span className="font-mono">{formatPercentage(coin.performanceVsEth[selectedTimeframeEth])}</span>
                                </div>
                                <div className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">
                                  vs Ethereum
                                </div>
                              </div>
                            </div>
                            
                            {/* Performance Metrics - Premium Design */}
                            <div className="mt-5 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-xl blur-xl"></div>
                              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                    {selectedTimeframeEth} Performance
                                  </span>
                                  <div className={cn(
                                    "text-lg font-bold font-mono flex items-center",
                                    coin.priceChange[selectedTimeframeEth] > 0 ? "text-green-400" : "text-red-400"
                                  )}>
                                    {coin.priceChange[selectedTimeframeEth] > 0 ? "+" : ""}
                                    {formatPercentage(coin.priceChange[selectedTimeframeEth])}
                                  </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all duration-1000 ease-out",
                                      coin.priceChange[selectedTimeframeEth] > 0 
                                        ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                                        : "bg-gradient-to-r from-red-500 to-pink-400"
                                    )}
                                    style={{ 
                                      width: `${Math.min(Math.abs(coin.priceChange[selectedTimeframeEth]), 100)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Market Stats - Enhanced Grid */}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-400 font-medium">Market Cap</span>
                                  <DollarSign className="w-3 h-3 text-indigo-500/50" />
                                </div>
                                <div className="font-bold text-white text-sm">{formatNumber(coin.marketCap)}</div>
                              </div>
                              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-400 font-medium">24h Volume</span>
                                  <Activity className="w-3 h-3 text-blue-500/50" />
                                </div>
                                <div className="font-bold text-white text-sm">{formatNumber(coin.volume24h)}</div>
                              </div>
                            </div>
                            
                            {/* Trading Actions - Premium Design */}
                            <div className="mt-5 space-y-3">
                              {/* Trade Now Button - BloFin */}
                              <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                                <a
                                  href={`https://blofin.com/futures/${coin.symbol.toUpperCase()}-USDT`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative block w-full"
                                >
                                  <button className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:via-amber-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
                                    <span className="text-sm tracking-wide font-bold relative z-10 flex items-center justify-center">
                                      <div className="relative">
                                        <Rocket className="w-5 h-5 mr-2" />
                                        <div className="absolute inset-0 bg-white blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                                      </div>
                                      TRADE {coin.symbol.toUpperCase()} ON BLOFIN
                                    </span>
                                  </button>
                                </a>
                              </div>
                              
                              {/* Chart Analysis Button - TradingView */}
                              <Dialog 
                                key={`chart-dialog-eth-${coin.id}`}
                                open={chartModalOpen[`eth-${coin.id}`]} 
                                onOpenChange={(open) => setChartModalOpen({...chartModalOpen, [`eth-${coin.id}`]: open})}
                              >
                                <DialogTrigger asChild>
                                  <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                                    <button 
                                      onClick={async () => {
                                        // Fetch correct trading pair info for this coin
                                        try {
                                          const res = await fetch(`/api/altseason/coin-trading-info/${coin.id}`);
                                          const tradingInfo = await res.json();
                                          setTradingPairs(prev => ({...prev, [`eth-${coin.id}`]: tradingInfo}));
                                        } catch (error) {
                                          console.error('Failed to fetch trading info:', error);
                                        }
                                        setChartModalOpen({...chartModalOpen, [`eth-${coin.id}`]: true});
                                      }}
                                      className="relative w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 hover:from-blue-800 hover:via-indigo-800 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group"
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"></div>
                                      <span className="text-sm tracking-wide font-medium relative z-10 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 mr-2" />
                                        TRADINGVIEW CHART ANALYSIS
                                      </span>
                                    </button>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-hidden bg-gray-900 border-gray-800">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-white flex items-center">
                                      <BarChart3 className="w-6 h-6 mr-2 text-indigo-400" />
                                      {coin.name} ({coin.symbol.toUpperCase()}) Chart Analysis
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="h-[700px] w-full mt-4">
                                    <TradingViewAdvancedWidget
                                      symbol={tradingPairs[`eth-${coin.id}`]?.symbol || `BINANCE:${coin.symbol.toUpperCase()}USDT`}
                                      theme="dark"
                                      locale="en"
                                      width="100%"
                                      height={700}
                                      autosize={false}
                                      interval="D"
                                      timezone="Etc/UTC"
                                      style={1}
                                      hide_side_toolbar={false}
                                      enable_publishing={false}
                                      container_id={`tradingview_eth_${coin.symbol}_${coin.id}`}
                                      toolbar_bg="#000000"
                                      save_image={true}
                                      details={true}
                                      hotlist={true}
                                      calendar={true}
                                      studies={[
                                        "STD;MA",
                                        "STD;RSI"
                                      ]}
                                      overrides={{
                                        "paneProperties.background": "#000000",
                                        "paneProperties.backgroundType": "solid",
                                        "paneProperties.vertGridProperties.color": "#1a1a1a",
                                        "paneProperties.horzGridProperties.color": "#1a1a1a",
                                        "scalesProperties.textColor": "#999999",
                                        "scalesProperties.backgroundColor": "#000000",
                                        "scalesProperties.lineColor": "#1a1a1a"
                                      }}
                                      enabled_features={[
                                        "study_templates",
                                        "use_localstorage_for_settings",
                                        "save_chart_properties_to_local_storage",
                                        "create_volume_indicator_by_default",
                                        "drawing_templates"
                                      ]}
                                      allow_symbol_change={true}
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            
                            {/* Outperformance Indicator - Premium Badge */}
                            {coin.performanceVsEth[selectedTimeframeEth] > 20 && (
                              <div className="mt-5 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl"></div>
                                <div className="relative bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-green-500/40 rounded-xl px-4 py-3 flex items-center justify-center shadow-lg shadow-green-500/10">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-pulse"></div>
                                  <Star className="w-5 h-5 text-green-400 mr-2 relative z-10" />
                                  <span className="text-sm font-bold text-green-400 uppercase tracking-wide relative z-10">
                                    Strong ETH Outperformer
                                  </span>
                                  <div className="absolute -top-1 -right-1">
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              </TabsContent>
            </Tabs>
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

          {/* Monte Carlo Tab */}
          <TabsContent value="montecarlo" className="mt-6">
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <Calculator className="mr-2 text-purple-400" />
                    <span className="text-lg">Monte Carlo Simulation - Top 5 ETH Outperformers</span>
                  </span>
                  <Badge className="bg-purple-600/20 text-purple-400 border-purple-500">
                    30-Day Price Projections
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Statistical price simulations based on historical volatility and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Explanation Card */}
                <div className="bg-purple-900/20 rounded-xl p-6 mb-8 border border-purple-500/20">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-purple-400" />
                    What is a Monte Carlo Simulation?
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    Monte Carlo simulations use computer modeling to predict possible future prices by running thousands of scenarios based on historical data. 
                    Think of it like rolling dice 100 times to see all possible outcomes.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-red-400 font-semibold">Bearish (10%)</div>
                      <div className="text-xs text-gray-400">Worst case scenario</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-semibold">Most Likely (50%)</div>
                      <div className="text-xs text-gray-400">Expected outcome</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-semibold">Bullish (90%)</div>
                      <div className="text-xs text-gray-400">Best case scenario</div>
                    </div>
                  </div>
                </div>
                
                {performanceEth?.altcoins && (
                  <div className="space-y-6">
                    {/* Get top 5 ETH outperformers */}
                    {(() => {
                      const top5EthOutperformers = performanceEth.altcoins
                        .filter(coin => coin.performanceVsEth?.["30d"] > 0)
                        .sort((a, b) => (b.performanceVsEth?.["30d"] || 0) - (a.performanceVsEth?.["30d"] || 0))
                        .slice(0, 5);

                      return top5EthOutperformers.map((coin, index) => {
                        // Monte Carlo simulation parameters
                        const currentPrice = coin.currentPrice || 0;
                        const volatility = Math.abs(coin.performanceVsEth?.["30d"] || 20) / 100;
                        const drift = (coin.performanceVsEth?.["30d"] || 0) / 30 / 100; // Daily drift
                        const simulations = 100;
                        const days = 30;

                        // Run Monte Carlo simulations
                        const runSimulation = () => {
                          const paths = [];
                          for (let sim = 0; sim < simulations; sim++) {
                            const path = [currentPrice];
                            let price = currentPrice;
                            
                            for (let day = 1; day <= days; day++) {
                              const randomShock = Math.sqrt(1/365) * volatility * (Math.random() * 2 - 1);
                              const dailyReturn = drift / 365 + randomShock;
                              price = price * (1 + dailyReturn);
                              path.push(price);
                            }
                            paths.push(path);
                          }
                          return paths;
                        };

                        const simulationPaths = runSimulation();
                        
                        // Calculate percentiles
                        const finalPrices = simulationPaths.map(path => path[path.length - 1]);
                        finalPrices.sort((a, b) => a - b);
                        
                        const p10 = finalPrices[Math.floor(simulations * 0.1)];
                        const p50 = finalPrices[Math.floor(simulations * 0.5)];
                        const p90 = finalPrices[Math.floor(simulations * 0.9)];

                        // Prepare chart data - show 5 sample paths
                        const chartData = Array.from({ length: days + 1 }, (_, i) => ({
                          day: i,
                          path1: simulationPaths[0]?.[i],
                          path2: simulationPaths[20]?.[i],
                          path3: simulationPaths[40]?.[i],
                          path4: simulationPaths[60]?.[i],
                          path5: simulationPaths[80]?.[i],
                        }));

                        return (
                          <motion.div
                            key={coin.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-900/50 rounded-xl p-6 border border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <img 
                                  src={coin.image} 
                                  alt={coin.symbol} 
                                  className="w-12 h-12 rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://via.placeholder.com/48?text=${coin.symbol.charAt(0)}`;
                                  }}
                                />
                                <div>
                                  <p className="font-bold text-xl text-white">{coin.symbol.toUpperCase()}</p>
                                  <p className="text-gray-400">{coin.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400">Current Price</p>
                                <p className="font-bold text-xl text-white">${currentPrice >= 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}</p>
                                <p className={cn(
                                  "text-sm font-medium mt-1",
                                  coin.performanceVsEth?.["30d"] > 0 ? "text-purple-400" : "text-red-400"
                                )}>
                                  +{coin.performanceVsEth?.["30d"]?.toFixed(1)}% vs ETH
                                </p>
                              </div>
                            </div>

                            {/* Simulation Chart */}
                            <div className="h-80 mb-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-4 border border-purple-500/20">
                              <h4 className="text-lg font-semibold text-white mb-3 text-center">📈 30-Day Price Forecast</h4>
                              <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                                  <defs>
                                    <linearGradient id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                  <XAxis 
                                    dataKey="day" 
                                    stroke="#9CA3AF" 
                                    fontSize={14}
                                    tick={{ fill: '#9CA3AF' }}
                                    tickFormatter={(value) => value === 0 ? 'Today' : value === 30 ? '30 Days' : value === 15 ? '15 Days' : ''}
                                  />
                                  <YAxis 
                                    stroke="#9CA3AF" 
                                    fontSize={14}
                                    tick={{ fill: '#9CA3AF' }}
                                    domain={['dataMin - 5%', 'dataMax + 5%']}
                                    tickFormatter={(value) => value >= 1000 ? `$${(value/1000).toFixed(0)}K` : value >= 1 ? `$${value.toFixed(0)}` : `$${value.toFixed(4)}`}

                                  />
                                  <RechartsTooltip
                                    contentStyle={{ 
                                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                                      border: '1px solid #374151',
                                      borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#9CA3AF' }}
                                    formatter={(value) => [`$${Number(value).toFixed(currentPrice >= 1 ? 2 : 4)}`, 'Price']}
                                    labelFormatter={(label) => `Day ${label}`}
                                  />
                                  <Line type="monotone" dataKey="path1" stroke="#A78BFA" strokeWidth={2} dot={false} strokeOpacity={0.4} />
                                  <Line type="monotone" dataKey="path2" stroke="#C084FC" strokeWidth={2} dot={false} strokeOpacity={0.4} />
                                  <Line type="monotone" dataKey="path3" stroke="#E879F9" strokeWidth={2} dot={false} strokeOpacity={0.4} />
                                  <Line type="monotone" dataKey="path4" stroke="#F472B6" strokeWidth={2} dot={false} strokeOpacity={0.4} />
                                  <Line type="monotone" dataKey="path5" stroke="#FB7185" strokeWidth={2} dot={false} strokeOpacity={0.4} />
                                  <ReferenceLine y={currentPrice} stroke="#10B981" strokeDasharray="5 5" strokeWidth={2}>
                                    <Label value={`Now: $${currentPrice >= 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(4)}`} position="right" fill="#10B981" style={{ fontSize: 14, fontWeight: 'bold' }} />
                                  </ReferenceLine>
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Price Targets */}
                            <div className="mb-4">
                              <h4 className="text-sm text-gray-400 mb-3 text-center">Price Predictions After 30 Days</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-5 border border-red-500/30 text-center"
                                >
                                  <div className="flex items-center justify-center mb-2">
                                    <TrendingDown className="w-5 h-5 text-red-400 mr-1" />
                                    <p className="text-sm font-semibold text-red-400">Bearish Scenario</p>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2">90% chance price stays above</p>
                                  <p className="font-bold text-2xl text-white mb-1">${p10 >= 1 ? p10.toFixed(2) : p10.toFixed(4)}</p>
                                  <p className={cn(
                                    "text-sm font-medium flex items-center justify-center",
                                    p10 < currentPrice ? "text-red-400" : "text-green-400"
                                  )}>
                                    {p10 < currentPrice ? <ArrowDownRight className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                                    {((p10 - currentPrice) / currentPrice * 100).toFixed(1)}%
                                  </p>
                                </motion.div>
                                
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-5 border border-purple-500/30 text-center"
                                >
                                  <div className="flex items-center justify-center mb-2">
                                    <Activity className="w-5 h-5 text-purple-400 mr-1" />
                                    <p className="text-sm font-semibold text-purple-400">Most Likely</p>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2">50% chance above/below</p>
                                  <p className="font-bold text-2xl text-white mb-1">${p50 >= 1 ? p50.toFixed(2) : p50.toFixed(4)}</p>
                                  <p className={cn(
                                    "text-sm font-medium flex items-center justify-center",
                                    p50 < currentPrice ? "text-red-400" : "text-green-400"
                                  )}>
                                    {p50 < currentPrice ? <ArrowDownRight className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                                    {((p50 - currentPrice) / currentPrice * 100).toFixed(1)}%
                                  </p>
                                </motion.div>
                                
                                <motion.div 
                                  whileHover={{ scale: 1.05 }}
                                  className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-5 border border-green-500/30 text-center"
                                >
                                  <div className="flex items-center justify-center mb-2">
                                    <TrendingUp className="w-5 h-5 text-green-400 mr-1" />
                                    <p className="text-sm font-semibold text-green-400">Bullish Scenario</p>
                                  </div>
                                  <p className="text-xs text-gray-400 mb-2">10% chance price exceeds</p>
                                  <p className="font-bold text-2xl text-white mb-1">${p90 >= 1 ? p90.toFixed(2) : p90.toFixed(4)}</p>
                                  <p className={cn(
                                    "text-sm font-medium flex items-center justify-center",
                                    p90 < currentPrice ? "text-red-400" : "text-green-400"
                                  )}>
                                    {p90 < currentPrice ? <ArrowDownRight className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                                    {((p90 - currentPrice) / currentPrice * 100).toFixed(1)}%
                                  </p>
                                </motion.div>
                              </div>
                            </div>
                            
                            {/* Methodology Note */}
                            <div className="bg-gray-900/30 rounded-lg p-4 text-center">
                              <p className="text-xs text-gray-500">
                                Based on {simulations} simulations using historical volatility and ETH outperformance trend
                              </p>
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
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
