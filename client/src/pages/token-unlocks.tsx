import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Lock, Unlock, AlertTriangle, Clock, 
  TrendingDown, Calendar, Bell, ExternalLink,
  ChevronDown, ChevronUp, Percent, BarChart3,
  Target, Shield, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TokenUnlock {
  token: string;
  gecko_id?: string;
  date: string;
  amount: string;
  percentage: number;
  impact: string;
  price?: number;
  value_usd?: number;
  type?: string;
  description?: string;
  daysUntil?: number;
  marketCap?: number;
  fdv?: number;
  circulatingSupply?: number;
  dilutionPercentage?: number;
  priceImpactEstimate?: number;
}

interface UnlockAlert {
  tokenId: string;
  unlockDate: string;
  alertType: 'price' | 'volume' | 'time';
  threshold: number;
}

export default function TokenUnlocks() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [sortBy, setSortBy] = useState<'date' | 'impact' | 'value'>('date');
  const [showOnlyHighImpact, setShowOnlyHighImpact] = useState(false);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  // Fetch unlock data
  const { data: unlocksData, isLoading: unlocksLoading } = useQuery<any>({
    queryKey: ['/api/defillama/unlocks'],
  });

  // Fetch token prices for unlock valuation
  const { data: tokenPrices } = useQuery<any>({
    queryKey: ['/api/coingecko/detailed'],
  });

  // Process unlock data with additional calculations
  const processedUnlocks: TokenUnlock[] = unlocksData?.slice(0, 50).map((unlock: any) => {
    const firstEvent = unlock.events?.[0];
    if (!firstEvent) return null;
    
    const unlockDate = new Date(firstEvent.timestamp * 1000);
    const now = new Date();
    const daysUntil = Math.floor((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate dilution percentage
    const unlockAmount = parseFloat(firstEvent.noOfTokens?.[0] || '0');
    const circulatingSupply = unlock.circSupply || 1;
    const dilutionPercentage = (unlockAmount / circulatingSupply) * 100;
    
    // Estimate price impact based on dilution
    let priceImpactEstimate = 0;
    if (dilutionPercentage > 10) priceImpactEstimate = -15;
    else if (dilutionPercentage > 5) priceImpactEstimate = -8;
    else if (dilutionPercentage > 2) priceImpactEstimate = -4;
    else if (dilutionPercentage > 1) priceImpactEstimate = -2;
    else priceImpactEstimate = -1;
    
    // Find token price from CoinGecko data
    const tokenData = tokenPrices?.find((t: any) => 
      t.symbol?.toLowerCase() === unlock.token?.split(':')[1]?.toLowerCase()
    );
    
    return {
      token: unlock.name || unlock.token,
      gecko_id: unlock.gecko_id,
      date: unlockDate.toISOString(),
      amount: unlockAmount.toLocaleString(),
      percentage: dilutionPercentage,
      impact: dilutionPercentage > 5 ? 'HIGH' : dilutionPercentage > 2 ? 'MEDIUM' : 'LOW',
      price: tokenData?.current_price,
      value_usd: tokenData?.current_price ? unlockAmount * tokenData.current_price : undefined,
      type: firstEvent.category || 'Unknown',
      description: firstEvent.description,
      daysUntil,
      marketCap: tokenData?.market_cap,
      fdv: tokenData?.fully_diluted_valuation,
      circulatingSupply,
      dilutionPercentage,
      priceImpactEstimate
    };
  }).filter(Boolean) || [];

  // Filter unlocks based on timeframe
  const filteredUnlocks = processedUnlocks.filter(unlock => {
    if (showOnlyHighImpact && unlock.impact !== 'HIGH') return false;
    
    const days = unlock.daysUntil || 0;
    switch (selectedTimeframe) {
      case '7d': return days >= 0 && days <= 7;
      case '30d': return days >= 0 && days <= 30;
      case '90d': return days >= 0 && days <= 90;
      default: return days >= 0;
    }
  });

  // Sort unlocks
  const sortedUnlocks = [...filteredUnlocks].sort((a, b) => {
    switch (sortBy) {
      case 'date': return (a.daysUntil || 0) - (b.daysUntil || 0);
      case 'impact': return (b.dilutionPercentage || 0) - (a.dilutionPercentage || 0);
      case 'value': return (b.value_usd || 0) - (a.value_usd || 0);
      default: return 0;
    }
  });

  // Calculate summary statistics
  const totalUnlockValue = sortedUnlocks.reduce((sum, u) => sum + (u.value_usd || 0), 0);
  const highImpactCount = sortedUnlocks.filter(u => u.impact === 'HIGH').length;
  const next7DaysCount = sortedUnlocks.filter(u => u.daysUntil !== undefined && u.daysUntil <= 7).length;

  // Chart data for unlock timeline
  const timelineData = {
    labels: sortedUnlocks.slice(0, 10).map(u => u.token),
    datasets: [
      {
        label: 'Days Until Unlock',
        data: sortedUnlocks.slice(0, 10).map(u => u.daysUntil || 0),
        backgroundColor: sortedUnlocks.slice(0, 10).map(u => 
          u.daysUntil && u.daysUntil <= 7 ? 'rgba(239, 68, 68, 0.5)' :
          u.daysUntil && u.daysUntil <= 30 ? 'rgba(245, 158, 11, 0.5)' :
          'rgba(34, 197, 94, 0.5)'
        ),
        borderColor: sortedUnlocks.slice(0, 10).map(u => 
          u.daysUntil && u.daysUntil <= 7 ? 'rgb(239, 68, 68)' :
          u.daysUntil && u.daysUntil <= 30 ? 'rgb(245, 158, 11)' :
          'rgb(34, 197, 94)'
        ),
        borderWidth: 2,
      },
    ],
  };

  const getUrgencyColor = (days?: number) => {
    if (!days) return 'text-gray-400';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-orange-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-gray-200 transition-colors">
              ← Back to Dashboard
            </Link>
            <Unlock className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Token Unlocks Monitor
            </h1>
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyHighImpact(!showOnlyHighImpact)}
              className={showOnlyHighImpact ? 'bg-red-500/20 border-red-500' : ''}
            >
              {showOnlyHighImpact ? 'High Impact Only' : 'All Unlocks'}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Total Unlock Value</p>
                  <p className="text-2xl font-bold text-red-400">
                    ${(totalUnlockValue / 1e6).toFixed(1)}M
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">High Impact</p>
                  <p className="text-2xl font-bold text-orange-400">{highImpactCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Next 7 Days</p>
                  <p className="text-2xl font-bold text-yellow-400">{next7DaysCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Avg Dilution</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {(sortedUnlocks.reduce((sum, u) => sum + (u.dilutionPercentage || 0), 0) / sortedUnlocks.length || 0).toFixed(1)}%
                  </p>
                </div>
                <Percent className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-400" />
                    Upcoming Token Unlocks
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="bg-gray-800 border-gray-700 rounded px-3 py-1 text-sm"
                    >
                      <option value="7d">Next 7 Days</option>
                      <option value="30d">Next 30 Days</option>
                      <option value="90d">Next 90 Days</option>
                      <option value="all">All Upcoming</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-gray-800 border-gray-700 rounded px-3 py-1 text-sm"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="impact">Sort by Impact</option>
                      <option value="value">Sort by Value</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {unlocksLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-800/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedUnlocks.map((unlock, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{unlock.token}</h4>
                              <Badge className={getImpactColor(unlock.impact)}>
                                {unlock.impact} IMPACT
                              </Badge>
                              <span className={`text-sm font-medium ${getUrgencyColor(unlock.daysUntil)}`}>
                                {unlock.daysUntil === 0 ? 'TODAY' : 
                                 unlock.daysUntil === 1 ? 'TOMORROW' :
                                 `${unlock.daysUntil} days`}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Unlock Amount</p>
                                <p className="font-medium">{unlock.amount}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Dilution</p>
                                <p className="font-medium text-orange-400">
                                  {(unlock.dilutionPercentage || 0).toFixed(2)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Est. Price Impact</p>
                                <p className="font-medium text-red-400">
                                  {unlock.priceImpactEstimate}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Value (USD)</p>
                                <p className="font-medium">
                                  ${unlock.value_usd ? (unlock.value_usd / 1e6).toFixed(2) + 'M' : 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <Progress 
                                value={Math.max(0, Math.min(100, (30 - (unlock.daysUntil || 0)) / 30 * 100))} 
                                className="h-2 flex-1"
                              />
                              <span className="text-xs text-gray-400">
                                {new Date(unlock.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <a
                              href={`https://www.bybit.com/trade/usdt/${unlock.token}USDT`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                            >
                              Short <Target className="w-3 h-3" />
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => setExpandedToken(expandedToken === unlock.token ? null : unlock.token)}
                            >
                              Details {expandedToken === unlock.token ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>

                        {expandedToken === unlock.token && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-gray-700"
                          >
                            <p className="text-sm text-gray-400 mb-2">{unlock.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Type</p>
                                <p>{unlock.type}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Market Cap</p>
                                <p>${unlock.marketCap ? (unlock.marketCap / 1e6).toFixed(0) + 'M' : 'N/A'}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                  Unlock Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar
                    data={timelineData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        x: { 
                          ticks: { color: '#888' }, 
                          grid: { color: '#333' },
                          title: {
                            display: true,
                            text: 'Days Until Unlock',
                            color: '#888'
                          }
                        },
                        y: { 
                          ticks: { color: '#888' }, 
                          grid: { color: '#333' }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30">
                    <Bell className="w-4 h-4 mr-2" />
                    Set Price Alerts for High Impact
                  </Button>
                  <Button className="w-full bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border-orange-500/30">
                    <Shield className="w-4 h-4 mr-2" />
                    Create Hedge Strategy
                  </Button>
                  <Button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-500/30">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Export Unlock Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}