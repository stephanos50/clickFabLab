const sequelize = require("./models/sequelize");
const Equipement = require("./models/Equipement");
const Utilisation = require("./models/Utilisation");
const Facture = require("./models/Facture");
const LigneFacture = require("./models/LigneFacture");
const {User, Role, Permission} = require('./models/User');
const luxon = require("luxon");
const bcrypt = require("bcrypt");
let number = "000";
var equipements = [];
var utilisations = [];

let i = 0;

async function equipementCreate(name,price){
  equipementdetail = {
    name: name,
    price: price
  }
  const equipement = await Equipement.create(equipementdetail);
  console.log("New equipement: " + equipement.id);
  equipements.push(equipement);
  return equipement;
}

async function utilisationCreate(date,date_year_month,duration,equipement,name){
  try {
    utilisationdetail = {
      date: date,
      date_year_month:date_year_month,
      duration: duration,
    }
    const utilisation = await Utilisation.create(utilisationdetail);
    await utilisation.setEquipement(equipement);
    await utilisation.setUser(name);
    console.log("New utilisation: " + utilisation.id);
    utilisations.push(utilisation);
    return utilisation;
  } catch (error) {
    console.log(error);
  }
}

async function createUser(){
  const [equipementCreate,equipementDelete,equipementDetail,equipementList,equipementUpdate,factureCreate,factureDetail,factureDelete,factureList,factureRead,roleList,utilisateurDetail,utilisateurList,utilisateurUpdate,utilisationDelete,utilisationList] = await Permission.bulkCreate([
    { name: "equipementCreate" },
    { name: "equipementDelete"},
    { name: "equipementDetail"},
    { name: "equipementList"},
    { name: "equipementUpdate" },
    { name:"factureCreate"},
    { name:"factureDetail"},
    { name:"factureDelete"},
    { name:"factureList"},
    { name:"factureRead"},
    { name: "roleList"},
    { name: "utilisateurDetail"},
    { name: "utilisateurList"},
    { name: "utilisateurUpdate"},
    { name: "utilisationDelete"},
    { name: "utilisationList"},
  ]);

  const [manager, comptable, member] = await Role.bulkCreate([
    { name: "manager" },
    { name: "comptable" },
    { name: "member"},
  ]);

  await Promise.all([
    manager.addPermissions([equipementCreate,equipementDelete,equipementDetail,equipementList,equipementUpdate,factureCreate,factureDetail,factureList,factureRead,roleList,utilisateurDetail,utilisateurList,utilisateurUpdate,utilisationDelete,utilisationList]),
    comptable.addPermission([equipementDetail,equipementList,factureDetail,factureDelete,factureList,factureRead, utilisateurList,utilisationList]),
    member.addPermission([equipementDetail,equipementList,factureList,utilisationList]),
  ]);






  const adminPasswordHash = await bcrypt.hash("root", 10);
  const arthurPasswordHash = await bcrypt.hash("root", 10);
  const louisPasswordHash = await bcrypt.hash("root", 10);
  const jeanPasswordHash = await bcrypt.hash("root", 10);
  const michelPasswordHash = await bcrypt.hash("root", 10);

  const [admin, arthur, louis, jean, michel] = await User.bulkCreate([
    {
      first_name: "admin",
      family_name: "LeChef",
      username: "admin@yahoo.fr",
      passwordHash: adminPasswordHash
    },
    {
      first_name: "arthur",
      family_name: "LeRoi",
      username: "arthur@yahoo.fr",
      passwordHash: arthurPasswordHash
    },
    {
      first_name: "louis",
      family_name: "LePetit",
      username: "louis@yahoo.fr",
      passwordHash: louisPasswordHash
    },
    {
      first_name: "jean",
      family_name: "LeVal",
      username: "jean@yahoo.fr",
      passwordHash: jeanPasswordHash
    },
    {
      first_name: "michel",
      family_name: "LeGrand",
      username: "michel@yahoo.fr",
      passwordHash: michelPasswordHash
    },
  ]);

  await Promise.all([
    admin.setRoles([manager]),
    arthur.setRoles([member]),
    jean.setRoles([member]),
    michel.setRoles([member]),
    louis.setRoles([comptable]),

  ]);
}

async function createEquipement(){
  return Promise.all([
    equipementCreate('Ultimaker S3 230 x 190 x 200 mm',0.50 ),
    equipementCreate('Ultimaker S5 Pro Bundle 330 x 240 x 300 mm', 0.50),
    equipementCreate('Prusa I3 Mk3s 250 x 210 x 210 mm', 0.80),
    equipementCreate('Maker S4 Pack 394 x 489 x 637 mm', 0.30),
    equipementCreate('Maker S2 Pack 350 x 489 x 630 mm', 0.20),
    equipementCreate('Ultimaker S3 Pack 360 x 489 x 632 mm', 0.50),
    equipementCreate('Ultimaker S4 Pack 370 x 489 x 634 mm', 0.90),
    equipementCreate('Ultimaker S5 Pack 380 x 489 x 636 mm', 0.70),
    equipementCreate('Ultimaker S6 Pack 390 x 489 x 638 mm', 0.30),

  ]);
}
async function createUtilisation(){
  return Promise.all([
    utilisationCreate('2020-12-01', '2020-12' ,100, equipements[0],"arthur@yahoo.fr"),
    utilisationCreate('2020-12-02', '2020-12', 120, equipements[1],"jean@yahoo.fr"),
    utilisationCreate('2020-12-03', '2020-12', 140, equipements[2],"michel@yahoo.fr"),
    utilisationCreate('2021-01-04', '2021-01', 160, equipements[3],"arthur@yahoo.fr"),
    utilisationCreate('2021-01-05', '2021-01',180, equipements[4],"jean@yahoo.fr"),
    utilisationCreate('2021-01-06', '2021-01',200, equipements[5],"michel@yahoo.fr"),
    utilisationCreate('2021-02-07', '2021-02', 100, equipements[0],"arthur@yahoo.fr"),
    utilisationCreate('2021-02-08', '2021-02', 120, equipements[1],"jean@yahoo.fr"),
    utilisationCreate('2021-02-09', '2021-02', 140, equipements[2],"michel@yahoo.fr"),
  ]);
}
async function createFacture(){
  return Promise.all([
    factureCreate(new Date(),"arthur@yahoo.fr"),
    factureCreate(new Date(), "jean@yahoo.fr"),
    factureCreate(new Date(),"michel@yahoo.fr"),


  ]);
}






(async () => {
  try {
    await sequelize.sync({ force: true });
    await createUser();
    const equipements = await createEquipement();
    const utilisations = await createUtilisation();



    sequelize.close();
  } catch (error) {
    console.error('Error while populating DB: ', error);
  }
})();
