const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class Token extends Model {}

Token.init(
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
    token_code: { type: DataTypes.STRING, unique: true, allowNull: false },
    status: {
      type: DataTypes.ENUM("Pending", "Active", "Expired", "Cancelled", "Paid"),
      allowNull: false,
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expected_pickup_date: { type: DataTypes.DATE, allowNull: true },
    expiration_date: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "Token", tableName: "tokens" }
);

Token.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Token, { foreignKey: "user_id" }); //One-to-many relationship ekak hada ganna.

module.exports = Token;
