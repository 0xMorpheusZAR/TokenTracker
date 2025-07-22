import { useState } from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface VeloChartProps {
  symbol: string;
  height?: number;
  spotPrice?: number;
  priceChange?: number;
  volume?: string;
  exchange?: string;
}

const timeframes = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: '1d', value: 'D' }
];

export default function VeloChart({ 
  symbol, 
  height = 400, 
  spotPrice,
  priceChange,
  volume,
  exchange = 'Binance-Futures'
}: VeloChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('60');

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* Header with timeframes */}
      <div className="flex justify-between items-center p-3 border-b border-gray-800">
        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setSelectedTimeframe(tf.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded transition-all",
                selectedTimeframe === tf.value
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
        
        <a
          href={`https://app.velodata.app/charts/${symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          Full chart
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>

      {/* Ticker info */}
      <div className="px-3 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white font-medium">{symbol}USDT</span>
          <span className="text-gray-400">· {exchange}</span>
          {spotPrice && (
            <>
              <span className="text-orange-400">O {spotPrice.toLocaleString()}</span>
              <span className="text-orange-400">H {spotPrice.toLocaleString()}</span>
              <span className="text-orange-400">L {spotPrice.toLocaleString()}</span>
              <span className={cn(
                "font-medium",
                priceChange && priceChange >= 0 ? "text-green-400" : "text-red-400"
              )}>
                C {spotPrice.toLocaleString()} {priceChange !== undefined && `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`}
              </span>
            </>
          )}
        </div>
        {volume && (
          <div className="text-xs text-gray-400 mt-1">
            Volume {volume}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <TradingViewWidget
          symbol={symbol}
          interval={selectedTimeframe}
          theme="dark"
          height={height}
        />
      </div>
    </div>
  );
}