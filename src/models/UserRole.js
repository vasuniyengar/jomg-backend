import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const UserRole = sequelize.define(
  "UserRole",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    tableName: "userroles",
  }
);

export default UserRole;
