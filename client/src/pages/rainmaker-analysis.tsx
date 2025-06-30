import { useState } from "react";
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

export default function RainmakerAnalysis() {
  const [activeTab, setActiveTab] = useState<'overview' | 'technology' | 'tokenomics'>('overview');
  const [selectedProject, setSelectedProject] = useState<string>('raiinmaker');
  const [, navigate] = useLocation();
  
  const project = projectsData[selectedProject];
  
  // Query for live token price if project has a symbol
  const { data: tokenData } = useQuery({
    queryKey: ['/api/coingecko/price', project.symbol],
    queryFn: async () => {
      if (project.symbol === 'ESX') {
        const response = await fetch(`/api/coingecko/detailed?symbols=estatex`);
        if (!response.ok) return null;
        const data = await response.json();
        return data?.[0];
      }
      return null;
    },
    enabled: project.symbol === 'ESX',
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mock data for AI video market size
  const marketData = {
    labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
    datasets: [{
      label: 'AI Video Generation Market Size (Billions USD)',
      data: [2.1, 4.8, 11.2, 26.5, 58.3, 124.7, 231.5],
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

  const competitorData = {
    labels: ['Raiinmaker', 'Sora', 'Runway', 'Pika', 'Stable Video'],
    datasets: [{
      label: 'Data Quality Score',
      data: [95, 72, 68, 65, 61],
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(59, 130, 246, 0.6)',
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(59, 130, 246, 1)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
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
              <Link href="/">
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Video className="w-6 h-6 text-purple-400" />
              <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm">Next-Gen AI Infrastructure</span>
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
        <div className="flex justify-center gap-2 mb-8">
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
            Network & Token
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 mb-16">
            {/* Problem Statement */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-purple-400" />
                The Cinematic Data Gap
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Current AI Video Limitations</h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                      <span>Models like Sora struggle with <strong className="text-white">realistic motion and physics</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                      <span>Training on <strong className="text-white">low-grade scraped data</strong> limits quality</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                      <span>Lack of <strong className="text-white">metadata-rich footage</strong> prevents cinematic output</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                      <span>No <strong className="text-white">frame-to-frame consistency</strong> for professional use</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Raiinmaker's Solution</h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Crowdsources <strong className="text-white">Hollywood-quality footage</strong> from community</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Provides <strong className="text-white">rich metadata</strong> for superior training</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Ensures <strong className="text-white">human validation</strong> for quality control</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Builds <strong className="text-white">ethical AI infrastructure</strong> with full traceability</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                <p className="text-sm text-slate-300 italic">
                  "Cinematic video is the final boss of generative AI" - As noted by OpenAI's head of security Lilian Weng
                </p>
              </div>
            </div>

            {/* Market Opportunity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  Market Growth Trajectory
                </h3>
                <div className="h-64">
                  <Line data={marketData} options={chartOptions} />
                </div>
                <div className="mt-4 text-sm text-slate-400">
                  AI video generation market projected to reach $231.5B by 2030
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-purple-400" />
                  Data Quality Comparison
                </h3>
                <div className="h-64">
                  <Bar data={competitorData} options={chartOptions} />
                </div>
                <div className="mt-4 text-sm text-slate-400">
                  Raiinmaker leads with 95/100 data quality score vs competitors
                </div>
              </div>
            </div>

            {/* Credibility Section */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-400" />
                World-Class Team & Backing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Leadership</h3>
                  <div className="space-y-4">
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-bold text-white">J.D. Seraphine</div>
                      <div className="text-sm text-slate-400">Founder & CEO</div>
                      <div className="text-sm text-slate-300 mt-2">
                        Hollywood producer of "Hesher" starring Natalie Portman
                      </div>
                      <a href="https://www.imdb.com/name/nm5333905/" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2">
                        View IMDB Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Strategic Advisors</h3>
                  <div className="space-y-4">
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-bold text-white">Nolan Bushnell</div>
                      <div className="text-sm text-slate-400">Board Advisor</div>
                      <div className="text-sm text-slate-300 mt-2">
                        Founder of Atari, Pioneer of video game industry
                      </div>
                      <a href="https://en.wikipedia.org/wiki/Nolan_Bushnell" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2">
                        Learn More <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technology' && (
          <div className="space-y-8 mb-16">
            {/* TRAIIN VIDEO Platform */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Video className="w-8 h-8 text-purple-400" />
                TRAIIN VIDEO Platform
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-black/20 p-6 rounded-xl">
                  <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Data Collection</h3>
                  <p className="text-sm text-slate-300">
                    Community members upload high-quality video footage with rich metadata for AI training
                  </p>
                </div>
                <div className="bg-black/20 p-6 rounded-xl">
                  <Shield className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Human Validation</h3>
                  <p className="text-sm text-slate-300">
                    Every contribution is validated by humans and recorded on-chain for transparency
                  </p>
                </div>
                <div className="bg-black/20 p-6 rounded-xl">
                  <Award className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Reward Distribution</h3>
                  <p className="text-sm text-slate-300">
                    Contributors earn RAIN tokens for providing data, validating content, and running nodes
                  </p>
                </div>
              </div>
            </div>

            {/* Infrastructure Partners */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-purple-400" />
                Infrastructure & Partnerships
              </h2>
              <div className="space-y-6">
                <div className="bg-black/20 p-6 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-purple-400 mb-2">Aethir Partnership</h3>
                      <p className="text-slate-300 mb-4">
                        Strategic partnership with Aethir, one of the largest decentralized GPU compute networks, 
                        providing the computational power needed for cinematic AI video generation.
                      </p>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Decentralized GPU infrastructure
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Scalable compute for AI training
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Cost-effective processing power
                        </li>
                      </ul>
                    </div>
                    <a href="https://www.raiinmaker.com/thecitiizen/b61173f0-d0fa-4bd3-82d5-61ff8a7a233f" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Ethical AI Framework */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="w-8 h-8 text-purple-400" />
                Ethical AI Infrastructure
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Transparency Features</h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Full on-chain traceability of data sources</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Transparent reward distribution system</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Community governance over data usage</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Data Rights Protection</h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Contributors retain ownership rights</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Fair compensation for data usage</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <span>Opt-in participation model</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tokenomics' && (
          <div className="space-y-8 mb-16">
            {/* Network Participants */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                Decentralized Network Participants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-500/20">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">Data Contributors</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Upload high-quality video footage</li>
                    <li>• Provide metadata and annotations</li>
                    <li>• Earn RAIN tokens per contribution</li>
                    <li>• Build reputation in the network</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/20">
                  <h3 className="text-lg font-bold text-blue-400 mb-3">Validators</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Verify data quality and authenticity</li>
                    <li>• Run validator nodes</li>
                    <li>• Earn rewards for accurate validation</li>
                    <li>• Maintain network integrity</li>
                  </ul>
                </div>
                <div className="bg-green-900/20 p-6 rounded-xl border border-green-500/20">
                  <h3 className="text-lg font-bold text-green-400 mb-3">AI Developers</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Access premium training data</li>
                    <li>• Build next-gen AI models</li>
                    <li>• Pay in RAIN tokens for data</li>
                    <li>• Contribute to ecosystem growth</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Token Utility */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-purple-400" />
                RAIN Token Utility
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Core Utilities</h3>
                  <div className="space-y-3">
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-semibold text-white mb-1">Data Marketplace Currency</div>
                      <div className="text-sm text-slate-300">Primary medium of exchange for video data transactions</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-semibold text-white mb-1">Staking & Governance</div>
                      <div className="text-sm text-slate-300">Stake tokens to participate in network governance</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-semibold text-white mb-1">Node Operations</div>
                      <div className="text-sm text-slate-300">Required for running validator and storage nodes</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">Value Accrual</h3>
                  <div className="space-y-3">
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-semibold text-white mb-1">Network Growth</div>
                      <div className="text-sm text-slate-300">Token value increases with data quality and volume</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-semibold text-white mb-1">AI Model Success</div>
                      <div className="text-sm text-slate-300">Demand rises as AI models achieve better results</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg">
                      <div className="font-semibold text-white mb-1">Ecosystem Expansion</div>
                      <div className="text-sm text-slate-300">New use cases drive additional token utility</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Thesis */}
            <div className="bg-gradient-to-br from-purple-900/20 to-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-6">Investment Thesis</h2>
              <div className="space-y-4 text-slate-300">
                <p className="text-lg">
                  Raiinmaker represents a <span className="text-purple-400 font-semibold">fundamental infrastructure play</span> in the AI video generation market, 
                  addressing the critical data quality gap that limits current models.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-xl font-semibold text-green-400 mb-3">Bull Case</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                        <span>First-mover advantage in cinematic AI data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                        <span>Hollywood connections ensure premium content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                        <span>Massive TAM with 110x growth by 2030</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                        <span>Ethical AI narrative gaining traction</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-red-400 mb-3">Risk Factors</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                        <span>Competition from tech giants (OpenAI, Google)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                        <span>Regulatory uncertainty around AI data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                        <span>Network effects take time to materialize</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                        <span>Token economics still being proven</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join the Cinematic AI Revolution</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Be part of building the ethical infrastructure that will power Hollywood-quality AI video generation
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://x.com/Raiinmakerapp/status/1935367996597485617"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              View Project Update <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://www.raiinmaker.com/thecitiizen/884f18dd-8b09-438e-a0b2-66bc010726e3"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              Read Technical Blog <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}