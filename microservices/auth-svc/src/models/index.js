import Account from "./account.model.js";
import RefreshToken from "./refreshToken.model.js";

Account.hasMany(RefreshToken, {
  foreignKey: "accountUsername",
  sourceKey: "username",
  onDelete: "CASCADE",
});

RefreshToken.belongsTo(Account, {
  foreignKey: "accountUsername",
  targetKey: "username",
  as: "Account",
});

export { Account, RefreshToken };
