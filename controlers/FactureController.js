const Facture = require('../models/Facture');
const createError = require("http-errors");
const LigneFacture = require('../models/LigneFacture');
const Utilisation = require('../models/Utilisation');
const Equipement = require('../models/Equipement');
const {User,Role, Permission} = require('../models/User');
const { create, sequelize } = require('../models/Utilisation');
const luxon = require("luxon");
const DateTime = luxon.DateTime;
const numero = DateTime.fromISO(new Date().toISOString());
const date_sequence = numero.toFormat('yyyyMM');


let aucune_facture;
let index = "000";

// Affiche la liste des factures
exports.factureList = async function(req, res, next){
    try {
    const user = req.user;
    if(!user){
      return res.redirect('/login');
    }
    let factures = user.roles[0].name !== "member"
          ? await Facture.findAll({include: User})
          : await Facture.findAll({
            where: {
              userUsername: user.username

            }
      });
      res.render('facture_list',{
      title: 'Liste des factures',
      user,
      factures,
      aucune_facture
    });
  }catch (error) {
    next(error);
  }
};


// DETAIL DE LA FACTURE
exports.facture_detail_get = async function(req,res,next){
  try {
      const user = req.user;
      if(!user){
        return res.redirect('/login');
      }
      const numero_facture = req.params.id;
      const ligneFacturtion = await LigneFacture.findByPk(numero_facture, {
            include: [Utilisation]
      });
      // Rechercher les utilisations
      const ligne_utilisation = ligneFacturtion.utilisations.map(utilisation => utilisation.id);
      //const ligne_equipement = ligneFacturtion.utilisations.map(utilisation => utilisation.equipementId);
      let liste_utilisation = [];
      //let liste_equipement =  [];
      const montantTotal = ligneFacturtion.sous_total;

      if(ligne_utilisation === null){
          next(createError(404, "Ligne de facture not found"));
      }else {

        for(let i = 0; i < ligne_utilisation.length; ++i){
          let identifiant = ligne_utilisation[i];
          const utilisation = await Utilisation.findByPk(identifiant,{
            include: Equipement,
          });
          if(utilisation !== null){
            liste_utilisation.push(utilisation);
          } else {
            next(createError(404, "Utilisation not found"));
          }
        }
        res.render('facture_detail',{
          title: 'Detail de la facture',
          user,
          liste_utilisation,
          montantTotal,
        });

      }
    } catch (error) {
    next(error);
  }
};


// Affiche les champs pour l'ajout d'une facture
exports.facture_create_get = async function(req,res,next){
  try {
      const user = req.user;
      let aucuneUtilisation = false;
      if(!user){
        res.redirect('/login');
      }
      const utilisations = await Utilisation.findAll({
        include: Equipement,
        where:{
          userUsername: req.params.name,
          facturer: false
        }
      });
      if( utilisations.length === 0){
        aucuneUtilisation = true;
      }
      res.render('facture_form',{
        title: 'Creation de la facture',
        user,
        utilisations,
        aucuneUtilisation
      });

    } catch (error) {
      next(error);
  }
}

// Ajouter une facture en mode Post
exports.facture_create_post = async function(req,res,next){
  try {
    permission(req.user, "factureCreate");
    aucune_facture = false;
    // Recherche  les utilisations par date et non facturer
    const utilisations = await Utilisation.findAll({
      include: Equipement,
      where: {
        date_year_month: req.body.date,
        userUsername : req.params.name,
        facturer: false,
      }
    });
    if ( utilisations.length === 0) {
      aucune_facture = true;
      res.redirect('/click-fablab/facture');
    } else {
      console.log(utilisations.length);
      let minute = 0;
      let prix = 0;

      for(let i = 0 ; i < utilisations.length;++i){
        minute += utilisations[i].duration;
        prix += utilisations[i].equipement.price;
        utilisations[i].setDataValue('facturer', true);
        await utilisations[i].save();
      }
      await creationDeLaFacture(req.params.name, minute, prix);

      res.redirect('/click-fablab/facture');

    }

  } catch (error) {
    next(error);
  }
};

// Creation de la facture
async function creationDeLaFacture(name, minute, prix){
  try {
    const facture = await Facture.create({
      numero: (`${numero.toFormat('yyyyMM')}${++index}`),
      date: new Date(),
      montant: 0,
      userUsername: name
    });
    facture.setDataValue("montant", await facture.calulePrix(minute,prix));
    await facture.save();

  } catch (error) {
      return error;
  }


}

// Creation de la ligne de facturation
async function createLigneDeFacturation(id){
  try {
    const ligne_facture = await LigneFacture.create();
    const ligneFacture = await LigneFacture.findByPk(ligne_facture.id);
    ligneFacture.setFacture(ligne_facture.id);
    await ligne_facture.addUtilisation(id);
    await ligneFacture.save();
  } catch (error) {
      return error;
  }

}

// Supprimer une facture en mode Get
exports.facture_delete_get = async function(req,res,next){
  try {
    const user = req.user;
    permission(user,"factureDelete");
    const facture = await Facture.findByPk(req.params.id);
      res.render('facture_delete', {
        title: 'Supprimer la facture',
        user,
        facture
      });
  } catch (error) {

  }
}

// Supprimer une facture en mode Post
exports.facture_delete_post = async function(req, res, next){
  try {
      const user = req.user;
      permission(user,"factureDelete");
      const facture = await Facture.findByPk(req.params.id);
      await facture.destroy();
      res.redirect('/click-fablab/facture');
  } catch (error) {
    next(error);
  }
};



function permission(user, name){
  if(!user){
    res.redirect('/login');
  }
  if (!user.can(name)) {
    return next(createError(403));
  }

}
