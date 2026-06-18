import Account from "./account.model.js";
import RefreshToken from "./refreshToken.model.js";

Account.hasMany(RefreshToken, {
  foreignKey: { name: "accountUsername", field: "account_username" },
  onDelete: "CASCADE",
});
RefreshToken.belongsTo(Account, {
  foreignKey: { name: "accountUsername", field: "account_username" },
});

export { Account, RefreshToken };
