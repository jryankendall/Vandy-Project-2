module.exports = function(sequelize, DataTypes) {
    var appids = sequelize.define("appids", {
        appid: DataTypes.INTEGER,
        name: DataTypes.STRING
    });
    return appids;
};
