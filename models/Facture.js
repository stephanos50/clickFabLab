const { Model, DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const  {User, Role, Permission}  = require("./User");
const {DateTime} = require("luxon");

class Facture extends Model{
  get url() {
    return `/facture/${this.id}`;
  }
  async calulePrix(minute,prix) {
    return (minute*prix);
  }
}
Facture.init(
  {

    numero:{type: DataTypes.INTEGER},
    date: { type: DataTypes.DATEONLY},
    montant: { type: DataTypes.FLOAT},
    date_formated: {
      type: DataTypes.VIRTUAL,
        get() {
          return DateTime.fromISO(this.date).toLocaleString(DateTime.DATE_HUGE);
        },
    },
  },
  { sequelize, modelName: 'facture' }
);

User.hasMany(Facture); // poséder plusieur facture
Facture.belongsTo(User); // appartient à un utilisateur

module.exports = Facture;



