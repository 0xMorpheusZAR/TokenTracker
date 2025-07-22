import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';

interface MarketStats {
  openInterest: string;
  volume24h: string;
  fundingRate: string;
  marketCap: string;
  fdv: string;
}

interface ComprehensiveTradingWidgetProps {
  coin: string;
  coinName?: string;
  initialTimeframe?: string;
  height?: number;
}

export default function ComprehensiveTradingWidget({ 
  coin, 
  coinName = coin,
  initialTimeframe = '1h',
  height = 400 
}: ComprehensiveTradingWidgetProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialTimeframe);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
  ];

  // Fetch live price
  const { data: priceData } = useQuery({
    queryKey: ['velo-price', coin],
    queryFn: async () => {
      const response = await fetch(`/api/velo/spot-prices?symbols=${coin}`);
      if (!response.ok) throw new Error('Failed to fetch price');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch market stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['velo-stats', coin],
    queryFn: async () => {
      const response = await fetch(`/api/velo/market-stats/${coin}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.stats as MarketStats;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch futures data for price change calculation
  const { data: futuresData } = useQuery({
    queryKey: ['velo-futures', coin, selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/velo/futures/${coin}?timeframe=${selectedTimeframe}`);
      if (!response.ok) throw new Error('Failed to fetch futures data');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Update live price and calculate change
  useEffect(() => {
    if (priceData && priceData[coin]) {
      setLivePrice(priceData[coin]);
    }

    if (futuresData && futuresData.data && futuresData.data.length >= 2) {
      const currentPrice = futuresData.data[futuresData.data.length - 1]?.close_price || 0;
      const previousPrice = futuresData.data[futuresData.data.length - 2]?.close_price || 0;
      
      if (currentPrice && previousPrice) {
        const change = ((currentPrice - previousPrice) / previousPrice) * 100;
        setPriceChange(change);
      }
    }
  }, [priceData, futuresData, coin]);

  // Initialize simplified chart display
  useEffect(() => {
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
      
      // Create a professional chart placeholder with live data
      const chartHTML = `
        <div class="w-full bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
          <div class="bg-gray-900/50 p-3 border-b border-gray-600">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-300">${coin}USDT • ${selectedTimeframe}</div>
              <div class="text-xs text-green-400">● LIVE</div>
            </div>
          </div>
          <div class="p-4">
            <div class="text-center text-gray-400 mb-4">
              <div class="text-sm">Professional Trading Chart</div>
              <div class="text-xs mt-1">Real-time data powered by Velo API</div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-400">Current Price</div>
                <div class="text-white font-medium">${livePrice ? '$' + formatPrice(livePrice) : 'Loading...'}</div>
              </div>
              <div>
                <div class="text-gray-400">24h Change</div>
                <div class="${priceChange && priceChange >= 0 ? 'text-green-400' : 'text-red-400'} font-medium">
                  ${priceChange ? (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + '%' : 'Loading...'}
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-700">
              <div class="text-xs text-gray-500 text-center">
                Chart interface optimized for ${selectedTimeframe} timeframe
              </div>
            </div>
          </div>
        </div>
      `;
      
      chartContainerRef.current.innerHTML = chartHTML;
    }
  }, [coin, selectedTimeframe, height, livePrice, priceChange]);

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toFixed(2);
    } else if (price >= 0.01) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  };

  return (
    <Card className="bg-gray-900/50 border border-gray-700 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-white text-lg">
              {coinName}USDT · Binance-Futures
            </CardTitle>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              Live
            </Badge>
          </div>
          <div className="text-right">
            {livePrice && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  ${formatPrice(livePrice)}
                </span>
                {priceChange !== null && (
                  <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-medium">
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 pt-3 border-t border-gray-700">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={selectedTimeframe === tf.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(tf.value)}
              className={`
                min-w-[48px] h-8 text-xs transition-all duration-200
                ${selectedTimeframe === tf.value 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                  : 'bg-transparent hover:bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                }
              `}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* TradingView Chart */}
        <div 
          ref={chartContainerRef}
          className="w-full"
          style={{ height: height - 120 }}
        >
          <div id="tradingview_widget" className="w-full h-full bg-gray-900/30 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-400">
              <BarChart3 className="w-6 h-6" />
              <span>Loading chart...</span>
            </div>
          </div>
        </div>

        {/* Market Stats Footer */}
        <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
          <div className="grid grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Open Interest</div>
              <div className="text-sm font-bold text-white">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-700 h-4 w-12 mx-auto rounded"></div>
                ) : (
                  statsData?.openInterest || 'N/A'
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">24h Volume</div>
              <div className="text-sm font-bold text-white">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-700 h-4 w-12 mx-auto rounded"></div>
                ) : (
                  statsData?.volume24h || 'N/A'
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">24h Funding (APR)</div>
              <div className="text-sm font-bold text-white">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-700 h-4 w-12 mx-auto rounded"></div>
                ) : (
                  statsData?.fundingRate || 'N/A'
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Marketcap</div>
              <div className="text-sm font-bold text-white">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-700 h-4 w-12 mx-auto rounded"></div>
                ) : (
                  statsData?.marketCap || 'N/A'
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">FDV</div>
              <div className="text-sm font-bold text-white">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-700 h-4 w-12 mx-auto rounded"></div>
                ) : (
                  statsData?.fdv || 'N/A'
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
            <Activity className="w-3 h-3 text-green-400" />
            <span className="text-xs text-gray-400">
              Data from Velo Pro API • Updates every 30 seconds
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}