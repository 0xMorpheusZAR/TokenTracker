import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { nanoid } from "nanoid";

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Setup authentication middleware
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Get the full callback URL using Replit domain
  const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  const protocol = replitDomain.includes('localhost') ? 'http' : 'https';
  const callbackURL = `${protocol}://${replitDomain}/api/auth/discord/callback`;
  
  console.log('Discord OAuth Configuration:');
  console.log('- Client ID:', process.env.DISCORD_CLIENT_ID ? 'Set' : 'Not set');
  console.log('- Client Secret:', process.env.DISCORD_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('- Callback URL:', callbackURL);

  // Discord OAuth Strategy
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID || 'your-discord-client-id',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || 'your-discord-client-secret',
    callbackURL: callbackURL,
    scope: ['identify', 'email', 'guilds']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await storage.getUserByDiscordId(profile.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          id: nanoid(),
          discordId: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          email: profile.email,
          isActive: true
        });
      }

      // Check Whop membership
      const hasWhopAccess = await checkWhopMembership(profile.id, profile.username, profile.discriminator);
      
      if (!hasWhopAccess) {
        return done(null, false, { message: 'You must be a member of Miles High Club Discord to access this platform.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth routes
  app.get('/api/auth/discord', (req, res, next) => {
    console.log('Discord auth initiated');
    passport.authenticate('discord')(req, res, next);
  });

  app.get('/api/auth/discord/callback', 
    (req, res, next) => {
      console.log('Discord callback received:', req.query);
      passport.authenticate('discord', (err, user, info) => {
        if (err) {
          console.error('Discord auth error:', err);
          return res.redirect('/login?error=auth_failed');
        }
        if (!user) {
          console.error('Discord auth failed:', info);
          return res.redirect('/login?error=access_denied');
        }
        req.logIn(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.redirect('/login?error=login_failed');
          }
          console.log('User logged in successfully:', user.username);
          return res.redirect('/');
        });
      })(req, res, next);
    }
  );

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    res.json(req.user);
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized - Please login through Miles High Club Discord' });
};

// Whitelist of authorized Discord handles for testing
const AUTHORIZED_DISCORD_HANDLES: string[] = [
  "boughtsol200"
];

// Check Whop membership (placeholder - needs actual implementation)
async function checkWhopMembership(discordId: string, username: string, discriminator?: string): Promise<boolean> {
  // For testing: Check whitelist first
  const handle = discriminator ? `${username}#${discriminator}` : username;
  if (AUTHORIZED_DISCORD_HANDLES.includes(handle)) {
    return true;
  }

  // TODO: Implement actual Whop API check
  // In production, this should verify the user's Discord ID against Whop's API
  // For now, return false to enforce whitelist
  return false;
}