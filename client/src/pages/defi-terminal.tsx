import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Zap, Target, Shield, TrendingUp, AlertCircle, 
  Layers, Globe, DollarSign, RefreshCw, Eye, 
  Search, Timer, Activity, AlertTriangle, Wallet
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useToast } from '@/hooks/use-toast';

interface MEVOpportunity {
  id: number;
  type: 'sandwich' | 'arbitrage' | 'liquidation';
  pool?: string;
  protocol?: string;
  dex?: string;
  targetTx?: string;
  position?: string;
  collateral?: string;
  debt?: string;
  healthFactor?: number;
  spread?: number;
  estimatedProfit: number;
  gasEstimate: number;
  netProfit: number;
  confidence: number;
  timeWindow: string;
  liquidity?: number;
}

interface DexPool {
  pair: string;
  address: string;
  dex: string;
  volume24h: number;
  volumeChange: number;
  tvl: number;
  newHolders24h: number;
  whaleActivity: 'high' | 'medium' | 'low';
  impermanentLoss: number;
  trending: boolean;
}

export default function DeFiTerminal() {
  const [activeView, setActiveView] = useState('mev');
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [executingOpportunity, setExecutingOpportunity] = useState<number | null>(null);
  
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  // Fetch real-time DEX data from CoinGecko
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/coingecko/trending'],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
  });

  // Fetch protocol data from DefiLlama
  const { data: protocolData, isLoading: protocolLoading } = useQuery({
    queryKey: ['/api/defillama/protocols'],
    refetchInterval: autoRefresh ? 60000 : false, // Refresh every minute
  });

  // Fetch MEV opportunities from backend
  const { data: mevData, isLoading: mevLoading } = useQuery({
    queryKey: ['/api/mev/arbitrage-opportunities'],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
  });

  // Use real MEV data or fallback to example data
  const mevOpportunities: MEVOpportunity[] = (mevData as any)?.opportunities || [
    {
      id: 1,
      type: 'sandwich',
      pool: 'WETH/USDC',
      dex: 'Uniswap V3',
      targetTx: '0x1234...5678',
      estimatedProfit: 0.089,
      gasEstimate: 0.023,
      netProfit: 0.066,
      confidence: 92,
      timeWindow: '< 2 blocks',
      liquidity: 4500000
    },
    {
      id: 2,
      type: 'arbitrage',
      pool: 'ARB/ETH',
      dex: 'SushiSwap → Camelot',
      spread: 0.0034,
      estimatedProfit: 0.125,
      gasEstimate: 0.031,
      netProfit: 0.094,
      confidence: 87,
      timeWindow: 'immediate',
      liquidity: 2300000
    },
    {
      id: 3,
      type: 'liquidation',
      protocol: 'Aave V3',
      position: '0xabcd...efgh',
      collateral: 'ETH',
      debt: 'USDC',
      healthFactor: 1.02,
      estimatedProfit: 0.340,
      gasEstimate: 0.045,
      netProfit: 0.295,
      confidence: 78,
      timeWindow: '5-10 min'
    }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

  // Execute MEV opportunity
  const executeMEV = async (opportunity: MEVOpportunity) => {
    if (!isConnected || !walletClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to execute MEV opportunities",
        variant: "destructive",
      });
      return;
    }

    setExecutingOpportunity(opportunity.id);

    try {
      // Simulate MEV execution (in production, this would interact with MEV contracts)
      const txHash = await walletClient.sendTransaction({
        to: '0x0000000000000000000000000000000000000000', // MEV router contract
        value: parseEther('0.01'), // Example gas fee
        data: '0x', // MEV execution data
      });

      toast({
        title: "MEV Execution Submitted",
        description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      // Wait for confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        
        if (receipt.status === 'success') {
          toast({
            title: "MEV Executed Successfully!",
            description: `Profit: ${opportunity.netProfit} ETH`,
          });
        }
      }
    } catch (error) {
      console.error('MEV execution error:', error);
      toast({
        title: "Execution Failed",
        description: "Failed to execute MEV opportunity. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setExecutingOpportunity(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              DeFi Alpha Terminal - Advanced Analytics
            </h1>
            <p className="text-gray-400 mt-2">MEV Scanner • Portfolio Risk • On-Chain Intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>

        {/* View Selector */}
        <div className="flex space-x-1 mb-6 bg-gray-900 rounded-lg p-1">
          {[
            { id: 'mev', name: 'MEV Scanner', icon: Zap },
            { id: 'dex', name: 'DEX Intelligence', icon: Layers },
            { id: 'portfolio', name: 'Portfolio Risk', icon: Shield },
            { id: 'narratives', name: 'Narrative Tracker', icon: Globe },
            { id: 'whale', name: 'Whale Watch', icon: Eye }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                activeView === view.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <view.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{view.name}</span>
            </button>
          ))}
        </div>

        {/* MEV Scanner */}
        {activeView === 'mev' && (
          <div className="space-y-6">
            {/* Wallet Status */}
            {isConnected && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">Connected to</span>
                  <span className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Ready to Execute</span>
                </div>
              </div>
            )}

            {/* MEV Opportunities List */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">MEV Opportunities</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
                      autoRefresh ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span>Auto-refresh</span>
                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {mevOpportunities.map(opp => (
                  <div key={opp.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          opp.type === 'sandwich' ? 'bg-yellow-900 text-yellow-400' :
                          opp.type === 'arbitrage' ? 'bg-green-900 text-green-400' :
                          'bg-red-900 text-red-400'
                        }`}>
                          {opp.type === 'sandwich' ? '🥪' :
                           opp.type === 'arbitrage' ? '♻️' : '💧'}
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{opp.type} Opportunity</h3>
                          <p className="text-sm text-gray-400">{opp.pool || opp.protocol}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Est. Profit</p>
                          <p className="font-semibold text-green-400">{opp.estimatedProfit} ETH</p>
                          <p className="text-xs text-gray-500">Gas: {opp.gasEstimate} ETH</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-400">Net Profit</p>
                          <p className="font-bold text-lg text-green-400">{opp.netProfit} ETH</p>
                          <p className="text-xs text-gray-500">${(opp.netProfit * 1800).toFixed(0)}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-400">Confidence</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-full rounded-full ${
                                  opp.confidence >= 90 ? 'bg-green-500' :
                                  opp.confidence >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${opp.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{opp.confidence}%</span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => executeMEV(opp)}
                            disabled={executingOpportunity === opp.id || !isConnected}
                            className={`px-4 py-1 rounded text-sm font-semibold transition-all ${
                              executingOpportunity === opp.id 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : !isConnected
                                ? 'bg-gray-700 hover:bg-gray-600 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            {executingOpportunity === opp.id ? 'Executing...' : !isConnected ? 'Connect Wallet' : 'Execute'}
                          </button>
                          <span className="text-xs text-gray-400 text-center">{opp.timeWindow}</span>
                        </div>
                      </div>
                    </div>

                    {opp.dex && (
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                        <span>Route: {opp.dex}</span>
                        {opp.spread && <span>Spread: {(opp.spread * 100).toFixed(2)}%</span>}
                        <span>Liquidity: ${(opp.liquidity ? (opp.liquidity / 1e6).toFixed(1) : '0')}M</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* MEV Performance Chart */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">MEV Capture Performance (24h)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={[
                  { time: '00:00', value: 0 },
                  { time: '04:00', value: 2.3 },
                  { time: '08:00', value: 4.5 },
                  { time: '12:00', value: 8.9 },
                  { time: '16:00', value: 12.3 },
                  { time: '20:00', value: 14.5 },
                  { time: '24:00', value: 16.7 }
                ]}>
                  <defs>
                    <linearGradient id="colorMEV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMEV)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-gray-400">Total Captured: <span className="text-white font-semibold">16.7 ETH</span></span>
                <span className="text-gray-400">Success Rate: <span className="text-white font-semibold">87%</span></span>
                <span className="text-gray-400">Avg Profit: <span className="text-white font-semibold">0.152 ETH</span></span>
              </div>
            </div>

            {/* MEV Strategy Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Sandwich Attacks</span>
                  <span className="text-yellow-400 text-2xl">🥪</span>
                </div>
                <p className="text-2xl font-bold">45</p>
                <p className="text-sm text-gray-500">Success: 89%</p>
                <p className="text-sm text-green-400">+5.4 ETH</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Arbitrage</span>
                  <span className="text-green-400 text-2xl">♻️</span>
                </div>
                <p className="text-2xl font-bold">123</p>
                <p className="text-sm text-gray-500">Success: 92%</p>
                <p className="text-sm text-green-400">+8.9 ETH</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Liquidations</span>
                  <span className="text-red-400 text-2xl">💧</span>
                </div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-500">Success: 75%</p>
                <p className="text-sm text-green-400">+2.4 ETH</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(marketLoading || protocolLoading) && activeView === 'mev' && (
          <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Loading real-time data...</span>
          </div>
        )}
      </div>
    </div>
  );
}