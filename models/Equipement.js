const { Model, DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const Utilisation = require('./Utilisation');

class Equipement extends Model {
  get url() {
    return `/equipement/${this.id}`;
  }

}

Equipement.init(
  {
    name: { type: DataTypes.STRING, unique:true, allowNull:false},
    price: { type: DataTypes.FLOAT },
  },
  { sequelize, modelName: "equipement" }
);


Equipement.hasMany(Utilisation); // possède plusieur Utilisation
Utilisation.belongsTo(Equipement); // appartient (concerne un seul équipement)

module.exports = Equipement;





