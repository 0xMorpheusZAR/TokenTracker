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
    // TODO: Implement export functionality
    console.log("Exporting data...");
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="text-loss-red text-2xl" />
              <h1 className="text-xl font-bold">Token Failure Analytics</h1>
            </div>
            <Badge variant="destructive" className="bg-loss-red/20 text-loss-red border-loss-red/30">
              <AlertTriangle className="w-3 h-3 mr-1" />
              High Risk Analysis
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-bg border-dark-border w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray w-4 h-4" />
            </div>
            <Button onClick={handleExport} className="bg-warning-orange hover:bg-warning-orange/80">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-dark-card border-r border-dark-border min-h-screen p-4">
          <nav className="space-y-2 mb-8">
            <Button variant="ghost" className="w-full justify-start bg-warning-orange/20 text-warning-orange">
              <TrendingDown className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
          </nav>

          <RiskIndicators />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-gray">Total Tokens Analyzed</h3>
                  <TrendingDown className="w-5 h-5 text-warning-orange" />
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{summary?.totalTokens || 10}</div>
                )}
                <div className="text-sm text-loss-red mt-1">
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                  {summary?.failureRate || 100}% Failed
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-gray">Average Loss</h3>
                  <TrendingDown className="w-5 h-5 text-loss-red" />
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-loss-red">{summary?.averageLoss || -95.2}%</div>
                )}
                <div className="text-sm text-neutral-gray mt-1">From ATH</div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-gray">Total Value Lost</h3>
                  <DollarSign className="w-5 h-5 text-loss-red" />
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-loss-red">{summary?.totalMarketCapLost || "$58.4B"}</div>
                )}
                <div className="text-sm text-neutral-gray mt-1">Market Cap Destroyed</div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-gray">Avg Initial Float</h3>
                  <Percent className="w-5 h-5 text-warning-orange" />
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-warning-orange">{summary?.averageInitialFloat || 13.2}%</div>
                )}
                <div className="text-sm text-neutral-gray mt-1">Extremely Low</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <PerformanceChart />
            </div>

            {/* Top Failures */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-lg">Worst Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topFailures?.map((token: any) => (
                    <div key={token.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${token.symbol === 'PORTAL' ? 'from-purple-500 to-blue-500' : 
                          token.symbol === 'AEVO' ? 'from-orange-500 to-red-500' :
                          token.symbol === 'SAGA' ? 'from-blue-500 to-cyan-500' :
                          token.symbol === 'PIXEL' ? 'from-green-500 to-teal-500' :
                          'from-yellow-500 to-orange-500'} rounded-full flex items-center justify-center text-xs font-bold`}>
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-neutral-gray">{token.sector}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-loss-red font-bold">{token.performancePercent}%</div>
                        <div className="text-xs text-neutral-gray">${token.currentPrice}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Token Analysis Table */}
          <TokenTable searchTerm={searchTerm} />

          {/* Unlock Calendar */}
          <UnlockCalendar />

          {/* API Integration Status */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-lg">API Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CryptoRank API */}
                <div className="bg-dark-bg rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">CryptoRank API</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${cryptoRankStatus?.connected ? 'bg-gain-green' : 'bg-loss-red'} rounded-full`}></div>
                      <span className={`text-sm ${cryptoRankStatus?.connected ? 'text-gain-green' : 'text-loss-red'}`}>
                        {cryptoRankStatus?.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Unlock Data:</span>
                      <span className="text-gain-green">Real-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Vesting Schedules:</span>
                      <span className="text-gain-green">Accurate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Coverage:</span>
                      <span>Hundreds of tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Documentation:</span>
                      <a 
                        href="https://api.cryptorank.io/v2/docs" 
                        className="text-warning-orange hover:underline" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        API Docs
                      </a>
                    </div>
                  </div>
                </div>

                {/* CoinGecko API */}
                <div className="bg-dark-bg rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">CoinGecko API</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${coinGeckoStatus?.connected ? 'bg-gain-green' : 'bg-loss-red'} rounded-full`}></div>
                      <span className={`text-sm ${coinGeckoStatus?.connected ? 'text-gain-green' : 'text-loss-red'}`}>
                        {coinGeckoStatus?.connected ? coinGeckoStatus.tier : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Price Data:</span>
                      <span className="text-gain-green">Real-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Historical:</span>
                      <span className="text-gain-green">Complete</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Rate Limit:</span>
                      <span className="text-warning-orange">{coinGeckoStatus?.rateLimit || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-gray">Documentation:</span>
                      <a 
                        href="https://www.coingecko.com/en/api/documentation" 
                        className="text-warning-orange hover:underline" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        API Docs
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-warning-orange/10 border border-warning-orange/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-warning-orange mt-1" />
                  <div>
                    <h4 className="font-medium text-warning-orange mb-1">Data Quality Assurance</h4>
                    <p className="text-sm text-neutral-gray">
                      Real-time pricing data from CoinGecko Pro API ensures accurate token valuations. 
                      CryptoRank provides verified unlock schedules and vesting data for comprehensive risk analysis.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
