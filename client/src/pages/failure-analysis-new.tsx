import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Activity,
  Calendar,
  Shield,
  Target,
  Percent,
  BarChart3,
  PieChart,
  Users,
  Lock,
  Unlock,
  Building2,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TokenFailureMetrics {
  category: string;
  description: string;
  impact: "Critical" | "High" | "Medium" | "Low";
  frequency: number;
  avgLoss: string;
  icon: any;
  color: string;
  examples: string[];
}

export default function ModernFailureAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Economic Failure Categories - Pure Analysis Without Token Data
  const failureCategories: TokenFailureMetrics[] = [
    {
      category: "Excessive Unlock Pressure",
      description: "Large token unlocks overwhelming market demand, creating systematic selling pressure",
      impact: "Critical",
      frequency: 78,
      avgLoss: "94.2%",
      icon: Unlock,
      color: "red",
      examples: [
        "Seed investor cliff unlocks releasing 20-40% of supply",
        "Team allocations vesting during bear markets",
        "Ecosystem fund distributions without utility backing"
      ]
    },
    {
      category: "Low Initial Float",
      description: "Extremely low circulating supply creating artificial scarcity and price manipulation",
      impact: "Critical", 
      frequency: 82,
      avgLoss: "96.8%",
      icon: Percent,
      color: "red",
      examples: [
        "Less than 5% of total supply circulating at launch",
        "High FDV relative to actual liquidity",
        "Market cap not reflecting true token availability"
      ]
    },
    {
      category: "Poor Tokenomics Design",
      description: "Fundamental flaws in token economic models and value capture mechanisms",
      impact: "Critical",
      frequency: 85,
      avgLoss: "91.7%",
      icon: Target,
      color: "red",
      examples: [
        "No clear utility or value accrual mechanism",
        "Excessive inflation rates",
        "Misaligned incentive structures"
      ]
    },
    {
      category: "Market Timing Failures",
      description: "Launching during unfavorable market conditions or poor timing decisions",
      impact: "High",
      frequency: 65,
      avgLoss: "89.3%",
      icon: Calendar,
      color: "orange",
      examples: [
        "Launching during crypto winter periods",
        "Poor coordination with market cycles",
        "Ignoring macro economic conditions"
      ]
    },
    {
      category: "Liquidity Mismanagement",
      description: "Insufficient liquidity provision and poor market making strategies",
      impact: "High",
      frequency: 71,
      avgLoss: "87.1%",
      icon: Activity,
      color: "orange",
      examples: [
        "Thin order books enabling price manipulation",
        "Inadequate DEX liquidity",
        "Poor market maker relationships"
      ]
    },
    {
      category: "Institutional Dumping",
      description: "Large institutional holders systematically selling positions",
      impact: "High",
      frequency: 58,
      avgLoss: "92.4%",
      icon: Building2,
      color: "orange",
      examples: [
        "VC firms exiting positions en masse",
        "Strategic partnerships unwinding",
        "Advisory allocation liquidations"
      ]
    }
  ];

  // Economic Impact Statistics
  const economicStats = [
    {
      label: "Total Market Cap Destroyed",
      value: "$58.4B",
      change: "+12.3% (30d)",
      icon: DollarSign,
      color: "red"
    },
    {
      label: "Average Token Decline",
      value: "95.2%",
      change: "From ATH",
      icon: TrendingDown,
      color: "red"
    },
    {
      label: "Failed Models Tracked",
      value: "847",
      change: "+23 (7d)",
      icon: AlertTriangle,
      color: "orange"
    },
    {
      label: "Avg Time to Failure",
      value: "4.7 months",
      change: "From launch",
      icon: Calendar,
      color: "gray"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      gray: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Economic Failure Analysis
              </h1>
            </div>
            
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              Live Analysis
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full px-4 py-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm font-medium">SYSTEMATIC FAILURE ANALYSIS</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tokenomics Failure 
            <span className="block text-red-600 dark:text-red-400">Economic Analysis</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Comprehensive breakdown of economic models that have destroyed $58.4B in market capitalization. 
            Focus on systematic failures, structural flaws, and recurring patterns.
          </p>
        </div>

        {/* Economic Impact Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {economicStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconColorClasses(stat.color)}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-xs">Impact</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="categories" className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Failure Categories
            </TabsTrigger>
            <TabsTrigger value="economic" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Economic Impact
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {failureCategories.map((category, index) => (
                <Card 
                  key={index} 
                  className={`border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    selectedCategory === category.category 
                      ? 'border-red-300 dark:border-red-700 shadow-lg' 
                      : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.category ? null : category.category)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconColorClasses(category.color)}`}>
                        <category.icon className="w-5 h-5" />
                      </div>
                      <Badge className={getColorClasses(category.color)}>
                        {category.impact}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{category.frequency}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Loss</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{category.avgLoss}</p>
                      </div>
                    </div>

                    {selectedCategory === category.category && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Common Examples:</p>
                        <ul className="space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="economic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Market Impact Breakdown */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    Market Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Total Value Destroyed</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Cumulative losses from ATH</p>
                      </div>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">$58.4B</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Average Decline</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Per token from peak</p>
                      </div>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">-95.2%</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Investor Losses</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Retail and institutional</p>
                      </div>
                      <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">$52.1B</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Analysis */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Failure Timeline Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">0-3 Months (Launch Phase)</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Initial price discovery and early unlock events</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-2">68% of failures begin</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">3-6 Months (Cliff Events)</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Major unlock cliffs and team vesting</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-2">23% accelerate decline</p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">6+ Months (Terminal Phase)</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Sustained selling pressure and low liquidity</p>
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mt-2">9% final breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Indicators */}
              <Card className="border-0 shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Early Warning Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Structural Red Flags</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">FDV/Market Cap Ratio &gt; 20x</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Extreme overvaluation relative to circulating supply</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Initial Float &lt; 10%</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Artificial scarcity creating unsustainable prices</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Large Unlock Events</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Major cliff unlocks within 6 months of launch</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Market Behavior Signals</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Volume Decline &gt; 80%</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Sustained loss of trading interest</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Liquidity Fragmentation</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Orders concentrated in narrow price ranges</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Holder Concentration</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">Top 10 wallets controlling &gt;50% of supply</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prevention Framework */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    Prevention Framework
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Gradual Unlock Schedule</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Linear vesting over 24-36 months</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Sustainable Float</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">25-40% initial circulation</p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Utility Integration</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Real value capture mechanisms</p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Market Making</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Professional liquidity provision</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}