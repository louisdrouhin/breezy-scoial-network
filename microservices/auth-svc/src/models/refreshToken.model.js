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
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

export default RefreshToken;
