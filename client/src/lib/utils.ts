import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCurrency(amount: number | string, symbol: string = '$'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 1e9) {
    return `${symbol}${(num / 1e9).toFixed(1)}B`;
  }
  if (num >= 1e6) {
    return `${symbol}${(num / 1e6).toFixed(1)}M`;
  }
  if (num >= 1e3) {
    return `${symbol}${(num / 1e3).toFixed(1)}K`;
  }
  return `${symbol}${num.toFixed(2)}`;
}

export function formatPercentage(percent: number | string): string {
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return 'bg-loss-red text-white';
    case 'high':
      return 'bg-warning-orange text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-gain-green text-white';
    default:
      return 'bg-neutral-gray text-white';
  }
}

export function getPerformanceColor(performance: number | string): string {
  const num = typeof performance === 'string' ? parseFloat(performance) : performance;
  if (num < -90) return 'text-red-500';
  if (num < -50) return 'text-orange-500';
  if (num < 0) return 'text-yellow-500';
  return 'text-gain-green';
}

export function generateTokenGradient(symbol: string): string {
  const colors = [
    'from-purple-500 to-blue-500',
    'from-orange-500 to-red-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-green-500',
    'from-red-500 to-pink-500',
    'from-cyan-500 to-blue-500'
  ];
  
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
