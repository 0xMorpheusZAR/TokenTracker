import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = '4e5c0b2e5a3f4e1b8c9d0e1f2a3b4c5d'; // Default project ID for development

export const config = getDefaultConfig({
  appName: 'MEV Scanner Terminal',
  projectId,
  chains: [mainnet, arbitrum, optimism, polygon, base],
  ssr: false, // We're not using SSR
});

export { WagmiProvider, RainbowKitProvider };

// Custom theme for MEV Scanner
export const mevScannerTheme = darkTheme({
  accentColor: '#8b5cf6',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});