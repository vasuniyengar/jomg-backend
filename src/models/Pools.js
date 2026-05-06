import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const Pool = sequelize.define(
  "Pool",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    poolName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bracketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tournamentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Pool",
  }
);

export default Pool;
