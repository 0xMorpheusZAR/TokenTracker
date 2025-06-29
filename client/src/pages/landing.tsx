import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle, BarChart3, Shield, Zap, Users, DollarSign, LineChart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
            Token Failure Analytics Platform
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Analyze $58.4B in market cap destruction. Track catastrophic failures of low float/high FDV tokens with 95.2% average losses.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="/api/login">Start Free Trial</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">$58.4B</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Market Cap Destroyed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">95.2%</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Average Loss from ATH</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600">247</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Failed Tokens Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">24/7</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Comprehensive Failure Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingDown className="w-12 h-12 text-red-600 mb-4" />
                <CardTitle>Failure Pattern Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Identify common patterns in token failures including low float manipulation, excessive FDV inflation, and unlock event impacts.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-orange-600 mb-4" />
                <CardTitle>Economic Model Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Deep dive into tokenomics failures with detailed breakdowns of float percentages, vesting schedules, and market dynamics.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <AlertTriangle className="w-12 h-12 text-yellow-600 mb-4" />
                <CardTitle>Risk Assessment Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced risk scoring based on unlock pressures, liquidity ratios, and holder concentration patterns.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <div className="text-3xl font-bold mt-4">$0</div>
                <CardDescription>7 days access</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Basic failure analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Top 50 failed tokens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Weekly reports</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <a href="/api/login">Start Free</a>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="text-3xl font-bold mt-4">$99/mo</div>
                <CardDescription>Full analytics suite</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span>All token analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span>Real-time monitoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="default" asChild>
                  <a href="/api/login">Get Started</a>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="text-3xl font-bold mt-4">Custom</div>
                <CardDescription>Tailored solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>White-label options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>SLA guarantee</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <a href="mailto:sales@tokenanalytics.com">Contact Sales</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Analyze Token Failures?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of analysts and investors using our platform to understand and avoid catastrophic token failures.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <a href="/api/login">Start Your Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Token Failure Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}