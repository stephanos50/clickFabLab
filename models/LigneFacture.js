const { Model, DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const  Utilisation  = require("./Utilisation");
const Facture = require("./Facture");



class LigneFacture extends Model{
  montant = 0;
  get url() {
    return `/ligneFacture/${this.id}`;
  }
  async sous_total(montant){
    montant += montant;
    return montant;
  }
}

LigneFacture.init(
  {
    sous_total: {type: DataTypes.INTEGER},
  },
  { sequelize, modelName: 'ligneFacture' }
);



Facture.hasOne(LigneFacture);
LigneFacture.belongsTo(Facture);



LigneFacture.belongsToMany(Utilisation,{through: 'facture_utilisation'});
Utilisation.belongsToMany(LigneFacture,{through: 'facture_utilisation'});




module.exports = LigneFacture;
