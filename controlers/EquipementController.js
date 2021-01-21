const  Equipement   = require("../models/Equipement");
const createError = require("http-errors");
const { body, validationResult } = require("express-validator");
const Utilisation = require('../models/Utilisation');


// afficher la liste des équipements
exports.equipementList = async function (req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    if (!user.can("equipementList")) {
      return next(createError(403));
    }
    const equipements = await Equipement.findAll();
    res.render('equipement_list',{
      title: 'Liste des Equipements',
      user,
      equipements,
    });
  } catch (error) {
      next(error);
  }
};

// Affiche le détail de la facture
exports.equipement_detail = async function(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("equipementDetail")) {
        return next(createError(403));
      }
      const equipement = await Equipement.findByPk(req.params.id);

      res.render('equipement_detail', {
          title: "Détail de l' équipement",
          user,
          equipement
      });
    } catch (error) {
      next(error);
    }
};

//
exports.equipement_update_get = async function(req, res, next){
  try {
      const user = req.user;
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.can("equipementUpdate")) {
        return next(createError(403));
      }
      const equipement = await Equipement.findByPk(req.params.id);
      res.render('equipement_form',{
        title: "Mise à jour de l'équipement",
        equipement,
        user
      });

  } catch (error) {
    next(error);
  }
};

exports.equipement_update_post = async function(req,res,next){
  try {
    if (!req.user) {
      return res.redirect("/login");
    }
    if (!req.user.can("equipementUpdate")) {
      return next(createError(403));
    }
    const equipement = await Equipement.findByPk(req.params.id);
    equipement.name = req.body.equipement;
    equipement.price = req.body.tarif;
    await equipement.save();

    res.redirect(`/click-fablab/equipement/${req.params.id}/update`);

  } catch (error) {
    next(error);
  }
};

exports.equipement_create_get = async function(req,res,next){
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    }
    res.render("equipement_form", {
      title: 'Ajouter un équipement',
      user,

    });

  } catch (error) {
    next(error);
  }
};

exports.equipement_create_post = [

    body('equipement').trim().notEmpty().escape().withMessage("Le nom de l'équipement doit être spécifié "),
    body('tarif').isFloat().withMessage("Le prix doit contenir un float"),
    async function(req,res, next){
      try {
        if (!req.user) {
          return res.redirect("/login");
        }
        if (!req.user.can("equipementCreate")) {
          return next(createError(403));
        }
        const errors = validationResult(req);
        if(!errors.isEmpty()){
          res.render('equipement_form',{
            title: 'Ajouter un équipement',
            equipement: req.body,
            errors: errors.array(),

          });
        }
        const equipement = await Equipement.findCreateFind({
            where: {
              name: req.body.equipement,
              price: req.body.tarif
            }
          });
          res.redirect('/click-fablab/equipement');
        } catch (error) {
          next(error);
        }
      },
]

exports.equipement_delete_get = async function(req, res, next){
  try {
    const user = req.user;
    if (!user) {
      return res.redirect("/login");
    };
    if (!user.can("equipementDelete")) {
      return next(createError(403));
    }
    const {id} = req.params;
    const equipement = await Equipement.findByPk(id);
    const utilisations = await Utilisation.findAll({
      include: Equipement,
      where : {
        equipementId: id,
      }
    });
    let notEquipement = false;
    if(utilisations.length > 0){
      notEquipement = true;
    }
    res.render('equipement_delete',{
      title: "Supprimer l'équipement",
      user,
      equipement,
      notEquipement,
    });

  } catch (error) {
    next(error);
  }
};

exports.equipement_delete_post = async function(req, res, next){
  try {
    if (!req.user) {
      return res.redirect("/login");
    };
    let equipement = await Equipement.findByPk(req.params.id);
    await Equipement.destroy({
      where: {
        name: equipement.name
      }
    });
    res.redirect('/click-fablab/equipement');

  } catch (error) {
    next(error);
  }
};

