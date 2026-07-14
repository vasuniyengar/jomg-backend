import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Team = sequelize.define(
  "Team",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamName: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // edited by host later
    bracketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tournamentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "registered",
        "checked-in",
        "active",
        "waitlist",
        "pending_payment",
        "withdrawn",
        "forfeited"
      ),
      defaultValue: "registered",
    },
    paymentStatus: {
      type: DataTypes.ENUM("paid", "unpaid", "pending"),
      allowNull: true,
      defaultValue: "paid",
    },
    isComplete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    standingsPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "teams",
  }
);

export default Team;
