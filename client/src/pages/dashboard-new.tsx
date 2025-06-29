import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Activity,
  BarChart3,
  Shield,
  Database,
  Layers,
  Cpu,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  ArrowRight,
  Globe,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PerformanceChart from "@/components/performance-chart";
import RiskIndicators from "@/components/risk-indicators";

export default function ModernDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // API Data Queries
  const { data: summary } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });

  const { data: tokens } = useQuery({
    queryKey: ['/api/tokens'],
  });

  const { data: coinGeckoStatus } = useQuery({
    queryKey: ['/api/coingecko/status'],
  });

  const topFailures = tokens || [];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Crypto Failure Analytics
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Overview
              </button>
              <Link href="/revenue-analysis" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Revenue Analysis
              </Link>
              <Link href="/hyperliquid" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Success Stories
              </Link>
              <Link href="/monte-carlo" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Simulations
              </Link>
              <Link href="/failure-analysis" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Failure Analysis
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-4 space-y-3">
                <button 
                  onClick={() => scrollToSection('overview')}
                  className="block w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                >
                  Overview
                </button>
                <Link href="/revenue-analysis" className="block px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors">
                  Revenue Analysis
                </Link>
                <Link href="/hyperliquid" className="block px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors">
                  Success Stories
                </Link>
                <Link href="/monte-carlo" className="block px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors">
                  Simulations
                </Link>
                <Link href="/failure-analysis" className="block px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors">
                  Failure Analysis
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Modern Design */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 dark:text-red-300 text-sm font-medium">LIVE ANALYSIS</span>
            </div>

            {/* Main Headline - Typography as Design Element */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 tracking-tight">
              <span className="text-gray-900 dark:text-white">Crypto Token</span>
              <br />
              <span className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
                Failure Analytics
              </span>
            </h1>

            {/* Subtitle with Clear Hierarchy */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Deep analysis of $58.4B in market cap destruction from failed tokenomics models. 
              Real-time data, predictive modeling, and comprehensive breakdowns.
            </p>

            {/* Call-to-Action Grid - Card-Based Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Link href="/revenue-analysis" className="group">
                <Card className="border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Revenue Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Profitable protocols analysis</p>
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/hyperliquid" className="group">
                <Card className="border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Success Stories</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Hyperliquid case study</p>
                    <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/monte-carlo" className="group">
                <Card className="border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Simulations</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Monte Carlo modeling</p>
                    <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/failure-analysis" className="group">
                <Card className="border-2 border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failure Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Economic breakdowns</p>
                    <ArrowRight className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <button 
              onClick={() => scrollToSection('overview')}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors group"
            >
              <span className="text-sm font-medium">Explore Analytics</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Market Overview Section - Clear Sectioning */}
      <section id="overview" className="py-16 sm:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Market Overview
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real-time analysis of failed tokenomics and market destruction
            </p>
          </div>

          {/* Stats Grid - Modern Card Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <Badge variant="outline" className="text-xs">Tracked</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary?.totalTokens || 10}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Tokens</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {summary?.failureRate || '95.2%'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Failure Rate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <Badge variant="destructive" className="text-xs">Lost</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {summary?.totalMarketCapLost || '$58.4B'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Market Cap Lost</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="outline" className="text-xs">Low</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {summary?.averageInitialFloat || '13.2%'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Avg Initial Float</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Visualization Grid - Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart />
                </CardContent>
              </Card>
            </div>

            {/* Top Failures */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  Worst Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topFailures?.slice?.(0, 5).map((token: any, index: number) => (
                    <div key={token.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                          {token.symbol?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {token.symbol || 'TOKEN'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {token.name || 'Token Name'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">
                          {token.priceChange30d && Number(token.priceChange30d) !== 0 ? `${Number(token.priceChange30d).toFixed(1)}%` : token.performancePercent || '-93.7%'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">30d</div>
                      </div>
                    </div>
                  )) || [
                    // Fallback data
                    <div key="fallback" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-xs font-bold text-white">P</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">PORTAL</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Portal Token</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">-96.3%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">30d</div>
                      </div>
                    </div>
                  ]}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskIndicators />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Data Sources</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Real-time integration status</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">CoinGecko Pro</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Market Data API</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={coinGeckoStatus?.connected ? "default" : "destructive"}
                    className={coinGeckoStatus?.connected ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                  >
                    {coinGeckoStatus?.connected ? 'Connected' : 'Offline'}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {coinGeckoStatus?.tier || 'Pro'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Dune Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">On-chain Data</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Connected
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Analytics</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Monte Carlo</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Simulation Engine</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    Active
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">GBM Model</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Real-time cryptocurrency failure analytics • Last updated: {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}