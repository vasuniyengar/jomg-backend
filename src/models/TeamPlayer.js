import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const TeamPlayer = sequelize.define(
  "teamPlayer",
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
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("player", "partner", "host"),
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["playerId", "teamId"],
      },
    ],
    tableName: "teamplayers",
  }
);

export default TeamPlayer;
