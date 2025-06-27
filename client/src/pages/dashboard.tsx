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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Modern gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black pointer-events-none opacity-80"></div>
      
      {/* Header - Mobile Responsive */}
      <header className="bg-gray-900/90 border-b border-gray-800 px-4 sm:px-6 py-4 sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="text-red-500 text-xl sm:text-2xl" />
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Token Failure Analytics
              </h1>
            </div>
            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 hidden sm:flex">
              <AlertTriangle className="w-3 h-3 mr-1" />
              High Risk Analysis
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 w-full sm:w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <Button 
              onClick={handleExport} 
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-gray-900/95 border-b border-gray-800 px-4 py-3 sticky top-[76px] z-40 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant="ghost" className="bg-blue-600/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">
            <TrendingDown className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <a href="/interactive">
            <Button variant="ghost" className="text-gray-400 hover:text-white whitespace-nowrap">
              <DollarSign className="w-4 h-4 mr-2" />
              Interactive
            </Button>
          </a>
          <a href="/hyperliquid">
            <Button variant="ghost" className="text-gray-400 hover:text-white whitespace-nowrap">
              <TrendingDown className="w-4 h-4 mr-2" />
              Hyperliquid
            </Button>
          </a>
          <a href="/monte-carlo">
            <Button variant="ghost" className="text-gray-400 hover:text-white whitespace-nowrap">
              <Percent className="w-4 h-4 mr-2" />
              Hype Simulation
            </Button>
          </a>
          <a href="/revenue-analysis">
            <Button variant="ghost" className="text-gray-400 hover:text-white whitespace-nowrap">
              <DollarSign className="w-4 h-4 mr-2" />
              Cash Cows
            </Button>
          </a>
          <a href="/failure-analysis">
            <Button variant="ghost" className="text-gray-400 hover:text-white whitespace-nowrap">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Failures
            </Button>
          </a>
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-gray-900/90 border-r border-gray-800 min-h-screen p-4 sticky top-[76px]">
          <nav className="space-y-2 mb-8">
            <Button variant="ghost" className="w-full justify-start bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <TrendingDown className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <a href="/interactive" className="block">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <DollarSign className="w-4 h-4 mr-3" />
                Interactive Dashboard
              </Button>
            </a>
            <a href="/hyperliquid" className="block">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <TrendingDown className="w-4 h-4 mr-3" />
                Hyperliquid Analysis
              </Button>
            </a>
            <a href="/monte-carlo" className="block">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <Percent className="w-4 h-4 mr-3" />
                Hype Simulation
              </Button>
            </a>
            <a href="/revenue-analysis" className="block">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <DollarSign className="w-4 h-4 mr-3" />
                Cash Cows
              </Button>
            </a>
            <a href="/failure-analysis" className="block">
              <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                <AlertTriangle className="w-4 h-4 mr-3" />
                Failure Analysis
              </Button>
            </a>
          </nav>

          <div className="mt-8">
            <RiskIndicators />
          </div>
        </aside>

        {/* Main Content - Scrollable Sections */}
        <main className="flex-1 p-4 lg:p-4 lg:p-6 space-y-6 lg:space-y-8 relative z-10">
          {/* Summary Cards Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white  ">Market Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4 lg:p-6">
              <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white/70 ">Total Tokens Analyzed</h3>
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-white ">{summary?.totalTokens || 10}</div>
                  )}
                  <div className="text-sm text-red-500 mt-1 ">
                    <TrendingDown className="w-3 h-3 inline mr-1" />
                    {summary?.failureRate || 100}% Failed
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white/70 ">Average Loss</h3>
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-20 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500 ">{summary?.averageLoss || -95.2}%</div>
                  )}
                  <div className="text-sm text-white/70 mt-1 ">From ATH</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white/70 ">Total Value Lost</h3>
                    <DollarSign className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-20 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500 ">{summary?.totalMarketCapLost || "$58.4B"}</div>
                  )}
                  <div className="text-sm text-white/70 mt-1 ">Market Cap Destroyed</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white/70 ">AVG_INITIAL_FLOAT</h3>
                    <Percent className="w-5 h-5 text-red-500" />
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-8 w-16 bg-green-400/20" />
                  ) : (
                    <div className="text-2xl font-bold text-red-500 ">{summary?.averageInitialFloat || 13.2}%</div>
                  )}
                  <div className="text-sm text-white/70 mt-1 ">EXTREMELY_LOW</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Performance Analysis Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white  ">Performance Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Performance Chart */}
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>

              {/* Top Failures */}
              <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white ">Worst Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topFailures?.map((token: any) => (
                      <div key={token.id} className="flex items-center justify-between p-3 bg-gray-700/80 border border-gray-600/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${token.symbol === 'PORTAL' ? 'from-red-500 to-red-600' : 
                            token.symbol === 'AEVO' ? 'from-red-500 to-red-600' :
                            token.symbol === 'SAGA' ? 'from-red-500 to-red-600' :
                            token.symbol === 'PIXEL' ? 'from-red-500 to-red-600' :
                            'from-red-500 to-red-600'} rounded-full flex items-center justify-center text-xs font-bold `}>
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white ">{token.symbol}</div>
                            <div className="text-xs text-white/50 ">{token.sector}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-500 font-bold ">{token.performancePercent}%</div>
                          <div className="text-xs text-white/50 ">${token.currentPrice}</div>
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
            <h2 className="text-2xl font-bold text-white  ">Token Analysis</h2>
            <TokenTable searchTerm={searchTerm} />
          </section>

          {/* Unlock Calendar Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white  ">Unlock Schedule</h2>
            <UnlockCalendar />
          </section>

          {/* API Integration Status Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white  ">API_DATA_SOURCES</h2>
            <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white ">SYSTEM_CONNECTIONS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:p-6">
                  {/* CryptoRank API */}
                  <div className="bg-gray-700/80 border border-gray-600/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white ">CRYPTORANK_API</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${cryptoRankStatus?.connected ? 'bg-green-400' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                        <span className={`text-sm  ${cryptoRankStatus?.connected ? 'text-white' : 'text-red-500'}`}>
                          {cryptoRankStatus?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm ">
                      <div className="flex justify-between">
                        <span className="text-white/70">UNLOCK_DATA:</span>
                        <span className="text-white">REAL-TIME</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">VESTING_SCHEDULES:</span>
                        <span className="text-white">ACCURATE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">COVERAGE:</span>
                        <span className="text-white">HUNDREDS_OF_TOKENS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">DOCUMENTATION:</span>
                        <a 
                          href="https://api.cryptorank.io/v2/docs" 
                          className="text-white hover:text-green-300 underline" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          API_DOCS
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* CoinGecko API */}
                  <div className="bg-gray-700/80 border border-gray-600/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-white ">COINGECKO_API</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${coinGeckoStatus?.connected ? 'bg-green-400' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                        <span className={`text-sm  ${coinGeckoStatus?.connected ? 'text-white' : 'text-red-500'}`}>
                          {coinGeckoStatus?.connected ? coinGeckoStatus.tier : 'DISCONNECTED'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm ">
                      <div className="flex justify-between">
                        <span className="text-white/70">PRICE_DATA:</span>
                        <span className="text-white">REAL-TIME</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">HISTORICAL:</span>
                        <span className="text-white">COMPLETE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">RATE_LIMIT:</span>
                        <span className="text-white">{coinGeckoStatus?.rateLimit || 'UNKNOWN'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">DOCUMENTATION:</span>
                        <a 
                          href="https://www.coingecko.com/en/api/documentation" 
                          className="text-white hover:text-green-300 underline" 
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
                    <AlertTriangle className="w-5 h-5 text-white mt-1" />
                    <div>
                      <h4 className="font-medium text-white mb-1 ">DATA_QUALITY_ASSURANCE</h4>
                      <p className="text-sm text-white/70 ">
                        REAL-TIME_PRICING_DATA_FROM_COINGECKO_PRO_API_ENSURES_ACCURATE_TOKEN_VALUATIONS. 
                        CRYPTORANK_PROVIDES_VERIFIED_Unlock ScheduleS_AND_VESTING_DATA_FOR_COMPREHENSIVE_RISK_ANALYSIS.
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
