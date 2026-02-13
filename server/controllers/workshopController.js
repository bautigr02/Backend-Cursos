const WorkshopRepository = require('../repositories/workshopRepository');

// Validates that the workshop date falls within the course date range
const validateWorkshopDateRange = async (idcurso, fecha) => {
  const fechaTaller = new Date(fecha);
  if (Number.isNaN(fechaTaller.getTime())) {
    throw new Error('Fecha de taller inválida');
  }

  const resultado = await WorkshopRepository.validateWorkshopDateRange(idcurso);
  if (!resultado || resultado.length === 0) {
    throw new Error('Curso no encontrado');
  }
    const fecIni = new Date(resultado[0].fec_ini);
    const fecFin = new Date(resultado[0].fec_fin);

    if (Number.isNaN(fecIni.getTime()) || Number.isNaN(fecFin.getTime())) {
      throw new Error('El curso tiene fechas inválidas');
    }

    const dentroDeRango = fechaTaller >= fecIni && fechaTaller <= fecFin;
    if (!dentroDeRango){
      throw new Error('La fecha del taller debe estar dentro del rango de fechas del curso');
    }
    return true;
};

// GET ALL
const getTalleres = async (req, res) => {
  try {
    const result = await WorkshopRepository.getTalleres();
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'No se encontraron talleres' });
    }
    console.log('Talleres obtenidos correctamente');
    return res.status(200).json(result);

  } catch (err) {
    console.error('Error al obtener talleres:', err);
    return res.status(500).json({ error: 'Error al obtener los talleres' });
  }
};

// GET ONE x ID
const getTallerById = async (req, res) => {
  const { id } = req.params;
  try{
    const resultado = await WorkshopRepository.getTallerById(id);

    if (!resultado) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    console.log('Taller', id, 'obtenido correctamente');
    return res.status(200).json(resultado);
  } catch (err) {
    console.error('Error al obtener taller por ID:', err);
    return res.status(500).json({ error: 'Error al obtener el taller' });
  }
};

// GET talleres por curso
const getTalleresByCurso = async (req, res) => {
  const { idcurso } = req.params;
  try {
    const resultado = await WorkshopRepository.getTalleresByCurso(idcurso);
    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'No se encontraron talleres para el curso' });
    }
    console.log('Talleres del curso', idcurso, 'obtenidos correctamente');
    return res.status(200).json(resultado);

  }catch (err) {
    return res.status(500).json({ error: 'Error al obtener talleres por curso' });
  }
};

// CREATE
const createTaller = async(req, res) => {
  const { idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen } = req.body;
  if (!idcurso || !nom_taller || !fecha || !tematica || !herramienta || !hora_ini || !requisitos || dificultad === undefined || dificultad === null || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  const difVal = Number(dificultad);
  if (!Number.isInteger(difVal) || difVal < 0 || difVal > 3) {
    return res.status(400).json({ error: 'La dificultad debe ser un entero entre 0 y 3 (0: desconocido, 1: principiante, 2: intermedio, 3: avanzado)' });
  }
  try{
      await validateWorkshopDateRange(idcurso, fecha);

      const resultado = await WorkshopRepository.createTaller({ idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad: difVal, dni_docente, imagen });
      if (!resultado) {
        return res.status(500).json({ error: 'Error al crear el taller' });
      }
      console.log('Taller creado correctamente con ID:', resultado.insertId);
      return res.status(201).json({ idtaller: resultado.insertId, idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad: difVal, dni_docente, imagen });
    
    }catch (err) {
      console.error('Error al crear taller:', err);

      if (err.message === 'Curso no encontrado') {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === 'Fecha de taller inválida' || err.message === 'El curso tiene fechas inválidas' || err.message === 'La fecha del taller debe estar dentro del rango de fechas del curso') {
        return res.status(400).json({ error: err.message });
      }

      return res.status(500).json({ error: 'Error al crear el taller' });
    }
};

// DELETE
const deleteTaller = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await WorkshopRepository.deleteTaller(id);
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    console.log('Taller eliminado con ID:', id);
    return res.status(200).json({ message: 'Taller eliminado correctamente' });
  }catch (err) {
    console.error('Error al eliminar taller:', err);
    return res.status(500).json({ error: 'Error al eliminar el taller' });
  }
};

// PUT (actualizar todo el taller)
const putTaller = async (req, res) => {
  const { id } = req.params;
  const { idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen } = req.body;
  
  if (!idcurso || !nom_taller || !fecha || !tematica || !herramienta || !hora_ini || !requisitos || !dificultad || !dni_docente) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try{
    const tallerActual = await WorkshopRepository.getTallerById(id);
    if (!tallerActual) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    const fechaTallerActual = new Date(tallerActual.fecha);
    const hoyAhora = new Date();
    hoyAhora.setHours(0, 0, 0, 0);
    if (fechaTallerActual <= hoyAhora) {
      return res.status(400).json({ error: 'No se puede editar un taller que ya ha comenzado' });
    }

    await validateWorkshopDateRange(idcurso, fecha);
    const resultado = await WorkshopRepository.putTaller(id, { idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen });
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    console.log('Taller actualizado con ID:', id);
    return res.status(200).json({ message: 'Taller actualizado correctamente' });

  }catch (err) {
    if (err.message === 'Curso no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Fecha de taller inválida' || err.message === 'El curso tiene fechas inválidas' || err.message === 'La fecha del taller debe estar dentro del rango de fechas del curso') {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error al actualizar taller:', err);
    return res.status(500).json({ error: 'Error al actualizar el taller' });
  }
};


// PATCH (actualizar parcialmente el taller)
const patchTaller = async(req, res) => {
  const { id } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }
  try {
    const tallerActual = await WorkshopRepository.getTallerById(id);
    if (!tallerActual) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }
    const fechaTallerActual = new Date(tallerActual.fecha);
    const hoyAhora = new Date();
    hoyAhora.setHours(0, 0, 0, 0);
    if (fechaTallerActual <= hoyAhora) {
      return res.status(400).json({ error: 'No se puede editar un taller que ya ha comenzado' });
    }
    if (Object.prototype.hasOwnProperty.call(campos, 'dificultad')) {
      const difVal = Number(campos.dificultad);
      if (!Number.isInteger(difVal) || difVal < 0 || difVal > 3) {
        return res.status(400).json({ error: 'La dificultad debe ser un entero entre 0 y 3 (0: desconocido, 1: principiante, 2: intermedio, 3: avanzado)' });
      }
    }
    if (campos.fecha || campos.idcurso) {
      await validateWorkshopDateRange(campos.idcurso || tallerActual.idcurso, campos.fecha || tallerActual.fecha);
    }

    const resultado = await WorkshopRepository.patchTaller(id, campos);
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Taller no encontrado' });
    }

    console.log('Taller actualizado parcialmente con ID:', id);
    return res.status(200).json({ message: 'Taller actualizado parcialmente' });

  }catch (err) {
    if (err.message === 'Curso no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Fecha de taller inválida' || err.message === 'El curso tiene fechas inválidas' || err.message === 'La fecha del taller debe estar dentro del rango de fechas del curso') {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error al actualizar parcialmente el taller:', err);
    return res.status(500).json({ error: 'Error al actualizar el taller' });
  }
};

// DELETE talleres by curso ID (for cascading delete when a course is deleted)
const deleteTalleresByCursoId = async (req, res) => {
  const { idcurso } = req.params;
  try {
    const resultado = await WorkshopRepository.deleteTalleresByCursoId(idcurso);
    if (!resultado) {
      return res.status(500).json({ error: 'Error al eliminar talleres por ID de curso' });
    }
    console.log('Talleres eliminados para el curso con ID:', idcurso);
    return res.status(200).json({ message: 'Talleres eliminados correctamente' });
  } catch (err) {
    console.error('Error al eliminar talleres por ID de curso:', err);
    return res.status(500).json({ error: 'Error al eliminar talleres por ID de curso' });
  }
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