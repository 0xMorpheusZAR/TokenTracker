# Blofin Announcement Feed Integration

## Executive Summary for Blofin Team

We're integrating Blofin's Announcement Center and price pump alerts into our cryptocurrency analytics dashboard to drive user engagement and trading volume through Miles Deutscher's referral partnership.

### Key Points:
- **Read-only integration** using public APIs (no authentication required)
- **Low-frequency polling** (60-second intervals) to minimize server load
- **Real-time newsfeed** showing new listings, promotions, and price pumps
- **Direct trading links** with referral tracking to drive volume
- **Seamless user experience** matching Blofin's in-app alerts

## Technical Implementation Overview

### 1. Data Sources

#### Announcement Center API (Zendesk)
- **Endpoint**: `https://blofin.zendesk.com/api/v2/help_center/en-us/sections/{section_id}/articles.json`
- **Categories Monitored**:
  - Spot Listing (Section ID: 11892707214991)
  - Futures Listing (Section ID: 6200516139919)
  - Latest News
  - Latest Promotions
- **Method**: HTTP GET requests (public, no auth required)
- **Frequency**: Every 60 seconds

#### Market Data API
- **Endpoint**: `/api/v1/market/tickers`
- **Purpose**: Monitor price movements for pump alerts
- **Threshold**: 5% price increase within 5 minutes
- **Alternative**: WebSocket connection for real-time updates

### 2. Integration Features

#### New Listing Alerts
```
📢 BloFin Lists VELVET/USDT on Spot
Deposits open 12:00 UTC, trading starts 12:30 UTC
[Trade on Blofin] → https://blofin.com/spot/VELVET-USDT
```

#### Price Pump Alerts
```
📈 BTC surged +7.2% in the last 5 minutes on BloFin!
[Trade Now] → https://blofin.com/futures/BTC-USDT
```

#### Promotion Notifications
```
🎉 Pump & Win: 20,000 USDT Bonus Challenge
Participate in BloFin's latest trading competition
[Learn More] → [announcement link]
```

### 3. Implementation Details

#### Backend Service Architecture
```javascript
// Announcement Polling Service
class BloffinAnnouncementService {
  async pollAnnouncements() {
    const sections = [
      { id: '11892707214991', type: 'spot' },
      { id: '6200516139919', type: 'futures' }
    ];
    
    for (const section of sections) {
      const articles = await this.fetchArticles(section.id);
      const newAnnouncements = this.filterNewArticles(articles);
      await this.processAnnouncements(newAnnouncements, section.type);
    }
  }
  
  async fetchArticles(sectionId) {
    const response = await fetch(
      `https://blofin.zendesk.com/api/v2/help_center/en-us/sections/${sectionId}/articles.json`
    );
    return response.json();
  }
}

// Price Pump Monitor
class PumpAlertService {
  async checkPricePumps() {
    const tickers = await this.fetchTickers();
    const pumps = this.detectPumps(tickers);
    await this.createPumpAlerts(pumps);
  }
  
  async fetchTickers() {
    const response = await fetch('https://api.blofin.com/api/v1/market/tickers');
    return response.json();
  }
  
  detectPumps(tickers) {
    return tickers.filter(ticker => {
      const priceChange5Min = this.calculate5MinChange(ticker);
      return priceChange5Min > 5.0; // 5% threshold
    });
  }
}
```

#### Trading Link Generation
```javascript
function generateTradingLink(announcement) {
  const { symbol, market, type } = parseAnnouncement(announcement);
  
  // Extract trading pair (e.g., VELVET/USDT → VELVET-USDT)
  const tradingPair = symbol.replace('/', '-');
  
  // Generate appropriate trading URL
  if (type === 'spot') {
    return `https://blofin.com/spot/${tradingPair}`;
  } else if (type === 'futures') {
    return `https://blofin.com/futures/${tradingPair}`;
  }
  
  // Append referral tracking
  return appendReferralCode(url);
}
```

### 4. Referral Integration

All trading links will include Miles Deutscher's referral tracking:
- New users: Route through `https://blofin.com/invite/MilesDeutscher`
- Existing users: Direct trading links with referral parameters

### 5. API Usage & Rate Limits

#### Announcement Center (Zendesk)
- **Requests**: ~4 per minute (one per section)
- **Data Size**: ~50KB per request
- **Total Daily**: ~5,760 requests
- **Impact**: Minimal (read-only, public API)

#### Market Data API
- **Requests**: 1 per minute (all tickers in single call)
- **Data Size**: ~100KB per request
- **Total Daily**: ~1,440 requests
- **Alternative**: Single WebSocket connection

### 6. Integration with Existing Dashboard

The Blofin feed will be integrated into our existing Velo News Dashboard:
- Unified newsfeed showing both Velo news and Blofin announcements
- Consistent UI/UX with neon green/purple styling
- 10-second refresh for Velo news, 60-second for Blofin
- Separate tabs for filtering by source

## Development Requirements

### Environment Variables
```bash
# Blofin API Configuration
BLOFIN_API_BASE_URL=https://api.blofin.com
BLOFIN_HELP_CENTER_URL=https://blofin.zendesk.com/api/v2/help_center
BLOFIN_REFERRAL_CODE=MilesDeutscher

# Section IDs
BLOFIN_SPOT_LISTING_SECTION=11892707214991
BLOFIN_FUTURES_LISTING_SECTION=6200516139919
```

### Database Schema
```sql
-- Store processed announcements to avoid duplicates
CREATE TABLE blofin_announcements (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'spot', 'futures', 'news', 'promotion'
  article_url TEXT NOT NULL,
  trading_url TEXT,
  published_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track price pumps for alerts
CREATE TABLE blofin_pump_alerts (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(50) NOT NULL,
  price_change DECIMAL(10, 2) NOT NULL,
  time_window INTEGER NOT NULL, -- in minutes
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing Plan

### 1. Announcement Polling
- Verify correct parsing of spot/futures listing titles
- Test trading link generation for various symbols
- Ensure duplicate announcements aren't processed

### 2. Price Pump Detection
- Simulate price movements with test data
- Verify 5% threshold triggers correctly
- Test alert frequency limiting

### 3. Referral Tracking
- Confirm referral code is properly appended
- Test new user flow through invite link
- Verify tracking for existing users

## Benefits for Blofin

1. **Increased Trading Volume**: Real-time alerts drive immediate trading activity
2. **User Acquisition**: New users through Miles Deutscher's audience
3. **Minimal Infrastructure Impact**: Read-only, low-frequency polling
4. **Enhanced User Experience**: Users get Blofin updates without leaving our platform

## Next Steps

1. **API Access Confirmation**: Verify public API endpoints remain accessible
2. **Referral Setup**: Confirm referral tracking implementation details
3. **Threshold Tuning**: Align pump alert thresholds with Blofin's criteria
4. **Testing Environment**: Set up staging environment for integration testing
5. **Go-Live Coordination**: Schedule launch with Blofin team

## Contact & Support

For technical questions or coordination:
- **Our Team**: [Your contact info]
- **Integration Lead**: [Technical lead contact]
- **Miles Deutscher**: [Referral partnership contact]

---

We're excited to integrate Blofin's dynamic content into our platform and drive significant trading volume through this partnership. This read-only, efficient integration will benefit both our users and Blofin's growth objectives.