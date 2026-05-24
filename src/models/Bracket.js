import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const Bracket = sequelize.define(
  "Bracket",
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
    maxTeams: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    maxAge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    minRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bracketFormatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    scoringListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    playoffSeedingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    playoffMatchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semiFinalMatchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bronzeMatchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    goldMatchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roundId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tournamentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    poolStarted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("active", "draft", "ongoing", "completed"),
      defaultValue: "draft",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    registrationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    scoringConfig: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "brackets",
  }
);

export default Bracket;
