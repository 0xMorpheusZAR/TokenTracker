import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// Generate OAuth URL manually
export function generateDiscordOAuthURL(host: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = `https://${host}/api/auth/discord/callback`;
  const scope = 'identify email guilds';
  const state = crypto.randomBytes(16).toString('hex');
  
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    state: state
  });
  
  return {
    url: `https://discord.com/api/oauth2/authorize?${params.toString()}`,
    state: state
  };
}

// Manual Discord OAuth routes
router.get('/auth/discord', (req, res) => {
  const host = req.get('host') || '';
  const { url, state } = generateDiscordOAuthURL(host);
  
  // Store state in session for CSRF protection
  req.session!.discordState = state;
  
  console.log('Manual Discord OAuth redirect:', url);
  res.redirect(url);
});

router.get('/auth/discord/callback', async (req, res) => {
  const { code, state } = req.query;
  
  console.log('Discord callback received:', { code: !!code, state });
  
  // Verify state for CSRF protection
  if (state !== req.session!.discordState) {
    console.error('State mismatch - possible CSRF attack');
    return res.redirect('/login?error=invalid_state');
  }
  
  if (!code) {
    console.error('No authorization code received');
    return res.redirect('/login?error=no_code');
  }
  
  try {
    // Exchange code for tokens
    const host = req.get('host') || '';
    const redirectUri = `https://${host}/api/auth/discord/callback`;
    
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokens);
      return res.redirect('/login?error=token_exchange_failed');
    }
    
    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    const discordUser = await userResponse.json();
    console.log('Discord user authenticated:', discordUser.username);
    
    // Whitelist check
    const whitelist = ['boughtsol200.']; // Your Discord username with period
    if (!whitelist.includes(discordUser.username)) {
      console.log('User not whitelisted:', discordUser.username);
      return res.redirect('/login?error=not_whitelisted');
    }
    
    // Store user in session
    req.session!.user = {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email
    };
    
    res.redirect('/');
  } catch (error) {
    console.error('Discord auth error:', error);
    res.redirect('/login?error=auth_failed');
  }
});

export default router;