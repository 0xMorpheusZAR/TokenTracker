import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, Users, TrendingUp, DollarSign, BarChart3, Loader2, AlertCircle, ExternalLink, Zap, Lock, PieChart } from "lucide-react";
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

interface DefiLlamaProtocol {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  url: string;
  description: string;
  twitter: string;
  currentChainTvls: { [key: string]: number };
  chainTvls: {
    [key: string]: {
      tvl: Array<{
        date: number;
        totalLiquidityUSD: number;
      }>;
    };
  };
  fees?: {
    totalDataChart: Array<[number, number]>;
    total24h: number;
    total7d: number;
    total30d: number;
    total365d: number;
  };
  revenue?: {
    totalDataChart: Array<[number, number]>;
    total24h: number;
    total7d: number;
    total30d: number;
    total365d: number;
  };
}

interface CoinGeckoData {
  current_price: number;
  market_cap: number;
  fully_diluted_valuation: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
}

export default function HyperliquidDunePage() {
  // Fetch DefiLlama protocol data for Hyperliquid
  const { data: defiLlamaData, isLoading: defiLlamaLoading } = useQuery<DefiLlamaProtocol>({
    queryKey: ['/api/defillama/protocol/hyperliquid'],
  });

  // Fetch CoinGecko live pricing data
  const { data: coinGeckoData, isLoading: coinGeckoLoading } = useQuery<CoinGeckoData>({
    queryKey: ['/api/coingecko/live/hyperliquid'],
  });

  // Fetch Dune Analytics data
  const { data: duneData } = useQuery<Record<string, DuneMetric>>({
    queryKey: ['/api/dune/hyperliquid/all'],
  });

  const isLoading = defiLlamaLoading || coinGeckoLoading;

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
                Hyperliquid Live Analytics Dashboard
              </h1>
              <p className="text-gray-400">
                Real-time data from DefiLlama & CoinGecko
              </p>
            </div>
          </div>
          
          {/* External Links */}
          <div className="flex items-center gap-3">
            <a 
              href="https://defillama.com/protocol/hyperliquid" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              DefiLlama
            </a>
            <a 
              href="https://www.coingecko.com/en/coins/hyperliquid" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              CoinGecko
            </a>
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
        {!isLoading && !defiLlamaData && !coinGeckoData && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-300">
                Failed to load data. Please check your API configuration.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {!isLoading && (defiLlamaData || coinGeckoData) && (
          <div className="space-y-6">
            {/* Live Price & Market Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 border-purple-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Live Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    ${coinGeckoData?.current_price?.toFixed(2) || 'N/A'}
                  </p>
                  <p className={`text-sm mt-2 flex items-center gap-1 ${
                    (coinGeckoData?.price_change_percentage_24h || 0) >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {coinGeckoData?.price_change_percentage_24h?.toFixed(2)}% (24h)
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-800/30 to-blue-900/30 border-blue-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-300">
                    <PieChart className="h-4 w-4 inline mr-2" />
                    Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(coinGeckoData?.market_cap || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    FDV: {formatNumber(coinGeckoData?.fully_diluted_valuation || 0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-800/30 to-green-900/30 border-green-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-300">
                    <Lock className="h-4 w-4 inline mr-2" />
                    TVL (DefiLlama)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {defiLlamaData?.currentChainTvls?.['Hyperliquid L1'] 
                      ? formatNumber(defiLlamaData.currentChainTvls['Hyperliquid L1'])
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Total value locked
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-800/30 to-yellow-900/30 border-yellow-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-yellow-300">
                    <Activity className="h-4 w-4 inline mr-2" />
                    24h Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(coinGeckoData?.total_volume || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Trading volume
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-800/30 to-pink-900/30 border-pink-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-pink-300">
                    <Zap className="h-4 w-4 inline mr-2" />
                    ATH Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-white">
                    ${coinGeckoData?.ath?.toFixed(2) || 'N/A'}
                  </p>
                  <p className="text-xs text-pink-400 mt-1">
                    {coinGeckoData?.ath_change_percentage?.toFixed(1)}% from ATH
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* TVL Chart from DefiLlama */}
            {defiLlamaData?.chainTvls?.['Hyperliquid L1']?.tvl && (
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Total Value Locked (TVL) History</CardTitle>
                  <CardDescription className="text-gray-400">
                    Historical TVL data from DefiLlama
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Line
                      data={{
                        labels: defiLlamaData.chainTvls['Hyperliquid L1'].tvl
                          .slice(-30)
                          .map(item => new Date(item.date * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })),
                        datasets: [{
                          label: 'TVL (USD)',
                          data: defiLlamaData.chainTvls['Hyperliquid L1'].tvl
                            .slice(-30)
                            .map(item => item.totalLiquidityUSD),
                          borderColor: 'rgb(147, 51, 234)',
                          backgroundColor: 'rgba(147, 51, 234, 0.1)',
                          tension: 0.4,
                          fill: true
                        }]
                      }}
                      options={{
                        ...chartOptions,
                        scales: {
                          ...chartOptions.scales,
                          y: {
                            ...chartOptions.scales?.y,
                            ticks: {
                              ...chartOptions.scales?.y?.ticks,
                              callback: function(value) {
                                return formatNumber(value as number);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto bg-gray-800/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                <TabsTrigger value="fees">Fees & Revenue</TabsTrigger>
                <TabsTrigger value="dune">On-Chain</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Protocol Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-4">
                        {defiLlamaData?.logo && (
                          <img 
                            src={defiLlamaData.logo} 
                            alt="Hyperliquid" 
                            className="w-16 h-16 rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {defiLlamaData?.name || 'Hyperliquid'}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {defiLlamaData?.description || 'Decentralized perpetual exchange'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Symbol</span>
                          <span className="text-white font-medium">
                            {defiLlamaData?.symbol || 'HYPE'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Chain</span>
                          <span className="text-white font-medium">Hyperliquid L1</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Website</span>
                          <a 
                            href={defiLlamaData?.url || 'https://hyperliquid.xyz'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            hyperliquid.xyz
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400">Twitter</span>
                          <a 
                            href={`https://twitter.com/${defiLlamaData?.twitter || 'HyperliquidX'}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            @{defiLlamaData?.twitter || 'HyperliquidX'}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Market Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">7D Change</p>
                          <p className={`text-xl font-bold ${
                            (coinGeckoData?.price_change_percentage_7d || 0) >= 0 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {coinGeckoData?.price_change_percentage_7d?.toFixed(2)}%
                          </p>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">30D Change</p>
                          <p className={`text-xl font-bold ${
                            (coinGeckoData?.price_change_percentage_30d || 0) >= 0 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {coinGeckoData?.price_change_percentage_30d?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Circulating Supply</span>
                          <span className="text-white font-medium">
                            {coinGeckoData?.circulating_supply?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Total Supply</span>
                          <span className="text-white font-medium">
                            {coinGeckoData?.total_supply?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Max Supply</span>
                          <span className="text-white font-medium">
                            {coinGeckoData?.max_supply?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400">ATH Date</span>
                          <span className="text-white font-medium">
                            {coinGeckoData?.ath_date 
                              ? new Date(coinGeckoData.ath_date).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tokenomics Tab */}
              <TabsContent value="tokenomics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Supply Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center">
                        <Doughnut
                          data={{
                            labels: ['Circulating', 'Locked'],
                            datasets: [{
                              data: [
                                coinGeckoData?.circulating_supply || 0,
                                (coinGeckoData?.total_supply || 0) - (coinGeckoData?.circulating_supply || 0)
                              ],
                              backgroundColor: [
                                'rgba(147, 51, 234, 0.8)',
                                'rgba(75, 85, 99, 0.8)'
                              ],
                              borderWidth: 0
                            }]
                          }}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: {
                                position: 'bottom' as const,
                                labels: {
                                  color: '#e5e7eb',
                                  padding: 20,
                                  font: {
                                    size: 14
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                        <p className="text-sm text-purple-300 mb-2">Market Cap / TVL Ratio</p>
                        <p className="text-2xl font-bold text-white">
                          {defiLlamaData?.currentChainTvls?.['Hyperliquid L1'] && coinGeckoData?.market_cap
                            ? (coinGeckoData.market_cap / defiLlamaData.currentChainTvls['Hyperliquid L1']).toFixed(2)
                            : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                        <p className="text-sm text-blue-300 mb-2">FDV / TVL Ratio</p>
                        <p className="text-2xl font-bold text-white">
                          {defiLlamaData?.currentChainTvls?.['Hyperliquid L1'] && coinGeckoData?.fully_diluted_valuation
                            ? (coinGeckoData.fully_diluted_valuation / defiLlamaData.currentChainTvls['Hyperliquid L1']).toFixed(2)
                            : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                        <p className="text-sm text-green-300 mb-2">Circulating %</p>
                        <p className="text-2xl font-bold text-white">
                          {coinGeckoData?.circulating_supply && coinGeckoData?.total_supply
                            ? ((coinGeckoData.circulating_supply / coinGeckoData.total_supply) * 100).toFixed(1)
                            : 'N/A'}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Fees & Revenue Tab */}
              <TabsContent value="fees" className="space-y-6">
                <Card className="bg-gray-800/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue Metrics</CardTitle>
                    <CardDescription className="text-gray-400">
                      Revenue data from DefiLlama
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">24h Fees</p>
                        <p className="text-xl font-bold text-green-400">
                          {defiLlamaData?.fees?.total24h 
                            ? formatNumber(defiLlamaData.fees.total24h)
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">7d Fees</p>
                        <p className="text-xl font-bold text-green-400">
                          {defiLlamaData?.fees?.total7d 
                            ? formatNumber(defiLlamaData.fees.total7d)
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">30d Fees</p>
                        <p className="text-xl font-bold text-green-400">
                          {defiLlamaData?.fees?.total30d 
                            ? formatNumber(defiLlamaData.fees.total30d)
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">Annual Fees</p>
                        <p className="text-xl font-bold text-green-400">
                          {defiLlamaData?.fees?.total365d 
                            ? formatNumber(defiLlamaData.fees.total365d)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Revenue metrics if available */}
                    {defiLlamaData?.revenue && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-purple-900/20 rounded-lg p-4">
                          <p className="text-sm text-purple-300 mb-2">24h Revenue</p>
                          <p className="text-xl font-bold text-purple-400">
                            {formatNumber(defiLlamaData.revenue.total24h || 0)}
                          </p>
                        </div>
                        <div className="bg-purple-900/20 rounded-lg p-4">
                          <p className="text-sm text-purple-300 mb-2">7d Revenue</p>
                          <p className="text-xl font-bold text-purple-400">
                            {formatNumber(defiLlamaData.revenue.total7d || 0)}
                          </p>
                        </div>
                        <div className="bg-purple-900/20 rounded-lg p-4">
                          <p className="text-sm text-purple-300 mb-2">30d Revenue</p>
                          <p className="text-xl font-bold text-purple-400">
                            {formatNumber(defiLlamaData.revenue.total30d || 0)}
                          </p>
                        </div>
                        <div className="bg-purple-900/20 rounded-lg p-4">
                          <p className="text-sm text-purple-300 mb-2">Annual Revenue</p>
                          <p className="text-xl font-bold text-purple-400">
                            {formatNumber(defiLlamaData.revenue.total365d || 0)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Fees Chart */}
                    {defiLlamaData?.fees?.totalDataChart && defiLlamaData.fees.totalDataChart.length > 0 && (
                      <div className="h-[400px]">
                        <Line
                          data={{
                            labels: defiLlamaData.fees.totalDataChart
                              .slice(-30)
                              .map(item => new Date(item[0] * 1000).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })),
                            datasets: [{
                              label: 'Daily Fees (USD)',
                              data: defiLlamaData.fees.totalDataChart
                                .slice(-30)
                                .map(item => item[1]),
                              borderColor: 'rgb(34, 197, 94)',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              tension: 0.4,
                              fill: true
                            }]
                          }}
                          options={{
                            ...chartOptions,
                            scales: {
                              ...chartOptions.scales,
                              y: {
                                ...chartOptions.scales?.y,
                                ticks: {
                                  ...chartOptions.scales?.y?.ticks,
                                  callback: function(value) {
                                    return formatNumber(value as number);
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                        {duneData?.top_traded_assets?.rows && duneData.top_traded_assets.rows.length > 0 ? (
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
                        {duneData?.open_interest?.rows && duneData.open_interest.rows.length > 0 ? (
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
                        {duneData?.pnl_distribution?.rows && duneData.pnl_distribution.rows.length > 0 ? (
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
                        {duneData?.funding_rates?.rows && duneData.funding_rates.rows.length > 0 ? (
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
                      Last updated: {duneData?.cumulative_volume?.lastUpdated 
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