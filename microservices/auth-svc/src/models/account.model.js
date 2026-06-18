import { DataTypes } from "sequelize";
import sequelize from "../config/database.config.js";

const Account = sequelize.define(
  "Account",
  {
    username: {
      type: DataTypes.STRING(30),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM("USER", "MODERATOR", "ADMIN"),
      defaultValue: "USER",
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // false si suspendu/banni (Fx21)
    },
  },
  {
    tableName: "accounts",
    timestamps: true,
    underscored: true,
  },
);

export default Account;
