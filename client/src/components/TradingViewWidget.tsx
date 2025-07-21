import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
}

export function TradingViewBTCDominance({
  theme = 'dark',
  width = '100%',
  height = 150
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      
      script.innerHTML = JSON.stringify({
        "symbol": "CRYPTOCAP:BTC.D",
        "width": width,
        "height": height,
        "locale": "en",
        "dateRange": "12M",
        "colorTheme": theme,
        "trendLineColor": "rgba(255, 155, 0, 1)",
        "underLineColor": "rgba(255, 155, 0, 0.3)",
        "underLineBottomColor": "rgba(255, 155, 0, 0)",
        "isTransparent": true,
        "autosize": false,
        "largeChartUrl": ""
      });

      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [theme, width, height]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export function TradingViewTickerWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
      script.type = 'text/javascript';
      script.async = true;
      
      script.innerHTML = JSON.stringify({
        "symbol": "CRYPTOCAP:BTC.D",
        "width": "100%",
        "colorTheme": "dark",
        "isTransparent": true,
        "locale": "en"
      });

      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}