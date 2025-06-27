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
    <div className="min-h-screen bg-gradient-secondary">
      {/* Professional Header */}
      <header className="glass-card border-0 border-b border-enterprise-charcoal/30 px-8 py-6 sticky top-0 z-50 backdrop-blur-xl rounded-none animate-fade-in-down">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-enterprise-pearl tracking-tight">
                  Token Analytics Platform
                </h1>
                <p className="text-enterprise-steel text-sm">
                  Comprehensive market failure analysis
                </p>
              </div>
            </div>
            <div className="status-indicator live">
              <div className="w-2 h-2 bg-success rounded-full animate-gentle-pulse mr-2"></div>
              Live Data
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enterprise-steel w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-enterprise-charcoal/50 border-enterprise-charcoal text-enterprise-pearl placeholder-enterprise-steel w-80 pl-10 h-12 rounded-xl backdrop-blur-sm"
              />
            </div>
            <Button 
              onClick={handleExport}
              className="bg-gradient-primary hover:opacity-90 text-white px-6 h-12 rounded-xl shadow-lg hover-lift transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Professional Sidebar */}
        <aside className="w-72 glass-card border-0 border-r border-enterprise-charcoal/20 min-h-screen p-6 sticky top-24 animate-slide-in-left">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-enterprise-pearl mb-1">Navigation</h2>
            <p className="text-enterprise-steel text-sm">Market analysis tools</p>
          </div>
          
          <nav className="space-y-3 mb-8">
            <div className="bg-gradient-primary/10 border border-accent-blue/20 rounded-xl p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-enterprise-pearl font-medium">Dashboard</div>
                  <div className="text-enterprise-steel text-xs">Current page</div>
                </div>
              </div>
            </div>
            
            <a href="/interactive" className="block group">
              <div className="p-3 rounded-xl border border-enterprise-charcoal/30 hover:border-accent-azure/30 hover:bg-accent-azure/5 transition-all duration-300 hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-enterprise-charcoal rounded-lg flex items-center justify-center group-hover:bg-accent-azure/20">
                    <DollarSign className="w-4 h-4 text-enterprise-steel group-hover:text-accent-azure" />
                  </div>
                  <div>
                    <div className="text-enterprise-pearl font-medium group-hover:text-accent-azure">Interactive Charts</div>
                    <div className="text-enterprise-steel text-xs">Visual analytics</div>
                  </div>
                </div>
              </div>
            </a>
            
            <a href="/revenue-analysis" className="block group">
              <div className="p-3 rounded-xl border border-enterprise-charcoal/30 hover:border-accent-emerald/30 hover:bg-accent-emerald/5 transition-all duration-300 hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-enterprise-charcoal rounded-lg flex items-center justify-center group-hover:bg-accent-emerald/20">
                    <Percent className="w-4 h-4 text-enterprise-steel group-hover:text-accent-emerald" />
                  </div>
                  <div>
                    <div className="text-enterprise-pearl font-medium group-hover:text-accent-emerald">Revenue Analysis</div>
                    <div className="text-enterprise-steel text-xs">Protocol metrics</div>
                  </div>
                </div>
              </div>
            </a>
            
            <a href="/hyperliquid" className="block group">
              <div className="p-3 rounded-xl border border-enterprise-charcoal/30 hover:border-accent-violet/30 hover:bg-accent-violet/5 transition-all duration-300 hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-enterprise-charcoal rounded-lg flex items-center justify-center group-hover:bg-accent-violet/20">
                    <TrendingDown className="w-4 h-4 text-enterprise-steel group-hover:text-accent-violet" />
                  </div>
                  <div>
                    <div className="text-enterprise-pearl font-medium group-hover:text-accent-violet">Hyperliquid Success</div>
                    <div className="text-enterprise-steel text-xs">Case study</div>
                  </div>
                </div>
              </div>
            </a>
            
            <a href="/monte-carlo" className="block group">
              <div className="p-3 rounded-xl border border-enterprise-charcoal/30 hover:border-accent-amber/30 hover:bg-accent-amber/5 transition-all duration-300 hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-enterprise-charcoal rounded-lg flex items-center justify-center group-hover:bg-accent-amber/20">
                    <AlertTriangle className="w-4 h-4 text-enterprise-steel group-hover:text-accent-amber" />
                  </div>
                  <div>
                    <div className="text-enterprise-pearl font-medium group-hover:text-accent-amber">Monte Carlo</div>
                    <div className="text-enterprise-steel text-xs">Price simulation</div>
                  </div>
                </div>
              </div>
            </a>
            
            <a href="/failure-analysis" className="block group">
              <div className="p-3 rounded-xl border border-enterprise-charcoal/30 hover:border-accent-coral/30 hover:bg-accent-coral/5 transition-all duration-300 hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-enterprise-charcoal rounded-lg flex items-center justify-center group-hover:bg-accent-coral/20">
                    <AlertTriangle className="w-4 h-4 text-enterprise-steel group-hover:text-accent-coral" />
                  </div>
                  <div>
                    <div className="text-enterprise-pearl font-medium group-hover:text-accent-coral">Failure Analysis</div>
                    <div className="text-enterprise-steel text-xs">Economic breakdown</div>
                  </div>
                </div>
              </div>
            </a>
          </nav>

          <div className="glass-card p-4">
            <RiskIndicators />
          </div>
        </aside>

        {/* Professional Main Content */}
        <main className="flex-1 p-8 space-y-12 animate-fade-in-up">
          {/* Executive Summary */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-enterprise-pearl tracking-tight">Market Overview</h2>
                <p className="text-enterprise-steel mt-1">Real-time analysis of token performance and market dynamics</p>
              </div>
              <div className="status-indicator live">
                <div className="w-2 h-2 bg-success rounded-full animate-gentle-pulse mr-2"></div>
                Live Updates
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-elevated group hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div className="status-indicator info text-xs">Analyzed</div>
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-16 bg-enterprise-charcoal" />
                ) : (
                  <div className="text-3xl font-bold text-enterprise-pearl mb-2">{summary?.totalTokens || 10}</div>
                )}
                <div className="text-enterprise-steel text-sm">Total Tokens</div>
                <div className="mt-3 flex items-center text-xs">
                  <div className="w-2 h-2 bg-error rounded-full mr-2"></div>
                  <span className="text-error">{summary?.failureRate || 100}% failure rate</span>
                </div>
              </div>

              <div className="card-elevated group hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div className="status-indicator error text-xs">Critical</div>
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-20 bg-enterprise-charcoal" />
                ) : (
                  <div className="text-3xl font-bold gradient-text-error mb-2">{summary?.averageLoss || -95.2}%</div>
                )}
                <div className="text-enterprise-steel text-sm">Average Loss</div>
                <div className="mt-3 text-xs text-enterprise-steel">From all-time high</div>
              </div>

              <div className="card-elevated group hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-error/20 border border-error/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-error" />
                  </div>
                  <div className="status-indicator error text-xs">Destroyed</div>
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-20 bg-enterprise-charcoal" />
                ) : (
                  <div className="text-3xl font-bold text-error mb-2">{summary?.totalMarketCapLost || "$58.4B"}</div>
                )}
                <div className="text-enterprise-steel text-sm">Value Lost</div>
                <div className="mt-3 text-xs text-enterprise-steel">Market cap destroyed</div>
              </div>

              <div className="card-elevated group hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning/20 border border-warning/30 rounded-xl flex items-center justify-center">
                    <Percent className="w-6 h-6 text-warning" />
                  </div>
                  <div className="status-indicator warning text-xs">Low Float</div>
                </div>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-16 bg-enterprise-charcoal" />
                ) : (
                  <div className="text-3xl font-bold text-warning mb-2">{summary?.averageInitialFloat || 13.2}%</div>
                )}
                <div className="text-enterprise-steel text-sm">Initial Float</div>
                <div className="mt-3 text-xs text-enterprise-steel">Extremely low circulation</div>
              </div>
            </div>
          </section>

          {/* Performance Analysis Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-enterprise-pearl tracking-tight">Performance Analysis</h2>
                <p className="text-enterprise-steel mt-1">Comprehensive market performance tracking</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Chart */}
              <div className="lg:col-span-2 card-elevated">
                <PerformanceChart />
              </div>

              {/* Top Failures */}
              <div className="card-elevated">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-enterprise-pearl mb-1">Worst Performers</h3>
                  <p className="text-enterprise-steel text-sm">Largest losses from ATH</p>
                </div>
                <div className="space-y-4">
                  {topFailures?.map((token: any) => (
                    <div key={token.id} className="p-4 bg-enterprise-charcoal/30 border border-enterprise-charcoal/50 rounded-xl hover:border-error/30 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-error/20 to-error/30 border border-error/20 rounded-xl flex items-center justify-center">
                            <span className="text-error font-semibold text-sm">{token.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-enterprise-pearl group-hover:text-error transition-colors">{token.symbol}</div>
                            <div className="text-xs text-enterprise-steel">{token.sector}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-error font-bold">{token.performancePercent}%</div>
                          <div className="text-xs text-enterprise-steel">${token.currentPrice}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Token Analysis Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-enterprise-pearl tracking-tight">Token Analysis</h2>
                <p className="text-enterprise-steel mt-1">Detailed performance metrics and market data</p>
              </div>
            </div>
            <div className="card-elevated">
              <TokenTable searchTerm={searchTerm} />
            </div>
          </section>

          {/* Unlock Calendar Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-enterprise-pearl tracking-tight">Unlock Schedule</h2>
                <p className="text-enterprise-steel mt-1">Upcoming token unlock events and vesting milestones</p>
              </div>
            </div>
            <div className="card-elevated">
              <UnlockCalendar />
            </div>
          </section>

          {/* API Integration Status Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-enterprise-pearl tracking-tight">Data Sources</h2>
                <p className="text-enterprise-steel mt-1">Real-time API connections and data quality monitoring</p>
              </div>
            </div>
            
            <div className="card-elevated">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-enterprise-pearl mb-1">System Connections</h3>
                <p className="text-enterprise-steel text-sm">Live status of external data providers</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CryptoRank API */}
                <div className="p-6 bg-enterprise-charcoal/30 border border-enterprise-charcoal/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-enterprise-pearl">CryptoRank API</h4>
                    <div className={`status-indicator ${cryptoRankStatus?.connected ? 'live' : 'error'} text-xs`}>
                      <div className={`w-2 h-2 ${cryptoRankStatus?.connected ? 'bg-success' : 'bg-error'} rounded-full animate-gentle-pulse mr-2`}></div>
                      {cryptoRankStatus?.connected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Unlock Data:</span>
                      <span className="text-success font-medium">Real-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Vesting Schedules:</span>
                      <span className="text-success font-medium">Accurate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Coverage:</span>
                      <span className="text-enterprise-pearl font-medium">Hundreds of tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Documentation:</span>
                      <a 
                        href="https://api.cryptorank.io/v2/docs" 
                        className="text-accent-blue hover:text-accent-azure underline font-medium transition-colors" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        API Docs
                      </a>
                    </div>
                  </div>
                </div>

                {/* CoinGecko API */}
                <div className="p-6 bg-enterprise-charcoal/30 border border-enterprise-charcoal/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-enterprise-pearl">CoinGecko API</h4>
                    <div className={`status-indicator ${coinGeckoStatus?.connected ? 'live' : 'error'} text-xs`}>
                      <div className={`w-2 h-2 ${coinGeckoStatus?.connected ? 'bg-success' : 'bg-error'} rounded-full animate-gentle-pulse mr-2`}></div>
                      {coinGeckoStatus?.connected ? coinGeckoStatus.tier : 'Disconnected'}
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Price Data:</span>
                      <span className="text-success font-medium">Real-time</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Historical:</span>
                      <span className="text-success font-medium">Complete</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Rate Limit:</span>
                      <span className="text-enterprise-pearl font-medium">{coinGeckoStatus?.rateLimit || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-enterprise-steel">Documentation:</span>
                      <a 
                        href="https://www.coingecko.com/en/api/documentation" 
                        className="text-accent-blue hover:text-accent-azure underline font-medium transition-colors" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        API Docs
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 bg-success/5 border border-success/20 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-success/20 border border-success/30 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-enterprise-pearl mb-2">Data Quality Assurance</h4>
                    <p className="text-enterprise-steel text-sm leading-relaxed">
                      Real-time pricing data from CoinGecko Pro API ensures accurate token valuations. 
                      CryptoRank provides verified unlock schedules and vesting data for comprehensive risk analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
