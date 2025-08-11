#!/usr/bin/env python3
"""
Google Sheets CSV Export for Ethereum Beta Plays
Creates properly formatted CSV for Google Sheets import
"""

import csv
import requests
from typing import Dict, List

class GoogleSheetsExporter:
    def __init__(self):
        self.api_key = "CG-MVg68aVqeVyu8fzagC9E1hPj"
        self.base_url = "https://pro-api.coingecko.com/api/v3"
        self.headers = {
            "accept": "application/json",
            "x-cg-pro-api-key": self.api_key
        }
        
        # Token mapping with correct CoinGecko IDs
        self.tokens = {
            'LDO': 'lido-dao',
            'ENA': 'ethena',
            'PEPE': 'pepe',
            'ARB': 'arbitrum',
            'RPL': 'rocket-pool',
            'ETHFI': 'ether-fi',
            'EIGEN': 'eigenlayer',
            'AAVE': 'aave',
            'MNT': 'mantle',
            'COOK': 'meth-protocol',
            'FLUID': 'fluid',
            'PENDLE': 'pendle',
            'SKY': 'maker',
            'CPOOL': 'clearpool'
        }
        
        self.categories = {
            'LDO': 'LIQUID STAKING',
            'ENA': 'STABLECOINS',
            'PEPE': 'MEME',
            'ARB': 'INFRA',
            'RPL': 'LIQUID STAKING',
            'ETHFI': 'RESTAKING',
            'EIGEN': 'RESTAKING',
            'AAVE': 'LENDING',
            'MNT': 'INFRA',
            'COOK': 'INFRA',
            'FLUID': 'DEX',
            'PENDLE': 'YIELD',
            'SKY': 'RWA/STABLECOINS',
            'CPOOL': 'RWA'
        }
        
        self.explanations = {
            'LDO': 'Lido is a leading Ethereum liquid staking protocol that issues stETH, a liquid staking token used in DeFi and restaking protocols.',
            'ENA': 'Ethena is a protocol that issues USDe, a synthetic stablecoin pegged to USD using ETH collateral and derivatives hedging.',
            'PEPE': 'One of the most recognized memes online and after SHIB the biggest meme token on Ethereum.',
            'ARB': 'Arbitrum is a Layer 2 scaling solution for Ethereum using optimistic rollups technology.',
            'RPL': 'Rocket Pool issues rETH, a liquid staking token, with RPL used for node operator incentives.',
            'ETHFI': 'Ether.fi is an advanced liquidity restaking protocol that leverages EigenLayer to restake ETH and LSTs, issuing eETH.',
            'EIGEN': 'EigenLayer introduces restaking, a new primitive in cryptoeconomic security enabling reuse of ETH on consensus layer.',
            'AAVE': 'Aave is an open-source, non-custodial protocol to earn interest on deposits and borrow assets.',
            'MNT': 'Mantle is a high-performance Ethereum Layer 2 network built with modular architecture.',
            'COOK': 'METH Protocol provides liquid staking solutions for ETH with yield optimization features.',
            'FLUID': 'Fluid is a DEX protocol focusing on capital efficiency and advanced liquidity management.',
            'PENDLE': 'Pendle Finance enables trading of tokenized future yield on an automated market maker system.',
            'SKY': 'Sky (formerly Maker) protocol issues DAI stablecoin and is expanding into real-world asset tokenization.',
            'CPOOL': 'Clearpool is a decentralized marketplace for uncollateralized institutional loans.'
        }

    def fetch_token_data(self) -> List[Dict]:
        """Fetch token data from CoinGecko Pro API"""
        token_ids = ','.join(self.tokens.values())
        url = f"{self.base_url}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'ids': token_ids,
            'order': 'market_cap_desc',
            'per_page': 100,
            'page': 1,
            'sparkline': False,
            'price_change_percentage': '24h,7d',
            'precision': 'full'
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            return []

    def format_for_sheets(self, data: List[Dict]) -> List[List]:
        """Format data for Google Sheets"""
        # Create lookup
        data_by_id = {token['id']: token for token in data}
        
        # Headers
        rows = [['TICKER', 'CATEGORY', 'PRICE', 'MARKET_CAP', 'FDV', 'CHANGE_24H', 'CHANGE_7D', 'VOLUME_24H', 'EXPLANATION']]
        
        # Sort by category priority
        category_order = {
            'LIQUID STAKING': 1,
            'RESTAKING': 2,
            'LENDING': 3,
            'YIELD': 4,
            'STABLECOINS': 5,
            'RWA/STABLECOINS': 6,
            'DEX': 7,
            'INFRA': 8,
            'RWA': 9,
            'MEME': 10
        }
        
        sorted_tokens = sorted(
            self.tokens.items(),
            key=lambda x: (category_order.get(self.categories.get(x[0], 'OTHER'), 10), x[0])
        )
        
        for symbol, gecko_id in sorted_tokens:
            if gecko_id in data_by_id:
                token = data_by_id[gecko_id]
                rows.append([
                    symbol,
                    self.categories.get(symbol, 'OTHER'),
                    token.get('current_price', 0),
                    token.get('market_cap', 0),
                    token.get('fully_diluted_valuation', 0),
                    f"{token.get('price_change_percentage_24h', 0):.2f}%",
                    f"{token.get('price_change_percentage_7d_in_currency', 0):.2f}%",
                    token.get('total_volume', 0),
                    self.explanations.get(symbol, 'No description available')
                ])
            else:
                rows.append([
                    symbol,
                    self.categories.get(symbol, 'OTHER'),
                    0,
                    0,
                    0,
                    '0.00%',
                    '0.00%',
                    0,
                    self.explanations.get(symbol, 'No description available')
                ])
        
        return rows

    def export_to_csv(self, filename: str = 'ethereum_beta_plays.csv'):
        """Export to CSV format"""
        print("Fetching data from CoinGecko Pro API...")
        data = self.fetch_token_data()
        rows = self.format_for_sheets(data)
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(rows)
        
        print(f"Data exported to {filename}")
        return rows

def main():
    exporter = GoogleSheetsExporter()
    rows = exporter.export_to_csv()
    
    # Display formatted table
    print("\nETHEREUM BETA PLAYS - GOOGLE SHEETS FORMAT")
    print("=" * 100)
    
    for i, row in enumerate(rows):
        if i == 0:  # Header
            print(f"{'TICKER':<8} {'CATEGORY':<15} {'PRICE':<12} {'MARKET CAP':<15} {'FDV':<15} {'24H':<8} {'7D':<8} {'VOL 24H':<15}")
            print("-" * 100)
        else:
            ticker, category, price, mcap, fdv, change24h, change7d, volume, explanation = row
            
            # Format numbers for display
            if isinstance(price, (int, float)) and price > 0:
                price_str = f"${price:.2f}" if price >= 1 else f"${price:.8f}"
            else:
                price_str = "N/A"
            
            mcap_str = f"${mcap/1e9:.2f}B" if mcap >= 1e9 else f"${mcap/1e6:.2f}M" if mcap >= 1e6 else "N/A"
            fdv_str = f"${fdv/1e9:.2f}B" if fdv >= 1e9 else f"${fdv/1e6:.2f}M" if fdv >= 1e6 else "N/A"
            vol_str = f"${volume/1e9:.2f}B" if volume >= 1e9 else f"${volume/1e6:.2f}M" if volume >= 1e6 else "N/A"
            
            print(f"{ticker:<8} {category:<15} {price_str:<12} {mcap_str:<15} {fdv_str:<15} {change24h:<8} {change7d:<8} {vol_str:<15}")

if __name__ == "__main__":
    main()