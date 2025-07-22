import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap, 
  Star,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import ComprehensiveTradingWidget from '@/components/ComprehensiveTradingWidget';

const popularCoins = [
  { symbol: 'BTC', name: 'Bitcoin', category: 'Layer 1' },
  { symbol: 'ETH', name: 'Ethereum', category: 'Layer 1' },
  { symbol: 'ENA', name: 'Ethena', category: 'DeFi' },
  { symbol: 'SOL', name: 'Solana', category: 'Layer 1' },
  { symbol: 'DOGE', name: 'Dogecoin', category: 'Meme' },
  { symbol: 'ADA', name: 'Cardano', category: 'Layer 1' },
  { symbol: 'AVAX', name: 'Avalanche', category: 'Layer 1' },
  { symbol: 'DOT', name: 'Polkadot', category: 'Layer 0' },
];

export default function TradingAnalysis() {
  const [selectedCoin, setSelectedCoin] = useState('ENA');

  const currentCoin = popularCoins.find(coin => coin.symbol === selectedCoin) || popularCoins[2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
        <div className="absolute inset-0 bg-gray-900/10 opacity-20"></div>
        
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/velo-news">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to News
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-blue-600/20 border border-blue-500/30">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  Advanced Trading Analysis
                </h1>
              </div>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Professional-grade TradingView charts with real-time market data from Velo Pro API
              </p>
              
              {/* Coin Selector */}
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 px-3 py-1">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
                <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                  <SelectTrigger className="w-64 bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {popularCoins.map((coin) => (
                      <SelectItem 
                        key={coin.symbol} 
                        value={coin.symbol}
                        className="text-white hover:bg-gray-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{coin.symbol}</span>
                          <span className="text-gray-400">{coin.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {coin.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Widget */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={selectedCoin}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <ComprehensiveTradingWidget
              coin={selectedCoin}
              coinName={currentCoin.name}
              height={600}
            />
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-600/20">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">TradingView Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Professional-grade charts with advanced indicators, multiple timeframes, and volume analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-600/20">
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Live Market Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Real-time pricing, funding rates, open interest, and 24h volume data from Velo Pro API.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Cross-Exchange Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Unified futures data from Binance with intelligent caching and 30-second updates.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">PERFORMANCE</span>
                </div>
                <div className="text-2xl font-bold text-white">Real-time</div>
                <div className="text-sm text-gray-400">Price tracking</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium text-green-300">REFRESH RATE</span>
                </div>
                <div className="text-2xl font-bold text-white">30s</div>
                <div className="text-sm text-gray-400">Market updates</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">DATA SOURCE</span>
                </div>
                <div className="text-2xl font-bold text-white">Velo Pro</div>
                <div className="text-sm text-gray-400">Premium API</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-300">TIMEFRAMES</span>
                </div>
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-sm text-gray-400">Available periods</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}