import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UnifiedAssetDashboard } from '@/components/UnifiedAssetDashboard';
import { Search, TrendingUp, BarChart3, Activity, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function UnifiedAssetDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  
  // Fetch trending/popular tokens
  const { data: popularTokens, isLoading } = useQuery<TokenInfo[]>({
    queryKey: ['/api/coingecko/detailed'],
    queryFn: async () => {
      const response = await fetch('/api/coingecko/detailed');
      if (!response.ok) throw new Error('Failed to fetch tokens');
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Filter tokens based on search
  const filteredTokens = popularTokens?.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Unified Asset Dashboard
                </h1>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 focus:border-blue-500 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!selectedToken ? (
          <div className="space-y-8">
            {/* Introduction */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Comprehensive Token Analytics
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Get real-time market data, DeFi metrics, liquidity analysis, and token unlock schedules all in one place.
                Select a token below to view its unified dashboard.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <h3 className="font-semibold">Market Data</h3>
                  <p className="text-sm text-gray-400">Price, volume, market cap</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <h3 className="font-semibold">DeFi Metrics</h3>
                  <p className="text-sm text-gray-400">TVL, users, revenue</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <h3 className="font-semibold">Liquidity</h3>
                  <p className="text-sm text-gray-400">DEX pools, depth</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4 text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="font-semibold">Unlocks</h3>
                  <p className="text-sm text-gray-400">Vesting schedules</p>
                </CardContent>
              </Card>
            </div>

            {/* Token Selection Grid */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Select a Token</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(searchQuery ? filteredTokens : popularTokens || []).map((token) => (
                    <Card
                      key={token.id}
                      className="bg-gray-900/50 border-gray-800 hover:border-blue-500 transition-all cursor-pointer group"
                      onClick={() => handleTokenSelect(token)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={token.image} alt={token.name} className="w-10 h-10 rounded-full" />
                          <div className="flex-1">
                            <h4 className="font-semibold group-hover:text-blue-400 transition-colors">{token.name}</h4>
                            <p className="text-sm text-gray-400 uppercase">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">#{token.market_cap_rank}</span>
                          <div className="text-right">
                            <div className="font-medium">${token.current_price.toFixed(4)}</div>
                            <div className={`text-sm ${token.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {token.price_change_percentage_24h >= 0 ? '+' : ''}{token.price_change_percentage_24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back to selection button */}
            <Button
              variant="outline"
              onClick={() => setSelectedToken(null)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Select Another Token
            </Button>

            {/* Token Dashboard */}
            <UnifiedAssetDashboard
              coinId={selectedToken.id}
              coinName={selectedToken.name}
            />
          </div>
        )}
      </main>
    </div>
  );
}