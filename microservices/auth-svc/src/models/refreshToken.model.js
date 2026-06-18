import { DataTypes } from "sequelize";
import sequelize from "../config/database.config.js";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tokenHash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      field: "token_hash",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
    accountUsername: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "account_username",
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

export default RefreshToken;
