const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class Outlet extends Model {}

Outlet.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    stock_level: { type: DataTypes.INTEGER, allowNull: false },
    manager_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: "Outlet", tableName: "outlets" }
);

Outlet.belongsTo(User, { foreignKey: "manager_id" });
User.hasMany(Outlet, { foreignKey: "manager_id" });

module.exports = Outlet;
