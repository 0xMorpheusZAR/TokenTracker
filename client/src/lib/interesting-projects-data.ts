export interface ProjectData {
  id: string;
  name: string;
  symbol: string;
  tagline: string;
  description: string;
  marketSize: string;
  keyMetric1: { value: string; label: string };
  keyMetric2: { value: string; label: string };
  keyMetric3: { value: string; label: string };
  keyMetric4: { value: string; label: string };
  tgeStatus: string;
  website: string;
  twitter: string;
  overview: {
    title: string;
    content: string[];
  };
  technology: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  tokenomics: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
}

export const projectsData: Record<string, ProjectData> = {
  raiinmaker: {
    id: 'raiinmaker',
    name: 'Raiinmaker',
    symbol: 'RAIN',
    tagline: 'The Cinematic AI Revolution',
    description: 'Solving the Hollywood-quality data gap in AI video generation through decentralized crowdsourcing and ethical infrastructure',
    marketSize: '$231.5B',
    keyMetric1: { value: '$231.5B', label: '2030 Market Size' },
    keyMetric2: { value: '95/100', label: 'Data Quality Score' },
    keyMetric3: { value: 'TRAIIN', label: 'Video Platform' },
    keyMetric4: { value: 'Aethir', label: 'GPU Partner' },
    tgeStatus: 'Token Generation Event: TBA',
    website: 'https://www.raiinmaker.com/',
    twitter: 'https://x.com/raiinmakerapp',
    overview: {
      title: 'Overview',
      content: [
        'Raiinmaker is pioneering the future of AI-generated cinematic content by solving the critical data infrastructure challenge that limits current video AI models.',
        'The platform leverages a decentralized network of content creators to generate high-quality, ethically-sourced training data for next-generation AI video models.',
        'By combining blockchain incentives with Hollywood-grade quality standards, Raiinmaker creates a sustainable ecosystem where creators are fairly compensated for their contributions.',
        'The project addresses the $231.5B AI video generation market expected by 2030, positioning itself as the infrastructure layer for cinematic AI applications.'
      ]
    },
    technology: {
      title: 'Technology',
      items: [
        {
          title: 'Decentralized Data Network',
          description: 'Blockchain-based infrastructure ensuring transparent attribution and fair compensation for all data contributors',
          icon: 'Network'
        },
        {
          title: 'TRAIIN Video Platform',
          description: 'Professional-grade video creation and annotation tools designed specifically for AI training datasets',
          icon: 'Video'
        },
        {
          title: 'Quality Assurance Engine',
          description: 'Multi-layer validation system achieving 95/100 data quality scores through automated and human review',
          icon: 'Shield'
        },
        {
          title: 'Ethical AI Framework',
          description: 'Industry-leading consent management and usage rights tracking for all generated content',
          icon: 'Scale'
        }
      ]
    },
    tokenomics: {
      title: 'Network & Token',
      items: [
        {
          title: 'GPU Partnership with Aethir',
          description: 'Strategic alliance providing decentralized computing power for AI model training and inference',
          icon: 'Cpu'
        },
        {
          title: 'Creator Rewards System',
          description: 'Token-based incentives for high-quality data contributions, with bonus multipliers for consistency',
          icon: 'Coins'
        },
        {
          title: 'Enterprise Integration',
          description: 'B2B licensing model allowing major studios and AI companies to access premium training datasets',
          icon: 'Building2'
        },
        {
          title: 'Governance Framework',
          description: 'Community-driven decision making for platform standards, quality metrics, and reward distributions',
          icon: 'Users'
        }
      ]
    }
  },
  estatex: {
    id: 'estatex',
    name: 'EstateX',
    symbol: 'ESX',
    tagline: 'Democratizing Real Estate Investment',
    description: 'Blockchain-based ecosystem making property investing simple, affordable, and accessible through tokenization',
    marketSize: '$300T',
    keyMetric1: { value: '$300T', label: 'Real Estate Market' },
    keyMetric2: { value: '$100', label: 'Min Investment' },
    keyMetric3: { value: 'Daily', label: 'Rental Payouts' },
    keyMetric4: { value: 'BaFin', label: 'Licensed' },
    tgeStatus: 'Token Listed: June 2025',
    website: 'https://estatex.com/',
    twitter: 'https://x.com/EstateX_',
    overview: {
      title: 'Overview',
      content: [
        'EstateX is revolutionizing real estate investment by tokenizing properties and enabling fractional ownership for as little as $100.',
        'The platform combines real-world assets (RWA) with Web3 technology, allowing investors to earn daily rental income via smart contracts.',
        'By building a dedicated Layer-1 blockchain optimized for RWA, EstateX aims to become the "Binance of Tokenization" for asset-backed tokens.',
        'With regulatory licenses from BaFin (Germany) and CSSF (Luxembourg), EstateX offers compliant investment opportunities across Europe and beyond.'
      ]
    },
    technology: {
      title: 'Technology',
      items: [
        {
          title: 'EstateX Blockchain',
          description: 'Dedicated Layer-1 optimized for real-world assets with built-in compliance and high throughput',
          icon: 'Blocks'
        },
        {
          title: 'PROPX Security Tokens',
          description: 'Fractional property ownership tokens representing shares in specific real estate assets',
          icon: 'Home'
        },
        {
          title: 'Smart Contract Automation',
          description: 'Daily rental yield distribution and automated property management via blockchain',
          icon: 'FileCode2'
        },
        {
          title: 'PropXChange Marketplace',
          description: '24/7 secondary market for trading property tokens with instant liquidity',
          icon: 'TrendingUp'
        }
      ]
    },
    tokenomics: {
      title: 'Ecosystem & Services',
      items: [
        {
          title: '$ESX Utility Token',
          description: 'Native token for all platform transactions with 20-35% revenue sharing to holders',
          icon: 'Coins'
        },
        {
          title: 'CapitalX Lending',
          description: 'Instant loans using real estate tokens as collateral without credit checks',
          icon: 'Wallet'
        },
        {
          title: 'EstateX Pay Card',
          description: 'Debit card allowing users to spend rental income for everyday purchases',
          icon: 'CreditCard'
        },
        {
          title: 'TokenizeX B2B Service',
          description: 'Asset tokenization platform for property owners and institutions',
          icon: 'Building'
        }
      ]
    }
  }
};