import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Loader2, TrendingUp, TrendingDown, Activity, Lock, DollarSign, Users, Droplets } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UnifiedAssetDashboardProps {
  coinId: string;
  coinName?: string;
}

interface UnifiedAssetData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  fullyDilutedValuation: number;
  totalVolume: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  categories: string[];
  isTrending: boolean;
  tvl: number | null;
  tvlChange24h: number | null;
  activeUsers: number | null;
  activeUsersChange24h: number | null;
  totalLiquidity: number | null;
  topLiquidityPools: Array<{
    pool: string;
    liquidity: number;
    chain: string;
  }> | null;
  nextUnlock: {
    date: string;
    amount: string;
    percentage: number;
    impact: string;
  } | null;
  upcomingUnlocks: Array<{
    date: string;
    amount: string;
    percentage: number;
  }> | null;
  fees24h: number | null;
  revenue24h: number | null;
  fees30d: number | null;
  revenue30d: number | null;
  priceHistory: Array<[number, number]> | null;
  tvlHistory: Array<[number, number]> | null;
}

export function UnifiedAssetDashboard({ coinId, coinName }: UnifiedAssetDashboardProps) {
  const { data, isLoading, error } = useQuery<UnifiedAssetData>({
    queryKey: ['/api/unified-asset', coinId],
    queryFn: async () => {
      const response = await fetch(`/api/unified-asset/${coinId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch asset data');
      }
      return response.json();
    },
    enabled: !!coinId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load asset data</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (num: number) => {
    const formatted = num.toFixed(2);
    return num >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  // Prepare chart data
  const priceChartData = {
    labels: data.priceHistory?.map((_, index) => index) || [],
    datasets: [
      {
        label: 'Price',
        data: data.priceHistory?.map(item => item[1]) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.1
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: true,
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with basic info */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <img src={data.image} alt={data.name} className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{data.name}</h2>
            <Badge variant="secondary" className="uppercase">{data.symbol}</Badge>
            {data.isTrending && (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {data.categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{formatNumber(data.currentPrice)}</p>
          <p className={`text-sm ${data.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercent(data.priceChange24h)}
          </p>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="defi">DeFi Metrics</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          <TabsTrigger value="unlocks">Unlocks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">7 Day Price Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {data.priceHistory && (
                  <Line data={priceChartData} options={chartOptions} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-xl font-bold">{formatNumber(data.marketCap)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Rank #{data.marketCap > 1e9 ? 'Top 100' : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="text-xl font-bold">{formatNumber(data.totalVolume)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Vol/MCap: {((data.totalVolume / data.marketCap) * 100).toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Changes */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">24h</div>
                  <div className={`font-bold ${data.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(data.priceChange24h)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">7d</div>
                  <div className={`font-bold ${data.priceChange7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(data.priceChange7d)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">30d</div>
                  <div className={`font-bold ${data.priceChange30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(data.priceChange30d)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Circulating Supply</span>
                  <span className="font-medium">{data.circulatingSupply.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Supply</span>
                  <span className="font-medium">{data.totalSupply.toLocaleString()}</span>
                </div>
                {data.maxSupply && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Max Supply</span>
                    <span className="font-medium">{data.maxSupply.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">FDV</span>
                  <span className="font-medium">{formatNumber(data.fullyDilutedValuation)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defi" className="space-y-4">
          {/* TVL Card */}
          {data.tvl !== null && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      Total Value Locked
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(data.tvl)}</div>
                    {data.tvlChange24h !== null && (
                      <div className={`text-sm ${data.tvlChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(data.tvlChange24h)} (24h)
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">TVL/MCap</div>
                    <div className="font-bold">{(data.tvl / data.marketCap).toFixed(2)}x</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Users */}
          {data.activeUsers !== null && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  Active Users (24h)
                </div>
                <div className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</div>
                {data.activeUsersChange24h !== null && (
                  <div className={`text-sm ${data.activeUsersChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(data.activeUsersChange24h)} change
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Revenue & Fees */}
          {(data.revenue24h !== null || data.fees24h !== null) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  Protocol Economics
                </div>
                <div className="space-y-2">
                  {data.revenue24h !== null && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue (24h)</span>
                      <span className="font-medium">{formatNumber(data.revenue24h)}</span>
                    </div>
                  )}
                  {data.fees24h !== null && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fees (24h)</span>
                      <span className="font-medium">{formatNumber(data.fees24h)}</span>
                    </div>
                  )}
                  {data.revenue30d !== null && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue (30d)</span>
                      <span className="font-medium">{formatNumber(data.revenue30d)}</span>
                    </div>
                  )}
                  {data.revenue30d !== null && data.marketCap && (
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm text-muted-foreground">P/S Ratio</span>
                      <span className="font-bold">
                        {(data.marketCap / (data.revenue30d * 12)).toFixed(2)}x
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No DeFi data message */}
          {data.tvl === null && data.activeUsers === null && data.revenue24h === null && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No DeFi metrics available for this asset</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          {/* Total Liquidity */}
          {data.totalLiquidity !== null && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Droplets className="w-4 h-4" />
                  Total DEX Liquidity
                </div>
                <div className="text-2xl font-bold">{formatNumber(data.totalLiquidity)}</div>
              </CardContent>
            </Card>
          )}

          {/* Top Liquidity Pools */}
          {data.topLiquidityPools && data.topLiquidityPools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Liquidity Pools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.topLiquidityPools.map((pool, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{pool.pool}</div>
                        <div className="text-xs text-muted-foreground">{pool.chain}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(pool.liquidity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No liquidity data */}
          {data.totalLiquidity === null && (!data.topLiquidityPools || data.topLiquidityPools.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No liquidity data available for this asset</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unlocks" className="space-y-4">
          {/* Next Unlock */}
          {data.nextUnlock && (
            <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-600">Next Token Unlock</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{data.nextUnlock.amount} tokens</div>
                  <div className="text-sm text-muted-foreground">
                    {data.nextUnlock.percentage}% of supply • {new Date(data.nextUnlock.date).toLocaleDateString()}
                  </div>
                  <Badge variant={data.nextUnlock.impact === 'high' ? 'destructive' : 'secondary'}>
                    {data.nextUnlock.impact.toUpperCase()} IMPACT
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Unlocks Timeline */}
          {data.upcomingUnlocks && data.upcomingUnlocks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unlock Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.upcomingUnlocks.map((unlock, index) => (
                    <div key={index} className="flex justify-between items-center pb-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{unlock.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(unlock.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">{unlock.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No unlock data */}
          {!data.nextUnlock && (!data.upcomingUnlocks || data.upcomingUnlocks.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No token unlock data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}