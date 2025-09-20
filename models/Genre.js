const {DataTypes} = require('sequelize');
module.exports = function(sequelize){
    const Genre = sequelize.define(
        'Genre',
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
    return Genre;
}