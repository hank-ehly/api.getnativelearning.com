/**
 * queue.spec
 * get-native.com
 *
 * Created by henryehly on 2017/04/28.
 */

const SpecUtil = require('../../spec-util');
const k        = require('../../../config/keys.json');

const Promise = require('bluebird');
const request = require('supertest');
const assert  = require('assert');
const _       = require('lodash');

describe('POST /videos/:id/queue', function() {
    let authorization  = null;
    let sampleVideo    = null;
    let server         = null;
    let user           = null;
    let db             = null;

    before(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return Promise.join(SpecUtil.seedAll(), SpecUtil.startMailServer());
    });

    beforeEach(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return SpecUtil.login().then(function(initGroup) {
            authorization = initGroup.authorization;
            server        = initGroup.server;
            user          = initGroup.response.body;
            db            = initGroup.db;

            return db.sequelize.query(`
                SELECT * FROM videos WHERE id NOT IN (
                    SELECT video_id FROM cued_videos WHERE user_id = ?
                ) LIMIT 1;
            `, {replacements: [user[k.Attr.Id]]}).spread(function(video) {
                sampleVideo = _.first(video);
            });
        });
    });

    afterEach(function(done) {
        server.close(done);
    });

    after(function() {
        this.timeout(SpecUtil.defaultTimeout);
        return Promise.join(SpecUtil.seedAllUndo(), SpecUtil.stopMailServer());
    });

    describe('response.headers', function() {
        it('should respond with an X-GN-Auth-Token header', function() {
            return request(server).post(`/videos/${sampleVideo[k.Attr.Id]}/queue`).set('authorization', authorization).then(function(response) {
                assert(_.gt(response.header[k.Header.AuthToken].length, 0));
            });
        });

        it('should respond with an X-GN-Auth-Expire header containing a valid timestamp value', function() {
            return request(server).post(`/videos/${sampleVideo[k.Attr.Id]}/queue`).set('authorization', authorization).then(function(response) {
                assert(SpecUtil.isParsableTimestamp(+response.header[k.Header.AuthExpire]));
            });
        });
    });

    describe('response.success', function() {
        it(`should return 204 No Content for a valid request`, function(done) {
            request(server).post(`/videos/${sampleVideo[k.Attr.Id]}/queue`).set('authorization', authorization).expect(204, done);
        });

        it(`should not contain a response body`, function() {
            return request(server).post(`/videos/${sampleVideo[k.Attr.Id]}/queue`).set('authorization', authorization).then(function(response) {
                assert.equal(_.size(response.body), 0);
            });
        });

        it(`should add the appropriate video to the appropriate queue`, function() {
            return request(server).post(`/videos/${sampleVideo[k.Attr.Id]}/queue`).set('authorization', authorization).then(function(response) {
                return db[k.Model.CuedVideo].findOne({
                    where: {
                        user_id: user[k.Attr.Id],
                        video_id: sampleVideo[k.Attr.Id]
                    }
                });
            }).then(function(queuedVideo) {
                assert(queuedVideo);
            });
        });
    });

    describe('response.failure', function() {
        it(`should respond with 401 Unauthorized if the request does not contain an 'authorization' header`, function(done) {
            request(server).post(`/videos/${sampleVideo[k.Attr.Id]}/queue`).expect(401, done);
        });

        it(`should respond with 400 Bad Request if the 'id' parameter is not a number`, function(done) {
            request(server).post(`/videos/not_a_number/queue`).set('authorization', authorization).expect(400, done);
        });

        it(`should respond with 400 Bad Request if the 'id' parameter is a negative number`, function(done) {
            request(server).post(`/videos/-50/queue`).set('authorization', authorization).expect(400, done);
        });

        it(`should respond with 400 Bad Request if the 'id' parameter is 0`, function(done) {
            request(server).post(`/videos/0/queue`).set('authorization', authorization).expect(400, done);
        });
    });
});
