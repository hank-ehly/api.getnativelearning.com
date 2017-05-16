/**
 * writing-answer
 * get-native.com
 *
 * Created by henryehly on 2017/02/24.
 */

const k = require('../../config/keys.json');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(k.Model.WritingAnswer, {
        answer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        words_per_minute: DataTypes.INTEGER,
        word_count: DataTypes.INTEGER
    }, {
        tableName: 'writing_answers',
        underscored: true,
        associations: function(models) {
            models[k.Model.WritingAnswer].belongsTo(models[k.Model.StudySession], {as: 'study_session'});
            models[k.Model.WritingAnswer].belongsTo(models[k.Model.WritingQuestion], {as: 'writing_question'});
        },
        scopes: {
            newestFirst: {
                order: [[k.Attr.CreatedAt, 'DESC']]
            },
            forUser: function(userId) {
                return {
                    where: {
                        study_session_id: {
                            $in: sequelize.literal(`(SELECT \`id\` FROM \`study_sessions\` WHERE \`user_id\` = ${userId})`)
                        }
                    }
                };
            },
            forUserWithLang: function(userId, lang) {
                return {
                    where: {
                        study_session_id: {
                            $in: sequelize.literal(`(
                                SELECT id
                                FROM study_sessions
                                WHERE video_id IN (
                                    SELECT videos.id
                                    FROM videos
                                    LEFT JOIN languages ON videos.language_id = languages.id
                                    WHERE languages.code = '${lang}'
                                ) AND user_id = '${userId}'
                            )`)
                        }
                    }
                }
            },
            since: function(since) {
                if (!since) {
                    return {};
                }

                return {
                    where: {
                        created_at: {
                            $gte: new Date(+since)
                        }
                    }
                }
            },
            maxId: function(maxId) {
                if (!maxId) {
                    return {};
                }

                return {
                    where: {
                        id: {
                            $gte: +maxId
                        }
                    }
                }
            }
        }
    });
};
