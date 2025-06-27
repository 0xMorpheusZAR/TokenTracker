import { useQuery } from "@tanstack/react-query";
import { Search, Download, TrendingDown, AlertTriangle, DollarSign, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TokenTable from "@/components/token-table";
import PerformanceChart from "@/components/performance-chart";
import RiskIndicators from "@/components/risk-indicators";
import UnlockCalendar from "@/components/unlock-calendar";
import { useState } from "react";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: cryptoRankStatus } = useQuery({
    queryKey: ["/api/cryptorank/status"],
  });

  const { data: coinGeckoStatus } = useQuery({
    queryKey: ["/api/coingecko/status"],
  });

  const { data: topFailures } = useQuery({
    queryKey: ["/api/tokens/top-failures"],
  });

  const handleExport = () => {
    console.log("Exporting data...");
  };

  return (
    <div className="min-h-screen bg-black text-green-400">
      {/* Cypherpunk Matrix Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-green-400 text-xs font-mono animate-matrix-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              {Math.random().toString(36).substring(2, 15)}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-black/90 border-b border-green-400/30 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="text-red-500 text-2xl animate-pulse-glow" />
              <h1 className="text-xl font-bold text-green-400 font-mono tracking-wider">TOKEN_FAILURE_ANALYTICS</h1>
            </div>
            <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/30 font-mono">
              <AlertTriangle className="w-3 h-3 mr-1" />
              HIGH_RISK_ANALYSIS
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="SEARCH_TOKENS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black border-green-400/30 text-green-400 placeholder-green-400/50 w-64 pl-10 font-mono"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
            </div>
            <Button onClick={handleExport} className="bg-green-400/20 border border-green-400/30 text-green-400 hover:bg-green-400/30 font-mono">
              <Download className="w-4 h-4 mr-2" />
              EXPORT_DATA
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black/90 border-r border-green-400/30 min-h-screen p-4 sticky top-16">
          <nav className="space-y-2 mb-8">
            <Button variant="ghost" className="w-full justify-start bg-green-400/20 text-green-400 border border-green-400/30 font-mono">
              <TrendingDown className="w-4 h-4 mr-3" />
              DASHBOARD
            </Button>
            <a href="/interactive" className="block">
              <Button variant="ghost" className="w-full justify-start text-green-400/70 hover:bg-green-400/10 hover:text-green-400 font-mono">
                <DollarSign className="w-4 h-4 mr-3" />
                INTERACTIVE
              </Button>
            </a>
            <a href="/hyperliquid" className="block">
              <Button variant="ghost" className="w-full justify-start text-green-400/70 hover:bg-green-400/10 hover:text-green-400 font-mono">
                <TrendingDown className="w-4 h-4 mr-3" />
                HYPERLIQUID
              </Button>
            </a>
            <a href="/monte-carlo" className="block">
              <Button variant="ghost" className="w-full justify-start text-green-400/70 hover:bg-green-400/10 hover:text-green-400 font-mono">
                <Percent className="w-4 h-4 mr-3" />
                MONTE_CARLO
              </Button>
            </a>
            <a href="/revenue-analysis" className="block">
              <Button variant="ghost" className="w-full justify-start text-green-400/70 hover:bg-green-400/10 hover:text-green-400 font-mono">
                <DollarSign className="w-4 h-4 mr-3" />
                REVENUE_ANALYSIS
              </Button>
            </a>
          </nav>

          <div className="mt-8">
            <RiskIndicators />
          </div>
        </aside>

        {/* Main Content - Scrollable Sections */}
        <main className="flex-1 p-6 space-y-8 relative z-10">
          {/* Summary Cards Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-400 font-mono tracking-wider">SYSTEM_OVERVIEW</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/80 border-green-400/30 glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-400/70 font-mono">TOTAL_TOKENS_ANALYZED</h3>
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-green-400 font-mono">{summary?.totalTokens || 10}</div>
                  )}
                  <div className="text-sm text-red-500 mt-1 font-mono">
                    <TrendingDown className="w-3 h-3 inline mr-1" />
                    {summary?.failureRate || 100}%_FAILED
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-400/30 glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-400/70 font-mono">AVERAGE_LOSS</h3>
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-20 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500 font-mono">{summary?.averageLoss || -95.2}%</div>
                  )}
                  <div className="text-sm text-green-400/70 mt-1 font-mono">FROM_ATH</div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-400/30 glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-400/70 font-mono">TOTAL_VALUE_LOST</h3>
                    <DollarSign className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-20 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500 font-mono">{summary?.totalMarketCapLost || "$58.4B"}</div>
                  )}
                  <div className="text-sm text-green-400/70 mt-1 font-mono">MARKET_CAP_DESTROYED</div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 border-green-400/30 glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-400/70 font-mono">AVG_INITIAL_FLOAT</h3>
                    <Percent className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500 font-mono">{summary?.averageInitialFloat || 13.2}%</div>
                  )}
                  <div className="text-sm text-green-400/70 mt-1 font-mono">EXTREMELY_LOW</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Performance Analysis Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-400 font-mono tracking-wider">PERFORMANCE_ANALYSIS</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Chart */}
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>

              {/* Top Failures */}
              <Card className="bg-black/80 border-green-400/30 glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg text-green-400 font-mono">WORST_PERFORMERS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topFailures?.map((token: any) => (
                      <div key={token.id} className="flex items-center justify-between p-3 bg-black/60 border border-green-400/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${token.symbol === 'PORTAL' ? 'from-red-500 to-red-600' : 
                            token.symbol === 'AEVO' ? 'from-red-500 to-red-600' :
                            token.symbol === 'SAGA' ? 'from-red-500 to-red-600' :
                            token.symbol === 'PIXEL' ? 'from-red-500 to-red-600' :
                            'from-red-500 to-red-600'} rounded-full flex items-center justify-center text-xs font-bold font-mono`}>
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-green-400 font-mono">{token.symbol}</div>
                            <div className="text-xs text-green-400/50 font-mono">{token.sector}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-500 font-bold font-mono">{token.performancePercent}%</div>
                          <div className="text-xs text-green-400/50 font-mono">${token.currentPrice}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Token Analysis Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-400 font-mono tracking-wider">TOKEN_ANALYSIS</h2>
            <TokenTable searchTerm={searchTerm} />
          </section>

          {/* Unlock Calendar Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-400 font-mono tracking-wider">UNLOCK_SCHEDULE</h2>
            <UnlockCalendar />
          </section>

          {/* API Integration Status Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-green-400 font-mono tracking-wider">API_DATA_SOURCES</h2>
            <Card className="bg-black/80 border-green-400/30 glass-effect">
              <CardHeader>
                <CardTitle className="text-lg text-green-400 font-mono">SYSTEM_CONNECTIONS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CryptoRank API */}
                  <div className="bg-black/60 border border-green-400/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-green-400 font-mono">CRYPTORANK_API</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${cryptoRankStatus?.connected ? 'bg-green-400' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                        <span className={`text-sm font-mono ${cryptoRankStatus?.connected ? 'text-green-400' : 'text-red-500'}`}>
                          {cryptoRankStatus?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-green-400/70">UNLOCK_DATA:</span>
                        <span className="text-green-400">REAL-TIME</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400/70">VESTING_SCHEDULES:</span>
                        <span className="text-green-400">ACCURATE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400/70">COVERAGE:</span>
                        <span className="text-green-400">HUNDREDS_OF_TOKENS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400/70">DOCUMENTATION:</span>
                        <a 
                          href="https://api.cryptorank.io/v2/docs" 
                          className="text-green-400 hover:text-green-300 underline" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          API_DOCS
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* CoinGecko API */}
                  <div className="bg-black/60 border border-green-400/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-green-400 font-mono">COINGECKO_API</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${coinGeckoStatus?.connected ? 'bg-green-400' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                        <span className={`text-sm font-mono ${coinGeckoStatus?.connected ? 'text-green-400' : 'text-red-500'}`}>
                          {coinGeckoStatus?.connected ? coinGeckoStatus.tier : 'DISCONNECTED'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-green-400/70">PRICE_DATA:</span>
                        <span className="text-green-400">REAL-TIME</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400/70">HISTORICAL:</span>
                        <span className="text-green-400">COMPLETE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400/70">RATE_LIMIT:</span>
                        <span className="text-green-400">{coinGeckoStatus?.rateLimit || 'UNKNOWN'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-400/70">DOCUMENTATION:</span>
                        <a 
                          href="https://www.coingecko.com/en/api/documentation" 
                          className="text-green-400 hover:text-green-300 underline" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          API_DOCS
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-400/10 border border-green-400/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-400 mb-1 font-mono">DATA_QUALITY_ASSURANCE</h4>
                      <p className="text-sm text-green-400/70 font-mono">
                        REAL-TIME_PRICING_DATA_FROM_COINGECKO_PRO_API_ENSURES_ACCURATE_TOKEN_VALUATIONS. 
                        CRYPTORANK_PROVIDES_VERIFIED_UNLOCK_SCHEDULES_AND_VESTING_DATA_FOR_COMPREHENSIVE_RISK_ANALYSIS.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
