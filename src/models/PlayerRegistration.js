import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const PlayerRegistration = sequelize.define(
  "PlayerRegistration",
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
    partnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "all",
        "registered",
        "completed",
        "not_registered",
        "withdraw"
      ),
      allowNull: false,
      defaultValue: "registered",
    },
   
    paymentEmailSentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    checkInStatus: {
      type: DataTypes.ENUM("not_checked_in", "checked_in"),
      allowNull: false,
      defaultValue: "not_checked_in",
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rosterNumber: {        
      type: DataTypes.STRING,
      allowNull: true,
    },
    playerRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   
    clubName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     division: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "playerregistrations",
  }
);

export default PlayerRegistration;
