const db = require('../models/db');

// GET ALL
const getCursos = (req, res) => {
  const query = 'SELECT curso.*, aula.cant_alumnos FROM curso JOIN aula ON curso.num_aula = aula.num_aula';
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

// PUT (actualizar todo el curso)
const putCurso = (req, res) => {
  const { id } = req.params;
  const { nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen } = req.body;
  if (!nom_curso || !fec_ini || !fec_fin || !estado || !num_aula || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
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
};

// PATCH (actualizar parcialmente el curso)
const patchCurso = (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
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
};

// Crear un nuevo curso
const createCurso = (req, res) => {
  const { nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen } = req.body;
  if (!nom_curso || !fec_ini || !fec_fin || !estado || !num_aula || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  const query = 'INSERT INTO curso (nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen], (err, result) => {
    if (err) {
      console.error('Error al crear el curso:', err);
      return res.status(500).json({ error: 'Error al crear el curso' });
    }
    res.status(201).json({ id: result.insertId, nom_curso, fec_ini, fec_fin, estado, num_aula, dni_docente, descripcion, imagen });
    console.log('Curso creado correctamente con ID:', result.insertId);
  });
};

module.exports = { getCursos, getCursoById, createCurso, deleteCurso, putCurso, patchCurso };
