const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class Notification extends Model {}

Notification.init(
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
    message: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("SMS", "Email"), allowNull: false },
    sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "Notification", tableName: "notifications" }
);

Notification.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Notification, { foreignKey: "user_id" });

module.exports = Notification;
