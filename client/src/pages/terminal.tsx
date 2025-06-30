import { useState } from 'react';
import { Link } from 'wouter';
import { 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  LineChart, 
  Calculator,
  Rocket,
  Activity,
  AlertTriangle,
  ChevronRight,
  Globe,
  Twitter,
  Github
} from 'lucide-react';

const tabs = [
  { 
    id: 'overview', 
    name: 'Overview', 
    icon: BarChart3,
    description: 'Market analytics and key metrics',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'failures', 
    name: 'Failed Tokens', 
    icon: TrendingDown,
    description: 'Analysis of low float/high FDV failures',
    color: 'from-red-500 to-orange-500'
  },
  { 
    id: 'revenue', 
    name: 'Revenue Analysis', 
    icon: DollarSign,
    description: 'DeFi protocol revenue metrics',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'hyperliquid', 
    name: 'Hyperliquid', 
    icon: Activity,
    description: 'Deep dive into HYPE success',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'simulations', 
    name: 'Monte Carlo', 
    icon: Calculator,
    description: 'Statistical price predictions',
    color: 'from-yellow-500 to-amber-500'
  },
  { 
    id: 'projects', 
    name: 'Projects', 
    icon: Rocket,
    description: 'Interesting upcoming projects',
    color: 'from-indigo-500 to-purple-500'
  }
];

export default function Terminal() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_40%,transparent_100%)]"></div>
      
      {/* Professional Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-2xl shadow-black/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">Token Terminal</h1>
              </div>
              <div className="hidden md:block text-sm text-gray-400">
                Professional Crypto Analytics Platform
              </div>
            </div>

            {/* Creator Attribution */}
            <div className="flex items-center gap-4">
              <a 
                href="https://x.com/0xMorpheusXBT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                <Twitter className="w-4 h-4" />
                <span className="hidden sm:inline">@0xMorpheusXBT</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide relative">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 transition-all duration-300 whitespace-nowrap group ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {/* Active Tab Indicator */}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b-2 border-blue-500"></div>
                )}
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
                <span className="font-medium relative z-10">{tab.name}</span>
                
                {/* Tab Glow Effect */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'failures' && <FailuresContent />}
        {activeTab === 'revenue' && <RevenueContent />}
        {activeTab === 'hyperliquid' && <HyperliquidContent />}
        {activeTab === 'simulations' && <SimulationsContent />}
        {activeTab === 'projects' && <ProjectsContent />}
      </div>

      {/* Professional Footer */}
      <footer className="mt-20 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              © 2025 Token Terminal - Professional Crypto Analytics
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-400">Built by</span>
              <a 
                href="https://x.com/0xMorpheusXBT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                @0xMorpheusXBT
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Overview Tab Content
function OverviewContent() {
  const metrics = [
    { label: 'Total Market Cap Lost', value: '$58.4B', change: '-95.2%', color: 'text-red-400', trend: 'down' },
    { label: 'Failed Tokens Tracked', value: '156', change: '+12', color: 'text-orange-400', trend: 'up' },
    { label: 'Average Loss from ATH', value: '93.7%', change: '-2.1%', color: 'text-red-400', trend: 'down' },
    { label: 'Active DeFi Protocols', value: '47', change: '+3', color: 'text-green-400', trend: 'up' }
  ];

  const marketStatus = [
    { metric: 'Fear & Greed Index', value: '42', status: 'Fear', color: 'text-orange-400' },
    { metric: 'Unlock Pressure', value: 'High', status: '$2.8B/week', color: 'text-red-400' },
    { metric: 'DeFi TVL', value: '$48.2B', status: '+5.2%', color: 'text-green-400' },
    { metric: 'BTC Dominance', value: '52.4%', status: '-1.2%', color: 'text-yellow-400' }
  ];

  return (
    <div className="space-y-8">
      {/* Market Status Bar */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketStatus.map((item) => (
            <div key={item.metric} className="flex items-center justify-between">
              <div className="text-xs text-gray-400">{item.metric}</div>
              <div className="text-right">
                <div className={`font-semibold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-500">{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-8 border border-gray-800 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Token Terminal Analytics
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl">
            Professional-grade analytics platform for understanding token failures and DeFi protocol performance. 
            Track real-time metrics, analyze failure patterns, and discover successful protocols.
          </p>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  {metric.trend === 'up' ? (
                    <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-green-400 rotate-[-90deg]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-red-400 rotate-[90deg]" />
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold mb-1 group-hover:text-blue-400 transition-colors">{metric.value}</div>
                <div className={`text-sm font-medium ${metric.color}`}>{metric.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {tabs.slice(1).map((tab, index) => (
          <Link
            key={tab.id}
            href={tab.id === 'failures' ? '/failure-analysis' : 
                  tab.id === 'revenue' ? '/revenue-analysis' :
                  tab.id === 'hyperliquid' ? '/hyperliquid' :
                  tab.id === 'simulations' ? '/monte-carlo' :
                  tab.id === 'projects' ? '/rainmaker' : '/'}
            className="group relative bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-[1.02] overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Card Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/0 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              {/* Icon with Glow Effect */}
              <div className="relative mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tab.color} p-2.5 group-hover:shadow-lg transition-shadow duration-300`}>
                  <tab.icon className="w-full h-full text-white" />
                </div>
                <div className={`absolute inset-0 w-12 h-12 rounded-lg bg-gradient-to-br ${tab.color} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                {tab.name}
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">{tab.description}</p>
              
              {/* Action Button */}
              <div className="flex items-center gap-2 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300">
                <span className="text-sm font-medium">Explore</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Failures Tab Content
function FailuresContent() {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-4">Failed Token Analysis</h2>
      <p className="text-gray-300 mb-6">
        Comprehensive analysis of tokens that have lost over 90% from their all-time highs, 
        focusing on the low float/high FDV tokenomics model failures.
      </p>
      <Link
        href="/failure-analysis"
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
      >
        <span>View Full Analysis</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Revenue Tab Content
function RevenueContent() {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-4">DeFi Revenue Analysis</h2>
      <p className="text-gray-300 mb-6">
        Track and compare revenue metrics across major DeFi protocols. 
        Analyze P/E ratios, growth rates, and market share dynamics.
      </p>
      <Link
        href="/revenue-analysis"
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
      >
        <span>View Revenue Metrics</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Hyperliquid Tab Content
function HyperliquidContent() {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-4">Hyperliquid Success Story</h2>
      <p className="text-gray-300 mb-6">
        Deep dive into how Hyperliquid achieved 76% perpetuals market share and 
        generated $830M in annual revenue through superior tokenomics.
      </p>
      <Link
        href="/hyperliquid"
        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
      >
        <span>Explore HYPE Analysis</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Simulations Tab Content
function SimulationsContent() {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-4">Monte Carlo Simulations</h2>
      <p className="text-gray-300 mb-6">
        Advanced statistical modeling using Geometric Brownian Motion to predict 
        price movements and analyze risk scenarios.
      </p>
      <Link
        href="/monte-carlo"
        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
      >
        <span>Run Simulations</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Projects Tab Content
function ProjectsContent() {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-4">Interesting Projects</h2>
      <p className="text-gray-300 mb-6">
        Discover upcoming projects with innovative tokenomics and strong fundamentals. 
        Currently featuring Raiinmaker's AI infrastructure revolution.
      </p>
      <Link
        href="/rainmaker"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
      >
        <span>Explore Projects</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}