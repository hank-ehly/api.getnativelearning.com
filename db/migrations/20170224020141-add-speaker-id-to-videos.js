/**
 * 20170224020141-add-speaker-id-to-videos
 * api.getnative.org
 *
 * Created by henryehly on 2017/02/24.
 */

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn('videos', 'speaker_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'speakers',
                key: 'id'
            },
            onUpdate: 'restrict',
            onDelete: 'restrict'
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn('videos', 'speaker_id');
    }
};
