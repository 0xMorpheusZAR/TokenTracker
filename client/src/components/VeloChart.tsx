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
        
        <a
          href={`https://app.velodata.app/charts/${symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-gray-500 hover:text-gray-300 transition-colors mr-2"
        >
          Full chart
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Ticker info - exact Velo style */}
      <div className="bg-black px-3 py-1">
        <div className="flex items-baseline gap-2 text-sm">
          <span className="text-white font-normal">{symbol}USDT • {exchange}</span>
          {spotPrice && (
            <>
              <span className="text-green-500">O</span>
              <span className="text-white">{spotPrice.toLocaleString()}</span>
              <span className="text-green-500 ml-2">H</span>
              <span className="text-white">{(spotPrice * 1.001).toLocaleString()}</span>
              <span className="text-red-500 ml-2">L</span>
              <span className="text-white">{(spotPrice * 0.999).toLocaleString()}</span>
              <span className="text-green-500 ml-2">C</span>
              <span className={cn(
                priceChange && priceChange >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {spotPrice.toLocaleString()} {priceChange !== undefined && `${priceChange >= 0 ? '+' : ''}${(priceChange * spotPrice / 100).toFixed(1)} (${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%)`}
              </span>
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          Volume {volume || '26.863K'}
        </div>
      </div>

      {/* Chart - exact Velo style */}
      <div style={{ height: height, position: 'relative', overflow: 'hidden' }} className="velo-chart-container bg-black">
        <div style={{ position: 'absolute', top: '-32px', left: '0', right: '0', bottom: '0' }}>
        <TradingViewWidget
          symbol={symbol}
          interval={selectedTimeframe}
          theme="dark"
          height={height + 32}
          hide_top_toolbar={true}
          hide_legend={true}
          save_image={false}
          hide_side_toolbar={true}
          allow_symbol_change={false}
          details={false}
          hotlist={false}
          calendar={false}
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
    </div>
  );
}