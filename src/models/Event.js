import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ensures no duplicate event names globally
    },
  },
  {
    tableName: "events",
  }
);

export default Event;
