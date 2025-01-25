const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class MonthlyUsage extends Model {}

MonthlyUsage.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    month_year: { type: DataTypes.STRING, allowNull: false },
    tokens_used: { type: DataTypes.INTEGER, allowNull: false },
    gas_limit: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: "MonthlyUsage", tableName: "monthly_usage" }
);

MonthlyUsage.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(MonthlyUsage, { foreignKey: "user_id" });

module.exports = MonthlyUsage;
