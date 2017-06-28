/**
 * application
 * api.get-native.com
 *
 * Created by henryehly on 2017/05/22.
 */

const logger = require('./logger');
const k = require('./keys.json');

const nconf = require('nconf');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

function Config() {
    nconf.env([k.API.Port, k.Debug, k.NODE_ENV]).use('memory');

    /* Normalized run-environment value */
    nconf.set(k.ENVIRONMENT, _.toLower(nconf.get(k.NODE_ENV) || k.Env.Development));

    let config = {};

    try {
        config = require(path.resolve(__dirname, 'environments', nconf.get(k.ENVIRONMENT)));
    } catch (e) {
        if (_.isError(e) && e.code === 'MODULE_NOT_FOUND') {
            logger.info(`${_.capitalize(nconf.get(k.ENVIRONMENT))} environment configuration file missing. Ignoring.`);
        } else {
            throw e;
        }
    }

    config = _.defaults(config, require(path.resolve(__dirname, 'environments', 'default')));

    for (let key in config) {
        nconf.set(key, config[key]);
    }

    if (!_.includes([k.Env.CircleCI, k.Env.Test], nconf.get(k.ENVIRONMENT))) {
        nconf.set(k.GoogleCloud.KeyFilename, path.resolve(__dirname, 'secrets', 'gcloud-credentials.json'));
    }

    const jwtKeyPair = require('./secrets/jwt-keypair.json');
    nconf.set(k.PrivateKey, jwtKeyPair.privateKey);
    nconf.set(k.PublicKey, jwtKeyPair.publicKey);

    nconf.set(k.VideoLanguageCodes, ['en', 'ja']);
    nconf.set(k.TempDir, fs.mkdtempSync('/tmp/com.get-native.'));
}

Config.prototype.get = function(key) {
    return nconf.get(key);
};

const config = new Config();

module.exports.config = config;
