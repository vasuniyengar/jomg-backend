import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Match = sequelize.define(
  "Match",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    team1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    poolId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    roundId: {
      type: DataTypes.INTEGER,
      allowNull: false, // each match belongs to one round
    },
    status: {
      type: DataTypes.ENUM("not_started", "ongoing", "completed"),
      defaultValue: "not_started",
    },
    scoreTeam1: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    scoreTeam2: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM("pool", "playoff", "semifinal", "bronze", "gold"),
      defaultValue: "pool", // new field
    },
    // 1=WD, 2=MD, 3=X1, 4=X2, 5=Dream Breaker
    gameType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    courtAssignment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    winnerTeamId: { type: DataTypes.INTEGER, allowNull: true },
    loserTeamId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "Matches",
  }
);

export default Match;
