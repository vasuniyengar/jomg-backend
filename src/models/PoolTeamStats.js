import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const PoolTeamStats = sequelize.define(
  "PoolTeamStats",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    poolId: { type: DataTypes.INTEGER, allowNull: false },
    teamId: { type: DataTypes.INTEGER, allowNull: false },
    wins: { type: DataTypes.INTEGER, defaultValue: 0 },
    losses: { type: DataTypes.INTEGER, defaultValue: 0 },
    pointsFor: { type: DataTypes.INTEGER, defaultValue: 0 },
    pointsAgainst: { type: DataTypes.INTEGER, defaultValue: 0 },
    pointDifference: { type: DataTypes.INTEGER, defaultValue: 0 },
    pdPercent: { type: DataTypes.FLOAT, defaultValue: 0 },

    // Playoff-specific stats
    playoffSeed: { type: DataTypes.INTEGER },
    playoffWins: { type: DataTypes.INTEGER, defaultValue: 0 },
    playoffPointsFor: { type: DataTypes.INTEGER, defaultValue: 0 },
    playoffPointsAgainst: { type: DataTypes.INTEGER, defaultValue: 0 },
    playoffPointDifference: { type: DataTypes.INTEGER, defaultValue: 0 },
    finalRank: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "poolteamstats",
    indexes: [
      { unique: true, fields: ["poolId", "teamId"] },
      { fields: ["poolId", "wins", "pointDifference"] },
    ],
  }
);

export default PoolTeamStats;
