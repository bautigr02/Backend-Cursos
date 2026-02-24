require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api', teacherRoutes);

const courseRoutes = require('./routes/courseRoutes');
app.use('/api', courseRoutes);

const workshopRoutes = require('./routes/workshopRoutes');
app.use('/api', workshopRoutes);

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

module.exports = app;
