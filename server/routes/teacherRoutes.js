const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacherController');
const verify  = require('../middleware/verifyJWT');
const authorize = require ('../middleware/roleAuth');

router.post('/loginDocente', teacherController.loginDocente);
router.get('/docentes',verify, authorize(['docente']) ,teacherController.getDocentes);
router.get('/docente/:dni',verify, authorize(['docente'])  ,teacherController.getDocenteByDni);
router.post('/docente',verify, authorize(['docente']),teacherController.createDocente);
router.delete('/docente/:dni',verify, authorize(['docente'])  ,teacherController.deleteDocenteByDni);
router.put('/docente/:dni',verify, authorize(['docente'])  ,teacherController.updateDocente);
router.patch('/docente/:dni',verify, authorize(['docente'])  ,teacherController.updateDocentePatch);
router.get('/docente/cursos/:dni',verify, authorize(['docente'])  ,teacherController.getCoursesByDocenteDni);
router.get('/docente/cursos/talleres/:idcurso',verify, authorize(['docente'])  ,teacherController.getTalleresByCursoId);
router.get('/docente/cursos/alumnos/:idcurso',verify, authorize(['docente'])  ,teacherController.getAlumnosByCursoId);
router.get('/docente/talleres/alumnos/:idtaller',verify, authorize(['docente'])  ,teacherController.getAlumnosByTallerId);

router.post('/docente/talleres/alumnos/nota/:idtaller/:dni',verify, authorize(['docente'])  ,teacherController.insertNotaAlumno);
router.get('/docente/talleres/alumnos/nota/:dni/:idcurso',verify, authorize(['docente'])  ,teacherController.getNotasByAlumnoInCurso);
router.post('/docente/talleres/alumnos/nota/curso/:idcurso/:dni',verify, authorize(['docente'])  ,teacherController.insertNotaCursoAlumno);
router.get('/docente/talleres/historial/:dni_docente',verify, authorize(['docente'])  ,teacherController.showTalleresHistorial);
module.exports = router;