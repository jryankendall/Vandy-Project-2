module.exports = function(sequelize, DataTypes) {
    var usergames = sequelize.define("usergames", {
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: "users", // 'persons' refers to table name
                key: "id", // 'id' refers to column name in persons table
            }
        },
        gameId: {
            type: DataTypes.INTEGER,
            references: {
                model: "appids", // 'persons' refers to table name
                key: "id", // 'id' refers to column name in persons table
            }
        }
    });
    return usergames;
};