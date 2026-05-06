import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Round = sequelize.define(
  "Round",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    poolId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    roundNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "ongoing", "completed"),
      defaultValue: "pending",
    },
    bracketId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null for pool rounds
    },
    type: {
      type: DataTypes.ENUM(
        "pool", // normal pool play
        "round_of_32", // playoffs
        "round_of_16",
        "quarterfinal",
        "semifinal",
        "bronze",
        "gold" // final match
      ),
      allowNull: false,
      defaultValue: "pool",
    },
  },
  {
    tableName: "rounds",
  }
);

export default Round;
