const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');

router.post('/loginDocente', teacherController.loginDocente);
router.get('/docentes', teacherController.getDocentes);
router.get('/docente/:dni', teacherController.getDocenteByDni);
router.post('/docente', teacherController.createDocente);
router.delete('/docente/:dni', teacherController.deleteDocenteByDni);
router.put('/docente/:dni', teacherController.updateDocente);
router.patch('/docente/:dni', teacherController.updateDocentePatch);
router.get('/docente/cursos/:dni', teacherController.getCoursesByDocenteDni);
router.get('/docente/cursos/talleres/:idcurso', teacherController.getTalleresByCursoId);
router.get('/docente/cursos/alumnos/:idcurso', teacherController.getAlumnosByCursoId);
router.get('/docente/talleres/alumnos/:idtaller', teacherController.getAlumnosByTallerId);
module.exports = router;