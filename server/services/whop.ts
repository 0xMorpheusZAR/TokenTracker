/**
 * Whop API Service for Miles High Club membership verification
 * Provides read-only access to check user membership status
 */

interface WhopMembership {
  id: string;
  user_id: string;
  product_id: string;
  status: 'active' | 'expired' | 'cancelled';
  discord_account_id?: string;
  created_at: string;
  expires_at?: string;
  plan_name: string;
}

interface WhopUser {
  id: string;
  email: string;
  discord_id?: string;
  username: string;
}

export class WhopService {
  private baseUrl = 'https://api.whop.com/api/v2';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.WHOP_API_KEY || '';
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Check if a Discord user has an active Miles High Club membership
   * @param discordId - The Discord user ID
   * @returns Membership details if active, null otherwise
   */
  async checkMembership(discordId: string): Promise<WhopMembership | null> {
    if (!this.apiKey) {
      console.error('Whop API key not configured');
      return null;
    }

    try {
      // First, find the user by Discord ID
      const userResponse = await fetch(`${this.baseUrl}/users?discord_id=${discordId}`, {
        headers: this.getHeaders()
      });

      if (!userResponse.ok) {
        console.error('Failed to fetch user from Whop:', userResponse.status);
        return null;
      }

      const userData = await userResponse.json();
      if (!userData.data || userData.data.length === 0) {
        return null; // User not found
      }

      const userId = userData.data[0].id;

      // Check memberships for this user
      const membershipResponse = await fetch(
        `${this.baseUrl}/memberships?user_id=${userId}&status=active`,
        {
          headers: this.getHeaders()
        }
      );

      if (!membershipResponse.ok) {
        console.error('Failed to fetch memberships:', membershipResponse.status);
        return null;
      }

      const membershipData = await membershipResponse.json();
      
      // Find Miles High Club membership
      const mhcMembership = membershipData.data?.find((membership: WhopMembership) => 
        membership.plan_name.includes('Miles High Club') && 
        membership.status === 'active'
      );

      return mhcMembership || null;
    } catch (error) {
      console.error('Error checking Whop membership:', error);
      return null;
    }
  }

  /**
   * Get membership details by membership ID
   * @param membershipId - The membership ID
   * @returns Membership details
   */
  async getMembershipDetails(membershipId: string): Promise<WhopMembership | null> {
    if (!this.apiKey) {
      console.error('Whop API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/memberships/${membershipId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('Failed to fetch membership details:', response.status);
        return null;
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching membership details:', error);
      return null;
    }
  }

  /**
   * Verify webhook signature for security
   * @param payload - The webhook payload
   * @param signature - The webhook signature from headers
   * @returns boolean indicating if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement webhook signature verification
    // This would use HMAC-SHA256 with your webhook secret
    const crypto = require('crypto');
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET || '';
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  isConnected(): boolean {
    return !!this.apiKey;
  }

  getConnectionStatus(): { connected: boolean; hasApiKey: boolean } {
    return {
      connected: this.isConnected(),
      hasApiKey: !!this.apiKey
    };
  }
}

export const whopService = new WhopService();