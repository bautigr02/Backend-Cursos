const db = require('../models/db');

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
  const query = `
    UPDATE taller 
    SET idcurso = ?, nom_taller = ?, fecha = ?, tematica = ?, herramienta = ?, hora_ini = ?, requisitos = ?, dificultad = ?, dni_docente = ?, imagen = ?
    WHERE idtaller = ?
  `;
  db.query(
    query,
    [idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, id],
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
};

// PATCH (actualizar parcialmente el taller)
const patchTaller = (req, res) => {
  const { id } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  const setClause = Object.keys(campos).map(key => `${key} = ?`).join(', ');
  const values = Object.values(campos);

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
};

module.exports = {
  getTalleres,
  getTallerById,
  getTalleresByCurso,
  createTaller,
  deleteTaller,
  putTaller,
  patchTaller
};