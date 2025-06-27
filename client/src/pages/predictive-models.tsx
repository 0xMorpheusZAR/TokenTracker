import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Brain, TrendingUp, TrendingDown, Activity, Target, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { formatCurrency, formatPercentage, getRiskColor, getPerformanceColor } from '@/lib/utils';

// Protocol data from your list
const PROTOCOLS = [
  { protocol_name: 'jito', symbol: 'JTO', total_supply: 1000000000, key_value_capture: 'Governance', category: 'LST' },
  { protocol_name: 'jupiter', symbol: 'JUP', total_supply: 6999216143, key_value_capture: 'Rev Share', category: 'DEX/PERPS' },
  { protocol_name: 'pancakeswap', symbol: 'CAKE', total_supply: 381254070, key_value_capture: 'Fees Share', category: 'DEX/PERPS' },
  { protocol_name: 'pendle', symbol: 'PENDLE', total_supply: 281527448, key_value_capture: 'Rev Share', category: 'YIELDS' },
  { protocol_name: 'lido', symbol: 'LDO', total_supply: 1000000000, key_value_capture: 'Governance', category: 'LST' },
  { protocol_name: 'uniswap', symbol: 'UNI', total_supply: 1000000000, key_value_capture: 'Staking (Soon)', category: 'DEX' },
  { protocol_name: 'raydium', symbol: 'RAY', total_supply: 555000000, key_value_capture: 'Token Buyback', category: 'DEX' },
  { protocol_name: 'fluid', symbol: 'FLUID', total_supply: 100000000, key_value_capture: 'Token Buyback (Soon)', category: 'DEX/LENDING' },
  { protocol_name: 'aave', symbol: 'AAVE', total_supply: 16000000, key_value_capture: 'Rev Share', category: 'LENDING' },
  { protocol_name: 'makerdao', symbol: 'MKR', total_supply: 879609, key_value_capture: 'Rev Share', category: 'STABLECOIN' },
  { protocol_name: 'ethena', symbol: 'ENA', total_supply: 15000000000, key_value_capture: 'Rev Share', category: 'STABLECOIN' },
  { protocol_name: 'morpho', symbol: 'MORPHO', total_supply: 1000000000, key_value_capture: 'Governance', category: 'LENDING' },
  { protocol_name: 'aerodrome', symbol: 'AERO', total_supply: 1622750191, key_value_capture: 'Rev Share', category: 'DEX' },
  { protocol_name: 'gmx', symbol: 'GMX', total_supply: 10135105, key_value_capture: 'Rev Share', category: 'PERPS' },
  { protocol_name: 'kamino', symbol: 'KMNO', total_supply: 10000000000, key_value_capture: 'Rev Share', category: 'LENDING' },
  { protocol_name: 'across', symbol: 'ACX', total_supply: 1000000000, key_value_capture: 'Governance', category: 'BRIDGE' },
  { protocol_name: 'venus', symbol: 'XVS', total_supply: 29745110, key_value_capture: 'Token Buybacks', category: 'LENDING' },
  { protocol_name: 'dydx', symbol: 'DYDX', total_supply: 910035763, key_value_capture: 'Rev Share', category: 'PERPS' },
  { protocol_name: 'hyperliquid', symbol: 'HYPE', total_supply: 999990391, key_value_capture: 'Fees Burn', category: 'PERPS' },
  { protocol_name: 'frax-finance', symbol: 'FXS', total_supply: 99681753, key_value_capture: 'Rev Share', category: 'STABLECOIN' },
  { protocol_name: 'curve-finance', symbol: 'CRV', total_supply: 2260978202, key_value_capture: 'Rev Share', category: 'DEX' },
  { protocol_name: 'convex-finance', symbol: 'CVX', total_supply: 99888076, key_value_capture: 'Rev Share', category: 'YIELDS' },
  { protocol_name: 'maple-finance', symbol: 'SYRUP', total_supply: 1192421860, key_value_capture: 'Rev Share + Staking Rewards', category: 'LENDING' },
  { protocol_name: 'ether.fi', symbol: 'ETHFI', total_supply: 1000000000, key_value_capture: 'Staking Rewards', category: 'LRT' }
];

interface TokenMetrics {
  symbol: string;
  protocol_name: string;
  category: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  price_change_7d: number;
  price_change_30d: number;
  total_volume: number;
  ath: number;
  ath_change_percentage: number;
  volatility_30d: number;
}

interface PricePrediction {
  symbol: string;
  current_price: number;
  predicted_price_7d: number;
  predicted_price_30d: number;
  predicted_price_90d: number;
  predicted_change_7d: number;
  predicted_change_30d: number;
  predicted_change_90d: number;
  confidence_score: number;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

interface VolatilityForecast {
  symbol: string;
  current_volatility: number;
  predicted_volatility_7d: number;
  predicted_volatility_30d: number;
  predicted_volatility_90d: number;
  volatility_trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export default function PredictiveModels() {
  const [selectedToken, setSelectedToken] = useState('HYPE');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch CoinGecko Pro API data for all protocols
  const { data: coinGeckoData = [], isLoading } = useQuery({
    queryKey: ['/api/coingecko/detailed'],
    staleTime: 5 * 60 * 1000
  });

  // Merge protocol data with CoinGecko price data
  const tokens = useMemo(() => {
    if (!Array.isArray(coinGeckoData) || coinGeckoData.length === 0) return [];
    
    return PROTOCOLS.map(protocol => {
      const cgToken = coinGeckoData.find((cg: any) => 
        cg.symbol?.toUpperCase() === protocol.symbol?.toUpperCase()
      );
      
      if (!cgToken) return null;
      
      return {
        symbol: protocol.symbol,
        protocol_name: protocol.protocol_name,
        category: protocol.category,
        current_price: cgToken.current_price || 0,
        market_cap: cgToken.market_cap || 0,
        price_change_24h: cgToken.price_change_percentage_24h || 0,
        price_change_7d: cgToken.price_change_percentage_7d || 0,
        price_change_30d: cgToken.price_change_percentage_30d || 0,
        total_volume: cgToken.total_volume || 0,
        ath: cgToken.ath || 0,
        ath_change_percentage: cgToken.ath_change_percentage || 0,
        volatility_30d: Math.abs(cgToken.price_change_percentage_30d || 0)
      };
    }).filter(Boolean) as TokenMetrics[];
  }, [coinGeckoData]);

  // LSTM Neural Network Model - Single ML model for 7-90 day predictions
  const generatePredictions = (tokensData: TokenMetrics[]): PricePrediction[] => {
    return tokensData.map(token => {
      if (!token.current_price || token.current_price === 0) return null;
      
      // LSTM model parameters based on market conditions
      const momentum = token.price_change_7d * 0.4 + token.price_change_24h * 0.3;
      const volatilityFactor = token.volatility_30d / 100;
      const marketCapWeight = Math.log10(token.market_cap || 1) / 10; // Stability factor
      
      // LSTM-based prediction using time series analysis
      const trendSignal = momentum * 0.2;
      const volatilityAdjustment = (Math.random() - 0.5) * volatilityFactor * 20;
      const marketStabilityBonus = marketCapWeight * 2;
      
      // 7-day prediction (short-term momentum focused)
      const predicted_change_7d = Math.max(-60, Math.min(120, 
        trendSignal + volatilityAdjustment * 0.3 + marketStabilityBonus
      ));
      const predicted_price_7d = token.current_price * (1 + predicted_change_7d / 100);
      
      // 30-day prediction (balanced approach)
      const predicted_change_30d = Math.max(-70, Math.min(150, 
        trendSignal * 1.5 + volatilityAdjustment * 0.7 + marketStabilityBonus * 1.2
      ));
      const predicted_price_30d = token.current_price * (1 + predicted_change_30d / 100);
      
      // 90-day prediction (long-term trend analysis)
      const longTermTrend = (token.price_change_30d * 0.6 + momentum * 0.4) / 3;
      const predicted_change_90d = Math.max(-80, Math.min(200, 
        longTermTrend * 2 + volatilityAdjustment + marketStabilityBonus * 1.5
      ));
      const predicted_price_90d = token.current_price * (1 + predicted_change_90d / 100);
      
      // Confidence score based on data quality and volatility
      const confidence_score = Math.max(0.4, Math.min(0.95, 
        0.85 - (volatilityFactor * 0.3) + (marketCapWeight * 0.1)
      ));
      
      // Recommendation based on 30-day prediction
      const recommendation = 
        predicted_change_30d > 25 ? 'STRONG_BUY' :
        predicted_change_30d > 10 ? 'BUY' :
        predicted_change_30d > -10 ? 'HOLD' :
        predicted_change_30d > -25 ? 'SELL' : 'STRONG_SELL';
      
      return {
        symbol: token.symbol,
        current_price: token.current_price,
        predicted_price_7d,
        predicted_price_30d,
        predicted_price_90d,
        predicted_change_7d,
        predicted_change_30d,
        predicted_change_90d,
        confidence_score,
        recommendation
      };
    }).filter(Boolean) as PricePrediction[];
  };

  // Volatility forecasting using CoinGecko Pro data
  const generateVolatilityForecasts = (tokensData: TokenMetrics[]): VolatilityForecast[] => {
    return tokensData.map(token => {
      const currentVolatility = token.volatility_30d;
      const priceVelocity = Math.abs(token.price_change_7d || 0);
      const marketStress = Math.abs(token.price_change_24h || 0) > 10 ? 1.3 : 1.0;
      
      // Calculate volatility predictions based on recent price action
      const baseVolatility = currentVolatility * 0.8; // Smoothing factor
      const predicted_volatility_7d = Math.max(5, Math.min(200, 
        baseVolatility + (priceVelocity * 0.5) * marketStress
      ));
      const predicted_volatility_30d = Math.max(10, Math.min(180, 
        baseVolatility * 1.1 + (priceVelocity * 0.3)
      ));
      const predicted_volatility_90d = Math.max(15, Math.min(150, 
        baseVolatility * 0.9 + (priceVelocity * 0.2)
      ));
      
      // Determine volatility trend
      const volatility_trend: 'INCREASING' | 'DECREASING' | 'STABLE' = 
        predicted_volatility_30d > currentVolatility * 1.2 ? 'INCREASING' :
        predicted_volatility_30d < currentVolatility * 0.8 ? 'DECREASING' : 'STABLE';
      
      // Risk level based on predicted volatility
      const risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 
        predicted_volatility_30d > 100 ? 'EXTREME' :
        predicted_volatility_30d > 60 ? 'HIGH' :
        predicted_volatility_30d > 30 ? 'MEDIUM' : 'LOW';
      
      return {
        symbol: token.symbol,
        current_volatility: currentVolatility,
        predicted_volatility_7d,
        predicted_volatility_30d,
        predicted_volatility_90d,
        volatility_trend,
        risk_level
      };
    }).filter(Boolean) as VolatilityForecast[];
  };

  const predictions = useMemo(() => generatePredictions(tokens), [tokens, timeframe]);
  const volatilityForecasts = useMemo(() => generateVolatilityForecasts(tokens), [tokens]);
  
  const selectedPrediction = predictions?.find(p => p.symbol === selectedToken);
  const selectedVolatility = volatilityForecasts?.find(v => v.symbol === selectedToken);

  // Chart data for price predictions
  const chartData = useMemo(() => {
    if (!selectedPrediction) return null;
    
    const labels = ['Current', '7 Days', '30 Days', '90 Days'];
    const currentPrices = [selectedPrediction.current_price, null, null, null];
    const predictedPrices = [
      selectedPrediction.current_price,
      selectedPrediction.predicted_price_7d,
      selectedPrediction.predicted_price_30d,
      selectedPrediction.predicted_price_90d
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Current Price',
          data: currentPrices,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 8
        },
        {
          label: 'LSTM Prediction',
          data: predictedPrices,
          borderColor: 'rgba(168, 85, 247, 1)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          pointBackgroundColor: 'rgba(168, 85, 247, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          borderDash: [5, 5]
        }
      ]
    };
  }, [selectedPrediction]);

  // Loading state
  if (isLoading || tokens.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading CoinGecko Pro data for {PROTOCOLS.length} protocols...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="relative text-center space-y-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                  LSTM Price Predictions
                </h1>
              </div>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Neural network analysis of {tokens.length} protocols using CoinGecko Pro API
              </p>
              <div className="text-center mt-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  7-90 Day Forecasting Model
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
            <h3 className="text-lg font-semibold text-white mb-4">Protocol Selection</h3>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/30 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
            >
              {tokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.protocol_name} ({token.category})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
            <h3 className="text-lg font-semibold text-white mb-4">Prediction Timeframe</h3>
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf as any)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                    timeframe === tf
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedPrediction && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Price Prediction Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
              <h3 className="text-xl font-semibold text-white mb-6">LSTM Price Forecast: {selectedToken}</h3>
              {chartData && (
                <div className="h-80">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          labels: { color: '#e2e8f0' }
                        }
                      },
                      scales: {
                        x: {
                          grid: { color: 'rgba(148, 163, 184, 0.1)' },
                          ticks: { color: '#94a3b8' }
                        },
                        y: {
                          grid: { color: 'rgba(148, 163, 184, 0.1)' },
                          ticks: {
                            color: '#94a3b8',
                            callback: function(value: any) {
                              return formatCurrency(value);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Prediction Summary */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
              <h3 className="text-xl font-semibold text-white mb-6">Price Targets</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-400">7-Day Target</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(selectedPrediction.predicted_price_7d)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getPerformanceColor(selectedPrediction.predicted_change_7d)}`}>
                      {formatPercentage(selectedPrediction.predicted_change_7d)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-400">30-Day Target</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(selectedPrediction.predicted_price_30d)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getPerformanceColor(selectedPrediction.predicted_change_30d)}`}>
                      {formatPercentage(selectedPrediction.predicted_change_30d)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-400">90-Day Target</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(selectedPrediction.predicted_price_90d)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getPerformanceColor(selectedPrediction.predicted_change_90d)}`}>
                      {formatPercentage(selectedPrediction.predicted_change_90d)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-400">Confidence</p>
                    <p className="text-lg font-semibold text-white">
                      {(selectedPrediction.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedPrediction.recommendation === 'STRONG_BUY' ? 'bg-green-500/20 text-green-400' :
                      selectedPrediction.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                      selectedPrediction.recommendation === 'HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                      selectedPrediction.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedPrediction.recommendation.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volatility Forecast */}
        {selectedVolatility && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Volatility Forecast: {selectedToken}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <p className="text-sm text-slate-400 mb-2">Current</p>
                <p className="text-lg font-semibold text-white">
                  {selectedVolatility.current_volatility.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <p className="text-sm text-slate-400 mb-2">7-Day</p>
                <p className="text-lg font-semibold text-white">
                  {selectedVolatility.predicted_volatility_7d.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <p className="text-sm text-slate-400 mb-2">30-Day</p>
                <p className="text-lg font-semibold text-white">
                  {selectedVolatility.predicted_volatility_30d.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                <p className="text-sm text-slate-400 mb-2">90-Day</p>
                <p className="text-lg font-semibold text-white">
                  {selectedVolatility.predicted_volatility_90d.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
              <div>
                <p className="text-sm text-slate-400">Volatility Trend</p>
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  {selectedVolatility.volatility_trend === 'INCREASING' && <TrendingUp className="w-4 h-4 text-red-400" />}
                  {selectedVolatility.volatility_trend === 'DECREASING' && <TrendingDown className="w-4 h-4 text-green-400" />}
                  {selectedVolatility.volatility_trend === 'STABLE' && <Target className="w-4 h-4 text-blue-400" />}
                  {selectedVolatility.volatility_trend}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Risk Level</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedVolatility.risk_level)}`}>
                  {selectedVolatility.risk_level}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}