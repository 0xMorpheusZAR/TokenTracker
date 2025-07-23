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
  const [selectedTimeframe, setSelectedTimeframe] = useState('240');

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* Header with timeframes - exact Velo style */}
      <div className="flex justify-between items-center bg-black p-2">
        <div className="flex items-center gap-0">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setSelectedTimeframe(tf.value)}
              className={cn(
                "px-3 py-1 text-sm font-normal transition-all",
                selectedTimeframe === tf.value
                  ? "bg-white text-black rounded"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Button */}
      <div className="p-3 bg-black border-t border-gray-800">
        <a
          href={`https://blofin.com/futures/${symbol.toUpperCase()}-USDT`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <button className="w-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black font-bold py-3 px-6 rounded-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:scale-105 animate-neon-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-[-100%] animate-shimmer"></div>
            <span className="text-lg tracking-wider font-extrabold relative z-10">🚀 TRADE {symbol.toUpperCase()} 🚀</span>
          </button>
        </a>
      </div>

      {/* Chart - exact Velo style */}
      <div className="velo-chart-wrapper" style={{ height: height, backgroundColor: '#000000' }}>
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