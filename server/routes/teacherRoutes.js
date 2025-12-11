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
router.post('/docente/talleres/alumnos/nota', teacherController.insertNotaAlumno);
router.get('/docente/talleres/alumnos/nota/:dni/:idcurso', teacherController.getNotasByAlumnoInCurso);
router.post('/docente/talleres/alumnos/nota/curso/:idcurso', teacherController.insertNotaCursoAlumno);
router.get('/docente/talleres/historial/:dni_docente', teacherController.showTalleresHistorial);
module.exports = router;