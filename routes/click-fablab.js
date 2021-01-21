const express = require("express");
const router = express.Router();



const utilisationController = require('../controlers/UtilisationController');
const equipementController = require('../controlers/EquipementController');
const utilisateurController = require('../controlers/UtilisateurController');
const factureController = require('../controlers/FactureController');
const roleController = require('../controlers/RoleController');
const permissionController = require('../controlers/PermissionController');


/* ROUTES UTILISATIONS */
router.get('/utilisation', utilisationController.utilisationList);
router.get('/utilisation/:id/create', utilisationController.utilisation_create_get);
router.post('/utilisation/:id/create', utilisationController.utilisation_create_post);
router.get('/utilisation/:id/delete',utilisationController.utilisation_delete_get);
router.post('/utilisation/:id/delete',utilisationController.utilisation_delete_post);
router.get('/utilisation/:name/detail',utilisationController.utilisation_detail_get);

/* ROUTES EQUIPEMENTS */
router.get('/equipement', equipementController.equipementList);
router.get('/equipement/:id/detail', equipementController.equipement_detail);
router.get('/equipement/:id/update', equipementController.equipement_update_get);
router.post('/equipement/:id/update', equipementController.equipement_update_post);
router.get('/equipement/create', equipementController.equipement_create_get);
router.post('/equipement/create', equipementController.equipement_create_post);
router.get('/equipement/:id/delete', equipementController.equipement_delete_get);
router.post('/equipement/:id/delete', equipementController.equipement_delete_post);

/* ROUTES UTILISATEUR */
router.get('/utilisateur',utilisateurController.utilisateurList );
router.get('/utilisateur/:name/detail',utilisateurController.utilisateur_detail_get );
router.post('/utilisateur/:name/detail',utilisateurController.utilisateur_detail_post );
router.get('/mesdonnees',utilisateurController.mesdonnes_update_get);
router.post('/mesdonnees',utilisateurController.mesdonnes_update_post);


/* ROUTES FACTURE */
router.get('/facture', factureController.factureList );
router.get('/facture/:id/detail', factureController.facture_detail_get);
router.get('/facture/:name/create', factureController.facture_create_get);
router.post('/facture/:name/create', factureController.facture_create_post);
router.get('/facture/:id/delete', factureController.facture_delete_get);
router.post('/facture/:id/delete', factureController.facture_delete_post);

/* ROUTES ROLES */
router.get('/role', roleController.roleList);
router.get('/role/create', roleController.role_create_get);
router.post('/role/create', roleController.role_create_post);
router.get('/role/:name/detail', roleController.role_detail);
router.get('/role/:name/delete', roleController.role_delete);




/* ROUTES PERMISSION */
router.get('/permission/:name/update', permissionController.permission_update_get);
router.post('/permission/:name/update', permissionController.permission_update_post);


module.exports = router;
