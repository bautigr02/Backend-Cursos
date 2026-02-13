const CourseRepository = require('../repositories/courseRepository');
// GET ALL
const getCursos = async (req, res) => {
  try {
    const results = await CourseRepository.getCursos();
    res.status(200).json(results);
  } catch (err) {
    console.error('Error al obtener cursos:', err);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
};

// GET ONE x ID
const getCursoById = async (req, res) => {
  const { id } = req.params;
  try {
    const curso = await CourseRepository.getCursoById(id);
    if(!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json(curso);
  }catch (err) {
    console.error('Error al obtener el curso:', err);
    res.status(500).json({ error: 'Error al obtener el curso' });
  }
};

/*// DELETE x ID
const deleteCurso = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM curso WHERE idcurso = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el curso:', err);
      return res.status(500).json({ error: 'Error al eliminar el curso' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json({ message: 'Curso eliminado correctamente' });
    console.log('Curso eliminado con ID:', id);
  });
}; */

const desactivarCurso = async (req, res) => {
  const {id}  = req.params;
  try {
    const resultado = await CourseRepository.desactivarCurso(id);
    if (resultado.curso.affectedRows === 0 | !resultado.curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no se puede cancelar' });
    }
    res.status(200).json({ message: 'Curso e inscripciones canceladas correctamente' });
    console.log('Curso cancelado con ID:', id);

  } catch (err) {
    console.error('Error al cancelar el curso:', err);
    res.status(500).json({ error: 'Error al cancelar el curso' });
  }
};

// PUT (actualizar todo el curso)
const putCurso = async (req, res) => {
  const { id } = req.params;
  try {
    const cursoExistente = await CourseRepository.getCursoById(id);
    if (!cursoExistente) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    const fechaInicioActual = new Date(cursoExistente.fec_ini);
    if (fechaInicioActual <= new Date()) {
      return res.status(400).json({ error: 'No se puede editar un curso que ya ha comenzado' });
    }
    
    await CourseRepository.putCurso(id, req.body);
    return res.status(200).json({ message: 'Curso actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar el curso:', err);
    res.status(500).json({ error: 'Error al actualizar el curso' });
  }
};

// PATCH (actualizar parcialmente el curso)
const patchCurso = async (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  if (!campos || Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  try {
    const resultado = await CourseRepository.patchCurso(id, campos);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json({ message: 'Curso actualizado parcialmente' });
  } catch (err) {
    console.error('Error al actualizar parcialmente el curso:', err);
    res.status(500).json({ error: 'Error al actualizar el curso' });
  }
};

// Crear un nuevo curso
const createCurso = async (req, res) => {
  const { nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen } = req.body;
  if (!nom_curso || !fec_ini || !fec_fin || !estado || !num_aula || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const fechaInicio = new Date(fec_ini + 'T00:00:00');
  const fechaFin = new Date(fec_fin + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Validar formato y rango de fechas
  if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
    return res.status(400).json({ error: 'Fechas inválidas' });
  }

  if (fechaInicio < hoy) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser hoy o una fecha futura' });
  }

  if (fechaFin <= fechaInicio) {
    return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
  }
  try {
    const resultado = await CourseRepository.createCurso({ 
      nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen 
    });   
    res.status(201).json({ id: resultado.insertId, nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen });
  } catch (err){
    res.status(500).json({ error: 'Error al crear el curso' });
  } 
};

const cambiarEstadoCurso = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const cursos = await CourseRepository.getEstadosCursos();

    for (const curso of cursos) {
      let nuevo_estado = curso.estado;
      const fecIni = new Date(curso.fec_ini);
      const fecFin = new Date(curso.fec_fin);
      
      if (curso.estado !== 4) { // Si no está cancelado
          if (hoy < fecIni) {
            nuevo_estado = 1; //confirmado
          } else if (hoy >= fecIni && hoy <= fecFin) {
            nuevo_estado = 2; //en curso
          } else if (hoy > fecFin) {
            nuevo_estado = 3; //finalizado
          }
        }

      if (curso.estado !== nuevo_estado) {
        await CourseRepository.cambiarEstadoCurso(nuevo_estado, curso.idcurso);
      }
    }
    if(res) {
      res.status(200).json({ message: `Estados de cursos actualizados correctamente.` });
      console.log("Estados de cursos actualizados correctamente.");
    }
  } catch (error) {
    if(res){
      res.status(500).json({ error: 'Error al actualizar los estados de los cursos' });
      console.error("Error al actualizar los estados de los cursos:", error);   
    }
  }
};

module.exports = { getCursos, getCursoById, createCurso,/* deleteCurso,*/ desactivarCurso, putCurso, patchCurso, cambiarEstadoCurso };
