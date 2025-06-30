import { useState } from "react";
import { ArrowLeft, Video, Database, Cpu, Shield, Users, TrendingUp, Globe, Zap, Award, CheckCircle2, ExternalLink, Home, Coins, Building, CreditCard, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Line, Bar } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface EstateXLiveData {
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
  fullyDilutedValuation: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  ath: number;
  athDate: string;
  athChangePercentage: number;
  atl: number;
  atlDate: string;
  tgeData: {
    launchDate: string;
    launchPrice: number;
    initialMarketCap: number;
    initialCirculatingSupply: number;
    percentageFromTGE: number;
  };
}

export default function InterestingProjects() {
  const [activeTab, setActiveTab] = useState<'overview' | 'technology' | 'tokenomics'>('overview');
  const [selectedProject, setSelectedProject] = useState<'raiinmaker' | 'estatex'>('raiinmaker');

  // Fetch EstateX live data from CoinGecko Pro
  const { data: estatexLiveData } = useQuery<EstateXLiveData>({
    queryKey: ['/api/estatex/live'],
    enabled: selectedProject === 'estatex',
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Project configurations
  const projects = {
    raiinmaker: {
      name: "Raiinmaker",
      subtitle: "The Cinematic AI Revolution",
      description: "Solving the Hollywood-quality data gap in AI video generation through decentralized crowdsourcing and ethical infrastructure",
      icon: Video,
      color: {
        primary: "purple",
        gradient: "from-purple-400 via-pink-400 to-purple-500",
        bgGradient: "from-purple-600/20 to-pink-600/20",
        borderColor: "border-purple-500/20",
        textAccent: "text-purple-400",
        bgAccent: "bg-purple-600/20",
        hoverBg: "hover:bg-purple-600/30"
      },
      metrics: [
        { label: "2030 Market Size", value: "$231.5B" },
        { label: "Data Quality Score", value: "95/100" },
        { label: "Video Platform", value: "TRAIIN" },
        { label: "GPU Partner", value: "Aethir" }
      ],
      tge: "Token Generation Event: TBA",
      links: [
        { label: "Official Website", url: "https://www.raiinmaker.com/", icon: Globe },
        { label: "@raiinmakerapp", url: "https://x.com/raiinmakerapp", icon: Users }
      ]
    },
    estatex: {
      name: "EstateX",
      subtitle: "Democratizing Real Estate Investment",
      description: "Making property investing simple, affordable, and accessible through blockchain tokenization and fractional ownership",
      icon: Building,
      color: {
        primary: "blue",
        gradient: "from-blue-400 via-teal-400 to-green-400",
        bgGradient: "from-blue-600/20 to-green-600/20",
        borderColor: "border-blue-500/20",
        textAccent: "text-blue-400",
        bgAccent: "bg-blue-600/20",
        hoverBg: "hover:bg-blue-600/30"
      },
      metrics: [
        { label: "Min Investment", value: "$100" },
        { label: "Market Size", value: "$300T" },
        { label: "TGE Price", value: "$0.00295" },
        { label: "License", value: "BaFin" }
      ],
      tge: "Token Generation Event: June 20, 2025 • Launch Price: $0.00295 • Initial Market Cap: $350K",
      links: [
        { label: "Official Website", url: "https://www.estatex.com/", icon: Globe },
        { label: "@EstateX_", url: "https://x.com/EstateX_", icon: Users }
      ]
    }
  };

  const currentProject = projects[selectedProject];

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Update EstateX metrics with live data if available
  if (selectedProject === 'estatex' && estatexLiveData) {
    projects.estatex.metrics = [
      { label: "Current Price", value: `$${estatexLiveData.currentPrice?.toFixed(6) || '0.00'}` },
      { label: "Circulating Market Cap", value: formatNumber(estatexLiveData.marketCap || 0) },
      { label: "Fully Diluted Valuation", value: formatNumber(estatexLiveData.fullyDilutedValuation || 0) },
      { label: "24h Change", value: `${estatexLiveData.priceChange24h?.toFixed(2) || '0'}%` }
    ];
  }

  // Chart data for Raiinmaker
  const raiinmakerMarketData = {
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

  const raiinmakerCompetitorData = {
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

  // Chart data for EstateX
  const estatexMarketData = {
    labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'],
    datasets: [{
      label: 'Token Price Performance (USD)',
      data: [0.00295, 0.0045, 0.018, 0.025, 0.034],
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  const estatexCompetitorData = {
    labels: ['EstateX', 'RealT', 'Lofty', 'Vairt', 'Traditional REIT'],
    datasets: [{
      label: 'Platform Features Score',
      data: [92, 78, 75, 72, 60],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(16, 185, 129, 0.6)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  // Select chart data based on project
  const marketData = selectedProject === 'raiinmaker' ? raiinmakerMarketData : estatexMarketData;
  const competitorData = selectedProject === 'raiinmaker' ? raiinmakerCompetitorData : estatexCompetitorData;

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

  // Content for Raiinmaker
  const raiinmakerContent = {
    overview: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-4">The Hollywood Data Problem</h3>
          <p className="text-slate-300 leading-relaxed mb-6">
            Current AI video models like OpenAI's Sora face a critical challenge: they lack access to professional-grade video data. While trained on billions of internet videos, they miss the cinematic quality that defines Hollywood productions - proper lighting, sound design, multiple camera angles, and professional direction.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-purple-500/10">
              <Award className="w-8 h-8 text-purple-400 mb-2" />
              <h4 className="font-semibold text-white mb-1">Professional Quality</h4>
              <p className="text-sm text-slate-400">Access to Hollywood-grade production data</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-purple-500/10">
              <Shield className="w-8 h-8 text-purple-400 mb-2" />
              <h4 className="font-semibold text-white mb-1">Ethical Sourcing</h4>
              <p className="text-sm text-slate-400">Creator-consented data with fair compensation</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-6">Market Opportunity</h3>
          <div className="h-80 mb-6">
            <Line data={marketData} options={chartOptions} />
          </div>
          <p className="text-slate-300 text-center">
            The AI video generation market is projected to reach <span className="text-purple-400 font-bold">$231.5B by 2030</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-6">Competitive Advantage</h3>
          <div className="h-80">
            <Bar data={competitorData} options={chartOptions} />
          </div>
        </div>
      </div>
    ),
    technology: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-6">Technical Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-10 h-10 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">TRAIIN Video Platform</h4>
              <p className="text-sm text-slate-400">Decentralized storage for cinematic-quality training data</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-10 h-10 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">GPU Infrastructure</h4>
              <p className="text-sm text-slate-400">Partnership with Aethir for distributed computing power</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Creator Network</h4>
              <p className="text-sm text-slate-400">Incentivized ecosystem for content creators</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-4">Data Quality Framework</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Multi-Angle Coverage</h4>
                <p className="text-sm text-slate-400">Professional shoots with 3+ camera angles per scene</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Metadata Richness</h4>
                <p className="text-sm text-slate-400">Detailed scene descriptions, lighting info, and technical specs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Legal Compliance</h4>
                <p className="text-sm text-slate-400">Full licensing and creator consent with revenue sharing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    tokenomics: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-6">Token Economics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-4">Utility & Governance</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Access to TRAIIN platform and premium features
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Payment for GPU compute resources
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Creator rewards and content licensing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  DAO governance participation
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Value Accrual</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Platform fee buyback mechanism
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Staking rewards from network revenue
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Deflationary burn from transaction fees
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  Early access to new AI models
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-purple-400 mb-4">Investment Highlights</h3>
          <div className="space-y-4">
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-semibold text-white mb-1">First-Mover Advantage</h4>
              <p className="text-sm text-slate-400">Only platform solving the cinematic data gap for AI video</p>
            </div>
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-semibold text-white mb-1">Strategic Partnerships</h4>
              <p className="text-sm text-slate-400">Aethir GPU infrastructure and major content creators onboard</p>
            </div>
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-semibold text-white mb-1">Massive TAM</h4>
              <p className="text-sm text-slate-400">$231.5B market by 2030 with 110% CAGR</p>
            </div>
          </div>
        </div>
      </div>
    )
  };

  // Content for EstateX
  const estatexContent = {
    overview: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">Democratizing Real Estate</h3>
          <p className="text-slate-300 leading-relaxed mb-6">
            EstateX breaks down traditional barriers to real estate investment by tokenizing properties and enabling fractional ownership from as little as $100. Built on blockchain technology, the platform provides instant liquidity, daily rental income, and transparent ownership records.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/10">
              <Home className="w-8 h-8 text-blue-400 mb-2" />
              <h4 className="font-semibold text-white mb-1">Fractional Ownership</h4>
              <p className="text-sm text-slate-400">Own a piece of real estate from $100</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/10">
              <DollarSign className="w-8 h-8 text-blue-400 mb-2" />
              <h4 className="font-semibold text-white mb-1">Daily Rental Income</h4>
              <p className="text-sm text-slate-400">Automated smart contract distributions</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-6">Price Performance</h3>
          <div className="h-80 mb-6">
            <Line data={marketData} options={chartOptions} />
          </div>
          <p className="text-slate-300 text-center">
            $ESX launched at <span className="text-blue-400 font-bold">$0.00295</span> and reached <span className="text-green-400 font-bold">$0.025</span> within two weeks (8-10x gain)
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-6">Platform Comparison</h3>
          <div className="h-80">
            <Bar data={competitorData} options={chartOptions} />
          </div>
        </div>
      </div>
    ),
    technology: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-6">EstateX Ecosystem</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">LaunchX</h4>
              <p className="text-xs text-slate-400">Initial Real Estate Offerings</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">PropXChange</h4>
              <p className="text-xs text-slate-400">24/7 Secondary Market</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">CapitalX</h4>
              <p className="text-xs text-slate-400">Instant Property Loans</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-1">EstateX Pay</h4>
              <p className="text-xs text-slate-400">Spend Your Earnings</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">Regulatory Compliance</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">BaFin Custody License</h4>
                <p className="text-sm text-slate-400">German Financial Supervisory Authority approved</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">EU Crowdfunding License</h4>
                <p className="text-sm text-slate-400">Luxembourg CSSF approved for EU-wide operations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">SEC & CSA Filings</h4>
                <p className="text-sm text-slate-400">Compliant with US and Canadian regulations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">EstateX Blockchain</h3>
          <p className="text-slate-300 mb-4">
            Building a dedicated Layer-1 blockchain optimized for Real World Assets (RWA), designed to handle compliance and high throughput for tokenized properties.
          </p>
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Testnet Launch</span>
              <span className="text-blue-400 font-semibold">Q2 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Mainnet Launch</span>
              <span className="text-blue-400 font-semibold">Q3 2025</span>
            </div>
          </div>
        </div>
      </div>
    ),
    tokenomics: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-6">Dual Token Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-blue-500/10">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-400" />
                $ESX Utility Token
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Platform transaction currency</li>
                <li>• Staking rewards (50%+ staked for 7+ years)</li>
                <li>• 20-35% platform revenue sharing</li>
                <li>• Governance rights</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-blue-500/10">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                PROPX Security Tokens
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Represents property ownership</li>
                <li>• Daily rental income in $ESX</li>
                <li>• Tradeable on PropXChange</li>
                <li>• Collateral for loans</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">Revenue Streams</h3>
          <div className="space-y-3">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-white mb-1">Primary Sales Fees</h4>
              <p className="text-sm text-slate-400">Commission on Initial Real Estate Offerings</p>
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-white mb-1">Trading Fees</h4>
              <p className="text-sm text-slate-400">Transaction fees on PropXChange marketplace</p>
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-white mb-1">Lending Interest</h4>
              <p className="text-sm text-slate-400">Revenue from CapitalX loan services</p>
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-white mb-1">TokenizeX B2B</h4>
              <p className="text-sm text-slate-400">Tokenization-as-a-Service for institutions</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-blue-400 mb-4">Key Achievements</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>First property sold out in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Highest-staked IEO of 2023 (75% average staking)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Featured in USA Today and 400+ publications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Backed by Brock Pierce (Tether co-founder)</span>
            </div>
          </div>
        </div>
      </div>
    )
  };

  const content = selectedProject === 'raiinmaker' ? raiinmakerContent : estatexContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 ${currentProject.color.bgAccent} rounded-full blur-3xl opacity-20 animate-float`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 ${currentProject.color.bgAccent} rounded-full blur-3xl opacity-20 animate-float-delayed`}></div>
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </a>
            </Link>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${currentProject.color.bgAccent} rounded-full animate-pulse`}></div>
              <span className={`${currentProject.color.textAccent} font-semibold`}>Interesting Projects</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className={`bg-gradient-to-br ${currentProject.color.bgGradient} backdrop-blur-md`}>
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="text-center space-y-6 relative">
              {/* Project Selector */}
              <div className="flex justify-center mb-8">
                <Select value={selectedProject} onValueChange={(value: 'raiinmaker' | 'estatex') => setSelectedProject(value)}>
                  <SelectTrigger className={`w-64 bg-slate-900/90 border ${currentProject.color.borderColor} ${currentProject.color.textAccent}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="raiinmaker" className="text-purple-400 hover:bg-purple-900/20">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>Raiinmaker</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="estatex" className="text-blue-400 hover:bg-blue-900/20">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>EstateX</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 ${currentProject.color.bgAccent} backdrop-blur-sm rounded-2xl flex items-center justify-center ${currentProject.color.borderColor} border-2`}>
                  <currentProject.icon className={`w-10 h-10 ${currentProject.color.textAccent}`} />
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className={`${currentProject.color.textAccent} font-semibold uppercase tracking-wider text-sm`}>Next-Gen Infrastructure</span>
              </div>
              
              <h1 className={`text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentProject.color.gradient} mb-4 leading-tight tracking-tight`}>
                {currentProject.name}: {currentProject.subtitle}
              </h1>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-4">
                {currentProject.description}
              </p>
              
              {/* TGE Event Banner */}
              <div className={`bg-gradient-to-r ${currentProject.color.bgGradient} backdrop-blur-sm rounded-xl p-4 mb-6 border ${currentProject.color.borderColor} max-w-2xl mx-auto`}>
                <div className="flex items-center justify-center gap-4">
                  <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <span className="text-white font-semibold">{currentProject.tge}</span>
                  <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              {/* Official Links */}
              <div className="flex justify-center gap-4 mb-8">
                {currentProject.links.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`px-4 py-2 ${currentProject.color.bgAccent} ${currentProject.color.textAccent} rounded-lg font-medium ${currentProject.color.hoverBg} transition-colors flex items-center gap-2 border ${currentProject.color.borderColor}`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </a>
                  );
                })}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {currentProject.metrics.map((metric, index) => (
                  <div key={index} className={`bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border ${currentProject.color.borderColor}`}>
                    <div className={`text-2xl font-bold ${currentProject.color.textAccent}`}>{metric.value}</div>
                    <div className="text-xs text-slate-400">{metric.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Live EstateX Data from CoinGecko Pro */}
              {selectedProject === 'estatex' && estatexLiveData && (
                <div className="mt-6 bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-blue-500/20 max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 animate-pulse" />
                    Live Market Data from CoinGecko Pro
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Current Price</div>
                      <div className="text-xl font-bold text-white">${estatexLiveData.currentPrice?.toFixed(6) || '0.00'}</div>
                      <div className={`text-xs ${estatexLiveData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {estatexLiveData.priceChange24h >= 0 ? '+' : ''}{estatexLiveData.priceChange24h?.toFixed(2)}% (24h)
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Fully Diluted Valuation</div>
                      <div className="text-xl font-bold text-white">{formatNumber(estatexLiveData.fullyDilutedValuation || 0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Since TGE</div>
                      <div className={`text-xl font-bold ${estatexLiveData.tgeData?.percentageFromTGE >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {estatexLiveData.tgeData?.percentageFromTGE >= 0 ? '+' : ''}{estatexLiveData.tgeData?.percentageFromTGE?.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  {estatexLiveData.tgeData && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="text-xs text-slate-400">
                        TGE: {estatexLiveData.tgeData.launchDate} • Launch Price: ${estatexLiveData.tgeData.launchPrice} • Initial Market Cap: ${formatNumber(estatexLiveData.tgeData.initialMarketCap)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-1 flex gap-1">
            {(['overview', 'technology', 'tokenomics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? `${currentProject.color.bgAccent} text-white`
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {content[activeTab]}
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Created by{' '}
              <a 
                href="https://x.com/0xMorpheusXBT"
                target="_blank"
                rel="noopener noreferrer"
                className={`${currentProject.color.textAccent} hover:text-white transition-colors`}
              >
                @0xMorpheusXBT
              </a>
            </p>
            <div className="flex items-center gap-6">
              <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/revenue-analysis" className="text-sm text-slate-400 hover:text-white transition-colors">
                Revenue Analysis
              </a>
              <a href="/failure-analysis" className="text-sm text-slate-400 hover:text-white transition-colors">
                Failure Analysis
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}