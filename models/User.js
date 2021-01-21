const { Model, DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const bcrypt = require("bcrypt");

class Permission extends Model {
  get url() {
    return `/permission/${this.name}`;
  }
}
Permission.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  { sequelize, modelName: "permission" }
);

class Role extends Model {
  get url() {
    return `/role/${this.name}`;
  }
}
Role.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
    },
  },
  { sequelize, modelName: "role" }
);

Role.belongsToMany(Permission, { through: "role_permissions" });
Permission.belongsToMany(Role, { through: "role_permissions" });

class User extends Model {
  get url() {
    return `/utilisateur/${this.username}`;
  }

  async validPassword(passwordToTest) {
    return bcrypt.compare(passwordToTest, this.passwordHash);
  }

  can(permissionName) {
    return this.roles.some((role) => {
      return role.permissions.some((perm) => {
        return perm.name === permissionName;
      });
    });
  }
}
User.init(
  {
    username: { type: DataTypes.STRING, primaryKey: true, isEmail: true},
    first_name: { type: DataTypes.STRING,  allowNull: false },
    family_name: { type: DataTypes.STRING, allowNull: false},
    passwordHash: DataTypes.STRING,
  },
  { sequelize, modelName: "user" }
);

User.belongsToMany(Role, { through: "user_roles" });
Role.belongsToMany(User, { through: "user_roles" });

module.exports = { User, Role, Permission} ;














