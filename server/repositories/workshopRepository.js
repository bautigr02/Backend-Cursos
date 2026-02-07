const db = require ('../models/db');

const WorkshopRepository = {

    validateWorkshopDateRange: (idcurso,) => {
        const queryCurso = 'SELECT fec_ini, fec_fin FROM curso WHERE idcurso = ? LIMIT 1';
        return new Promise((resolve, reject) => {
            db.query(queryCurso, [idcurso], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    getTalleres: () => {
    const query = 'SELECT * FROM taller';
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => err ? reject(err) : resolve(results));
        });
    },

    getTallerById: (id) => {
        const query = 'SELECT * FROM taller WHERE idtaller = ?';
        return new Promise((resolve, reject) => {
            db.query(query, [id], (err, results) => err ? reject(err) : resolve(results[0]));
        });
    },

    getTalleresByCurso: (idcurso) => {
        const query = 'SELECT * FROM taller WHERE idcurso = ?';
        return new Promise ((resolve, reject) => {
            db.query(query, [idcurso], (err, results) => err ? reject(err) : resolve(results));
        });
    },

    createTaller: (datos) => {
        const { idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen } = datos;
        const query = `INSERT INTO taller (idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            db.query(query, [idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    deleteTaller: (id) => {
        const query = 'DELETE FROM taller WHERE idtaller = ?';
        return new Promise ((resolve, reject) => {
            db.query(query, [id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },
    //Actualiza todo el taller
    putTaller: (id, datos) => {
        const{ idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen } = datos;
        const query = `UPDATE taller SET idcurso = ?, nom_taller = ?, fecha = ?, tematica = ?, herramienta = ?, hora_ini = ?, requisitos = ?, dificultad = ?, dni_docente = ?, imagen = ? WHERE idtaller = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [idcurso, nom_taller, fecha, tematica, herramienta, hora_ini, requisitos, dificultad, dni_docente, imagen, id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },
    patchTaller : (id, campos) => {
        const keys = Object.keys(campos);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(campos);
        const query = `UPDATE taller SET ${setClause} WHERE idtaller = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [...values, id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    deleteTalleresByCursoId: (idcurso) => {
        const query = 'DELETE FROM taller WHERE idcurso = ?';
        return new Promise((resolve, reject) => {
            db.query(query, [idcurso], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
}

module.exports = WorkshopRepository;