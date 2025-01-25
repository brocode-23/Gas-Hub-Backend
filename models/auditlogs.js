const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class AuditLog extends Model {}

AuditLog.init(
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
    action: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "AuditLog", tableName: "audit_logs" }
);

AuditLog.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(AuditLog, { foreignKey: "user_id" });

module.exports = AuditLog;
