import { useState } from "react";
import { ArrowLeft, Trophy, Rocket, Zap, CheckCircle2, ExternalLink, Users, Star, Award, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import SiteFooter from "@/components/site-footer";

export default function BlofinCompetition() {
  const [activeTab, setActiveTab] = useState<'overview' | 'about' | 'rules'>('overview');

  const tabContent = {
    overview: (
      <div className="space-y-8 animate-fade-in">
        {/* Competition Banner */}
        <div className="relative">
          <img 
            src="/assets/image_1751278919818.png" 
            alt="BloFin x Miles Deutscher Space Trading Competition"
            className="w-full rounded-2xl shadow-2xl"
          />
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
          <h3 className="text-2xl font-bold text-orange-400 mb-6">Competition Overview</h3>
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              Join Miles Deutscher and BloFin in the ultimate Space Trading Competition with a massive <span className="text-orange-400 font-bold">$10,000 prize pool</span>. Test your trading skills against traders from around the world and compete for your share of the rewards.
            </p>
            
            <div className="bg-orange-900/20 p-6 rounded-xl border border-orange-500/20">
              <h4 className="font-bold text-white mb-4 text-lg">How to Participate</h4>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">1.</span>
                  <span>Sign up through the official competition link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">2.</span>
                  <span>Create or connect your BloFin account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">3.</span>
                  <span>Start trading and climb the leaderboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">4.</span>
                  <span>Top traders share the $10,000 prize pool</span>
                </li>
              </ol>
            </div>

            <div className="flex justify-center mt-6">
              <a 
                href="https://tinyurl.com/MilesDeutscherBlofin10kComp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center gap-3"
              >
                <Rocket className="w-6 h-6" />
                Sign Up For The Competition
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20">
            <h4 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Prize Pool Distribution
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex justify-between">
                <span>1st Place</span>
                <span className="text-orange-400 font-bold">$4,000</span>
              </li>
              <li className="flex justify-between">
                <span>2nd Place</span>
                <span className="text-orange-400 font-bold">$2,500</span>
              </li>
              <li className="flex justify-between">
                <span>3rd Place</span>
                <span className="text-orange-400 font-bold">$1,500</span>
              </li>
              <li className="flex justify-between">
                <span>4th-10th Place</span>
                <span className="text-orange-400 font-bold">$2,000 (shared)</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20">
            <h4 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Competition Features
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Real-time leaderboard tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Professional trading platform</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Fair competition rules</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Expert insights from Miles Deutscher</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
    about: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
          <h3 className="text-2xl font-bold text-orange-400 mb-6">About BloFin</h3>
          <p className="text-slate-300 leading-relaxed mb-6">
            BloFin is a cutting-edge cryptocurrency derivatives exchange platform that provides professional trading tools and advanced features for both retail and institutional traders. With deep liquidity, low fees, and a user-friendly interface, BloFin has become a preferred platform for serious traders.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-orange-500/10">
              <h5 className="font-semibold text-white mb-2">24/7 Trading</h5>
              <p className="text-xs text-slate-400">Round-the-clock cryptocurrency trading</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-orange-500/10">
              <h5 className="font-semibold text-white mb-2">Deep Liquidity</h5>
              <p className="text-xs text-slate-400">Professional-grade order execution</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-orange-500/10">
              <h5 className="font-semibold text-white mb-2">Low Fees</h5>
              <p className="text-xs text-slate-400">Competitive trading fees</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-orange-500/10">
              <h5 className="font-semibold text-white mb-2">Secure Platform</h5>
              <p className="text-xs text-slate-400">Bank-grade security measures</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
          <h3 className="text-2xl font-bold text-orange-400 mb-6">About Miles Deutscher</h3>
          <p className="text-slate-300 leading-relaxed">
            Miles Deutscher is a renowned cryptocurrency analyst, trader, and content creator with a massive following across social media platforms. Known for his in-depth market analysis, trading strategies, and educational content, Miles has helped thousands of traders improve their skills and navigate the crypto markets successfully.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">500K+</div>
              <div className="text-sm text-slate-400">Followers</div>
            </div>
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">1000+</div>
              <div className="text-sm text-slate-400">Analysis Videos</div>
            </div>
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400">5+ Years</div>
              <div className="text-sm text-slate-400">Trading Experience</div>
            </div>
          </div>
        </div>
      </div>
    ),
    rules: (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
          <h3 className="text-2xl font-bold text-orange-400 mb-6">Competition Rules & Requirements</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Eligibility</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Open to all traders worldwide (where legally permitted)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Must be 18 years or older
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  One account per participant
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  KYC verification required for prize distribution
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Trading Rules</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Competition tracking based on PnL percentage
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  All trading pairs on BloFin are eligible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Both spot and derivatives trading allowed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Minimum trading volume requirements may apply
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Important Dates</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Registration: Open Now
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Competition Period: Check official announcement
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Winners Announcement: After competition ends
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  Prize Distribution: Within 7 days of announcement
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <a 
            href="https://tinyurl.com/MilesDeutscherBlofin10kComp"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center gap-3"
          >
            <Trophy className="w-6 h-6" />
            Join The Competition Now
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <a 
                href="https://x.com/BloFin_Official"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                @BloFin_Official
              </a>
              <span className="text-slate-600">×</span>
              <a 
                href="https://x.com/milesdeutscher"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                @milesdeutscher
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="text-center space-y-6">
              {/* Trophy Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-gradient-to-r from-orange-500 to-yellow-500 opacity-50 animate-pulse" />
                  <div className="w-20 h-20 bg-orange-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-orange-500/20">
                    <Trophy className="w-10 h-10 text-orange-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-orange-400 font-semibold uppercase tracking-wider text-sm">Space Trading Competition</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 mb-4 leading-tight tracking-tight">
                BloFin × Miles Deutscher
              </h1>
              
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-4">
                Compete for your share of the $10,000 prize pool in the ultimate crypto trading competition
              </p>
              
              {/* Prize Pool Banner */}
              <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-orange-500/20 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <span className="text-white font-semibold">$10,000 Total Prize Pool</span>
                  <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              {/* Official Links */}
              <div className="flex justify-center gap-4 mb-8">
                <a 
                  href="https://tinyurl.com/MilesDeutscherBlofin10kComp"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center gap-2 border border-orange-400/20"
                >
                  <Rocket className="w-4 h-4" />
                  Sign Up Now
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href="https://x.com/BloFin_Official"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-lg font-medium hover:bg-orange-600/30 transition-colors flex items-center gap-2 border border-orange-500/20"
                >
                  <Users className="w-4 h-4" />
                  @BloFin_Official
                </a>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-400">$10,000</div>
                  <div className="text-xs text-slate-400">Prize Pool</div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-400">Live Now</div>
                  <div className="text-xs text-slate-400">Competition Status</div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-400">BloFin</div>
                  <div className="text-xs text-slate-400">Trading Platform</div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-400">Miles Deutscher</div>
                  <div className="text-xs text-slate-400">Competition Host</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-orange-600/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'about'
                  ? 'bg-orange-600/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'rules'
                  ? 'bg-orange-600/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rules
            </button>
          </div>
        </div>

        {/* Content */}
        {tabContent[activeTab]}
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
                className="text-orange-400 hover:text-white transition-colors"
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
              <a href="/interesting-projects" className="text-sm text-slate-400 hover:text-white transition-colors">
                Interesting Projects
              </a>
            </div>
          </div>
        </div>
      </footer>
      <SiteFooter />
    </div>
  );
}