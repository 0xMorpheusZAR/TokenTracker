import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Users, TrendingUp, DollarSign, BarChart3, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DuneMetric {
  rows: any[];
  metadata: {
    column_names: string[];
    total_row_count: number;
  };
  lastUpdated: string;
}

export default function HyperliquidDunePage() {
  // Fetch all Hyperliquid metrics from Dune
  const { data: duneData, isLoading, error } = useQuery<Record<string, DuneMetric>>({
    queryKey: ['/api/dune/hyperliquid/all'],
  });

  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.3),rgba(0,0,0,0))]"></div>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-500/10 blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: `${300 + i * 100}px`,
              height: `${300 + i * 100}px`,
              left: `${i * 30}%`,
              top: `${i * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/hyperliquid">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Hyperliquid On-Chain Analytics
              </h1>
              <p className="text-gray-400">
                Real-time blockchain data from Dune Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-400">Loading on-chain data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-300">
                Failed to load Dune Analytics data. Please check your API configuration.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {duneData && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Total Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {duneData.cumulative_volume?.rows?.[0]?.total_volume 
                      ? formatNumber(duneData.cumulative_volume.rows[0].total_volume)
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    All-time trading volume
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    <Users className="h-4 w-4 inline mr-2" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {duneData.daily_active_users?.rows?.[0]?.user_count 
                      ? duneData.daily_active_users.rows[0].user_count.toLocaleString()
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    24h active traders
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    <Activity className="h-4 w-4 inline mr-2" />
                    Daily Trades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {duneData.trades_per_day?.rows?.[0]?.trade_count 
                      ? duneData.trades_per_day.rows[0].trade_count.toLocaleString()
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Transactions today
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Total TVL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {duneData.total_value_locked?.rows?.[0]?.tvl 
                      ? formatNumber(duneData.total_value_locked.rows[0].tvl)
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Total value locked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="volume" className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto bg-gray-800/50">
                <TabsTrigger value="volume">Volume</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="trading">Trading</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Volume Tab */}
              <TabsContent value="volume" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>Daily Volume Trend</CardTitle>
                      <CardDescription>
                        7-day trading volume analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.daily_volume?.rows && duneData.daily_volume.rows.length > 0 ? (
                          <Line
                            data={{
                              labels: duneData.daily_volume.rows.map(row => formatDate(row.date)),
                              datasets: [{
                                label: 'Daily Volume',
                                data: duneData.daily_volume.rows.map(row => row.volume),
                                borderColor: 'rgb(168, 85, 247)',
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                tension: 0.4
                              }]
                            }}
                            options={chartOptions}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No volume data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>Liquidations</CardTitle>
                      <CardDescription>
                        Recent liquidation events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.liquidations?.rows && duneData.liquidations.rows.length > 0 ? (
                          <Bar
                            data={{
                              labels: duneData.liquidations.rows.map(row => formatDate(row.date)),
                              datasets: [{
                                label: 'Liquidation Volume',
                                data: duneData.liquidations.rows.map(row => row.liquidation_amount),
                                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                                borderColor: 'rgb(239, 68, 68)',
                                borderWidth: 1
                              }]
                            }}
                            options={chartOptions}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No liquidation data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>
                        New users over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.new_users?.rows && duneData.new_users.rows.length > 0 ? (
                          <Line
                            data={{
                              labels: duneData.new_users.rows.map(row => formatDate(row.date)),
                              datasets: [{
                                label: 'New Users',
                                data: duneData.new_users.rows.map(row => row.new_user_count),
                                borderColor: 'rgb(34, 197, 94)',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                tension: 0.4
                              }]
                            }}
                            options={chartOptions}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No user data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>User Retention</CardTitle>
                      <CardDescription>
                        Weekly retention rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.user_retention?.rows && duneData.user_retention.rows.length > 0 ? (
                          <Bar
                            data={{
                              labels: duneData.user_retention.rows.map(row => `Week ${row.week}`),
                              datasets: [{
                                label: 'Retention Rate %',
                                data: duneData.user_retention.rows.map(row => row.retention_rate * 100),
                                backgroundColor: 'rgba(96, 165, 250, 0.8)',
                                borderColor: 'rgb(96, 165, 250)',
                                borderWidth: 1
                              }]
                            }}
                            options={chartOptions}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No retention data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Trading Tab */}
              <TabsContent value="trading" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>Average Trade Size</CardTitle>
                      <CardDescription>
                        Mean transaction value over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.average_trade_size?.rows && duneData.average_trade_size.rows.length > 0 ? (
                          <Line
                            data={{
                              labels: duneData.average_trade_size.rows.map(row => formatDate(row.date)),
                              datasets: [{
                                label: 'Avg Trade Size',
                                data: duneData.average_trade_size.rows.map(row => row.avg_size),
                                borderColor: 'rgb(251, 191, 36)',
                                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                tension: 0.4
                              }]
                            }}
                            options={chartOptions}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No trade size data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>Top Traders</CardTitle>
                      <CardDescription>
                        Highest volume traders
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {duneData.top_traders?.rows && duneData.top_traders.rows.length > 0 ? (
                          duneData.top_traders.rows.slice(0, 5).map((trader, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-purple-400">#{index + 1}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-200">
                                    {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {trader.trade_count} trades
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-400">
                                  {formatNumber(trader.volume)}
                                </p>
                                <p className="text-xs text-gray-400">Volume</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            No trader data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Assets Tab */}
              <TabsContent value="assets" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>Top Traded Assets</CardTitle>
                      <CardDescription>
                        Most popular trading pairs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.top_traded_assets?.rows && duneData.top_traded_assets.rows.length > 0 ? (
                          <Doughnut
                            data={{
                              labels: duneData.top_traded_assets.rows.slice(0, 6).map(row => row.asset),
                              datasets: [{
                                data: duneData.top_traded_assets.rows.slice(0, 6).map(row => row.volume),
                                backgroundColor: [
                                  'rgba(168, 85, 247, 0.8)',
                                  'rgba(96, 165, 250, 0.8)',
                                  'rgba(34, 197, 94, 0.8)',
                                  'rgba(251, 191, 36, 0.8)',
                                  'rgba(239, 68, 68, 0.8)',
                                  'rgba(156, 163, 175, 0.8)'
                                ],
                                borderWidth: 0
                              }]
                            }}
                            options={{
                              ...chartOptions,
                              plugins: {
                                ...chartOptions.plugins,
                                legend: {
                                  position: 'right' as const,
                                  labels: {
                                    color: '#e5e7eb',
                                    font: {
                                      size: 11
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No asset data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>Open Interest</CardTitle>
                      <CardDescription>
                        Outstanding positions by asset
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.open_interest?.rows && duneData.open_interest.rows.length > 0 ? (
                          <Bar
                            data={{
                              labels: duneData.open_interest.rows.map(row => row.asset),
                              datasets: [{
                                label: 'Open Interest',
                                data: duneData.open_interest.rows.map(row => row.oi_value),
                                backgroundColor: 'rgba(129, 140, 248, 0.8)',
                                borderColor: 'rgb(129, 140, 248)',
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              ...chartOptions,
                              indexAxis: 'y' as const
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No open interest data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>PnL Distribution</CardTitle>
                      <CardDescription>
                        Profit and loss across users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.pnl_distribution?.rows && duneData.pnl_distribution.rows.length > 0 ? (
                          <Bar
                            data={{
                              labels: duneData.pnl_distribution.rows.map(row => row.pnl_range),
                              datasets: [{
                                label: 'Number of Users',
                                data: duneData.pnl_distribution.rows.map(row => row.user_count),
                                backgroundColor: duneData.pnl_distribution.rows.map(row => 
                                  row.pnl_range.includes('-') ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)'
                                ),
                                borderWidth: 0
                              }]
                            }}
                            options={chartOptions}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No PnL data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle>Funding Rates</CardTitle>
                      <CardDescription>
                        Average funding rates over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {duneData.funding_rates?.rows && duneData.funding_rates.rows.length > 0 ? (
                          <Line
                            data={{
                              labels: duneData.funding_rates.rows.map(row => formatDate(row.date)),
                              datasets: [{
                                label: 'Funding Rate %',
                                data: duneData.funding_rates.rows.map(row => row.funding_rate * 100),
                                borderColor: 'rgb(251, 146, 60)',
                                backgroundColor: 'rgba(251, 146, 60, 0.1)',
                                tension: 0.4
                              }]
                            }}
                            options={chartOptions}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No funding rate data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Data Source Attribution */}
            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Data provided by{' '}
                      <a 
                        href="https://dune.com/x3research/hyperliquid" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        x3research Hyperliquid Dashboard
                      </a>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {duneData.cumulative_volume?.lastUpdated 
                        ? new Date(duneData.cumulative_volume.lastUpdated).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}