const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Outlet = require("./Outlet");

class OutletStock extends Model {}

OutletStock.init(
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
    tank_type: {
      type: DataTypes.ENUM("12.5kg", "5kg", "2.3kg", "2kg"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, modelName: "OutletStock", tableName: "outlet_stock" }
);

OutletStock.belongsTo(Outlet, { foreignKey: "outlet_id" });
Outlet.hasMany(OutletStock, { foreignKey: "outlet_id" });

module.exports = OutletStock;
