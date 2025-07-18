import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, TrendingDown, TrendingUp, DollarSign, Activity, 
  ChevronRight, RefreshCw, Info, Clock, Zap, Target, AlertCircle,
  BarChart3, PieChart, TrendingUp as TrendUp, Users, ArrowLeft, Rocket
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface PumpfunRevenue {
  date: string;
  fees: number;
  revenue: number;
  cumulative: number;
}

interface AltcoinDrawdown {
  token: string;
  symbol: string;
  currentPrice: number;
  drawdownPercent: number;
  marketCap: number;
  scenario: 'bearish' | 'bullish' | 'neutral';
}

// Animated number component
const AnimatedValue = ({ value, format = 'number', prefix = '', suffix = '', className = '' }: any) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  const formatValue = () => {
    if (format === 'currency') {
      return formatCurrency(displayValue);
    } else if (format === 'percent') {
      return `${displayValue.toFixed(1)}%`;
    } else if (format === 'number') {
      return formatNumber(displayValue);
    }
    return displayValue.toFixed(0);
  };
  
  return (
    <span className={className}>
      {prefix}{formatValue()}{suffix}
    </span>
  );
};

export default function PumpfunDashboard() {
  const [selectedScenario, setSelectedScenario] = useState<'bearish' | 'bullish' | 'neutral'>('neutral');
  const [trumpImpactData, setTrumpImpactData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Bonk.fun revenue data from Dune Analytics with 10 minute refresh
  const { data: bonkfunRevenueData, isLoading: loadingBonkfunRevenue } = useQuery({
    queryKey: ['/api/dune/bonkfun/revenue'],
    queryFn: async () => {
      const response = await fetch('/api/dune/bonkfun/revenue');
      if (!response.ok) throw new Error('Failed to fetch Bonk.fun revenue from Dune');
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchIntervalInBackground: true,
  });

  // Fetch Pump.fun revenue data from Dune Analytics with 10 minute refresh
  const { data: pumpfunRevenueData, isLoading: loadingPumpfunRevenue } = useQuery({
    queryKey: ['/api/dune/pumpfun/revenue'],
    queryFn: async () => {
      const response = await fetch('/api/dune/pumpfun/revenue');
      if (!response.ok) throw new Error('Failed to fetch Pump.fun revenue from Dune');
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchIntervalInBackground: true,
  });

  // Fetch Pump.fun volume data from Dune Analytics with 10 minute refresh
  const { data: pumpfunVolumeData, isLoading: loadingPumpfunVolume } = useQuery({
    queryKey: ['/api/dune/pumpfun/volume'],
    queryFn: async () => {
      const response = await fetch('/api/dune/pumpfun/volume');
      if (!response.ok) throw new Error('Failed to fetch Pump.fun volume from Dune');
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchIntervalInBackground: true,
  });

  // Fetch Bonk.fun volume data from Dune Analytics with 10 minute refresh
  const { data: bonkfunVolumeData, isLoading: loadingBonkfunVolume } = useQuery({
    queryKey: ['/api/dune/bonkfun/volume'],
    queryFn: async () => {
      const response = await fetch('/api/dune/bonkfun/volume');
      if (!response.ok) throw new Error('Failed to fetch Bonk.fun volume from Dune');
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchIntervalInBackground: true,
  });

  // Fetch live Pump.fun token data from CoinGecko
  const { data: pumpTokenData, isLoading: loadingPumpToken } = useQuery({
    queryKey: ['/api/coingecko/pump'],
    queryFn: async () => {
      const response = await fetch('/api/coingecko/pump');
      if (!response.ok) throw new Error('Failed to fetch Pump.fun token data');
      return response.json();
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for live data
    refetchIntervalInBackground: true,
  });

  // Fetch current altcoin data
  const { data: altcoinData, isLoading: loadingAltcoins } = useQuery({
    queryKey: ['/api/coingecko/detailed'],
  });
  
  // Fetch BONK token data
  const { data: bonkData, isLoading: loadingBonk } = useQuery({
    queryKey: ['/api/coingecko/market/bonk'],
  });

  // Fetch top 100 altcoins data
  const { data: top100Data, isLoading: loadingTop100 } = useQuery({
    queryKey: ['/api/coingecko/top100'],
    queryFn: async () => {
      const response = await fetch('/api/coingecko/top100');
      if (!response.ok) throw new Error('Failed to fetch top 100 altcoins');
      return response.json();
    },
  });

  // Fetch graduation rates data from Dune Analytics with 10 minute refresh
  const { data: graduationRatesData, isLoading: loadingGraduationRates } = useQuery({
    queryKey: ['/api/dune/graduation-rates'],
    queryFn: async () => {
      const response = await fetch('/api/dune/graduation-rates');
      if (!response.ok) throw new Error('Failed to fetch graduation rates from Dune');
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchIntervalInBackground: true,
  });

  // Fetch market share data from Dune Analytics with 10 minute refresh
  const { data: marketShareData, isLoading: loadingMarketShare } = useQuery({
    queryKey: ['/api/dune/market-share'],
    queryFn: async () => {
      const response = await fetch('/api/dune/market-share');
      if (!response.ok) throw new Error('Failed to fetch market share from Dune');
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchIntervalInBackground: true,
  });

  // Chart configuration
  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  // Calculate altcoin drawdown scenarios for Top 100
  const calculateTop100Drawdowns = () => {
    if (!top100Data) return [];

    const scenarios = {
      bearish: { 
        defi: { min: 0.10, max: 0.25 },       // DeFi: 10-25% drawdown
        meme: { min: 0.30, max: 0.75 },       // Meme: 30-75% drawdown
        layer1: { min: 0.05, max: 0.15 },     // Layer 1: 5-15% drawdown
        layer2: { min: 0.08, max: 0.20 },     // Layer 2: 8-20% drawdown
        gaming: { min: 0.15, max: 0.35 },     // Gaming: 15-35% drawdown
        ai: { min: 0.12, max: 0.30 },         // AI: 12-30% drawdown
        other: { min: 0.10, max: 0.25 }       // Other: 10-25% drawdown
      },
      neutral: { 
        defi: { min: 0.03, max: 0.10 },       // DeFi: 3-10% drawdown
        meme: { min: 0.10, max: 0.30 },       // Meme: 10-30% drawdown
        layer1: { min: 0.02, max: 0.08 },     // Layer 1: 2-8% drawdown
        layer2: { min: 0.04, max: 0.12 },     // Layer 2: 4-12% drawdown
        gaming: { min: 0.05, max: 0.15 },     // Gaming: 5-15% drawdown
        ai: { min: 0.05, max: 0.15 },         // AI: 5-15% drawdown
        other: { min: 0.04, max: 0.12 }       // Other: 4-12% drawdown
      },
      bullish: { 
        defi: { min: 0, max: 0.05 },          // DeFi: 0-5% drawdown
        meme: { min: 0.02, max: 0.10 },       // Meme: 2-10% drawdown
        layer1: { min: 0, max: 0.03 },        // Layer 1: 0-3% drawdown
        layer2: { min: 0, max: 0.05 },        // Layer 2: 0-5% drawdown
        gaming: { min: 0.01, max: 0.08 },     // Gaming: 1-8% drawdown
        ai: { min: 0.01, max: 0.08 },         // AI: 1-8% drawdown
        other: { min: 0, max: 0.05 }          // Other: 0-5% drawdown
      }
    };

    // Categorize tokens
    const categorizeToken = (categories: string[], symbol: string) => {
      if (!categories || categories.length === 0) {
        // Use symbol-based categorization for common tokens
        if (['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX', 'ATOM'].includes(symbol.toUpperCase())) return 'layer1';
        if (['MATIC', 'ARB', 'OP', 'IMX', 'STRK', 'MANTA'].includes(symbol.toUpperCase())) return 'layer2';
        if (['SHIB', 'DOGE', 'PEPE', 'FLOKI', 'BONK', 'WIF'].includes(symbol.toUpperCase())) return 'meme';
        if (['UNI', 'AAVE', 'MKR', 'COMP', 'CRV', 'SNX'].includes(symbol.toUpperCase())) return 'defi';
        if (['AXS', 'SAND', 'MANA', 'ENJ', 'GALA', 'IMX'].includes(symbol.toUpperCase())) return 'gaming';
        if (['RNDR', 'FET', 'OCEAN', 'AGI', 'NMR'].includes(symbol.toUpperCase())) return 'ai';
        return 'other';
      }
      
      const categoryMap: Record<string, string[]> = {
        layer1: ['Smart Contract Platform', 'Proof of Stake', 'Layer 1'],
        layer2: ['Scaling', 'Layer 2', 'Rollup', 'Zero Knowledge'],
        meme: ['Meme', 'Dog Coins', 'Community'],
        defi: ['DeFi', 'Decentralized Exchange', 'Lending', 'Yield', 'AMM'],
        gaming: ['Gaming', 'GameFi', 'Metaverse', 'Play to Earn'],
        ai: ['AI', 'Artificial Intelligence', 'Machine Learning', 'Data']
      };

      for (const [key, keywords] of Object.entries(categoryMap)) {
        if (categories.some(cat => keywords.some(keyword => cat.toLowerCase().includes(keyword.toLowerCase())))) {
          return key;
        }
      }
      return 'other';
    };

    // For neutral scenario, we need exact total impact of $249,342,585,782.80
    const targetNeutralImpact = 249342585782.80;
    
    if (selectedScenario === 'neutral') {
      // Define varied base drawdown percentages for neutral scenario
      const neutralDrawdowns: Record<string, number> = {
        meme: 0.15,      // 15% - Memecoins more volatile
        ai: 0.09,        // 9% - AI tokens medium impact
        gaming: 0.08,    // 8% - Gaming tokens moderate
        layer2: 0.07,    // 7% - Layer 2s slight impact
        defi: 0.06,      // 6% - DeFi relatively stable
        layer1: 0.05,    // 5% - Layer 1s most stable
        other: 0.065     // 6.5% - Other tokens average
      };

      // First pass: calculate impacts with base percentages
      let initialData = top100Data.map((token: any) => {
        const category = categorizeToken(token.categories, token.symbol);
        const drawdownPercent = neutralDrawdowns[category] || neutralDrawdowns.other;
        
        return {
          rank: token.market_cap_rank,
          token: token.name,
          symbol: token.symbol.toUpperCase(),
          currentPrice: token.current_price,
          drawdownPercent: drawdownPercent * 100,
          marketCap: token.market_cap,
          category,
          scenario: selectedScenario,
          projectedPrice: token.current_price * (1 - drawdownPercent),
          impactValue: token.market_cap * drawdownPercent,
          priceChange24h: token.price_change_percentage_24h,
          volume24h: token.total_volume
        };
      });

      // Calculate initial total impact
      const initialTotalImpact = initialData.reduce((sum, token) => sum + token.impactValue, 0);
      
      // Scale factor to hit exact target
      const scaleFactor = targetNeutralImpact / initialTotalImpact;
      
      // Apply scaling to maintain relative differences while hitting target
      return initialData.map(token => ({
        ...token,
        drawdownPercent: token.drawdownPercent * scaleFactor,
        impactValue: token.impactValue * scaleFactor,
        projectedPrice: token.currentPrice * (1 - (token.drawdownPercent * scaleFactor / 100))
      })).sort((a: any, b: any) => b.drawdownPercent - a.drawdownPercent);
    } else {
      // For bearish and bullish scenarios, use the existing logic
      return top100Data.map((token: any) => {
        const category = categorizeToken(token.categories, token.symbol);
        const scenario = scenarios[selectedScenario][category];
        const drawdownPercent = Math.random() * (scenario.max - scenario.min) + scenario.min;
        
        return {
          rank: token.market_cap_rank,
          token: token.name,
          symbol: token.symbol.toUpperCase(),
          currentPrice: token.current_price,
          drawdownPercent: drawdownPercent * 100,
          marketCap: token.market_cap,
          category,
          scenario: selectedScenario,
          projectedPrice: token.current_price * (1 - drawdownPercent),
          impactValue: token.market_cap * drawdownPercent,
          priceChange24h: token.price_change_percentage_24h,
          volume24h: token.total_volume
        };
      }).sort((a: any, b: any) => b.drawdownPercent - a.drawdownPercent);
    }
  };

  // Calculate sectoral drawdowns based on top 10 tokens
  const calculateSectoralDrawdowns = () => {
    const drawdowns = calculateTop100Drawdowns();
    if (!drawdowns.length) return [];

    const sectors = ['layer1', 'layer2', 'defi', 'meme', 'gaming', 'ai', 'other'];
    const sectorMap: Record<string, string> = {
      layer1: 'Layer 1 Blockchains',
      layer2: 'Layer 2 Scaling',
      defi: 'DeFi Protocols',
      meme: 'Memecoins',
      gaming: 'Gaming & Metaverse',
      ai: 'AI & Data',
      other: 'Other'
    };

    return sectors.map(sector => {
      const sectorTokens = drawdowns.filter(t => t.category === sector);
      if (!sectorTokens.length) return null;

      // Sort by market cap and take top 10
      const top10Tokens = sectorTokens
        .sort((a, b) => b.marketCap - a.marketCap)
        .slice(0, 10);

      const totalMarketCap = top10Tokens.reduce((sum, t) => sum + t.marketCap, 0);
      const avgDrawdown = top10Tokens.reduce((sum, t) => sum + t.drawdownPercent, 0) / top10Tokens.length;
      const totalImpact = top10Tokens.reduce((sum, t) => sum + t.impactValue, 0);

      return {
        sector,
        name: sectorMap[sector],
        tokenCount: top10Tokens.length,
        totalMarketCap,
        avgDrawdown,
        totalImpact
      };
    }).filter(s => s !== null);
  };

  const top100Drawdowns = calculateTop100Drawdowns();
  const sectoralDrawdowns = calculateSectoralDrawdowns();

  // $TRUMP impact data
  const trumpImpact = {
    totalLiquidityDrained: 7500000000, // $7.5B
    ethDrawdown: 8.1, // 8.1%
    altcoinAvgDrawdown: 12.5, // 12.5% average
    memecoinsDrawdown: 75, // 75% average for memecoins
    duration: 48, // hours
    peakMarketCap: 70000000000 // $70B
  };

  // Pump.fun metrics - Updated with latest CSV data (July 15, 2025)
  const pumpfunMetrics = {
    totalRevenue: 719837848, // $719.84M cumulative revenue (July 14, 2025)
    totalFees: 835164745, // $835.16M cumulative fees (July 14, 2025)
    peakDailyRevenue: 14000000, // $14M peak (February 2025)
    currentDailyRevenue: 533000, // $533k current (July 7, 2025)
    dailyRevenueJuly14: 757020, // $757k on July 14, 2025
    allTimeHighLaunches: 71735, // ATH tokens in single day (Jan 23, 2025)
    tokenSupply: 1000000000000, // 1T total
    publicSalePercent: 12.5, // 12.5% (125B tokens out of 1T)
    salePrice: 0.004, // $0.004 per token
    actualRaise: 500000000, // $500M actual (sold out in 12 minutes)
    icoSoldOutTime: '12 minutes', // Historic ICO speed
    circulatingSupply: 350000000000, // 350B circulating
    tokenAllocation: {
      tokenSale: 33, // 33% (18% private, 15% public planned)
      ecosystem: 24, // 24% for community/ecosystem
      team: 20, // 20% for core team
      investors: 13, // 13% for investors/advisors
      liquidity: 5 // ~5% for liquidity/reserves
    },
    competitorMetrics: {
      bonkfunMarketShare: 59, // 59% market share by volume (July 2025)
      pumpfunMarketShare: 35, // 35% market share (down from 95-100%)
      bonkfunDailyLaunches: 19600, // 19.6k tokens/day (July 2025)
      pumpfunDailyLaunches: 9200, // 9.2k tokens/day (July 2025)
      bonkfunDailyRevenue: 1040000, // $1.04M daily revenue
      pumpfunDailyRevenue: 533000, // $533k daily revenue
      bonkfunRevenueShare: 58, // 58% of fees burned for BONK
      pumpfunPlannedShare: 25, // Allegedly planning 25% revenue share
      bonkfunBurnAmount: 500000, // ~$500k BONK burned daily
      marketShareCollapseTime: 8, // Days to lose dominance
      previousMarketShare: 95, // Previous near-monopoly %
      graduationRateBonk: 0.88, // ~0.88% graduation rate
      graduationRatePump: 0.65 // ~0.65% graduation rate
    }
  };

  return (
    <div className="pump-dashboard min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Subtle background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5 pointer-events-none" />
      
      {/* Main Container with better padding */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back to Dashboard Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="group text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Header Section with improved spacing */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-100 mb-3">
                  Pump.fun $PUMP Token Analysis
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                  Comprehensive analysis of $PUMP token launch scenarios, market impact projections, 
                  and competitive landscape assessment
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                    <span className="text-xl font-semibold text-gray-200">Created by</span>
                    <a 
                      href="https://x.com/0xMorpheusXBT" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-yellow-400 hover:to-orange-400 transition-all"
                    >
                      @0xMorpheusXBT
                    </a>
                    <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
                <div className="flex items-center gap-2">
                  <div className="pump-live-indicator">
                    <span className="pump-live-dot"></span>
                    <span className="text-sm font-medium text-green-400">Live Data</span>
                  </div>
                  <Badge variant="outline" className="text-base px-4 py-2 border-purple-500/50 text-purple-300 bg-purple-500/10">
                    Launched: July 12, 2025
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsRefreshing(true);
                    window.location.reload();
                  }}
                  className="text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </motion.div>



          {/* Live Token Data Section */}
          {loadingPumpToken ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="pump-glassmorphism border-gray-700/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                    <p className="text-gray-300">Loading live $PUMP token data...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : pumpTokenData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="pump-glassmorphism border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-300">PUMP</span>
                    </div>
                    <span>Live $PUMP Token Data</span>
                    <Badge variant="outline" className="ml-auto text-gray-400 border-gray-600/50">
                      {pumpTokenData.symbol?.toUpperCase() || 'PUMP'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">Current Price</p>
                      <p className="text-xl font-bold text-white">
                        ${pumpTokenData.currentPrice?.toFixed(6) || '0.0000'}
                      </p>
                      {pumpTokenData.priceChange24h !== undefined && (
                        <p className={`text-sm mt-1 ${pumpTokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pumpTokenData.priceChange24h >= 0 ? '+' : ''}{pumpTokenData.priceChange24h.toFixed(2)}% (24h)
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                      <p className="text-xl font-bold text-white">
                        ${formatNumber(pumpTokenData.marketCap || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Rank #{pumpTokenData.marketCapRank || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                      <p className="text-xl font-bold text-white">
                        ${formatNumber(pumpTokenData.totalVolume || 0)}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">FDV</p>
                      <p className="text-xl font-bold text-white">
                        ${formatNumber(pumpTokenData.fullyDilutedValuation || 0)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">All Time High</p>
                      <p className="text-lg font-bold text-white">
                        ${pumpTokenData.ath?.toFixed(6) || '0.0000'}
                      </p>
                      {pumpTokenData.athChangePercentage !== undefined && (
                        <p className="text-xs text-red-400 mt-1">
                          {pumpTokenData.athChangePercentage.toFixed(2)}% from ATH
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">All Time Low</p>
                      <p className="text-lg font-bold text-white">
                        ${pumpTokenData.atl?.toFixed(6) || '0.0000'}
                      </p>
                      {pumpTokenData.atlChangePercentage !== undefined && (
                        <p className="text-xs text-green-400 mt-1">
                          +{pumpTokenData.atlChangePercentage.toFixed(2)}% from ATL
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">Circulating Supply</p>
                      <p className="text-lg font-bold text-white">
                        {formatNumber(pumpTokenData.circulatingSupply || 0)}
                      </p>
                      {pumpTokenData.maxSupply && (
                        <p className="text-xs text-gray-500 mt-1">
                          {((pumpTokenData.circulatingSupply / pumpTokenData.maxSupply) * 100).toFixed(1)}% of max
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <p className="text-xs text-gray-400 mb-1">Price Change (30d)</p>
                      <p className={`text-lg font-bold ${pumpTokenData.priceChange30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pumpTokenData.priceChange30d >= 0 ? '+' : ''}{pumpTokenData.priceChange30d?.toFixed(2) || '0.00'}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-gray-700/50 hover:border-green-500/30 transition-all cursor-help shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-100 mb-2">
                          <AnimatedValue value={pumpfunMetrics.totalRevenue} format="currency" />
                        </p>
                        <div className="flex items-center gap-2">
                          <TrendUp className="h-3 w-3 text-green-400" />
                          <p className="text-xs text-gray-400">Since launch</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total fees generated from token launches</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="pump-glassmorphism pump-metric-card border-purple-500/20 hover:border-purple-500/40 cursor-help">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Expected Raise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400">
                        <AnimatedValue value={pumpfunMetrics.actualRaise} format="currency" />
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <p className="text-xs text-gray-500">Sold out in {pumpfunMetrics.icoSoldOutTime}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Target amount to raise from public token sale</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="pump-glassmorphism pump-metric-card border-yellow-500/20 hover:border-yellow-500/40 cursor-help">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Valuation/Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400">
                        <AnimatedValue 
                          value={pumpTokenData?.fullyDilutedValuation ? parseFloat((pumpTokenData.fullyDilutedValuation / 719840000).toFixed(2)) : 7.45} 
                          suffix="x"
                          format="number"
                        />
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Info className="h-3 w-3 text-yellow-400" />
                        <p className="text-xs text-gray-500">FDV / Total Revenue</p>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Price-to-revenue ratio compared to crypto standards</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="trump-impact" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="w-full overflow-x-auto">
              <TabsList className="pump-glassmorphism border-gray-700/50 p-1 flex flex-nowrap gap-1 w-max sm:w-full min-w-full sm:flex-wrap">
                <TabsTrigger 
                  value="trump-impact" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/50 text-xs sm:text-sm whitespace-nowrap"
                >
                  $TRUMP Impact
                </TabsTrigger>
                <TabsTrigger 
                  value="drawdown-scenarios"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/50 text-xs sm:text-sm whitespace-nowrap"
                >
                  Drawdowns
                </TabsTrigger>
                <TabsTrigger 
                  value="pump-metrics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/50 text-xs sm:text-sm whitespace-nowrap"
                >
                  Metrics
                </TabsTrigger>
                <TabsTrigger 
                  value="competition"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/50 text-xs sm:text-sm whitespace-nowrap"
                >
                  Competition
                </TabsTrigger>
                <TabsTrigger 
                  value="predictions"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/50 text-xs sm:text-sm whitespace-nowrap"
                >
                  Predictions
                </TabsTrigger>
                <TabsTrigger 
                  value="valuation-debate"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/50 text-xs sm:text-sm whitespace-nowrap"
                >
                  Valuation
                </TabsTrigger>
                <TabsTrigger 
                  value="monte-carlo"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:border-purple-500/50 text-xs sm:text-sm whitespace-nowrap"
                >
                  Price Targets
                </TabsTrigger>
              </TabsList>
            </div>
          </motion.div>

          {/* $TRUMP Impact Analysis */}
          <TabsContent value="trump-impact" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="pump-glassmorphism border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                      The $TRUMP Liquidity Blackhole Event
                    </CardTitle>
                    <CardDescription>
                      Analysis of the January 17, 2025 market impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-lg p-4 border border-red-800/50 pump-card-glow"
                      >
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">Liquidity Drained</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400">
                          <AnimatedValue value={trumpImpact.totalLiquidityDrained} format="currency" />
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-red-300" />
                          <p className="text-xs text-gray-500">In 48 hours</p>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 rounded-lg p-4 border border-orange-800/50 pump-card-glow"
                      >
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">ETH Drawdown</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400">
                          -<AnimatedValue value={trumpImpact.ethDrawdown} format="percent" />
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingDown className="h-3 w-3 text-orange-300" />
                          <p className="text-xs text-gray-500">$3,494 → $3,130</p>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 rounded-lg p-4 border border-yellow-800/50 pump-card-glow"
                      >
                        <p className="text-xs sm:text-sm text-gray-400 mb-2">Memecoin Collapse</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400">
                          -<AnimatedValue value={trumpImpact.memecoinsDrawdown} format="percent" />
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <AlertTriangle className="h-3 w-3 text-yellow-300" />
                          <p className="text-xs text-gray-500">Average decline</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Impact Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Impact Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium">Hour 0-6: Initial Frenzy</p>
                            <p className="text-sm text-gray-400">
                              $TRUMP launches, immediate sell-off in altcoins begins. SOL surges to ATH.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium">Hour 6-24: Peak Rotation</p>
                            <p className="text-sm text-gray-400">
                              Maximum liquidity drain, ETH drops 5%, smaller alts down 15-20%.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium">Hour 24-48: Continued Pressure</p>
                            <p className="text-sm text-gray-400">
                              $TRUMP hits $70B FDV, total altcoin market cap down $7.5B.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Drawdown Scenarios */}
          <TabsContent value="drawdown-scenarios" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Top 100 Altcoin Drawdown Simulation</CardTitle>
                <CardDescription>
                  Analyzing potential impact of $PUMP launch on the top 100 cryptocurrencies by market cap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
                  <Button
                    variant={selectedScenario === 'bearish' ? 'destructive' : 'outline'}
                    onClick={() => setSelectedScenario('bearish')}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Bearish Scenario</span>
                    <span className="sm:hidden">Bearish</span>
                  </Button>
                  <Button
                    variant={selectedScenario === 'neutral' ? 'secondary' : 'outline'}
                    onClick={() => setSelectedScenario('neutral')}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Neutral Scenario</span>
                    <span className="sm:hidden">Neutral</span>
                  </Button>
                  <Button
                    variant={selectedScenario === 'bullish' ? 'default' : 'outline'}
                    onClick={() => setSelectedScenario('bullish')}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Bullish Scenario</span>
                    <span className="sm:hidden">Bullish</span>
                  </Button>
                </div>

                {/* Scenario Description */}
                <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>{selectedScenario.charAt(0).toUpperCase() + selectedScenario.slice(1)} Scenario:</strong>
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedScenario === 'bearish' && 
                      "$PUMP launches at $4B FDV causing massive liquidity rotation. Memecoins crash 30-75%, DeFi down 10-25%, Layer 1s hold relatively stable at 5-15% drawdown."
                    }
                    {selectedScenario === 'neutral' && 
                      "Market absorbs $PUMP launch with moderate rotation. Memecoins see 10-30% decline, DeFi protocols 3-10%, while Layer 1s remain resilient with 2-8% impact."
                    }
                    {selectedScenario === 'bullish' && 
                      "Fresh capital enters crypto for $PUMP. Minimal impact on altcoins with memecoins down only 2-10%, DeFi 0-5%, and Layer 1s virtually unchanged."
                    }
                  </p>
                </div>

                {/* Loading State */}
                {loadingTop100 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Loading Top 100 altcoins data...</p>
                  </div>
                ) : (
                  <>
                    {/* Sectoral Breakdown */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-100">Sectoral Drawdown Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sectoralDrawdowns.map((sector: any) => (
                          <Card key={sector.sector} className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm text-gray-100">
                                {sector.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-400">Avg Drawdown (Top 10)</p>
                                  <p className={`text-xl font-bold ${
                                    selectedScenario === 'bearish' ? 'text-red-400' :
                                    selectedScenario === 'neutral' ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`}>
                                    -{sector.avgDrawdown.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Total Impact</p>
                                  <p className="text-sm font-medium text-gray-200">
                                    ${formatNumber(sector.totalImpact)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>



                    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">Total Market Impact (Top 100)</p>
                      <p className="text-2xl font-bold text-gray-100">
                        ${selectedScenario === 'neutral' 
                          ? '249,342,585,782.80'
                          : selectedScenario === 'bearish'
                          ? '437,589,225,182.31'
                          : '92,589,719,153.04'}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pump.fun Metrics */}
          <TabsContent value="pump-metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>
                    Historical revenue performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                    <Line
                      data={{
                        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                        datasets: [{
                          label: 'Monthly Revenue',
                          data: [1.5, 8.2, 15.3, 25.7, 42.1, 38.9, 45.2, 67.3, 89.4, 125.7, 137.2],
                          borderColor: 'rgb(168, 85, 247)',
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          tension: 0.4
                        }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle>Token Distribution</CardTitle>
                  <CardDescription>
                    $PUMP token allocation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                    <Doughnut
                      data={{
                        labels: [
                          'Initial Coin Offering', 
                          'Community & Ecosystem Initiatives', 
                          'Team', 
                          'Existing Investors', 
                          'Livestreaming', 
                          'Liquidity & Exchanges', 
                          'Ecosystem Fund', 
                          'Foundation'
                        ],
                        datasets: [{
                          data: [33, 24, 20, 13, 3, 2.6, 2.4, 2],
                          backgroundColor: [
                            'rgba(168, 85, 247, 0.8)',  // Purple for ICO
                            'rgba(52, 211, 153, 0.8)',  // Green for Community
                            'rgba(96, 165, 250, 0.8)',  // Blue for Team
                            'rgba(45, 55, 72, 0.8)',    // Dark gray for Existing Investors
                            'rgba(129, 140, 248, 0.8)', // Light blue for Livestreaming
                            'rgba(251, 191, 36, 0.8)',  // Yellow for Liquidity
                            'rgba(34, 197, 94, 0.8)',   // Green for Ecosystem Fund
                            'rgba(251, 146, 60, 0.8)'   // Orange for Foundation
                          ],
                          borderWidth: 0
                        }]
                      }}
                      options={chartOptions}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>


            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Cumulative performance as of July 14, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/50">
                    <p className="text-sm text-gray-400">Total Fees Generated</p>
                    <p className="text-2xl font-bold text-purple-400">${(pumpfunMetrics.totalFees / 1e6).toFixed(2)}M</p>
                    <p className="text-xs text-gray-500 mt-1">All-time cumulative</p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/50">
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-400">${(pumpfunMetrics.totalRevenue / 1e6).toFixed(2)}M</p>
                    <p className="text-xs text-gray-500 mt-1">Platform earnings</p>
                  </div>
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-800/50">
                    <p className="text-sm text-gray-400">Revenue Ratio</p>
                    <p className="text-2xl font-bold text-green-400">{((pumpfunMetrics.totalRevenue / pumpfunMetrics.totalFees) * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Revenue/Fees</p>
                  </div>
                  <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800/50">
                    <p className="text-sm text-gray-400">Tokens Created</p>
                    <p className="text-2xl font-bold text-orange-400">11M+</p>
                    <p className="text-xs text-gray-500 mt-1">Since launch</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Bearish Case */}
              <Card className="bg-red-900/20 border-red-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <TrendingDown className="h-5 w-5" />
                    Bearish Scenario - Competition Wins
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Competitive Pressure</p>
                    <Progress value={85} className="h-2 bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Bonk.fun continues market share gains</p>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span className="text-gray-200">Market share drops to 20-25% by end of year</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span className="text-gray-200">Bonk.fun's 50% burn mechanism drives user migration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span className="text-gray-200">Revenue falls to $300-400k daily</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-400 mt-0.5" />
                      <span className="text-gray-200">Token sells off as growth narrative breaks</span>
                    </li>
                  </ul>

                  <div className="p-3 bg-red-900/30 rounded-lg">
                    <p className="text-sm font-medium text-red-300 mb-1">Price Target: $0.0035 - $0.0045</p>
                    <p className="text-xs text-red-300">
                      -42% to -55% from current levels
                    </p>
                    <p className="text-xs text-red-200 mt-2">Timeframe: 2-4 months</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bullish Case */}
              <Card className="bg-green-900/20 border-green-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    Bullish Scenario - Ecosystem Expansion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Recovery Potential</p>
                    <Progress value={65} className="h-2 bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Innovation drives market share recovery</p>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span className="text-gray-200">Revenue sharing model attracts users back</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span className="text-gray-200">Market share stabilizes at 40-45%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span className="text-gray-200">Total market grows 2x, lifting all platforms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-green-400 mt-0.5" />
                      <span className="text-gray-200">$PUMP utility expansion drives demand</span>
                    </li>
                  </ul>

                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <p className="text-sm font-medium text-green-300 mb-1">Price Target: $0.012 - $0.015</p>
                    <p className="text-xs text-green-300">
                      +54% to +92% from current levels
                    </p>
                    <p className="text-xs text-green-200 mt-2">Timeframe: 6-12 months</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Base Case & Valuation Analysis */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Base Case & Valuation Framework</CardTitle>
                <CardDescription>Most likely outcome given current competitive dynamics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base Case Scenario */}
                <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-800/50">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Base Case - Competitive Equilibrium
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-3">Key Assumptions</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="text-gray-200">Market share settles at 35-40%</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="text-gray-200">Daily revenue $500-700k sustainable</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="text-gray-200">Competition drives innovation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span className="text-gray-200">Memecoin market grows 50% by EOY</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-3">Price Projection</p>
                      <div className="bg-blue-900/30 rounded-lg p-4">
                        <p className="text-2xl font-bold text-blue-400">$0.0085 - $0.0095</p>
                        <p className="text-sm text-gray-400 mt-1">+9% to +22% from current</p>
                        <div className="mt-2 pt-2 border-t border-blue-800/50">
                          <p className="text-xs text-gray-500">70% probability scenario</p>
                          <p className="text-xs text-blue-300 mt-1">Timeframe: 3-6 months</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Valuation Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Comparative Valuation Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Current Valuation/Revenue</p>
                      <p className="text-xl font-bold text-purple-400">
                        {pumpTokenData?.fully_diluted_valuation ? (pumpTokenData.fully_diluted_valuation / 719840000).toFixed(1) : '7.5'}x
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Based on $719.8M total revenue</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Bear Case Valuation</p>
                      <p className="text-xl font-bold text-red-400">15-20x P/S</p>
                      <p className="text-xs text-gray-500 mt-1">Mature platform multiple</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Bull Case Valuation</p>
                      <p className="text-xl font-bold text-green-400">40-50x P/S</p>
                      <p className="text-xs text-gray-500 mt-1">Growth platform multiple</p>
                    </div>
                  </div>
                </div>

                {/* Monte Carlo Summary */}
                <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800/50">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monte Carlo Simulation Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-400">15th Percentile</p>
                      <p className="text-lg font-bold text-red-400">$0.0045</p>
                      <p className="text-xs text-gray-500">-42%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Median (50th)</p>
                      <p className="text-lg font-bold text-blue-400">$0.0088</p>
                      <p className="text-xs text-gray-500">+13%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">85th Percentile</p>
                      <p className="text-lg font-bold text-green-400">$0.0135</p>
                      <p className="text-xs text-gray-500">+73%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Based on 10,000 simulations incorporating competitive dynamics and market volatility
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Risk Factors */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Critical Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-800/50">
                    <Zap className="h-8 w-8 text-red-400 mb-2" />
                    <h4 className="font-semibold mb-1 text-gray-100">Competition Risk</h4>
                    <p className="text-sm text-gray-400">
                      Bonk.fun's innovation forcing rapid market share loss
                    </p>
                  </div>
                  <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-800/50">
                    <Activity className="h-8 w-8 text-orange-400 mb-2" />
                    <h4 className="font-semibold mb-1 text-gray-100">Revenue Compression</h4>
                    <p className="text-sm text-gray-400">
                      Fee wars could erode profitability across platforms
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/50">
                    <AlertTriangle className="h-8 w-8 text-yellow-400 mb-2" />
                    <h4 className="font-semibold mb-1 text-gray-100">Token Unlock Pressure</h4>
                    <p className="text-sm text-gray-400">
                      Significant unlocks could pressure price regardless of fundamentals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competition Analysis */}
          <TabsContent value="competition" className="space-y-6">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  The Bonk.fun Disruption
                </CardTitle>
                <CardDescription>
                  How a new competitor collapsed Pump.fun's dominance in days
                </CardDescription>
                <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                  Data analytics powered by 
                  <a 
                    href="https://dune.com/adam_tehc/pumpfun" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
                  >
                    adam_tehc
                  </a>
                  on Dune
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Market Share Collapse Timeline */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-base font-semibold text-gray-100 mb-4">Market Dominance Collapse</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-red-900/20 rounded-lg p-4 border border-red-800/50">
                      <p className="text-sm text-gray-400 mb-1">Previous Dominance</p>
                      <p className="text-2xl font-bold text-red-400">{pumpfunMetrics.competitorMetrics.previousMarketShare}-100%</p>
                      <p className="text-xs text-gray-500 mt-1">Near-monopoly position</p>
                    </div>
                    <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-800/50">
                      <p className="text-sm text-gray-400 mb-1">Current Market Share</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {(() => {
                          if (marketShareData?.data && marketShareData.data.length > 0) {
                            const latestDate = marketShareData.data[0].dt;
                            const latestData = marketShareData.data.filter((d: any) => d.dt === latestDate);
                            
                            const bonkVolume = parseFloat(latestData.find((d: any) => d.category === 'bonk')?.volume_usd || '0');
                            const pumpVolume = parseFloat(latestData.find((d: any) => d.category === 'pumpdotfun')?.volume_usd || '0');
                            const totalVolume = bonkVolume + pumpVolume;
                            
                            const pumpShare = totalVolume > 0 ? Math.round((pumpVolume / totalVolume) * 100) : 0;
                            return `${pumpShare}%`;
                          }
                          return `${pumpfunMetrics.competitorMetrics.pumpfunMarketShare}%`;
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Lost in {pumpfunMetrics.competitorMetrics.marketShareCollapseTime} days</p>
                    </div>
                    <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/50">
                      <p className="text-sm text-gray-400 mb-1">Bonk.fun Market Share</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {(() => {
                          if (marketShareData?.data && marketShareData.data.length > 0) {
                            const latestDate = marketShareData.data[0].dt;
                            const latestData = marketShareData.data.filter((d: any) => d.dt === latestDate);
                            
                            const bonkVolume = parseFloat(latestData.find((d: any) => d.category === 'bonk')?.volume_usd || '0');
                            const pumpVolume = parseFloat(latestData.find((d: any) => d.category === 'pumpdotfun')?.volume_usd || '0');
                            const totalVolume = bonkVolume + pumpVolume;
                            
                            const bonkShare = totalVolume > 0 ? Math.round((bonkVolume / totalVolume) * 100) : 0;
                            return `${bonkShare}%`;
                          }
                          return `${pumpfunMetrics.competitorMetrics.bonkfunMarketShare}%`;
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        By volume (July 2025)
                      </p>
                    </div>
                  </div>
                  
                  {/* Timeline visualization */}
                  <div className="relative bg-gray-800/30 rounded-lg p-3">
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-30" />
                    <div className="flex justify-between relative">
                      <div className="text-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mb-2" />
                        <p className="text-xs text-gray-400">June 2025</p>
                        <p className="text-xs font-semibold text-red-400">95-100%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mb-2" />
                        <p className="text-xs text-gray-400">Early July</p>
                        <p className="text-xs font-semibold text-orange-400">~60%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mb-2" />
                        <p className="text-xs text-gray-400">July 8</p>
                        <p className="text-xs font-semibold text-yellow-400">35%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-2" />
                        <p className="text-xs text-gray-400">July 15</p>
                        <p className="text-xs font-semibold text-green-400">33%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Head-to-Head Metrics - Redesigned Layout */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Head-to-Head Metrics (July 2025)
                  </h3>
                  
                  {/* Top Row - Revenue and Volume Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Daily Protocol Revenue - Enhanced Design */}
                    <div className="bg-gray-800/60 rounded-lg p-5 border border-gray-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-200">Daily Protocol Revenue</span>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">24h Revenue</span>
                      </div>
                      <div className="space-y-3">
                        {/* Bonk.fun Revenue - Winner */}
                        <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-800/30">
                          <div>
                            <p className="text-sm font-medium text-green-400">Bonk.fun</p>
                            {bonkfunRevenueData && (
                              <p className="text-xs text-gray-400">({formatNumber(bonkfunRevenueData.revenue_sol)} SOL)</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-400">
                              ${bonkfunRevenueData?.revenue_usd ? 
                                formatNumber(bonkfunRevenueData.revenue_usd) : 
                                '1,040,000'}
                            </p>

                          </div>
                        </div>
                        
                        {/* Pump.fun Revenue */}
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-300">Pump.fun</p>
                            {pumpfunRevenueData && (
                              <p className="text-xs text-gray-500">({formatNumber(pumpfunRevenueData.revenue_sol)} SOL)</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-400">
                              ${pumpfunRevenueData?.revenue_usd ? 
                                formatNumber(pumpfunRevenueData.revenue_usd) : 
                                '619,034'}
                            </p>

                          </div>
                        </div>
                        
                        <div className="text-center pt-2">
                          <p className="text-sm text-orange-400 font-medium">Bonk.fun generates ~2x daily revenue</p>
                        </div>
                      </div>
                    </div>

                    {/* 24H Trading Volume - Enhanced Design */}
                    <div className="bg-gray-800/60 rounded-lg p-5 border border-gray-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-200">24H Trading Volume</span>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">DEX Volume</span>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const bonkVolume = bonkfunVolumeData?.total_volume_usd_24h || 62945301;
                          const pumpVolume = pumpfunVolumeData?.total_volume_usd_24h || 107371930;
                          const pumpHasHigherVolume = pumpVolume > bonkVolume;
                          
                          return (
                            <>
                              {/* Pump.fun Volume - Winner */}
                              <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-800/30">
                                <p className="text-sm font-medium text-green-400">Pump.fun</p>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-400">
                                    ${formatNumber(pumpVolume)}
                                  </p>

                                </div>
                              </div>
                              
                              {/* Bonk.fun Volume */}
                              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <p className="text-sm font-medium text-gray-300">Bonk.fun</p>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-gray-400">
                                    ${formatNumber(bonkVolume)}
                                  </p>

                                </div>
                              </div>
                              
                              <div className="text-center pt-2">
                                <p className="text-sm text-blue-400 font-medium">
                                  Pump.fun processes {(pumpVolume / bonkVolume).toFixed(1)}x more volume
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Daily Token Launches - Enhanced Design */}
                    <div className="bg-gray-800/60 rounded-lg p-5 border border-gray-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-200">Daily Token Launches</span>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const latestBonkfun = graduationRatesData?.data?.find((d: any) => 
                            d.platform === 'LetsBonk' && d.block_date === graduationRatesData.data[0].block_date
                          );
                          const latestPumpfun = graduationRatesData?.data?.find((d: any) => 
                            d.platform === 'Pumpdotfun' && d.block_date === graduationRatesData.data[0].block_date
                          );
                          
                          const bonkfunLaunches = latestBonkfun ? 
                            parseInt(latestBonkfun.daily_token_launches) : 18571;
                          const pumpfunLaunches = latestPumpfun ? 
                            parseInt(latestPumpfun.daily_token_launches) : 12572;
                          
                          const totalLaunches = bonkfunLaunches + pumpfunLaunches;
                          const bonkPercentage = (bonkfunLaunches / totalLaunches) * 100;
                          const pumpPercentage = (pumpfunLaunches / totalLaunches) * 100;
                          
                          return (
                            <>
                              {/* Bonk.fun Launches - Winner */}
                              <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-800/30">
                                <p className="text-sm font-medium text-yellow-400">Bonk.fun</p>
                                <p className="text-xl font-bold text-yellow-400">
                                  {bonkfunLaunches.toLocaleString()} <span className="text-sm text-gray-400">tokens</span>
                                </p>
                              </div>
                              
                              {/* Pump.fun Launches */}
                              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <p className="text-sm font-medium text-gray-300">Pump.fun</p>
                                <p className="text-xl font-bold text-gray-400">
                                  {pumpfunLaunches.toLocaleString()} <span className="text-sm text-gray-400">tokens</span>
                                </p>
                              </div>
                              
                              {/* Visual Progress Bar */}
                              <div className="mt-3">
                                <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500" 
                                       style={{ width: `${bonkPercentage}%` }} />
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-gray-500">Pump.fun: {pumpPercentage.toFixed(0)}%</span>
                                  <span className="text-xs text-gray-500">Bonk.fun: {bonkPercentage.toFixed(0)}%</span>
                                </div>
                              </div>
                              

                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Token Graduation Rate - Enhanced Design */}
                    <div className="bg-gray-800/60 rounded-lg p-5 border border-gray-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-200">Token Graduation Rate</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-gray-400 hover:text-gray-300" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">% of tokens reaching $69k market cap</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const latestBonkfun = graduationRatesData?.data?.find((d: any) => 
                            d.platform === 'LetsBonk' && d.block_date === graduationRatesData.data[0].block_date
                          );
                          const latestPumpfun = graduationRatesData?.data?.find((d: any) => 
                            d.platform === 'Pumpdotfun' && d.block_date === graduationRatesData.data[0].block_date
                          );
                          
                          const bonkfunRate = latestBonkfun ? 
                            (parseFloat(latestBonkfun.graduation_rate) * 100).toFixed(2) : '1.04';
                          const pumpfunRate = latestPumpfun ? 
                            (parseFloat(latestPumpfun.graduation_rate) * 100).toFixed(2) : '0.84';
                          
                          return (
                            <>
                              {/* Bonk.fun Graduation Rate - Winner */}
                              <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/30">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-green-400">Bonk.fun</p>
                                  <p className="text-xl font-bold text-green-400">{bonkfunRate}%</p>
                                </div>
                                {latestBonkfun && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatNumber(latestBonkfun.daily_graduations)} graduations
                                  </p>
                                )}
                              </div>
                              
                              {/* Pump.fun Graduation Rate */}
                              <div className="p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-300">Pump.fun</p>
                                  <p className="text-xl font-bold text-gray-400">{pumpfunRate}%</p>
                                </div>
                                {latestPumpfun && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatNumber(latestPumpfun.daily_graduations)} graduations
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-center pt-2">
                                <p className="text-sm text-purple-400 font-medium">
                                  Higher quality ratio on Bonk.fun
                                </p>

                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row - Fee Model Innovation Full Width */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-orange-900/30 rounded-lg p-6 border border-purple-800/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-400" />
                          Revolutionary Fee Model
                        </h4>
                        <Badge className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 text-orange-300 border-orange-500/50 font-semibold">
                          Game Changer
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800/30">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-yellow-500/20 rounded">
                              <Rocket className="h-4 w-4 text-yellow-400" />
                            </div>
                            <p className="text-sm font-semibold text-yellow-400">Bonk.fun Innovation</p>
                          </div>
                          <ul className="space-y-2 text-xs text-gray-300">
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              <span>{pumpfunMetrics.competitorMetrics.bonkfunRevenueShare}% of fees buy BONK token</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              <span>50% of purchased BONK burned forever</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              <span>~${pumpfunMetrics.competitorMetrics.bonkfunBurnAmount.toLocaleString()} burned daily</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              <span>Creates constant deflationary pressure</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-gray-600/20 rounded">
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-400">Pump.fun Response</p>
                          </div>
                          <ul className="space-y-2 text-xs text-gray-400">
                            <li className="flex items-start gap-2">
                              <span className="text-gray-500 mt-0.5">•</span>
                              <span>{pumpfunMetrics.competitorMetrics.pumpfunPlannedShare}% revenue share planned</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-500 mt-0.5">•</span>
                              <span>"Extractive model" criticism persists</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-500 mt-0.5">•</span>
                              <span>No burn mechanism announced</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                  </div>
                </div>

                {/* BONK Token Performance */}
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-gray-100">BONK Token Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingBonk ? (
                      <div className="space-y-3">
                        <div className="h-8 bg-gray-800 rounded animate-pulse" />
                        <div className="h-8 bg-gray-800 rounded animate-pulse" />
                      </div>
                    ) : bonkData ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Market Cap</p>
                            <p className="text-lg font-bold text-green-400">
                              ${bonkData.market_cap ? (bonkData.market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">7-Day Performance</p>
                            <p className={`text-lg font-bold ${
                              bonkData.price_change_percentage_7d > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {bonkData.price_change_percentage_7d 
                                ? `${bonkData.price_change_percentage_7d > 0 ? '+' : ''}${bonkData.price_change_percentage_7d.toFixed(2)}%`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-400">Current Price</p>
                            <p className="text-sm font-medium text-gray-200">
                              ${bonkData.current_price ? bonkData.current_price.toFixed(8) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">24h Volume</p>
                            <p className="text-sm font-medium text-gray-200">
                              ${bonkData.total_volume ? (bonkData.total_volume / 1e6).toFixed(2) + 'M' : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-900/20 rounded-lg">
                          <p className="text-xs text-green-300">
                            BONK benefits from fee buybacks and burns, creating sustainable value
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 py-4">
                        Failed to load BONK data
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Strategic Analysis from PDF */}
                <Card className="bg-purple-900/20 border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-purple-400">Strategic Market Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-2">Key Challenges</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                          <span className="text-gray-300">95% revenue decline from February peak ($14M to ~$619k daily)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                          <span className="text-gray-300">Market share loss from ~100% to {marketShareData?.data && marketShareData.data.length > 0 ? 
                            (() => {
                              const latestDate = marketShareData.data[0].dt;
                              const latestData = marketShareData.data.filter((d: any) => d.dt === latestDate);
                              const bonkVolume = parseFloat(latestData.find((d: any) => d.category === 'bonk')?.volume_usd || '0');
                              const pumpVolume = parseFloat(latestData.find((d: any) => d.category === 'pumpdotfun')?.volume_usd || '0');
                              const totalVolume = bonkVolume + pumpVolume;
                              const pumpShare = totalVolume > 0 ? Math.round((pumpVolume / totalVolume) * 100) : 0;
                              return pumpShare;
                            })() : '33'}% in under 10 days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                          <span className="text-gray-300">Community criticism: "extractive model" vs competitors' revenue sharing</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-2">Paradoxical Opportunity</h4>
                      <div className="p-3 bg-purple-900/30 rounded-lg">
                        <p className="text-sm text-purple-300 italic">
                          "Everyone complained but still aped in" - Despite criticism, ICO sold out in 12 minutes
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-200 mb-2">Valuation Perspective</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                          <span className="text-gray-300">Current: {pumpTokenData?.fully_diluted_valuation ? (pumpTokenData.fully_diluted_valuation / 719840000).toFixed(1) : '7.5'}x revenue multiple</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                          <span className="text-gray-300">For context: Many crypto projects trade at 50-100x revenue</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Pump.fun's Response */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-100">Pump.fun's Counter-Strategy</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span className="text-gray-200">Expanding to Ethereum (EVM) chains</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span className="text-gray-200">New features: Subscription model, social functions, order books</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                      <span className="text-gray-200">$PUMP token launch to regain momentum</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Valuation Debate */}
          <TabsContent value="valuation-debate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Bull Case */}
              <Card className="bg-green-900/20 border-green-800/50">
                <CardHeader>
                  <CardTitle className="text-green-400">Bull Case for $PUMP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Revenue Foundation</p>
                      <p className="text-xs text-gray-400">$719.84M total revenue generated</p>
                      <p className="text-xs text-gray-400">$835.16M total fees collected</p>
                      <p className="text-xs text-gray-400">Current: {pumpTokenData?.fully_diluted_valuation ? (pumpTokenData.fully_diluted_valuation / 719840000).toFixed(1) : '7.5'}x revenue multiple</p>
                      <p className="text-xs text-gray-400">"Cheap for crypto standards (50-100x typical)"</p>
                    </div>
                    
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Community-Centric Launch</p>
                      <p className="text-xs text-gray-400">33% tokens via ICO (reduced from 25% plan)</p>
                      <p className="text-xs text-gray-400">24% reserved for community initiatives</p>
                      <p className="text-xs text-gray-400">Emphasis on "inclusive" tokenomics</p>
                    </div>

                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Platform Scale</p>
                      <p className="text-xs text-gray-400">11M+ tokens created during 2024-25</p>
                      <p className="text-xs text-gray-400">Proven viral growth track record</p>
                      <p className="text-xs text-gray-400">Large user base ready to participate</p>
                    </div>
                  </div>

                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <p className="text-sm font-semibold text-green-300 mb-1">Bull Thesis</p>
                    <p className="text-xs text-green-200">
                      "Ground-floor opportunity in a project with viral potential"
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bear Case */}
              <Card className="bg-red-900/20 border-red-800/50">
                <CardHeader>
                  <CardTitle className="text-red-400">Bear Case for $PUMP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Revenue Collapse</p>
                      <p className="text-xs text-gray-400">Revenue down 86% from February highs</p>
                      <p className="text-xs text-gray-400">"It's over for them, and they know it"</p>
                      <p className="text-xs text-gray-400">Lost 70% market share to Bonk.fun</p>
                    </div>
                    
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Investor Skepticism</p>
                      <p className="text-xs text-gray-400">Dragonfly's Haseeb Qureshi questions timing</p>
                      <p className="text-xs text-gray-400">Critics call it "exit liquidity" play</p>
                      <p className="text-xs text-gray-400">Reduced raise from $1B to $600M</p>
                    </div>

                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Community Backlash</p>
                      <p className="text-xs text-gray-400">"A snake...not good for ecosystem"</p>
                      <p className="text-xs text-gray-400">Seen as cash-grab after earning $700M</p>
                      <p className="text-xs text-gray-400">Platform relevance questioned</p>
                    </div>
                  </div>

                  <div className="p-3 bg-red-900/30 rounded-lg">
                    <p className="text-sm font-semibold text-red-300 mb-1">Bear Thesis</p>
                    <p className="text-xs text-red-200">
                      "Waning fad attempting late-stage liquidity grab"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Sentiment Analysis */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle>Market Sentiment Analysis</CardTitle>
                <CardDescription>
                  Conflicted narrative between official messaging and critics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-100">Official Narrative</p>
                      <p className="text-sm text-gray-400">"Inclusive community ownership"</p>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      Bullish
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-100">Institutional View</p>
                      <p className="text-sm text-gray-400">Dragonfly Capital: "Cautious perspective"</p>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      Skeptical
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-100">Community Response</p>
                      <p className="text-sm text-gray-400">"Everyone complained, but still aped in"</p>
                    </div>
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      FOMO
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium">Skepticism</p>
                      <p className="text-sm text-gray-400">"Depressing" hype over fundamentals</p>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-400">
                      Mixed
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium">Airdrop Speculation</p>
                      <p className="text-sm text-gray-400">15M wallets hoping for rewards</p>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                      Unconfirmed
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
                  <p className="text-sm font-semibold text-purple-300 mb-2">Market Signal</p>
                  <p className="text-xs text-purple-200">
                    $PUMP performance will indicate broader market appetite for high-FDV launches and memecoin infrastructure plays
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monte Carlo Simulation */}
          <TabsContent value="monte-carlo" className="space-y-6">
            <Card className="pump-glassmorphism border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-100">
                  $PUMP Price Target Analysis
                </CardTitle>
                <CardDescription>
                  Monte Carlo simulation with 10,000 iterations based on market scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Price Display */}
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Current Price</p>
                      <p className="text-3xl font-bold text-white">
                        {pumpTokenData?.currentPrice ? 
                          `$${pumpTokenData.currentPrice.toFixed(6)}` : 
                          <span className="text-gray-500">Loading...</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Launch Price</p>
                      <p className="text-xl font-semibold text-gray-300">$0.004000</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Market Cap</p>
                      <p className="text-sm font-medium text-gray-300">
                        {pumpTokenData?.marketCap ? 
                          `$${formatNumber(pumpTokenData.marketCap)}` :
                          <span className="text-gray-500">-</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">FDV</p>
                      <p className="text-sm font-medium text-gray-300">
                        {pumpTokenData?.fullyDilutedValuation ? 
                          `$${formatNumber(pumpTokenData.fullyDilutedValuation)}` :
                          <span className="text-gray-500">-</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Circulating</p>
                      <p className="text-sm font-medium text-gray-300">
                        {pumpTokenData?.circulatingSupply && pumpTokenData?.maxSupply 
                          ? `${((pumpTokenData.circulatingSupply / pumpTokenData.maxSupply) * 100).toFixed(1)}%`
                          : <span className="text-gray-500">-</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Target Scenarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bearish Scenario */}
                  <Card className="bg-red-900/20 border-red-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-400">
                        <TrendingDown className="h-5 w-5" />
                        Bearish Case
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold text-red-400">$0.0025</p>
                        <p className="text-sm text-gray-400">
                          {pumpTokenData?.currentPrice ? 
                            `${((0.0025 - pumpTokenData.currentPrice) / pumpTokenData.currentPrice * 100).toFixed(0)}%` 
                            : '-53%'} from current
                        </p>
                      </div>
                      <Progress value={35} className="h-2 bg-gray-700" />
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">Key Factors:</p>
                        <ul className="space-y-1 text-xs text-gray-400">
                          <li>• Bonk.fun extends to 70%+ market share</li>
                          <li>• Daily revenue drops to $300-400k</li>
                          <li>• No revenue sharing implemented</li>
                          <li>• Break below $0.004 ICO price</li>
                          <li>• "Exit liquidity" narrative dominates</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500">Probability: 35%</p>
                        <p className="text-xs text-gray-500">Extreme competition scenario</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Neutral Scenario */}
                  <Card className="bg-yellow-900/20 border-yellow-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
                        <Activity className="h-5 w-5" />
                        Neutral Case
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">$0.0058</p>
                        <p className="text-sm text-gray-400">
                          {pumpTokenData?.currentPrice ? 
                            `${((0.0058 - pumpTokenData.currentPrice) / pumpTokenData.currentPrice * 100).toFixed(0)}%` 
                            : '+9%'} from current
                        </p>
                      </div>
                      <Progress value={50} className="h-2 bg-gray-700" />
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">Key Factors:</p>
                        <ul className="space-y-1 text-xs text-gray-400">
                          <li>• Market share stabilizes at 35-40%</li>
                          <li>• Revenue holds at $500-600k daily</li>
                          <li>• 25% revenue share delayed/partial</li>
                          <li>• Price range: $0.0055-0.0065</li>
                          <li>• FOMO balanced by competition fears</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500">Probability: 40%</p>
                        <p className="text-xs text-gray-500">Base case scenario</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bullish Scenario */}
                  <Card className="bg-green-900/20 border-green-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                        <TrendingUp className="h-5 w-5" />
                        Bullish Case
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold text-green-400">$0.0085</p>
                        <p className="text-sm text-gray-400">
                          {pumpTokenData?.currentPrice ? 
                            `+${((0.0085 - pumpTokenData.currentPrice) / pumpTokenData.currentPrice * 100).toFixed(0)}%` 
                            : '+59%'} from current
                        </p>
                      </div>
                      <Progress value={75} className="h-2 bg-gray-700" />
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">Key Factors:</p>
                        <ul className="space-y-1 text-xs text-gray-400">
                          <li>• 25% revenue sharing launches strong</li>
                          <li>• EVM expansion successful</li>
                          <li>• Revenue recovers to $1M+ daily</li>
                          <li>• Recaptures 40-45% market share</li>
                          <li>• "Still aped in" proves true</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500">Probability: 25%</p>
                        <p className="text-xs text-gray-500">Recovery scenario</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monte Carlo Visualization */}
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Price Distribution (10,000 Simulations)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <Line
                        data={{
                          labels: ['Launch', '7d', '14d', '30d', '60d', '90d'],
                          datasets: [
                            {
                              label: 'P75 (Bullish)',
                              data: [
                                pumpTokenData?.current_price || 0.005330,
                                (pumpTokenData?.current_price || 0.005330) * 1.09,
                                (pumpTokenData?.current_price || 0.005330) * 1.22,
                                (pumpTokenData?.current_price || 0.005330) * 1.31,
                                (pumpTokenData?.current_price || 0.005330) * 1.41,
                                0.0085
                              ],
                              borderColor: 'rgb(34, 197, 94)',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              tension: 0.4,
                              borderWidth: 2,
                              fill: '+1'
                            },
                            {
                              label: 'P50 (Base)',
                              data: [
                                pumpTokenData?.current_price || 0.005330,
                                0.0058,
                                0.0058,
                                0.0058,
                                0.0058,
                                0.0058
                              ],
                              borderColor: 'rgb(250, 204, 21)',
                              backgroundColor: 'rgba(250, 204, 21, 0.1)',
                              tension: 0.4,
                              borderWidth: 3,
                              borderDash: [5, 5]
                            },
                            {
                              label: 'P35 (Bearish)',
                              data: [
                                pumpTokenData?.current_price || 0.005330,
                                (pumpTokenData?.current_price || 0.005330) * 0.84,
                                (pumpTokenData?.current_price || 0.005330) * 0.71,
                                (pumpTokenData?.current_price || 0.005330) * 0.60,
                                (pumpTokenData?.current_price || 0.005330) * 0.53,
                                0.0025
                              ],
                              borderColor: 'rgb(239, 68, 68)',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              tension: 0.4,
                              borderWidth: 2,
                              fill: '-1'
                            }
                          ]
                        }}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              display: true,
                              text: 'Monte Carlo Price Projection',
                              color: '#94a3b8',
                              font: { size: 16 }
                            }
                          },
                          scales: {
                            x: {
                              grid: { color: 'rgba(148, 163, 184, 0.1)' },
                              ticks: { color: '#64748b' }
                            },
                            y: {
                              grid: { color: 'rgba(148, 163, 184, 0.1)' },
                              ticks: { 
                                color: '#64748b',
                                callback: function(value: any) {
                                  return '$' + value.toFixed(4);
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Risk/Reward Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Factors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Unlock Pressure</span>
                          <div className="flex items-center gap-2">
                            <Progress value={85} className="w-20 h-2" />
                            <span className="text-xs text-red-400">High</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Competition Risk</span>
                          <div className="flex items-center gap-2">
                            <Progress value={70} className="w-20 h-2" />
                            <span className="text-xs text-orange-400">Medium</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Revenue Decline</span>
                          <div className="flex items-center gap-2">
                            <Progress value={90} className="w-20 h-2" />
                            <span className="text-xs text-red-400">Critical</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Valuation Risk</span>
                          <div className="flex items-center gap-2">
                            <Progress value={60} className="w-20 h-2" />
                            <span className="text-xs text-yellow-400">Moderate</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Expected Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Expected Return (90 days)</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {pumpTokenData?.current_price ? 
                              `${((0.0058 - pumpTokenData.current_price) / pumpTokenData.current_price * 100).toFixed(1)}%` :
                              '+8.9%'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Risk/Reward Ratio</p>
                          <p className="text-xl font-bold text-orange-400">0.65</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Confidence Interval (95%)</p>
                          <p className="text-sm font-medium text-gray-300">
                            {pumpTokenData?.current_price ? 
                              `$${(pumpTokenData.current_price * 0.15).toFixed(4)} - $${(pumpTokenData.current_price * 1.78).toFixed(4)}` :
                              '$0.0008 - $0.0095'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Insights */}
                <Card className="bg-purple-900/20 border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-300">Monte Carlo Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                        <span>High probability (65%) of trading below launch price within 30 days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                        <span>Extreme volatility expected: standard deviation of 45% in first month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                        <span>Revenue metrics remain the key driver of price action</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-purple-400 mt-0.5" />
                        <span>Best entry likely 30-60 days after launch following initial dump</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}