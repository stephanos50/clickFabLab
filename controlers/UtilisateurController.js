const {User, Role, Permission} = require('../models/User');
const Utilisation = require('../models/Utilisation');
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

// afiche la liste de tout les utilisateurs
exports.utilisateurList = async function(req, res, next){
  try {
    const user = req.user;
    if(!user){
      res.redirect('/login');
    }
    if (!user.can("utilisateurList")) {
      return next(createError(403));
    }
    const utilisateurs = await User.findAll({
      include: Role,
    });
    res.render('utilisateur_list', {
      title: 'Liste des utilisateurs',
      user,
      utilisateurs
    });

  } catch (error) {
    next(error);
  }
};

// affihce le détail d'un utilisateur (membre , comptable, admin )
exports.utilisateur_detail_get = async function(req, res, next){
  try {
      const user = req.user;
      if(!user){
        res.redirect('/login');
      }
      if (!user.can("utilisateurList")) {
        return next(createError(403));
      }
      const utilisateur = await User.findByPk(req.params.name, {
          include: Role,
      });
      const roles = await Role.findAll();
      const selectedUser = utilisateur.roles.map(role => role.name);
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        if (selectedUser.indexOf(role.name) > -1) {
          role.checked = true;
        }
      }
      res.render('utilisateur_detail', {
        title: " Données de Uitilsateur ",
        user,
        utilisateur,
        roles
      });
  } catch (error) {
    next(error);
  }
};



exports.utilisateur_detail_post = [
  body("firstname")
  .trim()
  .notEmpty()
  .escape()
  .withMessage("First name must be specified.")
  .isAlphanumeric("fr-FR")
  .withMessage("First name has non-alphanumeric characters."),
  body("familyname")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric("fr-FR")
    .withMessage("familyname : les éspaces ne sont pas autorisés."),
  body('username').notEmpty().isEmail().withMessage("Le champ email n'est pas conforme"),
  body('nouveaumotdepasse').trim().notEmpty().escape().withMessage("le champ password est obligatoire"),
  async function(req, res, next){

    try {
      const user = req.user;
      if(!user){
        res.redirect('/login');
      }
      if (!user.can("utilisateurList")) {
        return next(createError(403));
      }
      const errors = validationResult(req);

      const roles = req.body.role;
      const password = req.body.nouveaumotdepasse;
      const firstname = req.body.firstname;
      const familyname = req.body.familyname;
      const utilisateur = await User.findByPk(req.params.name, {
        include: Role
      });

      if(!errors.isEmpty()){
          const roles = await Role.findAll();
          const selectedUser = utilisateur.roles.map(role => role.name);
          for (let i = 0; i < roles.length; i++) {
              const role = roles[i];
              if (selectedUser.indexOf(role.name) > -1) {
                role.checked = true;
              }
          }
          res.render('utilisateur_detail', {
              title: " Données de Uitilsateur ",
              user,
              utilisateur,
              roles,
              errors: errors.array()
          });
      } else {
          const passwordHash = await bcrypt.hash(password, 10);
          utilisateur.passwordHash = passwordHash;
          utilisateur.first_name = firstname;
          utilisateur.family_name = familyname;
          await utilisateur.setRoles(roles);
          await utilisateur.save();
          res.redirect(`/click-fablab/utilisateur/${req.params.name}/detail`);
      }
  } catch (error) {
      next(error);
    }

  },
];



// Affiche les champs pour mettre  à jour les données d'un utilisateur (membre, comptable, manager)
exports.mesdonnes_update_get = async function(req,res,next){
  try {
      const user = req.user;
      if(!user){
        res.redirect('/login');
      }
      const utilisateur = await User.findByPk(req.user.username);
      res.render('mesdonnees_form', {
        title: 'Vos données ',
        user,
        utilisateur
      });
  } catch (error) {
    next(error);
  }
};

// Met à jour les données d'un utilisateur (membre, comptable, manager)
exports.mesdonnes_update_post = [
  /*
  body("firstname")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric("fr-FR")
    .withMessage("First name has non-alphanumeric characters."),
  body("familyname")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric("fr-FR")
    .withMessage("familyname : les éspaces ne sont pas autorisés."),
  body('username').notEmpty().isEmail().withMessage("Le champ email n'est pas conforme"),
  */

  async function(req,res,next){
    try {
      const user = req.user;
        if(!user){
          res.redirect('/login');
        }
        const errors = validationResult(req);
        const utilisateur = await User.findByPk(req.user.username);
        let authenticationFailed= false;
        let authenticationAccepted = false;
        if(!errors.isEmpty()){
          res.render('mesdonnees_form', {
            title: 'Vos données ',
            user,
            utilisateur,
            authenticationFailed,
            errors: errors.array()
          });

        } else {
            if(req.body.ancienMotDePasse !== undefined){
              const verifierMotDePasse = await utilisateur.validPassword(req.body.ancienMotDePasse);
                if(verifierMotDePasse){
                  const newpassword = req.body.nouveauMotDePasse;
                  const confirmepassword = req.body.conformerNouveauMotDePasse;
                  if(newpassword === confirmepassword){
                    const passwordHash = await bcrypt.hash(newpassword, 10);
                    utilisateur.passwordHash = passwordHash;
                    authenticationAccepted = true
                  }else {
                    authenticationFailed = true;
                  }
                } else {
                  authenticationFailed = true;
                }
            }else {
              utilisateur.first_name = req.body.firstname;
              utilisateur.family_name = req.body.familyname;
            }
            await utilisateur.save();
            res.render('mesdonnees_form', {
              title: 'Vos données ',
              user,
              utilisateur,
              authenticationFailed,
              authenticationAccepted

            });
        }

    } catch (error) {
      next(error);
    }
  }
];


