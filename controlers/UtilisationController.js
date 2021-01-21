
const Equipement = require('../models/Equipement');
const Utilisation = require('../models/Utilisation');
const {User, Role, Permission} = require('../models/User');
const Facture = require('../models/Facture');
const createError = require("http-errors");
let date_nom_valide;
let selectUtilisateur;
let selectEquipement;
let notFacture




// Afficher la liste des utilisations
exports.utilisationList = async function(req,res,next){
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      if (!user.can("utilisationList")) {
          return next(createError(403));
      }
      const [utilisateur, utilisations] = await Promise.all([
        User.findByPk(user.username,{
          include: Utilisation,
        }),
        Utilisation.findAll({
          include:[User],
        }),

      ]);
      let utilisationsUser = [];
      let j = 0;

      if ( utilisateur === null) {
        next(createError(404, "Book not found"));
      } else {
        const selectUtilisationId = utilisateur.utilisations.map(utilisation => utilisation.id);
        for(let i = 0 ; i < utilisations.length;++i){
          // Si l'utilisateur est un manager ou un comptable
          // Je copie directement l'utilisations
          // Met i à 1000 pour sortir de la boucle
          if(user.roles[0].name === "manager" || user.roles[0].name === "comptable"){
            utilisationsUser = '';
            utilisationsUser = utilisations;
            i = 1000;
          }else if(utilisations[i].id === selectUtilisationId[j] ){
            utilisationsUser.push(utilisations[i]);
            ++j;
          }
        }
        res.render('utilisation_list', {
          title: 'Votre liste d utilisation',
          user,
          utilisateur,
          utilisationsUser,
          date_nom_valide,
          selectUtilisateur,
        });
      }
  } catch (error) {
      next(error);
  }
};

// Affiche l'utilisation à ajouter en GET
exports.utilisation_create_get = async function(req, res, next){
  try {
      const user = req.user;
      if (!user) {
          return res.redirect("/login");
      }
      const roles = await User.findAll(
          {include: Role}
      );
      const date = new Date();
      let member = '';
      let admin = '';
      let equipements = '';
      let username = '';
      if(typeof req.params.id === "string" && req.params.id  > 0){
          member = user.roles[0].name !== "member" ? true : false;

      } else {
          equipements = await Equipement.findAll();
          admin = true;
          username = req.params.id;
      }
      const equipement= await Equipement.findByPk(req.params.id);
      res.render('utilisation_form', {
          title: 'Encoder une nouvelle utilisation',
          user,
          equipement,
          equipements,
          member,
          roles,
          admin,
          username,
      });
  } catch (error) {
      next(error);
  }
};

// Ajouter une utilisation
exports.utilisation_create_post = [
  async function(req, res, next){
    try {
      date_nom_valide = false;
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      const { member, date, minute} = req.body;
      const ifMemberExist = await User.findByPk(user.username);
        if(ifMemberExist === null) {
          selectUtilisateur = true;
          res.redirect('/click-fablab/utilisation');
        } else {
          selectUtilisateur = false;
          const mydate = new Date(date);
          const dateSystem = new Date();
          // Si la date appartient à une date précedante
          // Aucune utilisation ne sera enregistée
          if(dateSystem.getFullYear() > mydate.getFullYear() || dateSystem.getMonth() > mydate.getMonth() || dateSystem.getDay() > mydate.getDay())
            {
              date_nom_valide = true;
              res.redirect('/click-fablab/utilisation');
            }
          else if(dateSystem.getFullYear() <= mydate.getFullYear() && dateSystem.getDay() <= mydate.getDay())
            {
              const luxon = require("luxon");
              const numero = luxon.DateTime.fromISO(new Date().toISOString()).toFormat('yyyy-MM');
              date_nom_valide = false;
              let identifiant = req.body.equipement;
              let id = identifiant === undefined ? req.params.id : req.body.equipement;
              let name = member === undefined ? user.username : req.body.member
              const equipement = await Equipement.findByPk(id);

              const utilisation = await Utilisation.create({
                date: date,
                date_year_month: numero,
                duration: minute,
              });
              await utilisation.setEquipement(equipement);
              await utilisation.setUser(name);

              res.redirect('/click-fablab/utilisation');
          }
        }
    } catch (error) {
      next(error);
    }
  },
];

// Affiche les utilisations à supprimer
exports.utilisation_delete_get = async function(req, res, next){
    try {
      const user = req.user;
      if(!user){
          return res.redirect('/login');
      }
      if (!user.can("utilisationDelete")) {
        return next(createError(403));
      }
      const utilisation = await Utilisation.findByPk(req.params.id);
      // Si l'utilisation est déja facturé je met la variable notFacture à true
      if(utilisation.facturer  === true){
          notFacture = true;
      }
      res.render('utilisation_delete',{
        title: "Supprimer l'utilisation",
        user,
        utilisation,
        notFacture
      });
    } catch (error) {
    next(error);
  }
};

// Suppression d'une utilisation
exports.utilisation_delete_post = async function(req, res, next){
  try {
      const user = req.user;
      if(!user){
        return res.redirect('/login');
      }
      if (!user.can("utilisationDelete")) {
        return next(createError(403));
      }
      const utilisation = await Utilisation.findByPk(req.params.id);
      await utilisation.destroy();
      res.redirect('/click-fablab/utilisation');
  } catch (error) {
    next(error);
  }
};


// Affiche la liste des utilisations depuis Liste des utilisateurs
exports.utilisation_detail_get = async function(req, res, next){
    try {
      const user = req.user;
      if(!user){
        res.redirect('/login');
      }
      const name = req.params.name;
      const [utilisateur, utilisations] = await Promise.all([
        User.findByPk(name,{
          include:[Utilisation],
        }),
        Utilisation.findAll({
          include:[User],
        }),
      ]);
      let utilisationsUser = [];
      let j = 0;
      if ( utilisateur === null) {
        next(createError(404, "Utilisateur not found"));
      } else {
        const selectUtilisationId = utilisateur.utilisations.map(utilisation => utilisation.id);
        for(let i = 0 ; i < utilisations.length;++i){
          if(utilisations[i].id === selectUtilisationId[j] ){
            utilisationsUser.push(utilisations[i]);
            ++j;
          }
        }
        res.render('utilisation_list', {
          title: 'Liste des utilisations ',
          user,
          utilisateur,
          utilisationsUser,
          date_nom_valide,
          selectUtilisateur,

        });
      }
    } catch (error) {
      next(error);
    }
}

