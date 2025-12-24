const db = require('../models/db');

// Validates that the workshop date falls within the course date range
const validateWorkshopDateRange = (idcurso, fecha, cb) => {
  const fechaTaller = new Date(fecha);
  if (Number.isNaN(fechaTaller.getTime())) {
    return cb(null, 'invalid-date');
  }

  const queryCurso = 'SELECT fec_ini, fec_fin FROM curso WHERE idcurso = ? LIMIT 1';
  db.query(queryCurso, [idcurso], (err, results) => {
    if (err) return cb(err);
    if (results.length === 0) return cb(null, 'course-not-found');

    const fecIni = new Date(results[0].fec_ini);
    const fecFin = new Date(results[0].fec_fin);

    if (Number.isNaN(fecIni.getTime()) || Number.isNaN(fecFin.getTime())) {
      return cb(null, 'course-invalid-dates');
    }

    const dentroDeRango = fechaTaller >= fecIni && fechaTaller <= fecFin;
    if (!dentroDeRango) return cb(null, 'out-of-range');

    return cb(null, null);
  });
};

// GET ALL
const getTalleres = (req, res) => {
  const query = 'SELECT * FROM taller';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener talleres:', err);
      return res.status(500).json({ error: 'Error al obtener los talleres' });
    }
    res.status(200).json(results);
    console.log('Talleres obtenidos correctamente');
  });
};

// GET ONE x ID
const getTallerById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM taller WHERE idtaller = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al buscar el taller:', err);
      return res.status(500).json({ error: 'Error al buscar el taller' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    res.status(200).json(results[0]);
    console.log('Taller', id, 'obtenido correctamente');
  });
};

// GET talleres por curso
const getTalleresByCurso = (req, res) => {
  const { idcurso } = req.params;
  const query = 'SELECT * FROM taller WHERE idcurso = ?';
  db.query(query, [idcurso], (err, results) => {
    if (err) {
      console.error('Error al buscar talleres del curso:', err);
      return res.status(500).json({ error: 'Error al buscar talleres del curso' });
    }
    res.status(200).json(results);
    console.log('Talleres del curso', idcurso, 'obtenidos correctamente');
  });
};

// CREATE
const createTaller = (req, res) => {
  const { idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen } = req.body;
  if (!idcurso || !nom_taller || !fecha || !tematica || !herramienta || !hora_ini || !requisitos || !dificultad || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  const difVal = Number(dificultad);
  if (!Number.isInteger(difVal) || difVal < 0 || difVal > 3) {
    return res.status(400).json({ error: 'La dificultad debe ser un entero entre 0 y 3 (0: desconocido, 1: principiante, 2: intermedio, 3: avanzado)' });
  }
  validateWorkshopDateRange(idcurso, fecha, (err, status) => {
    if (err) {
      console.error('Error al validar fechas de taller:', err);
      return res.status(500).json({ error: 'Error al validar fechas de taller' });
    }
    if (status === 'invalid-date') {
      return res.status(400).json({ error: 'Fecha de taller inválida' });
    }
    if (status === 'course-not-found') {
      return res.status(404).json({ error: 'Curso no encontrado para el taller' });
    }
    if (status === 'course-invalid-dates') {
      return res.status(400).json({ error: 'El curso tiene fechas inválidas' });
    }
    if (status === 'out-of-range') {
      return res.status(400).json({ error: 'La fecha del taller debe estar dentro del rango de fechas del curso' });
    }
  const query = `
    INSERT INTO taller 
    (idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen], (err, result) => {
    if (err) {
      console.error('Error al crear el taller:', err);
      return res.status(500).json({ error: 'Error al crear el taller' });
    }
    res.status(201).json({ idtaller: result.insertId, idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen });
    console.log('Taller creado correctamente con ID:', result.insertId);
  });
  });
};

// DELETE
const deleteTaller = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM taller WHERE idtaller = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el taller:', err);
      return res.status(500).json({ error: 'Error al eliminar el taller' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    res.status(200).json({ message: 'Taller eliminado correctamente' });
    console.log('Taller eliminado con ID:', id);
  });
};

// PUT (actualizar todo el taller)
const putTaller = (req, res) => {
  const { id } = req.params;
  const { idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen } = req.body;
  if (!idcurso || !nom_taller || !fecha || !tematica || !herramienta || !hora_ini || !requisitos || !dificultad || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  // Verificar si el taller ya comenzó
  const queryTallerActual = 'SELECT fecha FROM taller WHERE idtaller = ? LIMIT 1';
  db.query(queryTallerActual, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener taller:', err);
      return res.status(500).json({ error: 'Error al validar el taller' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    const fechaTallerActual = new Date(results[0].fecha);
    const hoyAhora = new Date();
    hoyAhora.setHours(0, 0, 0, 0);
    if (fechaTallerActual <= hoyAhora) {
      return res.status(400).json({ error: 'No se puede editar un taller que ya ha comenzado' });
    }
    const difVal = Number(dificultad);
    if (!Number.isInteger(difVal) || difVal < 0 || difVal > 3) {
      return res.status(400).json({ error: 'La dificultad debe ser un entero entre 0 y 3 (0: desconocido, 1: principiante, 2: intermedio, 3: avanzado)' });
    }
    validateWorkshopDateRange(idcurso, fecha, (err, status) => {
      if (err) {
        console.error('Error al validar fechas de taller:', err);
        return res.status(500).json({ error: 'Error al validar fechas de taller' });
      }
      if (status === 'invalid-date') {
        return res.status(400).json({ error: 'Fecha de taller inválida' });
      }
      if (status === 'course-not-found') {
        return res.status(404).json({ error: 'Curso no encontrado para el taller' });
      }
      if (status === 'course-invalid-dates') {
        return res.status(400).json({ error: 'El curso tiene fechas inválidas' });
      }
      if (status === 'out-of-range') {
        return res.status(400).json({ error: 'La fecha del taller debe estar dentro del rango de fechas del curso' });
      }
      const query = `
        UPDATE taller 
        SET idcurso = ?, nom_taller = ?, fecha = ?, tematica = ?, herramienta = ?, hora_ini = ?, requisitos = ?, dificultad = ?, dni_docente = ?, imagen = ?
        WHERE idtaller = ?
      `;
      db.query(
        query,
        [idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen, id],
        (err, result) => {
          if (err) {
            console.error('Error al actualizar el taller:', err);
            return res.status(500).json({ error: 'Error al actualizar el taller' });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Taller no encontrado' });
          }
          res.status(200).json({ message: 'Taller actualizado correctamente' });
          console.log('Taller actualizado con ID:', id);
        }
      );
    });
  });
};


// PATCH (actualizar parcialmente el taller)
const patchTaller = (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  // Verificar si el taller ya comenzó
  const queryTallerActual = 'SELECT fecha FROM taller WHERE idtaller = ? LIMIT 1';
  db.query(queryTallerActual, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener taller:', err);
      return res.status(500).json({ error: 'Error al validar el taller' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    const fechaTallerActual = new Date(results[0].fecha);
    const hoyAhora = new Date();
    hoyAhora.setHours(0, 0, 0, 0);
    if (fechaTallerActual <= hoyAhora) {
      return res.status(400).json({ error: 'No se puede editar un taller que ya ha comenzado' });
    }

    const setClause = Object.keys(campos).map(key => `${key} = ?`).join(', ');
    const values = Object.values(campos);

    // Validar dificultad si se actualiza
    if (Object.prototype.hasOwnProperty.call(campos, 'dificultad')) {
      const difVal = Number(campos.dificultad);
      if (!Number.isInteger(difVal) || difVal < 0 || difVal > 3) {
        return res.status(400).json({ error: 'La dificultad debe ser un entero entre 0 y 3 (0: desconocido, 1: principiante, 2: intermedio, 3: avanzado)' });
      }
    }

    // Si se va a modificar fecha o idcurso, validar rango utilizando valores actuales si falta alguno
    if (campos.fecha || campos.idcurso) {
      const queryActual = 'SELECT idcurso, fecha FROM taller WHERE idtaller = ? LIMIT 1';
      db.query(queryActual, [id], (err, results) => {
        if (err) {
          console.error('Error al obtener taller para validar fecha:', err);
          return res.status(500).json({ error: 'Error al validar fecha del taller' });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Taller no encontrado' });
        }

        const idcursoTarget = campos.idcurso || results[0].idcurso;
        const fechaTarget = campos.fecha || results[0].fecha;

        validateWorkshopDateRange(idcursoTarget, fechaTarget, (valErr, status) => {
          if (valErr) {
            console.error('Error al validar fechas de taller:', valErr);
            return res.status(500).json({ error: 'Error al validar fechas de taller' });
          }
          if (status === 'invalid-date') {
            return res.status(400).json({ error: 'Fecha de taller inválida' });
          }
          if (status === 'course-not-found') {
            return res.status(404).json({ error: 'Curso no encontrado para el taller' });
          }
          if (status === 'course-invalid-dates') {
            return res.status(400).json({ error: 'El curso tiene fechas inválidas' });
          }
          if (status === 'out-of-range') {
            return res.status(400).json({ error: 'La fecha del taller debe estar dentro del rango de fechas del curso' });
          }

          const query = `UPDATE taller SET ${setClause} WHERE idtaller = ?`;
          db.query(query, [...values, id], (updErr, result) => {
            if (updErr) {
              console.error('Error al actualizar parcialmente el taller:', updErr);
              return res.status(500).json({ error: 'Error al actualizar el taller' });
            }
            if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Taller no encontrado' });
            }
            res.status(200).json({ message: 'Taller actualizado parcialmente' });
            console.log('Taller actualizado parcialmente con ID:', id);
          });
        });
      });
    } else {
      const query = `UPDATE taller SET ${setClause} WHERE idtaller = ?`;
      db.query(query, [...values, id], (err, result) => {
        if (err) {
          console.error('Error al actualizar parcialmente el taller:', err);
          return res.status(500).json({ error: 'Error al actualizar el taller' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Taller no encontrado' });
        }
        res.status(200).json({ message: 'Taller actualizado parcialmente' });
        console.log('Taller actualizado parcialmente con ID:', id);
      });
    }
  });
};

// DELETE talleres by curso ID (for cascading delete when a course is deleted)
const deleteTalleresByCursoId = (req, res) => {
  const { idcurso } = req.params;
  const query = 'DELETE FROM taller WHERE idcurso = ?';
  db.query(query, [idcurso], (err, result) => {
    if (err) {
      console.error('Error al eliminar talleres por ID de curso:', err);
      return res.status(500).json({ error: 'Error al eliminar talleres por ID de curso' });
    }
    res.status(200).json({ message: 'Talleres eliminados correctamente' });
    console.log('Talleres eliminados para el curso con ID:', idcurso);
  });
};
module.exports = {
  getTalleres,
  getTallerById,
  getTalleresByCurso,
  createTaller,
  deleteTaller,
  putTaller,
  patchTaller,
  deleteTalleresByCursoId
};