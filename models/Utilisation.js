const { Model, DataTypes, VIRTUAL } = require("sequelize");
const  {User, Role, Permission}  = require("./User");
const sequelize = require("./sequelize");
const {DateTime} = require("luxon");

class Utilisation extends Model{
  get url() {
    return `/utilisation/${this.id}`;
  }

}
Utilisation.init(
  {
    date: { type: DataTypes.DATEONLY, allowNull:false },
    date_year_month :{ type: DataTypes.STRING, allowNull: false},
    duration: { type: DataTypes.INTEGER, allowNull:false},
    facturer: {type: DataTypes.BOOLEAN, allowNull:false, defaultValue:false},
    date_formated: {
      type: DataTypes.VIRTUAL,
        get() {
          return DateTime.fromISO(this.date).toLocaleString(DateTime.DATE_HUGE);
        },
    },

  },
  { sequelize, modelName: 'utilisation' }
);

User.hasMany(Utilisation ); // A plususieur
Utilisation.belongsTo(User); // appartient à




module.exports = Utilisation;



