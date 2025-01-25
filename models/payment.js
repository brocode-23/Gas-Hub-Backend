const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Token = require("./token");

class Payment extends Model {}

Payment.init(
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
    token_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Token, key: "id" },
    },
    amount: { type: DataTypes.DECIMAL, allowNull: false },
    payment_method: {
      type: DataTypes.ENUM("Credit Card", "Bank Transfer", "Cash"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Completed", "Failed"),
      allowNull: false,
    },
    paid_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "Payment", tableName: "payments" }
);

Payment.belongsTo(User, { foreignKey: "user_id" });
Payment.belongsTo(Token, { foreignKey: "token_id" });

module.exports = Payment;
