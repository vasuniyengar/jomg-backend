import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const BracketFormat = sequelize.define(
  "BracketFormat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.ENUM(
        "single Elimination",
        "Double Elimination",
        "Round Robin",
        "Double Round Robin"
      ),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.ENUM(
        "Single elimination with gold and silver medals",
        "The winner of the consolation for the gold medal.",
        "All teams play against each other one time.",
        "All teams play against each other two times."
      ),
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
    tableName: "bracketformats",
  }
);

export default BracketFormat;
