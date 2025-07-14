const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');

router.post('/loginDocente', teacherController.loginDocente);
router.get('/docentes', teacherController.getDocentes);
router.get('/docente/:dni', teacherController.getDocenteByDni);
router.post('/docente', teacherController.createDocente);
router.delete('/docente/:dni', teacherController.deleteDocenteByDni);
router.put('/docente/:dni', teacherController.updateDocente);
router.get('/docente/cursos/:dni', teacherController.getCoursesByDocenteDni);
module.exports = router;