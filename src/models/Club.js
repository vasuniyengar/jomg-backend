import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";

const Club = sequelize.define(
  "Club",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clubType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "clubs",
  }
);

// Associations
Club.belongsTo(User, { foreignKey: "hostId", as: "host" });
User.hasMany(Club, { foreignKey: "hostId", as: "clubs" });

export default Club;
