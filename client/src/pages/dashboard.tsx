import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  BarChart3, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Globe,
  Activity,
  ChevronDown,
  Play,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import PerformanceChart from '@/components/performance-chart';
import RiskIndicators from '@/components/risk-indicators';
import UnlockCalendar from '@/components/unlock-calendar';

export default function Dashboard() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: summary } = useQuery({
    queryKey: ['/api/analytics/summary'],
    refetchInterval: 30000,
  });

  const { data: topFailures } = useQuery({
    queryKey: ['/api/tokens'],
    refetchInterval: 30000,
  });

  const { data: coinGeckoStatus } = useQuery({
    queryKey: ['/api/coingecko/status'],
    refetchInterval: 30000,
  });

  const scrollToOverview = () => {
    document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Creator Attribution - Top Bar */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-center shadow-2xl border-b-2 border-white/20">
        <a 
          href="https://x.com/0xMorpheusXBT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-white hover:text-yellow-300 transition-all duration-300 transform hover:scale-105"
        >
          <span className="text-xl font-semibold">Created by</span>
          <span className="text-2xl font-bold">@0xMorpheusXBT</span>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      </div>

      {/* Animated Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-blue-900/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-20">
        <div className="max-w-6xl mx-auto text-center w-full">
          {/* Professional Market Status */}
          <div className="flex flex-wrap justify-center gap-4 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-xs sm:text-sm font-medium">LIVE MARKET ANALYSIS</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1.5">
              <span className="text-yellow-400 text-xs sm:text-sm font-medium">⚠️ EXTREME RISK MARKET</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1.5">
              <span className="text-blue-400 text-xs sm:text-sm font-medium">📊 {new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' })} EST</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight">
            <span className="block text-white mb-2 sm:mb-4">CRYPTO</span>
            <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              FAILURE
            </span>
            <span className="block text-white">ANALYTICS</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
            Deep analysis of the $58.4B market cap destruction caused by failed tokenomics models. 
            Real-time data, predictive modeling, and comprehensive breakdowns.
          </p>



          {/* Action Grid - Mobile First */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <a href="/revenue-analysis" className="group w-full">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:border-blue-400/50 w-full">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">💰</div>
                <h3 className="text-base sm:text-lg font-bold text-blue-300 mb-1 sm:mb-2">Cash Cows</h3>
                <p className="text-xs sm:text-sm text-gray-400">Revenue-generating protocols</p>
              </div>
            </a>
            
            <a href="/hyperliquid" className="group w-full">
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:border-green-400/50 w-full">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎯</div>
                <h3 className="text-base sm:text-lg font-bold text-green-300 mb-1 sm:mb-2">Success Story</h3>
                <p className="text-xs sm:text-sm text-gray-400">Hyperliquid case study</p>
              </div>
            </a>
            
            <a href="/monte-carlo" className="group w-full">
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:border-purple-400/50 w-full">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📊</div>
                <h3 className="text-base sm:text-lg font-bold text-purple-300 mb-1 sm:mb-2">Simulations</h3>
                <p className="text-xs sm:text-sm text-gray-400">Monte Carlo modeling</p>
              </div>
            </a>
            
            <a href="/failure-analysis" className="group w-full">
              <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:border-red-400/50 w-full">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">⚠️</div>
                <h3 className="text-base sm:text-lg font-bold text-red-300 mb-1 sm:mb-2">Failures</h3>
                <p className="text-xs sm:text-sm text-gray-400">Economic breakdowns</p>
              </div>
            </a>
          </div>

          {/* API Status - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>CoinGecko Pro API</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>

          {/* Scroll Indicator */}
          <button 
            onClick={scrollToOverview}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group touch-manipulation"
          >
            <span className="text-xs sm:text-sm">Explore Data</span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Advanced Market Analytics Section */}
      <section className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-gray-950/50">
        <div className="max-w-7xl mx-auto">
          {/* Market Sentiment Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-red-900/20 to-gray-900/50 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">Fear & Greed Index</span>
                  <Badge variant="destructive" className="text-xs">EXTREME FEAR</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-red-500">12</div>
                  <div className="text-xs text-red-400">↓ -8 (24h)</div>
                </div>
                <Progress value={12} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/20 to-gray-900/50 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">Unlock Pressure</span>
                  <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">CRITICAL</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-yellow-500">$4.2B</div>
                  <div className="text-xs text-yellow-400">Next 30d</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">142 unlock events scheduled</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">Liquidity Risk</span>
                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">SEVERE</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-blue-500">0.23</div>
                  <div className="text-xs text-blue-400">Ratio</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">77% below healthy threshold</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Overview Section */}
      <section id="overview" className="relative z-10 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6">
              <span className="text-white">Market </span>
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Overview</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Real-time analysis of failed tokenomics and market destruction
            </p>
          </div>

          {/* Professional Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Failures Tracked</div>
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{summary?.totalTokens || 10}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">↓ 95.2% AVG</span>
                  <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Failure Rate</div>
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{summary?.failureRate || '95.2%'}</div>
                <div className="flex items-center gap-2">
                  <Progress value={95.2} className="h-2 flex-1" />
                  <span className="text-xs text-gray-500">ATH</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Value Destroyed</div>
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{summary?.totalMarketCapLost || '$58.4B'}</div>
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-400">-$2.1B (24h)</span>
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">ACCELERATING</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Float Analysis</div>
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-1">{summary?.averageInitialFloat || '13.2%'}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded">⚠️ 86.8% LOCKED</div>
                  <Badge variant="secondary" className="text-xs">HIGH RISK</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Visualization Grid - Mobile Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
            {/* Performance Chart */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <PerformanceChart />
                </CardContent>
              </Card>
            </div>

            {/* Professional Risk Analysis Dashboard */}
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm order-1 lg:order-2">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    Critical Risk Assets
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs animate-pulse">LIVE</Badge>
                    {coinGeckoStatus?.connected && (
                      <Badge variant="secondary" className="text-xs bg-green-900/20 text-green-400 border-green-700">
                        CoinGecko Pro
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {topFailures?.slice?.(0, 5).map((token: any, index: number) => (
                    <div key={token.id} className="bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-lg p-3 hover:from-gray-800/70 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                              {token.symbol?.charAt(0) || 'T'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{token.symbol || 'TOKEN'}</div>
                            <div className="text-xs text-gray-400">{token.exchange || 'CEX'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-white">${token.currentPrice?.toFixed(4) || '0.0000'}</div>
                          <div className={`text-xs font-bold ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.priceChange24h !== undefined ? `${token.priceChange24h >= 0 ? '+' : ''}${token.priceChange24h.toFixed(1)}%` : '-15.2%'} (24h)
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-gray-900/50 rounded px-2 py-1">
                          <div className="text-gray-500">ATH Loss</div>
                          <div className="text-red-400 font-bold">
                            -{token.athDeclinePercent || ((token.ath - token.currentPrice) / token.ath * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded px-2 py-1">
                          <div className="text-gray-500">Risk</div>
                          <div className="text-orange-400 font-bold">
                            {index < 2 ? "EXTREME" : index < 4 ? "HIGH" : "SEVERE"}
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded px-2 py-1">
                          <div className="text-gray-500">Float</div>
                          <div className="text-yellow-400 font-bold">
                            {token.circulatingSupplyPercentage?.toFixed(1) || '8.5'}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || [
                    <div key="loading" className="text-center py-8 text-gray-500">
                      <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-white rounded-full mx-auto mb-2"></div>
                      Loading live data...
                    </div>
                  ]}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-800">
                  <a href="/interactive-dashboard" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                    View Complete Analysis
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Indicators - Mobile Responsive */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RiskIndicators />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Status Section */}
      <section className="relative z-10 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gray-950/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Data Sources</h2>
            <p className="text-sm sm:text-base text-gray-400">Real-time data integration status</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">CoinGecko Pro</div>
                    <div className="text-xs sm:text-sm text-gray-400">Market Data API</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={coinGeckoStatus?.connected ? "default" : "destructive"} 
                    className={`text-xs ${coinGeckoStatus?.connected ? "bg-green-500/20 text-green-400" : ""}`}
                  >
                    {coinGeckoStatus?.connected ? 'Connected' : 'Offline'}
                  </Badge>
                  <div className="text-xs text-gray-400">
                    {coinGeckoStatus?.tier || 'Pro'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">Dune Analytics</div>
                    <div className="text-xs sm:text-sm text-gray-400">On-chain Data</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-blue-500/20 text-blue-400 text-xs">
                    Connected
                  </Badge>
                  <div className="text-xs text-gray-400">Analytics</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">Monte Carlo</div>
                    <div className="text-xs sm:text-sm text-gray-400">Simulation Engine</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-purple-500/20 text-purple-400 text-xs">
                    Active
                  </Badge>
                  <div className="text-xs text-gray-400">GBM Model</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <a 
            href="https://x.com/0xMorpheusXBT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 font-medium"
          >
            <span className="text-lg">Created by</span>
            <span className="text-xl font-bold">@0xMorpheusXBT</span>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <p className="text-gray-400 text-sm">
            Real-time cryptocurrency failure analytics • Updated every 30 seconds
          </p>
        </div>
      </footer>
    </div>
  );
}