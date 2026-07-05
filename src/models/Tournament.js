import sequelize from "../config/database.js";
import { resolveMediaUrl, extractMediaKey } from "../services/tournamentMediaService.js";

import { DataTypes } from "sequelize";

const Tournament = sequelize.define(
  "Tournament",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    entryFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tournamentTumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("tournamentTumbnail");
        return resolveMediaUrl(rawValue);
      },
      set(value) {
        if (!value) {
          this.setDataValue("tournamentTumbnail", null);
          return;
        }

        this.setDataValue("tournamentTumbnail", extractMediaKey(value));
      },
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    registrationOpenDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    registrationCloseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    refundDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    refundFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    duprRecorded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    duprEnforced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    requireSkillRating: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "ongoing", "completed"),
      allowNull: false,
    },
    organizerInfo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    clubId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hostId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "tournaments",
  }
);

export default Tournament;
