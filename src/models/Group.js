import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const Group = sequelize.define(
  "Group",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.ENUM(
        "Men's",
        "Women's",
        "Mixed",
        "Boys",
        "Girls",
        "Junior"
      ),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "groups",
  }
);

export default Group;
