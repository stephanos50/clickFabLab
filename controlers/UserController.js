
const passport  = require("passport");
const {User, Role, Permission} = require('../models/User');
const Utilisation = require('../models/Utilisation');
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");




exports.index = (req,res) => {
  const newlyAuthenticated =  req.session.newlyAuthenticated;
  delete req.session.newlyAuthenticated;
  res.render("index", {
      title: "Liste des utilisateurs",
      user: req.user,
      currentUrl: req.originalUrl,
      newlyAuthenticated,
  });
}
// Get Login
exports.login_get = (req, res) => {
  const authenticationFailed = req.session.authenticationFailed;
  delete req.session.authenticationFailed;
  res.render("login", {
    title: "Login",
    currentUrl: req.originalUrl,
    authenticationFailed
  });
};

exports.login_post = [
  body('username').notEmpty().isEmail().withMessage("Le champ n'est pas conforme"),
  body('password').trim().notEmpty().escape().withMessage("le champ est obligatoire"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){

      res.render('login', {
        title: 'login',
        users: req.body,
        errors: errors.array(),
      });
    }
    else {
      const utilisateurs = await User.findAll({
        include: Role,
          where: {
          username: req.body.username,
        }
      });
      let role='';
      if( utilisateurs.length > 0){
         role = utilisateurs[0].roles[0].name;
      }


      passport.authenticate("local", (err1, user, info) => {
        if (err1) {
          return next(err1);
        }
        if (!user) {
          req.session.authenticationFailed = true;
          return res.redirect("/login");
        }
        delete req.session.nextUrl;
        req.session.regenerate((err2) => {
          if (err2) {
            return next(err2);
          }
          req.login(user, (err3) => {
            if (err3 || utilisateurs.length === 0) {
              return next(err3);
            }
            req.session.newlyAuthenticated = true;
            role === "comptable" ? res.redirect('click-fablab/facture') : res.redirect('click-fablab/equipement');
          });
        });
      })(req, res, next);
    }
  }
];

exports.signin_create_get =  async function(req,res,next){
  try {
    res.render('signIn', {
      title:'Inscrivez-vous'
    });
  } catch (error) {
      next(error);
  }
};

exports.signin_create_post = [
  body("first_name").notEmpty().withMessage("Le champ est oblogatoire")
    .isAlphanumeric("fr-FR")
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name").notEmpty().withMessage("Le champ est oblogatoire")
    .isAlphanumeric("fr-FR")
    .withMessage("Family name has non-alphanumeric characters."),
    body('username').notEmpty().isEmail().withMessage("Le champ n'est pas conforme"),
    body('password').trim().notEmpty().escape().withMessage("le champ est obligatoire"),

    async function(req,res, next)
    {
      try {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
            res.render('signIn', {
              title: 'Inscrivez-vous',
              users: req.body,
              errors: errors.array(),
            });

          }else {

            const { first_name,family_name, username, password } = req.body;
            const passwordHash = await bcrypt.hash(password, 10);
            isNewRecord(req,res,username);
            const newuser = await User.build({
              username: username,
              first_name: first_name,
              family_name: family_name,
              passwordHash: passwordHash
            });
            await newuser.save();
            new Promise((resolve, reject) =>{
                resolve(newuser.setRoles(["member"]));
                reject(new Error("Oupss!"));
            });
            res.redirect('click-fablab/utilisation');
          }
      } catch (error) {
        next(error);
      }
    },
];


async function isNewRecord(req,res,username){
  try {
    const isNewRecord = await User.findByPk(username);
    const ifExist = false;
      if(isNewRecord !== null){
        res.render("signIn", {
          title: "Inscrivez-vous",
          isNewRecord: req.body,
        });
      }
  } catch (error) {}
};


exports.logout= function(req, res, next){
  req.logout();
  req.session.regenerate((err) => {
    if (!err) { res.redirect("/"); } else { next(err); }
  });
};








