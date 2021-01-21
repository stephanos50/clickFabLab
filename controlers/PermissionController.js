const { User, Role, Permission} = require('../models/User');
const createError = require("http-errors");
const { body, validationResult } = require("express-validator");


// Affiche la liste des permissions
exports.permissionList = async function(req,res,next){
  try {
    const user = req.user;
    ifUserExist(res,user);
    const role = req.params.name;
    const permissions = await Permission.findAll({
      include: Role,
     });
    res.render('permission_list', {
      title: ' Liste des permission',
      permissions,
      role,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Affiche les permissions à mettre à jour
exports.permission_update_get = async function(req,res,next){
  try {
    const user = req.user;
    ifUserExist(res,user);
    const roles = await Role.findByPk(req.params.name, {
      include: Permission,
    });
    const permissions = await Permission.findAll();
    if (roles === null) {
      next(createError(404, "Role not found"));
    } else {
      const selectedPermission = roles.permissions.map(permission => permission.name);
      for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        if (selectedPermission.indexOf(permission.name) > -1) {
          permission.checked = true;
        }
      }
      res.render("permission_list", {
        title: " Liste des permissions ",
        roles,
        permissions,
        user,
      });
    }
  } catch (error) {
    next(error);
  }

};

// Met à jour la liste des permissions
exports.permission_update_post = [
  body('permission').toArray(),

  async (req, res, next) => {
      try {
          const user = req.user;
          ifUserExist(res,user);

          const errors = validationResult(req);
          if(!errors.isEmpty()){
            res.render('permission_list',{
              title: " Liste des permissions ",
              permissions: req.body,


            });
          } else {
            if(req.body.permission === undefined){
              const roles = await Role.findAll({
                include: Permission,
                where: {
                  name: req.params.name
                }
              });
              await roles[0].setPermissions(null);
              res.redirect(`/click-fablab/permission/${req.params.name}/update`);
            }else {
              const role = await Role.findByPk(req.params.name);
              await role.setPermissions(req.body.permission);
              await role.save();
              res.redirect(`/click-fablab/permission/${req.params.name}/update`);

            }
          }

      } catch (error) {
          next(error);
        }
  }
];



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




