/**
 * transcript
 * get-native.com
 *
 * Created by henryehly on 2017/02/24.
 */

const k = require('../../config/keys.json');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define(k.Model.Transcript, {
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'transcripts',
        underscored: true,
        associations: function(models) {
            models[k.Model.Transcript].belongsTo(models[k.Model.Video]);
            models[k.Model.Transcript].belongsTo(models[k.Model.Language], {as: 'language'});
            models[k.Model.Transcript].hasMany(models[k.Model.Collocation], {as: 'collocations'});
        }
    });
};