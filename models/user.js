module.exports = function(sequelize, DataTypes) {
    var users = sequelize.define("user", {
        email: DataTypes.STRING,
        username: DataTypes.STRING,
        description: DataTypes.STRING,
        image: DataTypes.STRING
    });
    return users;
};