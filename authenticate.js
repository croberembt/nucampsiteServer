const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); 
const JwtStrategy = require('passport-jwt').Strategy; // import jwt strategy from passport
const ExtractJwt = require('passport-jwt').ExtractJwt; // import extract jwt module from passport
const jwt = require('jsonwebtoken'); // used to create, sign and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token'); 

const config = require('./config.js'); // import config file
const { NotExtended } = require('http-errors');

exports.local = passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

exports.getToken = function(user) { // function that receives the object user that contains an ID for a user document and returns a token
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {}; // will contain options for jwt strategy
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // configuring to send a bearer token as an authorization header
opts.secretOrKey = config.secretKey; 

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false); 
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false}); 


exports.verifyAdmin = ((req, res, next) => {
    console.log(req.user.admin);
    if (req.user.admin === true) {
        return next();
    } else {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
});

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user); 
                        }
                    });
                }
            });
        }
    )
);



