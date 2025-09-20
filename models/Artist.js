const {DataTypes} = require('sequelize');
module.exports = function(sequelize){
    const Artist = sequelize.define(
        'Artist',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            image: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }
    );
    return Artist;
}