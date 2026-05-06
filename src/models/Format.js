import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const Format = sequelize.define(
  "Format",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.ENUM("Double's", "Single's", "Mlp", "Triples"),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "formats",
  }
);

export default Format;
