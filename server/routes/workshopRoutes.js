const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');

router.get('/talleres', workshopController.getTalleres);
router.get('/talleres/:id', workshopController.getTallerById);
router.get('/talleres/curso/:idcurso', workshopController.getTalleresByCurso);
router.post('/talleres', workshopController.createTaller);
router.delete('/talleres/:id', workshopController.deleteTaller);
router.put('/talleres/:id', workshopController.putTaller);
router.patch('/talleres/:id', workshopController.patchTaller);

module.exports = router;