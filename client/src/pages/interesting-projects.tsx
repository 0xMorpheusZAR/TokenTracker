import { useState, useEffect } from "react";
import { 
  ArrowLeft, Video, Database, Cpu, Shield, Users, TrendingUp, Globe, Zap, Award, CheckCircle2, ExternalLink,
  ChevronDown, Home, Wallet, CreditCard, Building, Blocks, FileCode2, Network, Scale, Coins, Building2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Line, Bar } from "react-chartjs-2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { projectsData, type ProjectData } from '@/lib/interesting-projects-data';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const iconMap: Record<string, any> = {
  Network, Shield, Video, Scale, Cpu, Coins, Building2, Users,
  Blocks, Home, FileCode2, TrendingUp, Wallet, CreditCard, Building
};

export default function InterestingProjects() {
  const [activeTab, setActiveTab] = useState<'overview' | 'technology' | 'tokenomics'>('overview');
  const [selectedProject, setSelectedProject] = useState<string>('raiinmaker');
  const [, navigate] = useLocation();
  
  const project = projectsData[selectedProject];
  
  // Query for live token price if project has a symbol
  const { data: tokenData } = useQuery({
    queryKey: ['/api/coingecko/price', project.symbol],
    queryFn: async () => {
      if (project.symbol === 'ESX') {
        const response = await fetch(`/api/coingecko/details/estatex`);
        if (!response.ok) return null;
        const data = await response.json();
        return {
          current_price: data?.market_data?.current_price?.usd,
          price_change_percentage_24h: data?.market_data?.price_change_percentage_24h,
          market_cap: data?.market_data?.market_cap?.usd
        };
      }
      return null;
    },
    enabled: project.symbol === 'ESX',
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mock data for market growth
  const marketData = {
    labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
    datasets: [{
      label: `Market Size (${project.symbol === 'RAIN' ? 'AI Video Gen' : 'Tokenized RE'}) in Billions USD`,
      data: project.symbol === 'RAIN' 
        ? [2.1, 4.8, 11.2, 26.5, 58.3, 124.7, 231.5]
        : [0.5, 2.1, 8.4, 25.2, 67.8, 145.3, 287.9],
      borderColor: 'rgba(147, 51, 234, 1)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgba(147, 51, 234, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/interactive">
                <a className="text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </a>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 font-semibold">Interesting Projects</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Project Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-purple-500/20">
                  <span className="text-white font-medium">{project.name}</span>
                  <ChevronDown className="w-4 h-4 text-purple-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                  {Object.entries(projectsData).map(([key, proj]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setSelectedProject(key)}
                      className="flex items-center justify-between cursor-pointer hover:bg-slate-800"
                    >
                      <span className="text-white">{proj.name}</span>
                      <span className="text-xs text-purple-400 ml-2">{proj.symbol}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <span className="text-xs text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-purple-900/5 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Video className="w-6 h-6 text-purple-400" />
              <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm">Next-Gen Infrastructure</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 mb-4 leading-tight tracking-tight">
              {project.name}: {project.tagline}
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-4">
              {project.description}
            </p>
            
            {/* TGE Event Banner / Token Price */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-500/30 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                {tokenData && project.symbol === 'ESX' ? (
                  <div className="flex items-center gap-6">
                    <span className="text-white font-semibold">${project.symbol} Price: ${tokenData.current_price?.toFixed(4)}</span>
                    <span className={`text-sm font-medium ${tokenData.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tokenData.price_change_percentage_24h > 0 ? '+' : ''}{tokenData.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                    <span className="text-sm text-slate-400">MCap: ${(tokenData.market_cap / 1e6).toFixed(1)}M</span>
                  </div>
                ) : (
                  <span className="text-white font-semibold">{project.tgeStatus}</span>
                )}
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
            </div>
            
            {/* Official Links */}
            <div className="flex justify-center gap-4 mb-8">
              <a 
                href={project.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg font-medium hover:bg-purple-600/30 transition-colors flex items-center gap-2 border border-purple-500/30"
              >
                <Globe className="w-4 h-4" />
                Official Website
              </a>
              <a 
                href={project.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg font-medium hover:bg-purple-600/30 transition-colors flex items-center gap-2 border border-purple-500/30"
              >
                <Users className="w-4 h-4" />
                Twitter/X
              </a>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{project.keyMetric1.value}</div>
                <div className="text-xs text-slate-400">{project.keyMetric1.label}</div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{project.keyMetric2.value}</div>
                <div className="text-xs text-slate-400">{project.keyMetric2.label}</div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{project.keyMetric3.value}</div>
                <div className="text-xs text-slate-400">{project.keyMetric3.label}</div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{project.keyMetric4.value}</div>
                <div className="text-xs text-slate-400">{project.keyMetric4.label}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('technology')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'technology'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Technology
          </button>
          <button
            onClick={() => setActiveTab('tokenomics')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'tokenomics'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {project.tokenomics.title}
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 mb-16">
            {/* Overview Content */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-purple-400" />
                {project.overview.title}
              </h2>
              <div className="space-y-4">
                {project.overview.content.map((paragraph, index) => (
                  <p key={index} className="text-lg text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Market Opportunity */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                Market Opportunity
              </h2>
              <div className="h-[400px]">
                <Line data={marketData} options={chartOptions} />
              </div>
              <p className="text-center text-slate-400 mt-4">
                Total Addressable Market: <span className="text-purple-400 font-bold">{project.marketSize}</span> by 2030
              </p>
            </div>
          </div>
        )}

        {activeTab === 'technology' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {project.technology.items.map((item, index) => {
              const Icon = iconMap[item.icon || 'Shield'];
              return (
                <div key={index} className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'tokenomics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {project.tokenomics.items.map((item, index) => {
              const Icon = iconMap[item.icon || 'Coins'];
              return (
                <div key={index} className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-600/20 p-3 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-300">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-800/50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-slate-400">
              Analysis by{' '}
              <a 
                href="https://x.com/0xMorpheusXBT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                @0xMorpheusXBT
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}