const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Outlet = require("./Outlet");
const Token = require("./token");

class Request extends Model {}

Request.init(
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
    toemail: { type: DataTypes.STRING, allowNull: false },
    outlet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Outlet, key: "id" },
    },
    token_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Token, key: "id" },
    },
    type: {
      type: DataTypes.ENUM("Industry", "Business", "Individual"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      allowNull: false,
    },
    requested_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "Request", tableName: "requests" }
);

Request.belongsTo(User, { foreignKey: "user_id" });
Request.belongsTo(Outlet, { foreignKey: "outlet_id" });
Request.belongsTo(Token, { foreignKey: "token_id" });

module.exports = Request;
