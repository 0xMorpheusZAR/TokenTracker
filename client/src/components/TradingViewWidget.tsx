import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
  width?: string;
}

function TradingViewWidget({ 
  symbol, 
  interval = '60', 
  theme = 'dark',
  height = 500,
  width = '100%'
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear any existing content
    while (container.current.firstChild) {
      container.current.removeChild(container.current.firstChild);
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.textContent = JSON.stringify({
      "autosize": false,
      "symbol": `BINANCE:${symbol}USDT`,
      "interval": interval,
      "timezone": "Etc/UTC",
      "theme": theme,
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(0, 0, 0, 1)",
      "gridColor": "rgba(42, 46, 57, 0.3)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com",
      "container_id": `tradingview_${Math.random().toString(36).substring(7)}`,
      "studies": [
        {
          "id": "Volume@tv-basicstudies",
          "inputs": {
            "showMA": false
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
        "volumePaneSize": "medium"
      },
      "height": height,
      "width": width
    });

    const widgetContainer = document.createElement("div");
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
  }, [symbol, interval, theme, height, width]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewWidget);