require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 
app.use(cors()); 
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api', teacherRoutes);
//Servidor
app.listen(port, '127.0.0.1', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

/*El '127.0.0.1' es para que corra de forma local y otros dispositivos no se puedan conectar, tener en cuenta*/

process.on('SIGINT', () => {
  console.log('Servidor cerrado con Ctrl+C');
  process.exit();
});