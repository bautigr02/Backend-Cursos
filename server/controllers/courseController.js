const db = require('../models/db');

// GET ALL
const getCursos = (req, res) => {
  const query = 'SELECT curso.*, aula.cant_alumnos, (SELECT COUNT(*) FROM inscripcion_curso i WHERE i.idcurso = curso.idcurso) AS cantidad_inscriptos FROM curso JOIN aula ON curso.num_aula = aula.num_aula';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener cursos:', err);
      return res.status(500).json({ error: 'Error al obtener los cursos' });
    }
    res.status(200).json(results);
    console.log('Cursos obtenidos correctamente');
  });
};

// GET ONE x ID
const getCursoById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM curso WHERE idcurso = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al buscar el curso:', err);
      return res.status(500).json({ error: 'Error al buscar el curso' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json(results[0]);
    console.log('Curso ', id,' obtenido correctamente');
  });
};

// DELETE x ID
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
};

const desactivarCurso = (req, res) => {
  const {id}  = req.params;
  const query = 'UPDATE CURSO SET estado = 4 WHERE idcurso = ? and estado = 1 and fec_ini > CURRENT_DATE'; // 4 es cancelado
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al cancelar el curso:', err);
      return res.status(500).json({error: 'Error al cancelar el curso'});
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'Curso no encontrado'});
    }
    res.status(200).json({message: 'Curso cancelado correctamente'});
      console.log('Curso cancelado con ID:', id);
    });
    const queryInscripciones = 'UPDATE inscripcion_curso SET estado = 4 WHERE idcurso = ? and estado = 1'; // 4 es cancelado
    db.query(queryInscripciones, [id], (err, result) => {
      if (err) {
        console.error('Error al actualizar inscripciones del curso cancelado:', err);
        return res.status(500).json({error: 'Error al actualizar inscripciones del curso cancelado'});
      }
      console.log('Inscripciones del curso cancelado actualizadas con IDcurso:', id);
    });
  };

// PUT (actualizar todo el curso)
const putCurso = (req, res) => {
  const { id } = req.params;
  const { nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen } = req.body;
  if (!nom_curso || !fec_ini || !fec_fin || !estado || !num_aula || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  // Verificar si el curso ya comenzó
  const queryCursoActual = 'SELECT fec_ini FROM curso WHERE idcurso = ? LIMIT 1';
  db.query(queryCursoActual, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener curso:', err);
      return res.status(500).json({ error: 'Error al validar el curso' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    const fechaInicioActual = new Date(results[0].fec_ini);
    const hoyAhora = new Date();
    hoyAhora.setHours(0, 0, 0, 0);
    if (fechaInicioActual <= hoyAhora) {
      return res.status(400).json({ error: 'No se puede editar un curso que ya ha comenzado' });
    }
    const fechaInicio = new Date(fec_ini);
    const fechaFin = new Date(fec_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    if (fechaInicio < hoy) {
      return res.status(400).json({ error: 'La fecha de inicio debe ser hoy o una fecha futura' });
    }

    if (fechaFin <= fechaInicio) {
      return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
    }
    const query = `
      UPDATE curso 
      SET nom_curso = ?, fec_ini = ?, fec_fin = ?, estado = ?, num_aula = ?, dni_docente = ?
      WHERE idcurso = ?
    `;
    db.query(
      query,
      [nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen, id],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar el curso:', err);
          return res.status(500).json({ error: 'Error al actualizar el curso' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.status(200).json({ message: 'Curso actualizado correctamente' });
        console.log('Curso actualizado con ID:', id);
      }
    );
  });
};

// PATCH (actualizar parcialmente el curso)
const patchCurso = (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  // Verificar si el curso ya comenzó
  const queryCursoActual = 'SELECT fec_ini FROM curso WHERE idcurso = ? LIMIT 1';
  db.query(queryCursoActual, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener curso:', err);
      return res.status(500).json({ error: 'Error al validar el curso' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    const fechaInicioActual = new Date(results[0].fec_ini);
    const hoyAhora = new Date();
    hoyAhora.setHours(0, 0, 0, 0);
    if (fechaInicioActual <= hoyAhora) {
      return res.status(400).json({ error: 'No se puede editar un curso que ya ha comenzado' });
    }

    // Construir la consulta dinámicamente
    const setClause = Object.keys(campos).map(key => `${key} = ?`).join(', ');
    const values = Object.values(campos);

    const query = `UPDATE curso SET ${setClause} WHERE idcurso = ?`;

    db.query(query, [...values, id], (err, result) => {
      if (err) {
        console.error('Error al actualizar parcialmente el curso:', err);
        return res.status(500).json({ error: 'Error al actualizar el curso' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }
      res.status(200).json({ message: 'Curso actualizado parcialmente' });
      console.log('Curso actualizado parcialmente con ID:', id);
    });
  });
};

// Crear un nuevo curso
const createCurso = (req, res) => {
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
  const query = 'INSERT INTO curso (nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen], (err, result) => {
    if (err) {
      console.error('Error al crear el curso:', err);
      return res.status(500).json({ error: 'Error al crear el curso' });
    }
    res.status(201).json({ id: result.insertId, nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen });
    console.log('Curso creado correctamente con ID:', result.insertId);
  });
};


const queryPromise = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const cambiarEstadoCurso = async () => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const cursos = await queryPromise('SELECT idcurso, estado, fec_ini, fec_fin FROM curso', []);
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
        await queryPromise('UPDATE curso SET estado = ? WHERE idcurso = ?', [nuevo_estado, curso.idcurso]);  
      }
    }
    console.log("Estados de cursos actualizados correctamente.");
  } catch (error) {
    console.error("Error al actualizar los estados de los cursos:", error);
    throw error;
  }
};

module.exports = { getCursos, getCursoById, createCurso, deleteCurso, desactivarCurso, putCurso, patchCurso, cambiarEstadoCurso };
