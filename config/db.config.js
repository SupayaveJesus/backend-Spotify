const {Sequelize} = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
})

sequelize.authenticate()
.then(() => {
    console.log("db connected");
}).catch((err) => {
    console.log("db connection failed", err);
})
module.exports = {
    sequelize,
    Sequelize
};