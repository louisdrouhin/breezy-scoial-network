import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Profile = sequelize.define(
  "Profile",
  {
    username: { type: DataTypes.STRING(30), primaryKey: true },
    displayName: { type: DataTypes.STRING(50), field: "display_name" },
    bio: DataTypes.STRING(160),
    avatarUrl: { type: DataTypes.STRING, field: "avatar_url" },
    bannerUrl: { type: DataTypes.STRING, field: "banner_url" },
  },
  {
    tableName: "profiles",
    timestamps: true,
    underscored: true,
  },
);

export default Profile;
