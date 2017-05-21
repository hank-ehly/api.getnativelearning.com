/**
 * login.spec
 * get-native.com
 *
 * Created by henryehly on 2017/03/08.
 */

const Utility  = require('../../../app/services')['Utility'];
const SpecUtil = require('../../spec-util');

const Promise  = require('bluebird');
const assert   = require('assert');
const request  = require('supertest');
const _        = require('lodash');

describe('POST /sessions', function() {
    let server   = null;
    let response = null;

    before(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return Promise.all([SpecUtil.seedAll(), SpecUtil.startMailServer()]);
    });

    beforeEach(function() {
        return SpecUtil.login().then(function(initGroup) {
            server   = initGroup.server;
            response = initGroup.response;
        });
    });

    afterEach(function(done) {
        server.close(done);
    });

    after(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return Promise.all([SpecUtil.seedAllUndo(), SpecUtil.stopMailServer()]);
    });

    describe('response.headers', function() {
        it('should respond with an X-GN-Auth-Token header', function() {
            assert(response.headers['x-gn-auth-token'].length > 0);
        });

        it('should respond with an X-GN-Auth-Expire header containing a valid timestamp value', function() {
            assert(SpecUtil.isParsableTimestamp(+response.headers['x-gn-auth-expire']));
        });
    });

    describe('response.failure', function() {
        it('should respond with a 404 Not Found response if the user is not found', function(done) {
            request(server).post('/sessions').send({
                email: 'bad@email.com',
                password: SpecUtil.credentials.password
            }).expect(404, done);
        });

        it(`should respond with a 404 Not Found if the provided login password is incorrect`, function(done) {
            request(server).post('/sessions').send({
                email: SpecUtil.credentials.email,
                password: 'incorrect'
            }).expect(404, done);
        });
    });

    describe('response.success', function() {
        it('should respond with 201 Created', function(done) {
            request(server).post('/sessions').send(SpecUtil.credentials).expect(201, done);
        });

        it('should respond with an object containing the user\'s ID', function() {
            assert(_.isNumber(response.body.id));
        });

        it('should respond with an object containing the user\'s email address', function() {
            assert(SpecUtil.isValidEmail(response.body.email));
        });

        it('should respond with an object containing the user\'s preference for receiving browser notifications', function() {
            assert(_.isBoolean(response.body.browser_notifications_enabled));
        });

        it(`should not include the user password in the response`, function() {
            assert(!response.body.password);
        });

        it('should respond with an object containing the user\'s preference for receiving email notifications', function() {
            assert(_.isBoolean(response.body.email_notifications_enabled));
        });

        it('should respond with an object containing the user\'s email validity status', function() {
            assert(_.isBoolean(response.body.email_verified));
        });

        it('should respond with an object containing a top level default_study_language object', function() {
            assert(_.isPlainObject(response.body.default_study_language));
        });

        it('should respond with an object containing a top level default_study_language.name string', function() {
            assert(_.isString(response.body.default_study_language.name));
        });

        it('should respond with an object containing a top level default_study_language.code string', function() {
            assert(_.isString(response.body.default_study_language.code));
        });

        it('should respond with an object containing the user\'s profile picture URL', function() {
            assert(SpecUtil.isValidURL(response.body.picture_url));
        });

        it('should respond with an object containing the user\'s preference for using the profile picture or silhouette image', function() {
            assert(_.isBoolean(response.body.is_silhouette_picture));
        });
    });
});