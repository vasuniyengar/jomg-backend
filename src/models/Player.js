import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Player = sequelize.define(
  "Player",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    initials: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.ENUM("M", "F"),
      allowNull: false,
    },
    age: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    partner: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    partner_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    division: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    dupr: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    paid: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paid_class: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status_class: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "players",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Player;