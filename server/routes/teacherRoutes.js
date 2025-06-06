const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');

router.get('/docentes', teacherController.getDocentes);
router.get('/docente/:dni', teacherController.getDocenteByDni);
router.post('/docente', teacherController.createDocente);
router.delete('/docente/:dni', teacherController.deleteDocenteByDni);
router.put('/docente/:dni', teacherController.updateDocente);
module.exports = router;