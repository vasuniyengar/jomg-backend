import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const PlayoffSeeding = sequelize.define(
  "playoffSeeding",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "playoffseedings",
  }
);

export default PlayoffSeeding;
