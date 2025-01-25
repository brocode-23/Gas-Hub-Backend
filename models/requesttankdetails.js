const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Request = require("./Request");

class RequestTankDetails extends Model {}

RequestTankDetails.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Request, key: "id" },
    },
    tank_type: {
      type: DataTypes.ENUM("12.5kg", "5kg", "2kg"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "RequestTankDetails",
    tableName: "request_tank_details",
  }
);

RequestTankDetails.belongsTo(Request, { foreignKey: "request_id" });
Request.hasMany(RequestTankDetails, { foreignKey: "request_id" });

module.exports = RequestTankDetails;
