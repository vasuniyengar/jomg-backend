import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const playerBracket = sequelize.define(
  "playerBracket",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tournamentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bracketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("registered", "checked-in"),
      defaultValue: "registered",
    },
  },
  {
    tableName: "playerbrackets",
  }
);

export default playerBracket;
