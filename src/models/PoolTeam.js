import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const PoolTeam = sequelize.define(
  "PoolTeam",
  {
    poolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "PoolTeam",
  }
);

export default PoolTeam;
