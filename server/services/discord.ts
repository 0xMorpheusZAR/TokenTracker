/**
 * Discord OAuth Service for authentication
 * Handles Discord login flow and user data retrieval
 */

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
  verified?: boolean;
  mfa_enabled?: boolean;
  global_name?: string;
}

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export class DiscordService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private apiBaseUrl = 'https://discord.com/api/v10';

  constructor() {
    this.clientId = process.env.DISCORD_CLIENT_ID || '';
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    this.redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/discord/callback';
  }

  /**
   * Generate OAuth2 authorization URL
   * @param state - CSRF protection state parameter
   * @returns Discord OAuth2 authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'identify email guilds.members.read',
      state
    });

    return `https://discord.com/api/oauth2/authorize?${params}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from Discord
   * @returns Token response or null
   */
  async exchangeCodeForToken(code: string): Promise<DiscordTokenResponse | null> {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri
      });

      const response = await fetch(`${this.apiBaseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        console.error('Failed to exchange code for token:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return null;
    }
  }

  /**
   * Get Discord user information
   * @param accessToken - Discord access token
   * @returns Discord user data or null
   */
  async getUserInfo(accessToken: string): Promise<DiscordUser | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error('Failed to get user info:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  /**
   * Check if user is member of Miles High Club Discord
   * @param accessToken - Discord access token
   * @param guildId - Discord server ID for Miles High Club
   * @returns boolean indicating membership
   */
  async checkGuildMembership(accessToken: string, guildId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error('Failed to get user guilds:', response.status);
        return false;
      }

      const guilds = await response.json();
      return guilds.some((guild: any) => guild.id === guildId);
    } catch (error) {
      console.error('Error checking guild membership:', error);
      return false;
    }
  }

  /**
   * Refresh access token
   * @param refreshToken - Discord refresh token
   * @returns New token response or null
   */
  async refreshAccessToken(refreshToken: string): Promise<DiscordTokenResponse | null> {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });

      const response = await fetch(`${this.apiBaseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        console.error('Failed to refresh token:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  getConnectionStatus(): { configured: boolean; hasCredentials: boolean } {
    return {
      configured: this.isConfigured(),
      hasCredentials: !!(this.clientId && this.clientSecret)
    };
  }
}

export const discordService = new DiscordService();