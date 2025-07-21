import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertCircle,
  Bitcoin,
  DollarSign,
  Zap,
  Filter,
  ExternalLink,
  Activity,
  Sparkles,
  MessageSquare,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VeloNewsItem {
  id: number;
  time: number;
  headline: string;
  source: string;
  priority: number | string;
  coins: string[];
  summary: string;
  link: string | null;
  effectiveTime?: number;
  effectivePrice?: number;
}

interface SpotPrices {
  [symbol: string]: number;
}



function TimeAgo({ timestamp }: { timestamp: number }) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setTimeAgo(`${days}d ago`);
      } else if (hours > 0) {
        setTimeAgo(`${hours}h ago`);
      } else if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo('Just now');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span>{timeAgo}</span>;
}

export default function VeloNewsDashboard() {
  const [selectedCoin, setSelectedCoin] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [newCoins, setNewCoins] = useState<string[]>([]);
  const previousNewsIds = useRef<Set<number>>(new Set());
  const previousCoins = useRef<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch news data with auto-refresh - optimized for fastest possible updates
  const { data: newsResponse, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['/api/velo/news'],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds for near real-time updates
    staleTime: 0, // Always consider data stale to ensure fresh updates
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when reconnecting to network
  });

  const newsData = newsResponse?.data?.stories || newsResponse?.data || [];

  // Extract unique coins from news items
  const uniqueCoins = React.useMemo(() => {
    const coins = new Set<string>();
    newsData.forEach((item: VeloNewsItem) => {
      item.coins.forEach((coin: string) => coins.add(coin));
    });
    return Array.from(coins);
  }, [newsData]);

  // Fetch live spot prices from Velo API
  const { data: spotPrices } = useQuery({
    queryKey: ['/api/velo/spot-prices', uniqueCoins],
    queryFn: async () => {
      if (uniqueCoins.length === 0) return {};
      const response = await fetch(`/api/velo/spot-prices?symbols=${uniqueCoins.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch spot prices');
      return response.json();
    },
    enabled: uniqueCoins.length > 0,
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 0
  });

  // Track new items and new coins
  useEffect(() => {
    if (newsData.length > 0) {
      // Track new news items
      const currentIds = new Set(newsData.map((item: VeloNewsItem) => item.id));
      const newIds = [...currentIds].filter(id => !previousNewsIds.current.has(id));
      
      if (previousNewsIds.current.size > 0 && newIds.length > 0) {
        setNewItemsCount(newIds.length);
        // Auto-dismiss notification after 5 seconds
        setTimeout(() => setNewItemsCount(0), 5000);
      }
      
      previousNewsIds.current = currentIds;

      // Track new coins
      const currentCoins = new Set<string>();
      newsData.forEach((item: VeloNewsItem) => {
        item.coins.forEach((coin: string) => currentCoins.add(coin));
      });
      
      const newCoinsList = [...currentCoins].filter(coin => !previousCoins.current.has(coin));
      
      if (previousCoins.current.size > 0 && newCoinsList.length > 0) {
        setNewCoins(newCoinsList);
        // Auto-dismiss new coins notification after 10 seconds
        setTimeout(() => setNewCoins([]), 10000);
      }
      
      previousCoins.current = currentCoins;
    }
  }, [newsData]);

  // Filter news based on selections - showing all available news
  const filteredNews = newsData.filter((item: VeloNewsItem) => {
    const coinMatch = selectedCoin === 'all' || item.coins.includes(selectedCoin.toUpperCase());
    const priorityMatch = selectedPriority === 'all' || 
      (selectedPriority === 'high' && (item.priority === 1 || item.priority === '1')) ||
      (selectedPriority === 'normal' && (item.priority === 2 || item.priority === '2')) ||
      (selectedPriority === 'low' && (item.priority > 2 || parseInt(item.priority as string) > 2));
    
    return coinMatch && priorityMatch;
  });

  // Get unique coins from all news items
  const allCoins = Array.from(new Set(newsData.flatMap((item: VeloNewsItem) => item.coins))).sort();



  // Calculate time range for available news
  const sortedNews = [...newsData].sort((a: VeloNewsItem, b: VeloNewsItem) => a.time - b.time);
  const oldestNews = sortedNews[0];
  const newestNews = sortedNews[sortedNews.length - 1];
  
  const timeRangeString = oldestNews && newestNews
    ? `${new Date(oldestNews.time).toLocaleString()} - ${new Date(newestNews.time).toLocaleString()}`
    : 'No news available';

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: number | string }) => {
    const pNum = typeof priority === 'string' ? parseInt(priority) : priority;
    
    if (pNum === 1) {
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          High Priority
        </Badge>
      );
    } else if (pNum === 2) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Bell className="w-3 h-3 mr-1" />
          Normal
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">
        <MessageSquare className="w-3 h-3 mr-1" />
        Low
      </Badge>
    );
  };

  // Get icon for coin
  const getCoinIcon = (coin: string) => {
    if (coin === 'BTC' || coin === 'BITCOIN') return <Bitcoin className="w-4 h-4" />;
    if (coin === 'USDT' || coin === 'USDC' || coin === 'USD') return <DollarSign className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Activity className="w-10 h-10 mr-3 text-emerald-400" />
              Velo News Feed
            </h1>
            <p className="text-gray-400">Live cryptocurrency news updates from Velo Data API</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* New items notification */}
            <AnimatePresence>
              {newItemsCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/30 flex items-center"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {newItemsCount} new {newItemsCount === 1 ? 'story' : 'stories'}
                </motion.div>
              )}
              
              {/* New coins notification */}
              {newCoins.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg border border-purple-500/30 flex items-center"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {newCoins.length} new {newCoins.length === 1 ? 'ticker' : 'tickers'}: {newCoins.join(', ')}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-refresh toggle */}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "transition-all",
                autoRefresh ? "bg-emerald-600 hover:bg-emerald-700" : ""
              )}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")} />
              {autoRefresh ? 'Auto-refresh ON (10s)' : 'Auto-refresh OFF'}
            </Button>

            {/* Manual refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Stories</p>
                  <p className="text-2xl font-bold text-white">{filteredNews.length}</p>
                </div>
                <Bell className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">High Priority</p>
                  <p className="text-2xl font-bold text-red-400">
                    {filteredNews.filter((n: VeloNewsItem) => n.priority === 1 || n.priority === '1').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Coins Covered</p>
                  <p className="text-2xl font-bold text-white">{allCoins.length}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Last Update</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(dataUpdatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* News Status Indicator */}
      <div className="max-w-7xl mx-auto mb-4">
        <Card className="bg-emerald-900/20 border-emerald-500/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-400 font-medium">
                Showing all available news updates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              
              {/* Coin filter with new coins indicator */}
              <div className="relative">
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="bg-gray-700 text-white rounded-lg px-4 py-2 pr-8 border border-gray-600 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Coins ({allCoins.length})</option>
                  {allCoins.map(coin => (
                    <option key={coin} value={coin.toLowerCase()}>
                      {coin}
                      {newCoins.includes(coin) && ' 🆕'}
                    </option>
                  ))}
                </select>
                
                {/* New coins notification */}
                {newCoins.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                  >
                    +{newCoins.length}
                  </motion.div>
                )}
              </div>

              {/* Priority filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

              <div className="ml-auto text-gray-400 text-sm">
                Showing {filteredNews.length} of {newsData.length} stories
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News Feed */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="w-6 h-6 mr-2 text-emerald-400" />
              Live News Feed
            </CardTitle>
            <CardDescription>
              Real-time updates from Velo Data API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
              <AnimatePresence>
                {filteredNews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p className="text-lg">No news items match your filters</p>
                    <p className="text-sm mt-2">Try adjusting your filter settings</p>
                  </div>
                ) : (
                  filteredNews.map((item: VeloNewsItem, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className={cn(
                        "p-4 rounded-lg mb-4 border transition-all duration-300",
                        "bg-gray-900/50 border-gray-700",
                        "hover:bg-gray-800/50 hover:border-gray-600",
                        item.priority === 1 || item.priority === '1' ? "border-l-4 border-l-red-500" : "",
                        item.priority === 2 || item.priority === '2' ? "border-l-4 border-l-yellow-500" : "",
                        (item.priority > 2 || parseInt(item.priority as string) > 2) ? "border-l-4 border-l-gray-500" : ""
                      )}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <a
                              href={item.coins.length > 0 ? `https://blofin.com/futures/${item.coins[0]}-USDT` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative"
                              title={item.coins.length > 0 ? `Trade ${item.coins[0]} on BloFin` : ''}
                            >
                              <h3 className="text-lg font-semibold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors cursor-pointer">
                                {item.headline}
                              </h3>
                            </a>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center text-gray-400">
                                <Clock className="w-4 h-4 mr-1" />
                                <TimeAgo timestamp={item.time} />
                              </div>
                              
                              <PriorityBadge priority={item.priority} />
                              
                              {item.source && (
                                <Badge variant="outline" className="text-gray-400 border-gray-600">
                                  {item.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Coins and Trade Buttons */}
                        {item.coins.length > 0 && (
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              {item.coins.map(coin => (
                                <Badge
                                  key={coin}
                                  className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                                >
                                  {getCoinIcon(coin)}
                                  <span className="ml-1">{coin}</span>
                                </Badge>
                              ))}
                            </div>
                            
                            {/* Trade Buttons */}
                            <div className="flex items-center gap-2">
                              {item.coins.map(coin => (
                                <a
                                  key={`trade-${coin}`}
                                  href={`https://blofin.com/futures/${coin}-USDT`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-md
                                    bg-black/90 border-2 border-green-400 text-green-400
                                    hover:bg-green-400/20 hover:border-green-300 hover:text-green-300
                                    transition-all duration-300 group
                                    shadow-[0_0_15px_rgba(74,222,128,0.6),inset_0_0_10px_rgba(74,222,128,0.2)] 
                                    hover:shadow-[0_0_30px_rgba(74,222,128,0.9),inset_0_0_15px_rgba(74,222,128,0.3)]
                                    animate-pulse-subtle"
                                >
                                  <Zap className="w-3 h-3 mr-1 group-hover:animate-pulse" />
                                  TRADE {coin}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {item.summary && (
                          <p className="text-gray-300 text-sm leading-relaxed mb-3">
                            {item.summary}
                          </p>
                        )}

                        {/* Effective Price from Velo API */}
                        {item.effectivePrice && (
                          <div className="bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/20 rounded-lg p-3 mb-3">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Effective Price */}
                              <div>
                                <span className="text-xs text-gray-400 uppercase tracking-wide">Effective Price</span>
                                <div className="text-2xl font-bold text-white mt-1">
                                  ${item.effectivePrice < 1 ? item.effectivePrice.toFixed(6) : item.effectivePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                {item.effectiveTime && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    <TimeAgo timestamp={item.effectiveTime} />
                                  </div>
                                )}
                              </div>
                              
                              {/* Current Live Price from Velo */}
                              {item.coins[0] && spotPrices?.[item.coins[0]] && (
                                <div>
                                  <span className="text-xs text-gray-400 uppercase tracking-wide">Live Price</span>
                                  <div className="text-2xl font-bold text-white mt-1">
                                    ${spotPrices[item.coins[0]] < 1 ? spotPrices[item.coins[0]].toFixed(6) : spotPrices[item.coins[0]].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-xs mt-1">
                                    {(() => {
                                      const priceDiff = ((spotPrices[item.coins[0]] - item.effectivePrice) / item.effectivePrice) * 100;
                                      const isPositive = priceDiff > 0;
                                      return (
                                        <span className={`flex items-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                          {isPositive ? '+' : ''}{priceDiff.toFixed(2)}%
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Trade Link */}
                        <div className="flex items-center justify-end">
                          {item.coins.length > 0 && (
                            <a
                              href={`https://blofin.com/futures/${item.coins[0]}-USDT`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              Trade on BloFin
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {index < filteredNews.length - 1 && (
                        <Separator className="bg-gray-700/50 mb-4" />
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>Powered by Velo Data API • Real-time cryptocurrency news feed</p>
        <p className="mt-2">Created by @0xMorpheusXBT</p>
      </div>
    </div>
  );
}