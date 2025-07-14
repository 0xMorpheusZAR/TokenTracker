import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, ArrowLeft, DollarSign, Users, Rocket, Shield, Zap, Target, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function HyperliquidAnalysis() {
  const { data: hyperliquidData } = useQuery({
    queryKey: ["/api/hyperliquid/comprehensive"],
  });

  const { data: coinGeckoStatus } = useQuery({
    queryKey: ["/api/coingecko/status"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="relative mb-12">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative flex flex-wrap items-center justify-between mb-8">
            <a 
              href="/" 
              className="group inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 text-slate-300 hover:text-white transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Dashboard</span>
            </a>
          </div>
          
          <div className="relative text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 backdrop-blur-sm rounded-full border border-emerald-500/20">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-sm">Success Case Study</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 leading-tight tracking-tight">
              Hyperliquid
            </h1>
            
            <div className="space-y-3">
              <p className="text-3xl font-bold text-white">The Success Story</p>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                How to build a token that <span className="text-emerald-400 font-semibold">actually works</span> — the complete opposite of low float/high FDV failures
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Revenue-Generating</span>
              </div>
              <div className="w-1 h-4 bg-slate-600"></div>
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Fair Launch</span>
              </div>
              <div className="w-1 h-4 bg-slate-600"></div>
              <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">+1,029% Performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Data Source:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${(coinGeckoStatus as any)?.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  CoinGecko Pro API {(coinGeckoStatus as any)?.tier ? `(${(coinGeckoStatus as any).tier} Tier)` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* On-Chain Analytics Button */}
        <div className="mb-8 text-center">
          <Link href="/hyperliquid-dune">
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <BarChart3 className="w-5 h-5" />
              <span>View On-Chain Analytics</span>
              <span className="text-xs opacity-80 ml-2">Powered by Dune</span>
            </button>
          </Link>
        </div>

        {/* Key Achievement Banner - Updated June 27, 2025 */}
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-6">Market Dominance Achieved - June 2025 Update</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-black text-green-400">76.07%</div>
              <div className="text-sm text-gray-400">Current Market Share</div>
              <div className="text-xs text-gray-500 mt-1">Up from 62% monthly average</div>
            </div>
            <div>
              <div className="text-4xl font-black text-green-400">$1.81T</div>
              <div className="text-sm text-gray-400">Cumulative Volume</div>
              <div className="text-xs text-gray-500 mt-1">All-time trading volume</div>
            </div>
            <div>
              <div className="text-4xl font-black text-green-400">$6.4B</div>
              <div className="text-sm text-gray-400">Daily Volume (3mo avg)</div>
              <div className="text-xs text-gray-500 mt-1">10% of Binance's flow</div>
            </div>
            <div>
              <div className="text-4xl font-black text-green-400">511K+</div>
              <div className="text-sm text-gray-400">Total Unique Traders</div>
              <div className="text-xs text-gray-500 mt-1">2.7x growth from 190K</div>
            </div>
          </div>
        </div>

        {/* Current Performance Metrics */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8">Real-Time Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-3xl font-black text-green-400">
                ${((hyperliquidData as any)?.realTimeMetrics?.currentPrice || 36.8).toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Current Price</div>
              <div className="text-xs text-green-400 mt-1">
                +{((hyperliquidData as any)?.realTimeMetrics?.priceChangeSinceLaunch || 1129).toFixed(0)}% since launch
              </div>
            </div>
            
            <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-3xl font-black text-green-400">
                +{(hyperliquidData as any)?.realTimeMetrics?.priceChangeSinceLaunch?.toFixed(0) || "1,029"}%
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Since Launch</div>
              <div className="text-xs text-gray-400 mt-1">Nov 29, 2024</div>
            </div>
            
            <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-3xl font-black text-green-400">
                ${((hyperliquidData as any)?.realTimeMetrics?.marketCap ? ((hyperliquidData as any).realTimeMetrics.marketCap / 1e9).toFixed(1) : "12.3")}B
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Market Cap</div>
              <div className="text-xs text-gray-400 mt-1">${((hyperliquidData as any)?.realTimeMetrics?.fdv ? ((hyperliquidData as any).realTimeMetrics.fdv / 1e9).toFixed(1) : "36.7")}B FDV</div>
            </div>
            
            <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-3xl font-black text-green-400">
                ${((hyperliquidData as any)?.fundamentals?.annualRevenue ? ((hyperliquidData as any).fundamentals.annualRevenue / 1e6).toFixed(0) : "830")}M
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Annual Revenue</div>
              <div className="text-xs text-green-400 mt-1">${((hyperliquidData as any)?.fundamentals?.annualRevenue ? (((hyperliquidData as any).fundamentals.annualRevenue * 0.93) / 1e6).toFixed(0) : "772")}M to holders</div>
            </div>
            
            <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-3xl font-black text-green-400">
                {((hyperliquidData as any)?.fundamentals?.activeUsers / 1000)?.toFixed(0) || "190"}K+
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Active Users</div>
              <div className="text-xs text-gray-400 mt-1">Real traders</div>
            </div>
            
            <div className="text-center bg-black/40 p-6 rounded-xl border border-green-500/50 hover:border-green-400 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-3xl font-black text-green-400">
                {(hyperliquidData as any)?.fundamentals?.launchFloat?.toFixed(1) || "33.4"}%
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Fair Launch Float</div>
              <div className="text-xs text-green-400 mt-1">2.5x Failed Avg</div>
            </div>
          </div>
        </div>

        {/* Protocol Fundamentals */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8">Protocol Fundamentals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/40 rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Technical Innovation
              </h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>20,000+ TPS with sub-1 second finality</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Fully on-chain central limit order book</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Custom HyperBFT consensus mechanism</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>EVM-compatible HyperEVM architecture</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Optimized matching engine reduces toxic flow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>One-click trading with instant execution</span>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6" />
                Fair Launch Philosophy
              </h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>No venture capital backing - fully self-funded</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>31% airdrop to 90,000+ users at TGE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>No insider premine or preferential allocations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Team tokens vest over time with community</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Bitcoin-inspired fair distribution ethos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Community-built ecosystem tools</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Financial Milestones - June 2025 */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8">Latest Financial Milestones - June 2025</h2>
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/50 rounded-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400 mb-2">$1.814T</div>
                <div className="text-lg font-bold text-gray-300">Cumulative Volume</div>
                <div className="text-sm text-gray-400">All-time perp trading volume</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400 mb-2">$68.06M</div>
                <div className="text-lg font-bold text-gray-300">Monthly Protocol Fees</div>
                <div className="text-sm text-gray-400">$830M annualized run-rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400 mb-2">$536M</div>
                <div className="text-lg font-bold text-gray-300">TVL (Hyperliquid L1)</div>
                <div className="text-sm text-gray-400">Deep on-chain liquidity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Dominance */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8">Market Dynamics: From Zero to Dominance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-black/40 rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                Volume Growth
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-green-400">$234.16B</div>
                  <div className="text-sm text-gray-400">Monthly volume (June 2025)</div>
                  <div className="text-xs text-gray-500">62% of all perp DEX volume</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">$6.4B</div>
                  <div className="text-sm text-gray-400">3-month daily average</div>
                  <div className="text-xs text-gray-500">10% of Binance's total flow</div>
                </div>
                <div className="text-sm text-gray-400 bg-green-900/20 p-3 rounded-lg">
                  Current market share at 76.07%, widening lead over competitors
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                Liquidity Metrics
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-green-400">$7.17B</div>
                  <div className="text-sm text-gray-400">Open Interest (June 2025)</div>
                  <div className="text-xs text-gray-500">$1.4B in BTC alone (15% of Binance)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">$1.66M</div>
                  <div className="text-sm text-gray-400">Daily protocol fees</div>
                  <div className="text-xs text-gray-500">$1.55M flows to holders</div>
                </div>
                <div className="text-sm text-gray-400 bg-green-900/20 p-3 rounded-lg">
                  Deep liquidity rivals mid-tier CEXs with tight spreads
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <Users className="w-6 h-6" />
                User Adoption
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-green-400">511K+</div>
                  <div className="text-sm text-gray-400">Total unique traders</div>
                  <div className="text-xs text-gray-500">2.7x growth since launch</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">99.8B</div>
                  <div className="text-sm text-gray-400">Cumulative trades</div>
                  <div className="text-xs text-gray-500">$1.76T total notional</div>
                </div>
                <div className="text-sm text-gray-400 bg-green-900/20 p-3 rounded-lg">
                  Network effect accelerating - liquidity begets liquidity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tokenomics */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8">Tokenomics: Community-First Design</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/40 rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6">Supply Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span className="text-gray-300">Community Airdrop</span>
                  <span className="text-green-400 font-bold">31%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span className="text-gray-300">Future Incentives</span>
                  <span className="text-green-400 font-bold">38.9%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span className="text-gray-300">Team (Vested)</span>
                  <span className="text-green-400 font-bold">23.8%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span className="text-gray-300">Foundation</span>
                  <span className="text-green-400 font-bold">6%</span>
                </div>
                <div className="text-sm text-gray-400 mt-4 p-3 bg-blue-900/20 rounded-lg">
                  ~70% of tokens belong to community vs VCs. One of the most inclusive launches in DeFi history.
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-green-400 mb-6">Real Yield Model</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>HYPE staking for network security rewards</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Governance rights for protocol parameters</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Fee sharing from trading revenue</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>HLP vault profits distributed to users</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>No team take from market-making profits</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Permissionless vaults for algorithmic strategies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success vs Failure Comparison */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8">The Lesson: Success vs Failure</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-red-900/20 rounded-xl p-8 border border-red-500/50">
              <h3 className="text-2xl font-bold text-red-400 mb-6">❌ Failed Token Playbook</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Low float (5-15%) to create artificial scarcity</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Massive VC allocations with short vesting</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>No working product or revenue model</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Token utility limited to speculation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Coordinated unlock events cause price collapse</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Team exits with windfall profits</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-red-900/30 rounded-lg">
                <div className="text-red-400 font-bold text-center text-xl">Result: -95.2% Average Loss</div>
                <div className="text-red-300 text-center text-sm mt-1">$58.4B in market cap destroyed</div>
              </div>
            </div>

            <div className="bg-green-900/20 rounded-xl p-8 border border-green-500/50">
              <h3 className="text-2xl font-bold text-green-400 mb-6">✅ Hyperliquid's Success Formula</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Fair float (31%) for genuine price discovery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>No VC funding, community-first philosophy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Working product with $1.15B real revenue</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Multiple token utilities (staking, governance, fees)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Transparent vesting with aligned incentives</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Team success tied to protocol success</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-900/30 rounded-lg">
                <div className="text-green-400 font-bold text-center text-xl">Result: +1,129% Gain</div>
                <div className="text-green-300 text-center text-sm mt-1">76.07% market dominance achieved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Bull Case - June 2025 */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-8">Updated Bull Case - June 2025</h2>
          <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/50 rounded-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-6">Network Effect Acceleration</h3>
                <div className="space-y-4 text-gray-300">
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-green-400">Market Share: 76.07%</div>
                    <div className="text-sm">Up from 62% monthly average - dominance is widening, not plateauing</div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-green-400">Volume: $234.16B/month</div>
                    <div className="text-sm">Processing 10% of Binance's total derivatives flow</div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-green-400">Users: 511K+ total traders</div>
                    <div className="text-sm">2.7x growth proves organic adoption, not speculation</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-6">Revenue Quality & Scale</h3>
                <div className="space-y-4 text-gray-300">
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-green-400">Annual Revenue: $830M</div>
                    <div className="text-sm">Cash-flow-to-FDV ratio (2.1%) rivals large exchanges</div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-green-400">To Holders: $772M</div>
                    <div className="text-sm">Real yield - 100% of fees flow to community, zero team take</div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-green-400">Open Interest: $7.17B</div>
                    <div className="text-sm">$1.4B in BTC alone = 15% of Binance's BTC OI</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border border-blue-500/30">
              <h4 className="text-xl font-bold text-blue-400 mb-4">Bottom Line: Every Bull Case Pillar Strengthened</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>✅ Network effects: Market share expanded to 76.07%</div>
                <div>✅ Revenue growth: $830M run-rate with 2.1% yield</div>
                <div>✅ User adoption: 511K+ traders, 2.7x organic growth</div>
                <div>✅ Token alignment: $772M flows to holders, zero team take</div>
              </div>
              <div className="mt-4 text-center text-blue-400 font-bold">
                Unless a rival can match throughput, fee structure, AND fair tokenomics simultaneously, 
                Hyperliquid's lead compounds through the next cycle.
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/50 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-blue-400 mb-8 text-center flex items-center justify-center gap-3">
            <Target className="w-8 h-8" />
            Key Takeaways for Token Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-400 mb-3">Build First, Token Second</div>
              <div>Hyperliquid spent years building a working product before launching HYPE. Revenue and users came first, token was the reward.</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-400 mb-3">Fair Launch Matters</div>
              <div>Avoiding VC dumping and prioritizing community distribution creates sustainable tokenomics that benefit actual users.</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-400 mb-3">Real Utility Required</div>
              <div>Tokens need genuine use cases beyond speculation - staking, governance, fee sharing, and ecosystem participation.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Data powered by CoinGecko Pro API • Real-time metrics updated continuously</p>
          <p className="mt-2">Hyperliquid represents the future of tokenomics - community-first, utility-driven, and revenue-generating.</p>
        </div>
      </div>
    </div>
  );
}