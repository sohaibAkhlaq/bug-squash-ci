const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          // Try finding by email
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Link google account
            user.googleId = profile.id;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              role: 'viewer', // Default role
              isActive: true
            });
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.warn('⚠️ Google OAuth credentials missing. Google Login will be disabled.');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
