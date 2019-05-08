module.exports = function(sequelize, DataTypes) {
    var userfriends = sequelize.define("userfriends", {
        userId1: {
            type: DataTypes.INTEGER,
            references: {
                model: "users", // 'users' refers to table name
                key: "id", // 'id' refers to column name in users table
            }
        },
        userId2: {
            type: DataTypes.INTEGER,
            references: {
                model: "users", // 'users' refers to table name
                key: "id", // 'id' refers to column name in users table
            }
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });
    return userfriends;
};