import { useEffect, useRef, memo } from 'react';

interface TradingViewAdvancedWidgetProps {
  symbol: string; // Full symbol like "BINANCE:BTCUSDT" or "COINBASE:BTCUSD"
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
  width?: string;
  toolbar_bg?: string;
  container_id?: string;
  overrides?: Record<string, any>;
  disabled_features?: string[];
  enabled_features?: string[];
  studies?: any[];
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  save_image?: boolean;
  show_popup_button?: boolean;
  popup_width?: string;
  popup_height?: string;
  support_host?: string;
  enable_publishing?: boolean;
  withdateranges?: boolean;
  range?: string;
  details?: boolean;
  hotlist?: boolean;
  calendar?: boolean;
}

function TradingViewAdvancedWidget({ 
  symbol,
  interval = '240',
  theme = 'dark',
  height = 500,
  width = '100%',
  toolbar_bg = 'rgba(0, 0, 0, 1)',
  container_id,
  overrides = {},
  disabled_features = [],
  enabled_features = [],
  studies = [],
  hide_side_toolbar = false,
  allow_symbol_change = true,
  save_image = true,
  show_popup_button = false,
  popup_width = '600',
  popup_height = '650',
  support_host = 'https://www.tradingview.com',
  enable_publishing = false,
  withdateranges = true,
  range,
  details = true,
  hotlist = true,
  calendar = true
}: TradingViewAdvancedWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear any existing content
    container.current.innerHTML = '';

    const containerId = container_id || `tradingview_${Math.random().toString(36).substring(7)}`;
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    const config: any = {
      "autosize": false,
      "symbol": symbol,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": enable_publishing,
      "backgroundColor": toolbar_bg,
      "gridColor": "rgba(42, 46, 57, 0.3)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": save_image,
      "hide_volume": false,
      "support_host": support_host,
      "container_id": containerId,
      "show_popup_button": show_popup_button,
      "popup_width": popup_width,
      "popup_height": popup_height,
      "allow_symbol_change": allow_symbol_change,
      "withdateranges": withdateranges,
      "details": details,
      "hotlist": hotlist,
      "calendar": calendar,
      "studies": studies.length > 0 ? studies : [
        {
          "id": "MASimple@tv-basicstudies",
          "inputs": {
            "length": 20
          }
        },
        {
          "id": "RSI@tv-basicstudies",
          "inputs": {
            "length": 14
          }
        }
      ],
      "overrides": {
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
        "paneProperties.background": "#000000",
        "paneProperties.vertGridProperties.color": "#363c4e",
        "paneProperties.horzGridProperties.color": "#363c4e",
        "scalesProperties.textColor": "#AAA",
        "volumePaneSize": "medium",
        ...overrides
      },
      "height": height,
      "width": width
    };

    if (range) {
      config.range = range;
    }

    if (disabled_features.length > 0) {
      config.disabled_features = disabled_features;
    }

    if (enabled_features.length > 0) {
      config.enabled_features = enabled_features;
    }

    if (hide_side_toolbar) {
      config.hide_side_toolbar = true;
    }

    script.innerHTML = JSON.stringify(config);

    const widgetContainer = document.createElement("div");
    widgetContainer.id = containerId;
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = `${height}px`;
    widgetContainer.style.width = width;
    
    container.current.appendChild(widgetContainer);
    container.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [symbol, interval, theme, height, width, toolbar_bg, container_id, allow_symbol_change, save_image, show_popup_button, popup_width, popup_height, support_host, enable_publishing, withdateranges, range, details, hotlist, calendar, hide_side_toolbar]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: `${height}px`, width }}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewAdvancedWidget);