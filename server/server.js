require('dotenv').config();
const app = require('./app');
const {cambiarEstadoCurso} = require('./controllers/courseController');

const port = process.env.PORT || 3000;

// Solo arrancar el servidor cuando este archivo sea ejecutado directamente
if (require.main === module) {
  app.listen(port, async () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    try {
      await cambiarEstadoCurso();
      console.log('Estado de los cursos e inscripciones actualizado automáticamente al iniciar el servidor.');
    } catch (error) {
      console.error('Error inesperado al actualizar el estado de los cursos/inscripciones:', error);
    }
    setInterval(async () => {
      try{
        await cambiarEstadoCurso();
        console.log('Estado de los cursos e inscripciones actualizado automáticamente.');
      } catch (error) {
        console.error('Error inesperado al actualizar el estado de los cursos/inscripciones:', error);
      }
    }, 86400000); // 24 horas en milisegundos
  });
}

/*El 127.0.0.1 es para que corra de forma local y otros dispositivos no se puedan conectar, tener en cuenta*/ 