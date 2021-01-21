const express = require("express");
const router = express.Router();


const userController = require('../controlers/UserController');

/* HOME PAGE */
router.get("/",userController.index);
/* ROUTE LOGIN */
router.get("/login", userController.login_get);
router.post("/login",userController.login_post);

/* ROUTE SING IN */
router.get("/signIn", userController.signin_create_get);
router.post("/signIn",userController.signin_create_post );

/* ROUTE LOGOUT */
router.get("/logout", userController.logout);

module.exports = router;
