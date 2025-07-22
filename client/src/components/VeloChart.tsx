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
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white font-medium">{symbol}USDT</span>
            <span className="text-gray-400">· {exchange}</span>
            {spotPrice && (
              <>
                <span className="text-emerald-400">O</span>
                <span className="text-white">{spotPrice.toLocaleString()}</span>
                <span className="text-emerald-400">H</span>
                <span className="text-white">{(spotPrice * 1.001).toLocaleString()}</span>
                <span className="text-emerald-400">L</span>
                <span className="text-white">{(spotPrice * 0.999).toLocaleString()}</span>
                <span className="text-emerald-400">C</span>
                <span className={cn(
                  "font-medium",
                  priceChange && priceChange >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {spotPrice.toLocaleString()} {priceChange !== undefined && `(${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%)`}
                </span>
              </>
            )}
          </div>
        </div>
        {volume && (
          <div className="text-xs text-gray-400 mt-0.5">
            Volume {volume}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }} className="tradingview-velo-wrapper">
        <TradingViewWidget
          symbol={symbol}
          interval={selectedTimeframe}
          theme="dark"
          height={height}
          hide_top_toolbar={false}
          hide_legend={true}
          save_image={false}
          hide_side_toolbar={true}
          allow_symbol_change={false}
          details={false}
          hotlist={false}
          calendar={false}
          studies={[]}
          toolbar_bg="#000000"
          container_id={`velo_chart_${symbol}_${Date.now()}`}
          overrides={{
            "mainSeriesProperties.candleStyle.upColor": "#00D964",
            "mainSeriesProperties.candleStyle.downColor": "#FF3B30",
            "mainSeriesProperties.candleStyle.borderUpColor": "#00D964",
            "mainSeriesProperties.candleStyle.borderDownColor": "#FF3B30",
            "mainSeriesProperties.candleStyle.wickUpColor": "#00D964",
            "mainSeriesProperties.candleStyle.wickDownColor": "#FF3B30",
            "paneProperties.background": "#000000",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "#1a1a1a",
            "paneProperties.horzGridProperties.color": "#1a1a1a",
            "scalesProperties.textColor": "#999999",
            "scalesProperties.backgroundColor": "#000000"
          }}
          disabled_features={[
            "header_symbol_search",
            "header_compare",
            "display_market_status",
            "study_templates",
            "header_indicators",
            "header_settings",
            "header_fullscreen_button",
            "header_screenshot",
            "header_undo_redo",
            "use_localstorage_for_settings",
            "header_chart_type"
          ]}
          enabled_features={[
            "hide_left_toolbar_by_default"
          ]}
        />
      </div>
    </div>
  );
}