const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); 
const JwtStrategy = require('passport-jwt').Strategy; // import jwt strategy from passport
const ExtractJwt = require('passport-jwt').ExtractJwt; // import extract jwt module from passport
const jwt = require('jsonwebtoken'); // used to create, sign and verify tokens

const config = require('./config.js'); // import config file

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
