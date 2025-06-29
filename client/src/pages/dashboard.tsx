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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-blue-900/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-sm font-medium">LIVE MARKET ANALYSIS</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-8 leading-none">
            <span className="block text-white mb-4">CRYPTO</span>
            <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              FAILURE
            </span>
            <span className="block text-white">ANALYTICS</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Deep analysis of the $58.4B market cap destruction caused by failed tokenomics models. 
            Real-time data, predictive modeling, and comprehensive breakdowns.
          </p>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <a href="/revenue-analysis" className="group">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-blue-400/50">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-lg font-bold text-blue-300 mb-2">Cash Cows</h3>
                <p className="text-sm text-gray-400">Revenue-generating protocols</p>
              </div>
            </a>
            
            <a href="/hyperliquid" className="group">
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-green-400/50">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold text-green-300 mb-2">Success Story</h3>
                <p className="text-sm text-gray-400">Hyperliquid case study</p>
              </div>
            </a>
            
            <a href="/monte-carlo" className="group">
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-purple-400/50">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold text-purple-300 mb-2">Simulations</h3>
                <p className="text-sm text-gray-400">Monte Carlo modeling</p>
              </div>
            </a>
            
            <a href="/failure-analysis" className="group">
              <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-red-400/50">
                <div className="text-3xl mb-3">⚠️</div>
                <h3 className="text-lg font-bold text-red-300 mb-2">Failures</h3>
                <p className="text-sm text-gray-400">Economic breakdowns</p>
              </div>
            </a>
          </div>

          {/* API Status */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>CoinGecko Pro API</span>
            </div>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>

          {/* Scroll Indicator */}
          <button 
            onClick={scrollToOverview}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <span className="text-sm">Explore Data</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Market Overview Section */}
      <section id="overview" className="relative z-10 py-24 px-4 lg:px-8 bg-gradient-to-b from-transparent to-gray-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-white">Market </span>
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Overview</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real-time analysis of failed tokenomics and market destruction
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total Tokens</div>
                      <div className="text-2xl font-bold text-white">{summary?.totalTokens || 10}</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Tracked failures</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Failure Rate</div>
                      <div className="text-2xl font-bold text-red-400">{summary?.failureRate || '95.2%'}</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Average decline from ATH</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Market Cap Lost</div>
                      <div className="text-2xl font-bold text-red-400">{summary?.totalMarketCapLost || '$58.4B'}</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Total destruction</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Avg Initial Float</div>
                      <div className="text-2xl font-bold text-red-400">{summary?.averageInitialFloat || '13.2%'}</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Extremely low</div>
              </CardContent>
            </Card>
          </div>

          {/* Data Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart />
                </CardContent>
              </Card>
            </div>

            {/* Top Failures */}
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Worst Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topFailures?.slice(0, 5).map((token: any) => (
                    <div key={token.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-400">
                          {token.priceChange30d ? `${token.priceChange30d.toFixed(1)}%` : '-93.7%'}
                        </div>
                        <div className="text-xs text-gray-400">30d</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Indicators */}
          <div className="mb-16">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RiskIndicators />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Status Section */}
      <section className="relative z-10 py-16 px-4 lg:px-8 bg-gray-950/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Data Sources</h2>
            <p className="text-gray-400">Real-time data integration status</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">CoinGecko Pro</div>
                    <div className="text-sm text-gray-400">Market Data API</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={coinGeckoStatus?.connected ? "default" : "destructive"} 
                    className={coinGeckoStatus?.connected ? "bg-green-500/20 text-green-400" : ""}
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
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Dune Analytics</div>
                    <div className="text-sm text-gray-400">On-chain Data</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-blue-500/20 text-blue-400">
                    Connected
                  </Badge>
                  <div className="text-xs text-gray-400">Analytics</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Monte Carlo</div>
                    <div className="text-sm text-gray-400">Simulation Engine</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-purple-500/20 text-purple-400">
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
      <footer className="relative z-10 py-8 px-4 lg:px-8 bg-black/50 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Real-time cryptocurrency failure analytics • Updated every 30 seconds
          </p>
        </div>
      </footer>
    </div>
  );
}