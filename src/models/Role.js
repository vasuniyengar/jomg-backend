import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM("host", "player", "organizer", "super_admin"),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "roles",
  }
);

export default Role;
