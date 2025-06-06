const db = require('../models/userModel');

// GET ALL
const getDocentes = (req, res) => {
  const query = 'SELECT docente.* FROM docente';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener docente:', err);
      return res.status(500).json({ error: 'Error al obtener los docentes' });
    }
    res.status(200).json(results);
    console.log('docente obtenidos correctamente');
  });
};

// GET BY dni
const getDocenteByDni = (req, res) => {
  const { dni } = req.params;
  const query = 'SELECT * FROM docente WHERE dni = ?';
  
  db.query(query, [dni], (err, results) => {
    if (err) {
      console.error('Error al obtener docente por DNI:', err);
      return res.status(500).json({ error: 'Error al obtener el docente' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.status(200).json(results[0]);
    console.log('Docente obtenido correctamente por DNI');
  });
};

// CREATE docente
const createDocente = (req, res) => {
  const { dni, nombre, apellido, telefono, direccion, email, contraseña } = req.body;

  const query = `
    INSERT INTO docente (dni, nombre, apellido, telefono, direccion, email, contraseña)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [dni, nombre, apellido, telefono, direccion, email, contraseña], (err, results) => {
    if (err) {
      console.error('Error al crear docente:', err);
      return res.status(500).json({ error: 'Error al crear el docente' });
    }
    res.status(201).json({ message: 'Docente creado correctamente', dni: results.insertdni });
    console.log('Docente creado correctamente');
  });
};

const deleteDocenteByDni = (req, res) => {
  const { dni } = req.params;

  const query = 'DELETE FROM docente WHERE dni = ?';

  db.query(query, [dni], (err, results) => {
    if (err) {
      console.error('Error al eliminar docente:', err);
      return res.status(500).json({ error: 'Error al eliminar el docente' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    res.status(200).json({ message: 'Docente eliminado correctamente' });
    console.log('Docente eliminado correctamente');
  });
};

// Actualizar datos del docente por DNI
const updateDocente = (req, res) => {
  const dni = req.params.dni;
  const { direccion, email, telefono, contraseña } = req.body;

  if (!direccion || !email || !telefono || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    UPDATE docente
    SET direccion = ?, email = ?, telefono = ?, contraseña = ?
    WHERE dni = ?
  `;

  const values = [direccion, email, telefono, contraseña, dni];

 db.query(sql, values, (err, result) => {
    console.log('Valores enviados:', values);
    if (err) {
      console.error('Error al actualizar docente:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Docente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Docente actualizado correctamente' });
  });
};

module.exports = {
  getDocentes,
  getDocenteByDni,
    createDocente,
    deleteDocenteByDni,
  updateDocente,
};