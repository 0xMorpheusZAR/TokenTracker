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
          height={height + 45}
          toolbar_bg="#000000"
          container_id={`velo_chart_${symbol}_${Date.now()}`}
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
          disabled_features={[
            "header_widget",
            "header_widget_dom_node",
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
            "header_chart_type",
            "left_toolbar",
            "control_bar",
            "timeframes_toolbar",
            "main_series_scale_menu",
            "create_volume_indicator_by_default"
          ]}
          enabled_features={[
            "hide_left_toolbar_by_default",
            "hide_top_toolbar",
            "hide_side_toolbar"
          ]}
        />
      </div>
    </div>
  );
}