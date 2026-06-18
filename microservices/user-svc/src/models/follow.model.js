import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Follow = sequelize.define(
  "Follow",
  {
    followerUsername: {
      type: DataTypes.STRING(30),
      field: "follower_username",
      primaryKey: true,
    },
    followedUsername: {
      type: DataTypes.STRING(30),
      field: "followed_username",
      primaryKey: true,
    },
  },
  {
    tableName: "follows",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

export default Follow;
