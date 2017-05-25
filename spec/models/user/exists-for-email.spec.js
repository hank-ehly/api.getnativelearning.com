/**
 * exists-for-email.spec
 * api.get-native.com
 *
 * Created by henryehly on 2017/05/25.
 */

const SpecUtil = require('../../spec-util');
const k = require('../../../config/keys.json');
const db = require('../../../app/models');
const Credential = db[k.Model.Credential];
const Language = db[k.Model.Language];

const chance = require('chance').Chance();
const assert = require('assert');
const mocha = require('mocha');
const describe = mocha.describe;
const before = mocha.before;
const beforeEach = mocha.beforeEach;
const after = mocha.after;
const afterEach = mocha.afterEach;
const it = mocha.it;

describe('User.existsForEmail', function() {
    let user = null;

    before(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return Promise.join(SpecUtil.seedAll(), SpecUtil.startMailServer());
    });

    beforeEach(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return Language.findOne().then(function(language) {
            return User.create({
                default_study_language_id: language.get(k.Attr.Id),
                email: chance.email()
            });
        }).then(function(_user) {
            user = _user;
            return Credential.create({user_id: user.get(k.Attr.Id)});
        });
    });

    after(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return Promise.join(SpecUtil.seedAllUndo(), SpecUtil.stopMailServer());
    });

    describe('existsForEmail', function() {
        it(`should return true if a user exists for a given email address`, async function() {
            return assert(await User.existsForEmail(user.email));
        });

        it(`should return false if a user does not exist for a given email address`, function() {
            return User.existsForEmail('nonexistent@email.com').then(function(exists) {
                assert(!exists);
            });
        });

        it(`should throw a TypeError if the first argument is not an email address`, function() {
            assert.throws(function() {
                User.existsForEmail(123);
            }, TypeError);
        });
    });
});