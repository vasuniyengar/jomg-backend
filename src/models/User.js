import sequelize from "../config/database.js";

import { DataTypes } from "sequelize";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // required only for local
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "local",
    }, // local, google, facebook, apple
    providerId: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // provider-specific ID
    profilePicture: {
      type: DataTypes.STRING,
    },
    // refreshToken: {
    //   type: DataTypes.TEXT, // or STRING if you prefer
    //   allowNull: true,
    // },
    duprRating: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true,
      validate: {
        is: /^\+?[0-9\s-()]{7,25}$/,
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accountExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
      duprId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
      facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
      paymentStatus: {
      type: DataTypes.ENUM("paid", "unpaid", "refunded"),
      allowNull: false,
      defaultValue: "paid",
    },
    roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "roles",
      key: "id",
  },
},

  },
  {
    tableName: "users",
  }
);

export default User;
