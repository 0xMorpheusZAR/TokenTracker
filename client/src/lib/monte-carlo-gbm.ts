/**
 * Comprehensive Monte Carlo Simulation Framework for Hyperliquid (HYPE) Price Prediction
 * Based on Geometric Brownian Motion with Fundamental Adjustments
 * 
 * Methodology follows the PDF framework:
 * - Uses GBM: ΔS = S × (μ Δt + σ ε √Δt)
 * - Incorporates fundamental factors for drift adjustment
 * - Runs scenario-based analysis with 10,000+ simulations
 * - Provides comprehensive risk metrics and confidence intervals
 */

interface SimulationParameters {
  currentPrice: number;
  volatility: number; // Annualized volatility (σ)
  drift: number; // Expected daily return (μ)
  marketShare: number;
  revenue: number;
  users: number;
  timeHorizon: number; // Days
  numSimulations: number;
  fundamentalAdjustments: {
    marketShareGrowth: number;
    userGrowthRate: number;
    revenueGrowthRate: number;
  };
}

interface MonteCarloResult {
  scenario: string;
  probability: number;
  endPrice: number;
  priceChange: number;
  marketCap: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  valueAtRisk: number;
  maxDrawdown: number;
  probabilityAbove50: number;
  fundamentalFactors: {
    marketShareImpact: number;
    userGrowthImpact: number;
    revenueGrowthImpact: number;
  };
}

// Box-Muller transform for generating normal random numbers
function randomNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function runAdvancedMonteCarloSimulation(params: SimulationParameters): MonteCarloResult[] {
  const results: MonteCarloResult[] = [];
  
  // Define scenarios with different fundamental outlooks
  const scenarios = [
    {
      name: "Bear Case",
      probability: 0.15,
      driftMultiplier: 0.2, // Competition erodes dominance
      description: "Market competition intensifies, growth slows significantly"
    },
    {
      name: "Base Case", 
      probability: 0.70,
      driftMultiplier: 1.0, // Current fundamental trajectory
      description: "Sustained growth aligned with current fundamentals"
    },
    {
      name: "Bull Case",
      probability: 0.15,
      driftMultiplier: 2.0, // Explosive institutional adoption
      description: "Institutional adoption accelerates, market dominance expands"
    }
  ];

  scenarios.forEach(scenario => {
    const numSimulations = params.numSimulations || 10000;
    const timeSteps = params.timeHorizon || 150; // 5 months
    const dt = 1; // Daily time step
    
    let endPrices: number[] = [];
    let allPaths: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      let price = params.currentPrice;
      let path = [price];
      
      for (let t = 0; t < timeSteps; t++) {
        // Fundamental adjustments over time
        const timeFactor = t / timeSteps; // Progress through simulation period
        
        // Base drift adjusted by scenario
        const baseDrift = params.drift * scenario.driftMultiplier;
        
        // Fundamental growth adjustments (converted to daily rates)
        const marketShareBoost = params.fundamentalAdjustments.marketShareGrowth * 0.1 / 365;
        const userGrowthBoost = params.fundamentalAdjustments.userGrowthRate * 0.05 / 365;
        const revenueGrowthBoost = params.fundamentalAdjustments.revenueGrowthRate * 0.03 / 365;
        
        // Diminishing returns as market cap grows
        const currentMarketCap = price * 334e6; // 334M circulating supply
        const scaleFactor = Math.max(0.5, 1 - (currentMarketCap / 100e9) * 0.3); // Diminishing returns above $100B
        
        const adjustedDrift = (baseDrift + marketShareBoost + userGrowthBoost + revenueGrowthBoost) * scaleFactor;
        
        // Convert annual volatility to daily
        const dailyVolatility = params.volatility / Math.sqrt(252);
        
        // Generate random shock
        const epsilon = randomNormal();
        
        // Geometric Brownian Motion: ΔS = S × (μ Δt + σ ε √Δt)
        const driftTerm = adjustedDrift * dt;
        const volatilityTerm = dailyVolatility * epsilon * Math.sqrt(dt);
        
        // Update price using GBM
        price = price * Math.exp(driftTerm + volatilityTerm);
        
        // Ensure price remains positive
        price = Math.max(price, 0.01);
        path.push(price);
      }
      
      endPrices.push(price);
      allPaths.push(path);
    }
    
    // Statistical Analysis
    endPrices.sort((a, b) => a - b);
    
    const avgEndPrice = endPrices.reduce((sum, price) => sum + price, 0) / endPrices.length;
    const medianEndPrice = endPrices[Math.floor(endPrices.length / 2)];
    const priceChange = ((avgEndPrice - params.currentPrice) / params.currentPrice) * 100;
    const marketCap = avgEndPrice * 334e6;
    
    // Confidence intervals (5th and 95th percentiles)
    const lowerCI = endPrices[Math.floor(endPrices.length * 0.05)];
    const upperCI = endPrices[Math.floor(endPrices.length * 0.95)];
    
    // Value at Risk (5% worst case)
    const valueAtRisk = ((lowerCI - params.currentPrice) / params.currentPrice) * 100;
    
    // Maximum drawdown calculation
    const maxDrawdowns = allPaths.map(path => {
      let maxDrawdown = 0;
      let peak = path[0];
      for (let price of path) {
        if (price > peak) peak = price;
        const drawdown = (peak - price) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }
      return maxDrawdown * 100;
    });
    const avgMaxDrawdown = maxDrawdowns.reduce((sum, dd) => sum + dd, 0) / maxDrawdowns.length;
    
    // Probability of price above $50
    const probabilityAbove50 = endPrices.filter(p => p > 50).length / endPrices.length;
    
    // Fundamental factor impacts
    const marketShareImpact = (params.marketShare - 0.5) * 200; // Dominance impact
    const userGrowthImpact = Math.log(params.users / 100000) * 25;
    const revenueGrowthImpact = Math.log(params.revenue / 100e6) * 20;
    
    results.push({
      scenario: scenario.name,
      probability: scenario.probability,
      endPrice: avgEndPrice,
      priceChange: priceChange,
      marketCap: marketCap,
      confidenceInterval: {
        lower: lowerCI,
        upper: upperCI
      },
      valueAtRisk: valueAtRisk,
      maxDrawdown: avgMaxDrawdown,
      probabilityAbove50: probabilityAbove50,
      fundamentalFactors: {
        marketShareImpact: marketShareImpact,
        userGrowthImpact: userGrowthImpact,
        revenueGrowthImpact: revenueGrowthImpact
      }
    });
  });

  return results;
}

// Calculate drift from fundamental analysis
export function calculateFundamentalDrift(params: {
  marketShare: number;
  revenue: number;
  users: number;
  historicalGrowth: number;
}): number {
  // Base historical performance (tempered for future projections)
  const baseReturn = Math.log(1 + params.historicalGrowth) / 365; // Convert to daily
  
  // Fundamental multipliers
  const marketDominanceMultiplier = Math.min(2.0, params.marketShare * 2); // Cap at 2x
  const revenueScaleMultiplier = Math.log(params.revenue / 100e6) * 0.1; // Logarithmic revenue impact
  const userBaseMultiplier = Math.log(params.users / 50000) * 0.05; // User network effects
  
  // Combined fundamental drift
  const fundamentalDrift = baseReturn * marketDominanceMultiplier + revenueScaleMultiplier + userBaseMultiplier;
  
  // Apply maturity discount (high growth becomes harder at scale)
  const maturityDiscount = Math.max(0.3, 1 - (params.revenue / 5e9) * 0.5); // Discount as revenue approaches $5B
  
  return fundamentalDrift * maturityDiscount;
}