const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Outlet = require("./Outlet");

class Analytics extends Model {}

Analytics.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    outlet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Outlet, key: "id" },
    },
    total_requests: { type: DataTypes.INTEGER, allowNull: false },
    total_tokens_issued: { type: DataTypes.INTEGER, allowNull: false },
    stock_used: { type: DataTypes.INTEGER, allowNull: false },
    last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "Analytics", tableName: "analytics" }
);

Analytics.belongsTo(Outlet, { foreignKey: "outlet_id" });

module.exports = Analytics;
