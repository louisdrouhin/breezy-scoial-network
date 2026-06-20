import Profile from "./profile.model.js";
import Follow from "./follow.model.js";

// Les associations sont déclarées ici, pas dans les fichiers de modèle eux-mêmes
Profile.belongsToMany(Profile, {
  as: "Following",
  through: Follow,
  foreignKey: "followerUsername",
  otherKey: "followedUsername",
  onDelete: "CASCADE",
});
Profile.belongsToMany(Profile, {
  as: "Followers",
  through: Follow,
  foreignKey: "followedUsername",
  otherKey: "followerUsername",
  onDelete: "CASCADE",
});

// Associations pour Follow
Follow.belongsTo(Profile, {
  as: "follower",
  foreignKey: "followerUsername",
  targetKey: "username",
});
Follow.belongsTo(Profile, {
  as: "followed",
  foreignKey: "followedUsername",
  targetKey: "username",
});

export { Profile, Follow };
