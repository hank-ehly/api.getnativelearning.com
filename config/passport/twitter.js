/**
 * twitter
 * api.get-native.com
 *
 * Created by henryehly on 2017/05/24.
 */

const config   = require('../application').config;
const k        = require('../keys.json');
const User     = require('../../app/models')[k.Model.User];

const Strategy = require('passport-twitter').Strategy;

const strategy = new Strategy({
    consumerKey: config.get(k.OAuth.Twitter.ConsumerKey),
    consumerSecret: config.get(k.OAuth.Twitter.ConsumerSecret),
    callbackURL: config.get(k.OAuth.Twitter.CallbackURL),
    includeEmail: true
}, async (token, tokenSecret, profile, callback) => {
    return callback(null, await User.findOrCreateFromPassportProfile(profile));
});

module.exports = strategy;
