import { useState } from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import { cn } from '@/lib/utils';

interface TradingViewTimeframesProps {
  symbol: string;
  height?: number;
}

const timeframes = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: '1d', value: 'D' }
];

export default function TradingViewTimeframes({ symbol, height = 400 }: TradingViewTimeframesProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('60');

  return (
    <div className="relative">
      {/* Timeframe Selector */}
      <div className="absolute top-2 left-2 z-10 flex bg-gray-900/90 rounded-md p-1 gap-1">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setSelectedTimeframe(tf.value)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-all",
              selectedTimeframe === tf.value
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* TradingView Chart */}
      <TradingViewWidget
        symbol={symbol}
        interval={selectedTimeframe}
        theme="dark"
        height={height}
      />
    </div>
  );
}