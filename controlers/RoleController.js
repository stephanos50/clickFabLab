const {User, Role, Permission} = require('../models/User');
const createError = require("http-errors");
const { body, validationResult } = require("express-validator");



// Affiche la liste des roles
exports.roleList = async function(req, res, next){
  try {
    const user = req.user;
    ifUserExist(res,user);

    const roles = await Role.findAll();
    res.render('role_list',{
      title: 'Liste des rôles',
      user,
      roles
    });
  } catch (error) {
    next(error);
  }
};

// Affiche le détail du role
exports.role_detail = async function (req, res, next) {
  try {
    const user = req.user;
    ifUserExist(res,user);
    const { name } = req.params;
    const role = await Role.findByPk(name, {
      include: User
    });
    if (role !== null) {
      res.render("role_detail", { title: "Role Detail", role, user });
    } else {
      next(createError(404, "Role not found"));
    }
  } catch (error) {
    next(error);
  }
};

// Ajouter un role en Get (affiche champs)
exports.role_create_get =  async function(req,res,next){
  try {
    const user = req.user;
    ifUserExist(res,user);
    res.render("role_form", { title: "Create Rôle", user });

  } catch (error) {
    next(error);
  }

};

// Ajouter un role
exports.role_create_post = [
  body("name", "Rôle name required").trim().notEmpty().escape(),
  async function (req, res, next) {
    const user = req.user;
    ifUserExist(res, user);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("role_form", {
        title: "Create Role",
        role: req.body,
        errors: errors.array(),
      });
    } else {
      try {
        const role = await Role.findOrCreate({
          include: Permission,
          where: { name: req.body.name },
        });

        const roles = await Role.findAll();
        res.render('role_list',{
          title: 'Liste des rôles',
          user,
          roles,
          addRole: true
        });
      } catch (error) {
        next(error);
      }
    }
  },
];

// Supprimer un role
exports.role_delete = async function(req,res,next){
  try {
    const user = req.user;
    ifUserExist(res,user);
    const {name} = req.params;
    const role = await Role.findByPk(name, {
      include: User
    });
    if(role.users.length === 0){
      await Role.destroy({
        where: { name: name }
      });
      res.redirect("/click-fablab/role");
    } else {
        const roles = await Role.findAll();
        res.render('role_list',{
          title: 'Liste des rôles',
          user,
          roles,
          deletedFailed: true
        });
    }
  } catch (error) {
    next(error);
  }
};

// Enegistrer un role
exports.role_accorder_get = async function(req,res,next){
  try {
    const user = req.user;
    if(!user){
      res.redirect('/login');
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
}

// Si l'utilisateur existe et si l'utilisateur à la permission
async function ifUserExist(res,user){
  try {
    if (!user) {
        return res.redirect("/login");
    }
    if (!user.can("roleList")) {
        return next(createError(403));
    }
  } catch (error) {
    console.log(error);
  }

};

