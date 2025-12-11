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

const courseRoutes = require('./routes/courseRoutes');
app.use('/api', courseRoutes);

const workshopRoutes = require('./routes/workshopRoutes');
app.use('/api', workshopRoutes);


//Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

/*El 127.0.0.1 es para que corra de forma local y otros dispositivos no se puedan conectar, tener en cuenta*/ 