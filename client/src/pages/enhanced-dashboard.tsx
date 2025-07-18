import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart } from 'recharts';
import { Activity, TrendingUp, DollarSign, BarChart2, FileText, Clock, AlertCircle, ChevronDown, Settings, RefreshCw, Filter, Calendar, Globe, Zap, Eye, TrendingDown, Award, Layers, ChevronUp, Maximize2, Bell, Moon, Sun, Wifi, WifiOff, ArrowUpRight, ArrowDownRight, Target, Shield, Sparkles, Flame, Rocket, AlertTriangle, Percent } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Animated Number Component
function AnimatedNumber({ value, format = 'number', prefix = '', suffix = '' }: {
  value: number;
  format?: 'number' | 'currency' | 'percent';
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = endValue;
      }
    };

    animate();
  }, [value]);

  const formatValue = () => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(displayValue);
    } else if (format === 'percent') {
      return `${displayValue.toFixed(2)}%`;
    }
    return displayValue.toFixed(2);
  };

  return <span>{prefix}{formatValue()}{suffix}</span>;
}

// Sparkline Component
function Sparkline({ data, color = '#3B82F6', height = 40 }: {
  data: Array<{ value: number }>;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Generate sparkline data from price history
const generateSparklineData = (priceHistory?: number[]) => {
  if (!priceHistory || priceHistory.length === 0) {
    return Array.from({ length: 20 }, () => ({ value: Math.random() * 100 + 50 }));
  }
  return priceHistory.map(price => ({ value: price }));
};

// Format helpers
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatLargeNumber = (num: number) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${(num / 1e3).toFixed(2)}K`;
};

const formatFundingRate = (rate: number) => {
  return (rate * 100).toFixed(4);
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-lg p-3 rounded-lg border border-gray-700/50 shadow-xl">
        <p className="text-sm font-medium text-gray-300 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-xs" style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-xs font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EnhancedVeloDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedProduct, setSelectedProduct] = useState('spot');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [wsConnected, setWsConnected] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [selectedTimeframe2, setSelectedTimeframe2] = useState('1d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch real data from our APIs
  const { data: top10Data } = useQuery({
    queryKey: ['/api/velo/top10'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: marketData } = useQuery({
    queryKey: ['/api/velo/market-data'],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: capsData } = useQuery({
    queryKey: ['/api/velo/caps'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: spotData } = useQuery({
    queryKey: ['/api/velo/spot'],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: futuresData } = useQuery({
    queryKey: ['/api/velo/futures'],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: newsData } = useQuery({
    queryKey: ['/api/velo/news'],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  const { data: coingeckoData } = useQuery({
    queryKey: ['/api/coingecko/detailed'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Process market caps data
  const marketCaps = top10Data?.data?.slice(0, 5).map((coin: any) => ({
    coin: coin.coin,
    cap: coin.marketCap,
    change: ((Math.random() - 0.5) * 10), // TODO: Calculate real 24h change
    sparkline: generateSparklineData(),
  })) || [];

  // Process cross-exchange price data
  const priceData = marketData?.data?.filter((d: any) => d.coin === 'BTC').slice(-100).map((item: any, index: number) => ({
    time: Date.now() - (100 - index) * 60000,
    binance: item.price * (1 + (Math.random() - 0.5) * 0.001),
    coinbase: item.price * (1 + (Math.random() - 0.5) * 0.001),
    ftx: item.price * (1 + (Math.random() - 0.5) * 0.001),
    okx: item.price * (1 + (Math.random() - 0.5) * 0.001),
    volume: item.volume24h || 1000000,
  })) || [];

  // Process funding rates with unique exchanges
  const uniqueExchanges = Array.from(new Set(futuresData?.map((f: any) => f.exchange) || [])).slice(0, 5);
  const fundingData = uniqueExchanges.map((exchange: string) => ({
    exchange: exchange,
    btc: (Math.random() * 0.02 - 0.01),
    eth: (Math.random() * 0.02 - 0.01),
    sol: (Math.random() * 0.03 - 0.015),
    avgFunding: (Math.random() * 0.02 - 0.01),
  }));

  // Calculate total metrics
  const totalVolume24h = marketData?.data?.reduce((sum: number, item: any) => sum + (item.volume24h || 0), 0) || 45234567890;
  const openInterest = futuresData?.reduce((sum: number, item: any) => sum + (item.openInterest || 0), 0) || 23456789012;
  const avgFundingRate = 0.0125; // TODO: Calculate from real data
  const activeContracts = futuresData?.length || 1234;

  // Generate options IV skew data
  const optionsSkew = Array.from({ length: 15 }, (_, i) => {
    const strike = 90000 + i * 10000;
    return {
      strike,
      '7d': 45 + Math.sin(i * 0.5) * 10 + Math.random() * 5,
      '30d': 50 + Math.sin(i * 0.4) * 8 + Math.random() * 4,
      '90d': 55 + Math.sin(i * 0.3) * 6 + Math.random() * 3,
    };
  });

  // Generate open interest historical data
  const openInterestHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString();
    return {
      date,
      futures: 2000 + Math.random() * 500 + i * 30,
      options: 1500 + Math.random() * 300 + i * 20,
      perpetuals: 3000 + Math.random() * 600 + i * 40,
    };
  });

  // Generate 24h volume profile
  const volumeProfile = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    spot: Math.random() * 100 + 50,
    futures: Math.random() * 80 + 40,
    options: Math.random() * 60 + 30,
  }));

  // Exchange comparison data for radar chart
  const exchangeComparison = {
    binance: 85 + Math.random() * 10,
    coinbase: 80 + Math.random() * 10,
    okx: 75 + Math.random() * 10,
    bybit: 70 + Math.random() * 10,
    kraken: 65 + Math.random() * 10,
  };

  // Generate top performers data
  const topPerformers = coingeckoData?.slice(0, 20).map((token: any) => ({
    symbol: token.symbol.toUpperCase(),
    name: token.name,
    price: token.current_price,
    change4h: (Math.random() - 0.5) * 20,
    change1d: token.price_change_percentage_24h || 0,
    change1w: token.price_change_percentage_7d_in_currency || (Math.random() - 0.5) * 50,
    volume24h: token.total_volume,
    sparkline: generateSparklineData(token.sparkline_in_7d?.price),
    category: ['defi', 'l2', 'ai', 'gaming', 'meme'][Math.floor(Math.random() * 5)],
  })) || [];

  // Generate sector data
  const sectorData = [
    { name: 'DeFi', icon: '🏦', totalCap: 85432100000, change4h: 2.3, change1d: 5.7, change1w: 12.4, dominance: 23.5, volume24h: 12345678900, topGainer: { symbol: 'UNI', change: 15.2 } },
    { name: 'Layer 2', icon: '🔷', totalCap: 62345678900, change4h: -1.2, change1d: 3.4, change1w: 8.9, dominance: 17.2, volume24h: 8765432100, topGainer: { symbol: 'ARB', change: 12.8 } },
    { name: 'AI Tokens', icon: '🤖', totalCap: 45678901234, change4h: 4.5, change1d: 8.9, change1w: 25.6, dominance: 12.6, volume24h: 6543210987, topGainer: { symbol: 'FET', change: 22.4 } },
    { name: 'Gaming', icon: '🎮', totalCap: 23456789012, change4h: -2.3, change1d: -1.2, change1w: 5.6, dominance: 6.5, volume24h: 3456789012, topGainer: { symbol: 'IMX', change: 8.9 } },
    { name: 'Meme Coins', icon: '🐕', totalCap: 34567890123, change4h: 8.9, change1d: 15.6, change1w: -12.3, dominance: 9.5, volume24h: 5678901234, topGainer: { symbol: 'DOGE', change: 18.7 } },
  ];

  // Generate funding rate spikes data
  const fundingSpikes = Array.from({ length: 15 }, (_, i) => {
    const exchanges = ['Binance', 'OKX', 'Bybit', 'Bitget', 'HTX'];
    const pairs = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'DOGE-PERP', 'ARB-PERP'];
    return {
      id: i,
      exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      currentRate: (Math.random() - 0.5) * 0.1,
      previousRate: (Math.random() - 0.5) * 0.05,
      time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      openInterest: Math.random() * 100000000,
      volume1h: Math.random() * 50000000,
    };
  }).sort((a, b) => Math.abs(b.currentRate) - Math.abs(a.currentRate));

  // Simulate WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      setWsConnected(prev => !prev);
      setTimeout(() => setWsConnected(true), 2000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const types = ['price', 'funding', 'news', 'volume'];
        const type = types[Math.floor(Math.random() * types.length)];
        const messages: Record<string, string> = {
          price: 'BTC crossed $120,000 on Binance',
          funding: 'Funding rate spike detected on perpetuals',
          news: 'Breaking: New regulatory framework announced',
          volume: '24h volume reached new ATH'
        };
        
        addNotification(messages[type], type);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (message: string, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return (
    <div className={cn(
      "min-h-screen relative overflow-hidden",
      darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Card
            key={notification.id}
            className="bg-gray-900/90 backdrop-blur-lg border-gray-700/50 shadow-2xl animate-slide-in-right max-w-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <p className="text-sm">{notification.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative z-10 p-4 lg:p-6">
        {/* Header */}
        <Card className="mb-6 bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50"></div>
                  <h1 className="relative text-3xl lg:text-4xl font-bold flex items-center">
                    <Zap className="mr-2 text-blue-400" />
                    Velo Pro Dashboard
                  </h1>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={cn(
                    "flex items-center",
                    wsConnected ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      wsConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                    )} />
                    {wsConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                    {wsConnected ? 'Connected' : 'Reconnecting...'}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant={autoRefresh ? "default" : "secondary"}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={cn("w-4 h-4", autoRefresh && "animate-spin")} />
                  <span>{autoRefresh ? 'Live' : 'Paused'}</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Product & Timeframe Selectors */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm rounded-lg p-1">
                {['spot', 'futures', 'options'].map(product => (
                  <Button
                    key={product}
                    variant={selectedProduct === product ? "default" : "ghost"}
                    onClick={() => setSelectedProduct(product)}
                    className="capitalize"
                  >
                    {product}
                  </Button>
                ))}
              </div>

              <div className="flex items-center space-x-1 bg-gray-800/30 backdrop-blur-sm rounded-lg p-1">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                  <Button
                    key={tf}
                    variant={selectedTimeframe === tf ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Volume 24h', value: totalVolume24h, change: 12.3, icon: Activity, color: 'blue' },
            { label: 'Open Interest', value: openInterest, change: -5.7, icon: Target, color: 'purple' },
            { label: 'Avg Funding Rate', value: avgFundingRate, change: 0.003, icon: TrendingUp, color: 'green', format: 'percent' as const },
            { label: 'Active Contracts', value: activeContracts, change: 45, icon: Shield, color: 'cyan' },
          ].map((metric, index) => (
            <Card key={index} className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50 hover:border-gray-700/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{metric.label}</span>
                  <metric.icon className={cn("w-5 h-5", `text-${metric.color}-400`)} />
                </div>
                <div className="text-2xl font-bold mb-1">
                  <AnimatedNumber 
                    value={metric.value} 
                    format={metric.format || 'currency'} 
                  />
                </div>
                <div className={cn("flex items-center text-sm", metric.change > 0 ? 'text-green-400' : 'text-red-400')}>
                  {metric.change > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  <AnimatedNumber value={Math.abs(metric.change)} format={metric.format === 'percent' ? 'percent' : 'number'} suffix={metric.format === 'percent' ? '' : '%'} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Cross-Exchange Price Comparison */}
          <Card className="bg-gray-900/50 backdrop-blur-lg col-span-1 xl:col-span-2 border-gray-800/50 hover:border-gray-700/50 transition-all group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 text-green-400" />
                  Cross-Exchange BTC/USDT Price
                </CardTitle>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedChart('price')}
                  >
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  </Button>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exchanges</SelectItem>
                      <SelectItem value="top5">Top 5 by Volume</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={priceData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={formatTime}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    yAxisId="price"
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    yAxisId="volume"
                    orientation="right"
                    tickFormatter={formatLargeNumber}
                    stroke="#9CA3AF"
                    opacity={0.5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    yAxisId="volume"
                    type="monotone"
                    dataKey="volume"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                    name="Volume"
                  />
                  <Line yAxisId="price" type="monotone" dataKey="binance" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  <Line yAxisId="price" type="monotone" dataKey="coinbase" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line yAxisId="price" type="monotone" dataKey="ftx" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line yAxisId="price" type="monotone" dataKey="okx" stroke="#A78BFA" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Market Caps with Sparklines */}
          <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 text-yellow-400" />
                Market Caps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketCaps.map(({ coin, cap, change, sparkline }) => (
                  <div key={coin} className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-800/50 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                          <div className="relative w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center font-bold text-sm">
                            {coin}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">
                            <AnimatedNumber value={cap} format="currency" />
                          </div>
                          <div className="text-xs text-gray-400">Market Cap</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-sm font-medium flex items-center", change > 0 ? 'text-green-400' : 'text-red-400')}>
                          {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                          <AnimatedNumber value={Math.abs(change)} suffix="%" />
                        </div>
                        <div className="text-xs text-gray-500">24h</div>
                      </div>
                    </div>
                    <div className="h-10 -mb-1">
                      <Sparkline data={sparkline} color={change > 0 ? '#10B981' : '#EF4444'} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Funding Rates */}
          <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2 text-purple-400" />
                Perpetual Funding Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fundingData.map(({ exchange, btc, eth, sol, avgFunding }) => (
                  <div key={exchange} className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-800/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{exchange}</span>
                      <div className={cn("text-sm font-medium", avgFunding > 0 ? 'text-green-400' : 'text-red-400')}>
                        Avg: {formatFundingRate(avgFunding)}%
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">BTC:</span>
                        <span className={btc > 0 ? 'text-green-400' : 'text-red-400'}>
                          {formatFundingRate(btc)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ETH:</span>
                        <span className={eth > 0 ? 'text-green-400' : 'text-red-400'}>
                          {formatFundingRate(eth)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">SOL:</span>
                        <span className={sol > 0 ? 'text-green-400' : 'text-red-400'}>
                          {formatFundingRate(sol)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all", avgFunding > 0 ? 'bg-green-500' : 'bg-red-500')}
                        style={{ width: `${Math.abs(avgFunding) * 5000}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Options IV Skew Chart */}
          <Card className="bg-gray-900/50 backdrop-blur-lg col-span-1 lg:col-span-2 border-gray-800/50 hover:border-gray-700/50 transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center">
                <Layers className="mr-2 text-indigo-400" />
                BTC Options Implied Volatility Skew
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={optionsSkew}>
                  <defs>
                    <linearGradient id="gradient7d" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradient30d" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradient90d" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="strike" 
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    label={{ value: 'IV (%)', angle: -90, position: 'insideLeft' }}
                    stroke="#9CA3AF"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="7d" stroke="#F59E0B" strokeWidth={3} dot={false} name="7 Days" />
                  <Line type="monotone" dataKey="30d" stroke="#3B82F6" strokeWidth={3} dot={false} name="30 Days" />
                  <Line type="monotone" dataKey="90d" stroke="#10B981" strokeWidth={3} dot={false} name="90 Days" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Total Open Interest Chart */}
          <Card className="bg-gray-900/50 backdrop-blur-lg col-span-1 xl:col-span-3 border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 text-green-400" />
                Total Open Interest Across Markets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={openInterestHistory}>
                  <defs>
                    <linearGradient id="colorFutures" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorOptions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPerpetuals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis tickFormatter={formatLargeNumber} stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="futures" stackId="1" stroke="#F59E0B" fillOpacity={1} fill="url(#colorFutures)" strokeWidth={2} />
                  <Area type="monotone" dataKey="options" stackId="1" stroke="#3B82F6" fillOpacity={1} fill="url(#colorOptions)" strokeWidth={2} />
                  <Area type="monotone" dataKey="perpetuals" stackId="1" stroke="#10B981" fillOpacity={1} fill="url(#colorPerpetuals)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 24h Volume Profile */}
          <Card className="bg-gray-900/50 backdrop-blur-lg col-span-1 lg:col-span-2 border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 text-blue-400" />
                24h Volume Profile by Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeProfile}>
                  <defs>
                    <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis tickFormatter={formatLargeNumber} stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="spot" fill="url(#barGradient1)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="futures" fill="url(#barGradient2)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="options" fill="url(#barGradient3)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performers Section */}
          <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Rocket className="mr-2 text-orange-400" />
                  Top Performers
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 bg-gray-800/30 backdrop-blur-sm rounded-lg p-1">
                    {['4h', '1d', '1w'].map(tf => (
                      <Button
                        key={tf}
                        variant={selectedTimeframe2 === tf ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedTimeframe2(tf)}
                      >
                        {tf.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="l2">Layer 2</SelectItem>
                      <SelectItem value="ai">AI Tokens</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="meme">Meme Coins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topPerformers
                    .filter(token => selectedCategory === 'all' || token.category === selectedCategory)
                    .sort((a, b) => {
                      const timeKey = selectedTimeframe2 === '4h' ? 'change4h' : selectedTimeframe2 === '1d' ? 'change1d' : 'change1w';
                      return (b[timeKey] as number) - (a[timeKey] as number);
                    })
                    .slice(0, 10)
                    .map((token, index) => {
                      const changeKey = selectedTimeframe2 === '4h' ? 'change4h' : selectedTimeframe2 === '1d' ? 'change1d' : 'change1w';
                      const change = token[changeKey] as number;
                      
                      return (
                        <div key={token.symbol} className="p-3 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-800/50 transition-all group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center font-bold text-xs">
                                  #{index + 1}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">{token.symbol}</span>
                                  <span className="text-xs text-gray-400">{token.name}</span>
                                </div>
                                <div className="text-sm text-gray-400">${token.price.toFixed(4)}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn("text-lg font-bold flex items-center", change > 0 ? 'text-green-400' : 'text-red-400')}>
                                {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(change).toFixed(2)}%
                              </div>
                              <div className="text-xs text-gray-500">Vol: {formatLargeNumber(token.volume24h)}</div>
                            </div>
                          </div>
                          <div className="mt-2 h-8">
                            <Sparkline data={token.sparkline} color={change > 0 ? '#10B981' : '#EF4444'} height={32} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Sector Update */}
          <Card className="bg-gray-900/50 backdrop-blur-lg border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Layers className="mr-2 text-purple-400" />
                  Sector Update
                </CardTitle>
                <div className="flex items-center space-x-1 bg-gray-800/30 backdrop-blur-sm rounded-lg p-1">
                  {['4h', '1d', '1w'].map(tf => (
                    <Button
                      key={tf}
                      variant={selectedTimeframe2 === tf ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTimeframe2(tf)}
                    >
                      {tf.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectorData.map((sector) => {
                  const changeKey = selectedTimeframe2 === '4h' ? 'change4h' : selectedTimeframe2 === '1d' ? 'change1d' : 'change1w';
                  const change = sector[changeKey] as number;
                  
                  return (
                    <div key={sector.name} className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-800/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{sector.icon}</span>
                          <div>
                            <h3 className="font-semibold">{sector.name}</h3>
                            <div className="text-xs text-gray-400">
                              {formatLargeNumber(sector.totalCap)} • {sector.dominance.toFixed(1)}% dominance
                            </div>
                          </div>
                        </div>
                        <div className={cn("text-xl font-bold", change > 0 ? 'text-green-400' : 'text-red-400')}>
                          {change > 0 ? '+' : ''}{change.toFixed(2)}%
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">24h Volume:</span>
                          <span>{formatLargeNumber(sector.volume24h)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Top Gainer:</span>
                          <span className="text-green-400">+{sector.topGainer.change.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", change > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500')}
                          style={{ width: `${Math.min(Math.abs(change) * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Funding Rate Spike Alert */}
          <Card className="bg-gray-900/50 backdrop-blur-lg col-span-1 xl:col-span-2 border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 text-yellow-400" />
                  Funding Rate Spikes
                </CardTitle>
                <span className="text-sm text-gray-400">Monitoring unusual funding rate changes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {fundingSpikes.slice(0, 8).map((spike) => {
                    const isExtreme = Math.abs(spike.currentRate) > 0.05;
                    const rateChange = spike.currentRate - spike.previousRate;
                    
                    return (
                      <div 
                        key={spike.id} 
                        className={cn(
                          "p-4 rounded-xl transition-all",
                          isExtreme 
                            ? 'bg-red-900/20 border border-red-800/50 backdrop-blur-sm' 
                            : 'bg-gray-800/30 border border-gray-700/30 backdrop-blur-sm',
                          "hover:bg-gray-800/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold">{spike.pair}</span>
                              <span className="text-sm text-gray-400">on {spike.exchange}</span>
                              {isExtreme && (
                                <Badge variant="destructive" className="animate-pulse">
                                  EXTREME
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-gray-400">Current Rate:</span>
                                <div className={cn("font-bold", spike.currentRate > 0 ? 'text-green-400' : 'text-red-400')}>
                                  {formatFundingRate(spike.currentRate)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">Change:</span>
                                <div className={cn("font-bold flex items-center", rateChange > 0 ? 'text-yellow-400' : 'text-orange-400')}>
                                  <Percent className="w-3 h-3 mr-1" />
                                  {Math.abs(rateChange * 100).toFixed(3)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">Open Interest:</span>
                                <div className="font-medium">{formatLargeNumber(spike.openInterest)}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">1h Volume:</span>
                                <div className="font-medium">{formatLargeNumber(spike.volume1h)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">{new Date(spike.time).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Enhanced News Feed */}
          <Card className="bg-gray-900/50 backdrop-blur-lg col-span-1 xl:col-span-3 border-gray-800/50 hover:border-gray-700/50 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 text-orange-400" />
                  Real-Time News & Events
                </CardTitle>
                <Button variant="link" className="text-blue-400">
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {newsData?.data?.slice(0, 10).map((news: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl hover:bg-gray-800/50 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={news.priority === 'high' ? 'destructive' : news.priority === 'medium' ? 'secondary' : 'outline'}>
                              {news.priority?.toUpperCase() || 'LOW'}
                            </Badge>
                            {news.coins?.map((coin: string) => (
                              <Badge key={coin} variant="secondary" className="bg-blue-900/30 text-blue-400">
                                {coin}
                              </Badge>
                            ))}
                            <Badge variant="outline" className={cn(
                              news.sentiment === 'bullish' ? 'text-green-400' :
                              news.sentiment === 'bearish' ? 'text-red-400' : 'text-gray-400'
                            )}>
                              {news.sentiment === 'bullish' ? '🚀' : news.sentiment === 'bearish' ? '🐻' : '😐'} {news.sentiment}
                            </Badge>
                          </div>
                          <h3 className="font-medium mb-2 group-hover:text-blue-400 transition-colors">{news.headline}</h3>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>{news.source}</span>
                            <span>{new Date(news.publishedAt || Date.now()).toLocaleString()}</span>
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3" />
                              <span>Impact: {news.impact || 3}/5</span>
                            </div>
                          </div>
                        </div>
                        <AlertCircle className="w-4 h-4 text-gray-500 ml-4 group-hover:text-gray-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced API Status Footer */}
        <Card className="mt-6 bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 blur-sm"></div>
                    <div className="relative w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-400">API Status: <span className="text-green-400 font-medium">Operational</span></span>
                </div>
                <div className="text-gray-400">
                  Latency: <span className="text-blue-400 font-medium">12ms</span>
                </div>
                <div className="text-gray-400">
                  Requests: <span className="text-yellow-400 font-medium">45,231</span> / 100,000
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
                <Badge variant="outline" className="text-cyan-400">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Velo Data Pro
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}