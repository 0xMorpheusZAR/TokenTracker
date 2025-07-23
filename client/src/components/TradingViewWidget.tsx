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
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    // Handle special symbol mappings
    let tradingViewSymbol = symbol;
    let exchange = 'BINANCE';
    
    // Handle special cases
    if (symbol === '1000FLOKI') tradingViewSymbol = 'FLOKI';
    else if (symbol === '1000PEPE') tradingViewSymbol = 'PEPE';
    else if (symbol === 'MATIC') tradingViewSymbol = 'POL'; // MATIC renamed to POL
    else if (symbol === 'PUMP') {
      exchange = 'MEXC'; // PUMP token may be on MEXC
      tradingViewSymbol = 'PUMP';
    }
    else if (symbol === 'XMR') {
      exchange = 'KUCOIN'; // Monero delisted from many exchanges
      tradingViewSymbol = 'XMR';
    }
    else if (symbol === 'BSV') {
      exchange = 'HUOBI'; // BSV delisted from some exchanges
      tradingViewSymbol = 'BSV';
    }
    
    // Fallback symbol construction
    const fullSymbol = `${exchange}:${tradingViewSymbol}USDT`;
    console.log(`TradingView Widget: Loading ${fullSymbol}`);
    
    // Add error handling
    script.onerror = () => {
      console.error(`Failed to load TradingView widget for ${fullSymbol}`);
      if (container.current) {
        container.current.innerHTML = `<div style="color: #666; text-align: center; padding: 20px;">Chart unavailable for ${symbol}</div>`;
      }
    };
    
    script.innerHTML = JSON.stringify({
      "autosize": false,
      "symbol": fullSymbol,
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