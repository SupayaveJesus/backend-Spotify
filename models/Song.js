const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
    const Song = sequelize.define(
        'Song',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            file: {
                type: DataTypes.STRING,
                allowNull: false
            },
            albumId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        }
    );
    return Song;
};