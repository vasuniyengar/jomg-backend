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
    paymentStatus: {
      type: DataTypes.ENUM("paid", "unpaid", "refunded"),
      allowNull: false,
      defaultValue: "paid",
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
  },
  {
    tableName: "playerregistrations",
  }
);

export default PlayerRegistration;
