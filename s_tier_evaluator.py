#!/usr/bin/env python3
"""
S-Tier Rating System for Ethereum Beta Plays
Comprehensive evaluation with logos and detailed scoring methodology
"""

import requests
import json
from typing import Dict, List, Optional
from datetime import datetime

class STierEvaluator:
    def __init__(self):
        self.api_key = "CG-MVg68aVqeVyu8fzagC9E1hPj"
        self.base_url = "https://pro-api.coingecko.com/api/v3"
        self.headers = {
            "accept": "application/json",
            "x-cg-pro-api-key": self.api_key
        }
        
        # Token data with enhanced information
        self.tokens = {
            'LDO': {
                'id': 'lido-dao',
                'category': 'LIQUID STAKING',
                'logo_url': 'https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png',
                'description': 'Leading Ethereum liquid staking protocol',
                'founded': '2020',
                'backing': 'Paradigm, Coinbase Ventures, Three Arrows Capital'
            },
            'RPL': {
                'id': 'rocket-pool',
                'category': 'LIQUID STAKING', 
                'logo_url': 'https://assets.coingecko.com/coins/images/2090/standard/rocket_pool.png',
                'description': 'Decentralized Ethereum staking protocol',
                'founded': '2016',
                'backing': 'ConsenSys, Blockchain Capital'
            },
            'EIGEN': {
                'id': 'eigenlayer',
                'category': 'RESTAKING',
                'logo_url': 'https://assets.coingecko.com/coins/images/30060/standard/eigenlayer.png',
                'description': 'Restaking infrastructure protocol',
                'founded': '2021',
                'backing': 'Blockchain Capital, Coinbase Ventures, Polychain'
            },
            'ETHFI': {
                'id': 'ether-fi',
                'category': 'RESTAKING',
                'logo_url': 'https://assets.coingecko.com/coins/images/35958/standard/etherfi.png',
                'description': 'Liquid restaking protocol on EigenLayer',
                'founded': '2021',
                'backing': 'Bullish Ventures, Node Capital'
            },
            'AAVE': {
                'id': 'aave',
                'category': 'LENDING',
                'logo_url': 'https://assets.coingecko.com/coins/images/12645/standard/AAVE.png',
                'description': 'Leading DeFi lending protocol',
                'founded': '2017',
                'backing': 'Framework Ventures, ParaFi Capital, Three Arrows'
            },
            'PENDLE': {
                'id': 'pendle',
                'category': 'YIELD',
                'logo_url': 'https://assets.coingecko.com/coins/images/15069/standard/Pendle_Logo_Normal-03.png',
                'description': 'Yield tokenization and trading',
                'founded': '2021',
                'backing': 'Mechanism Capital, Spartan Group'
            },
            'ENA': {
                'id': 'ethena',
                'category': 'STABLECOINS',
                'logo_url': 'https://assets.coingecko.com/coins/images/36530/standard/ethena.png',
                'description': 'Synthetic USD stablecoin protocol',
                'founded': '2023',
                'backing': 'Dragonfly, Binance Labs, OKX Ventures'
            },
            'SKY': {
                'id': 'maker',
                'category': 'RWA/STABLECOINS',
                'logo_url': 'https://assets.coingecko.com/coins/images/1364/standard/Mark_Maker.png',
                'description': 'DAI stablecoin and RWA protocol',
                'founded': '2014',
                'backing': 'Andreessen Horowitz, Polychain Capital'
            },
            'ARB': {
                'id': 'arbitrum',
                'category': 'INFRA',
                'logo_url': 'https://assets.coingecko.com/coins/images/16547/standard/photo_2023-03-29_21.47.00.jpeg',
                'description': 'Leading Ethereum Layer 2 solution',
                'founded': '2018',
                'backing': 'Lightspeed, Polychain, Ribbit Capital'
            },
            'MNT': {
                'id': 'mantle',
                'category': 'INFRA',
                'logo_url': 'https://assets.coingecko.com/coins/images/30980/standard/token-logo.png',
                'description': 'High-performance Layer 2 network',
                'founded': '2021',
                'backing': 'BitDAO treasury, Bybit'
            },
            'COOK': {
                'id': 'meth-protocol',
                'category': 'INFRA',
                'logo_url': 'https://assets.coingecko.com/coins/images/33041/standard/meth.png',
                'description': 'Liquid staking with yield optimization',
                'founded': '2023',
                'backing': 'Private investors'
            },
            'CPOOL': {
                'id': 'clearpool',
                'category': 'RWA',
                'logo_url': 'https://assets.coingecko.com/coins/images/17816/standard/clearpool-logo.png',
                'description': 'Decentralized institutional lending',
                'founded': '2021',
                'backing': 'Sequoia Capital, HashKey Capital'
            },
            'PEPE': {
                'id': 'pepe',
                'category': 'MEME',
                'logo_url': 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg',
                'description': 'Leading Ethereum meme token',
                'founded': '2023',
                'backing': 'Community driven'
            }
        }
        
        # S-Tier scoring criteria (0-100 scale)
        self.scoring_criteria = {
            'market_metrics': {
                'weight': 0.25,
                'factors': {
                    'market_cap': 0.4,  # Size and adoption
                    'volume_ratio': 0.3,  # Liquidity health  
                    'fdv_premium': 0.3   # Valuation sanity
                }
            },
            'fundamentals': {
                'weight': 0.30,
                'factors': {
                    'protocol_maturity': 0.3,  # Track record
                    'team_quality': 0.25,      # Leadership
                    'backing_quality': 0.25,   # Investor quality
                    'innovation_score': 0.2    # Technical edge
                }
            },
            'adoption_growth': {
                'weight': 0.25,
                'factors': {
                    'tvl_trend': 0.4,      # Capital inflow
                    'user_growth': 0.3,    # Network effects
                    'integration_depth': 0.3  # Ecosystem presence
                }
            },
            'risk_assessment': {
                'weight': 0.20,
                'factors': {
                    'regulatory_risk': 0.3,   # Compliance outlook
                    'technical_risk': 0.3,    # Code security
                    'token_economics': 0.25,  # Sustainability
                    'competition_moat': 0.15  # Defensibility
                }
            }
        }

    def fetch_enhanced_data(self) -> Dict:
        """Fetch comprehensive market and on-chain data"""
        # Get valid token IDs
        valid_ids = [data['id'] for data in self.tokens.values()]
        ids_string = ','.join(valid_ids)
        
        url = f"{self.base_url}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'ids': ids_string,
            'order': 'market_cap_desc',
            'per_page': 100,
            'page': 1,
            'sparkline': False,
            'price_change_percentage': '1h,24h,7d,30d',
            'precision': 'full'
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    def calculate_market_score(self, token_data: Dict) -> float:
        """Calculate market metrics score (0-100)"""
        mcap = token_data.get('market_cap', 0)
        volume = token_data.get('total_volume', 0)
        fdv = token_data.get('fully_diluted_valuation', 0)
        
        # Market cap score (logarithmic scale)
        if mcap >= 5e9: mcap_score = 100
        elif mcap >= 1e9: mcap_score = 85
        elif mcap >= 500e6: mcap_score = 70
        elif mcap >= 100e6: mcap_score = 50
        elif mcap >= 50e6: mcap_score = 30
        else: mcap_score = 10
        
        # Volume ratio score (volume/mcap health)
        vol_ratio = volume / mcap if mcap > 0 else 0
        if vol_ratio >= 0.3: vol_score = 100
        elif vol_ratio >= 0.15: vol_score = 80
        elif vol_ratio >= 0.05: vol_score = 60
        elif vol_ratio >= 0.01: vol_score = 40
        else: vol_score = 20
        
        # FDV premium score (lower premium = higher score)
        fdv_premium = fdv / mcap if mcap > 0 else 1
        if fdv_premium <= 1.2: fdv_score = 100
        elif fdv_premium <= 2.0: fdv_score = 75
        elif fdv_premium <= 3.0: fdv_score = 50
        elif fdv_premium <= 5.0: fdv_score = 25
        else: fdv_score = 0
        
        # Weighted average
        factors = self.scoring_criteria['market_metrics']['factors']
        return (mcap_score * factors['market_cap'] + 
                vol_score * factors['volume_ratio'] + 
                fdv_score * factors['fdv_premium'])

    def calculate_fundamentals_score(self, symbol: str) -> float:
        """Calculate fundamentals score based on qualitative factors"""
        token_info = self.tokens[symbol]
        
        # Protocol maturity (years since founding)
        founded_year = int(token_info['founded'])
        years_active = 2024 - founded_year
        if years_active >= 6: maturity_score = 100
        elif years_active >= 4: maturity_score = 85
        elif years_active >= 2: maturity_score = 70
        elif years_active >= 1: maturity_score = 50
        else: maturity_score = 30
        
        # Team quality (subjective but based on track record)
        team_scores = {
            'LDO': 90, 'AAVE': 95, 'SKY': 90, 'ARB': 90, 'EIGEN': 85,
            'PENDLE': 80, 'ETHFI': 75, 'ENA': 70, 'MNT': 75, 'RPL': 80,
            'COOK': 60, 'CPOOL': 70, 'PEPE': 20
        }
        team_score = team_scores.get(symbol, 50)
        
        # Backing quality
        backing_scores = {
            'LDO': 95, 'AAVE': 90, 'SKY': 85, 'ARB': 95, 'EIGEN': 90,
            'PENDLE': 75, 'ETHFI': 70, 'ENA': 85, 'MNT': 80, 'RPL': 75,
            'COOK': 40, 'CPOOL': 80, 'PEPE': 0
        }
        backing_score = backing_scores.get(symbol, 50)
        
        # Innovation score
        innovation_scores = {
            'LDO': 85, 'AAVE': 90, 'SKY': 70, 'ARB': 95, 'EIGEN': 100,
            'PENDLE': 90, 'ETHFI': 80, 'ENA': 85, 'MNT': 70, 'RPL': 75,
            'COOK': 60, 'CPOOL': 70, 'PEPE': 10
        }
        innovation_score = innovation_scores.get(symbol, 50)
        
        # Weighted average
        factors = self.scoring_criteria['fundamentals']['factors']
        return (maturity_score * factors['protocol_maturity'] +
                team_score * factors['team_quality'] +
                backing_score * factors['backing_quality'] +
                innovation_score * factors['innovation_score'])

    def calculate_adoption_score(self, symbol: str, token_data: Dict) -> float:
        """Calculate adoption and growth metrics"""
        # Based on category leadership and growth trends
        adoption_scores = {
            'LDO': 95,   # Dominant in liquid staking
            'AAVE': 90,  # Leading DeFi protocol
            'ARB': 85,   # Top L2 by TVL
            'ENA': 80,   # Fast growing stablecoin
            'PENDLE': 75, # Growing yield sector
            'EIGEN': 70, # New but high potential
            'MNT': 70,   # Strong L2 position
            'SKY': 65,   # Established but slow growth
            'ETHFI': 65, # Good restaking position
            'RPL': 60,   # Smaller liquid staking player
            'CPOOL': 55, # Niche institutional lending
            'COOK': 45,  # Small player
            'PEPE': 40   # Meme with retail adoption
        }
        return adoption_scores.get(symbol, 50)

    def calculate_risk_score(self, symbol: str, token_data: Dict) -> float:
        """Calculate risk assessment (higher score = lower risk)"""
        # Risk factors scoring
        risk_scores = {
            'LDO': 75,   # Some regulatory risk on staking
            'AAVE': 80,  # Well established, good security
            'ARB': 85,   # Strong tech, backed by Offchain Labs
            'SKY': 70,   # Regulatory scrutiny on RWA
            'PENDLE': 75, # Complex mechanisms, audit risks
            'EIGEN': 60, # New, complex, high technical risk
            'ENA': 65,   # New protocol, derivatives exposure
            'ETHFI': 65, # Built on EigenLayer, dependency risk
            'MNT': 70,   # Centralization concerns
            'RPL': 80,   # Decentralized, battle-tested
            'CPOOL': 60, # Credit risk, regulatory uncertainty
            'COOK': 50,  # Small, unproven
            'PEPE': 30   # Pure speculation, no utility
        }
        return risk_scores.get(symbol, 50)

    def calculate_s_tier_score(self, symbol: str, market_data: List[Dict]) -> Dict:
        """Calculate comprehensive S-Tier score"""
        # Find token data
        token_data = None
        for data in market_data:
            if data['id'] == self.tokens[symbol]['id']:
                token_data = data
                break
        
        if not token_data:
            return {'total_score': 0, 'tier': 'F', 'scores': {}}
        
        # Calculate component scores
        market_score = self.calculate_market_score(token_data)
        fundamentals_score = self.calculate_fundamentals_score(symbol)
        adoption_score = self.calculate_adoption_score(symbol, token_data)
        risk_score = self.calculate_risk_score(symbol, token_data)
        
        # Calculate weighted total
        weights = self.scoring_criteria
        total_score = (
            market_score * weights['market_metrics']['weight'] +
            fundamentals_score * weights['fundamentals']['weight'] +
            adoption_score * weights['adoption_growth']['weight'] +
            risk_score * weights['risk_assessment']['weight']
        )
        
        # Determine tier
        if total_score >= 85: tier = 'S+'
        elif total_score >= 80: tier = 'S'
        elif total_score >= 75: tier = 'S-'
        elif total_score >= 70: tier = 'A+'
        elif total_score >= 65: tier = 'A'
        elif total_score >= 60: tier = 'A-'
        elif total_score >= 55: tier = 'B+'
        elif total_score >= 50: tier = 'B'
        elif total_score >= 45: tier = 'B-'
        elif total_score >= 40: tier = 'C'
        else: tier = 'D'
        
        return {
            'total_score': round(total_score, 1),
            'tier': tier,
            'scores': {
                'market': round(market_score, 1),
                'fundamentals': round(fundamentals_score, 1),
                'adoption': round(adoption_score, 1),
                'risk': round(risk_score, 1)
            },
            'market_data': token_data
        }

    def generate_s_tier_analysis(self) -> str:
        """Generate comprehensive S-Tier analysis"""
        print("Fetching enhanced market data...")
        market_data = self.fetch_enhanced_data()
        
        # Calculate scores for all tokens
        results = {}
        for symbol in self.tokens.keys():
            results[symbol] = self.calculate_s_tier_score(symbol, market_data)
        
        # Sort by total score
        sorted_results = sorted(results.items(), key=lambda x: x[1]['total_score'], reverse=True)
        
        # Generate output
        output = []
        output.append("ETHEREUM BETA PLAYS - S-TIER ANALYSIS")
        output.append("=" * 60)
        output.append(f"Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}")
        output.append("")
        
        # Tier breakdown
        tiers = {}
        for symbol, data in sorted_results:
            tier = data['tier']
            if tier not in tiers:
                tiers[tier] = []
            tiers[tier].append((symbol, data))
        
        # Display by tier
        tier_order = ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C', 'D']
        
        for tier in tier_order:
            if tier in tiers:
                output.append(f"\n[{tier} TIER]")
                output.append("-" * 20)
                
                for symbol, data in tiers[tier]:
                    token_info = self.tokens[symbol]
                    market_data = data['market_data']
                    
                    price = market_data.get('current_price', 0)
                    mcap = market_data.get('market_cap', 0)
                    
                    price_str = f"${price:.2f}" if price >= 1 else f"${price:.8f}"
                    mcap_str = f"${mcap/1e9:.2f}B" if mcap >= 1e9 else f"${mcap/1e6:.2f}M"
                    
                    output.append(f"\n{symbol} - {token_info['category']} | Score: {data['total_score']}")
                    output.append(f"  Price: {price_str} | Market Cap: {mcap_str}")
                    output.append(f"  Market: {data['scores']['market']} | Fundamentals: {data['scores']['fundamentals']}")
                    output.append(f"  Adoption: {data['scores']['adoption']} | Risk: {data['scores']['risk']}")
                    output.append(f"  Description: {token_info['description']}")
                    output.append(f"  Backing: {token_info['backing']}")
        
        # Summary statistics
        output.append(f"\n\nSUMMARY STATISTICS")
        output.append("=" * 30)
        s_tier_count = len([t for t in tiers.get('S+', [])] + [t for t in tiers.get('S', [])] + [t for t in tiers.get('S-', [])])
        output.append(f"S-Tier Tokens: {s_tier_count}/{len(results)}")
        output.append(f"Average Score: {sum(r['total_score'] for r in results.values()) / len(results):.1f}")
        
        highest_score = max(results.values(), key=lambda x: x['total_score'])
        output.append(f"Highest Score: {highest_score['total_score']} ({highest_score['tier']} tier)")
        
        return "\n".join(output)

def main():
    evaluator = STierEvaluator()
    analysis = evaluator.generate_s_tier_analysis()
    print(analysis)
    
    # Save detailed analysis
    with open('s_tier_analysis.txt', 'w', encoding='utf-8') as f:
        f.write(analysis)
    
    print(f"\nDetailed S-Tier analysis saved to: s_tier_analysis.txt")

if __name__ == "__main__":
    main()