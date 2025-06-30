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

  // Discord OAuth Strategy
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID || 'your-discord-client-id',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || 'your-discord-client-secret',
    callbackURL: process.env.DISCORD_CALLBACK_URL || '/api/auth/discord/callback',
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
      const hasWhopAccess = await checkWhopMembership(profile.id);
      
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
  app.get('/api/auth/discord', passport.authenticate('discord'));

  app.get('/api/auth/discord/callback', 
    passport.authenticate('discord', { 
      failureRedirect: '/login?error=access_denied' 
    }),
    (req, res) => {
      res.redirect('/');
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

// Check Whop membership (placeholder - needs actual implementation)
async function checkWhopMembership(discordId: string): Promise<boolean> {
  // TODO: Implement actual Whop API check
  // For now, this is a placeholder that always returns true
  // In production, this should verify the user's Discord ID against Whop's API
  return true;
}