require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());

// Configuración de CORS específica para Vercel
const corsOptions = {
  origin: [
    'https://cursoftware.vercel.app',
    'https://cursoftware-*.vercel.app', // Para preview deployments de Vercel
    'http://localhost:4200' // Para desarrollo local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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
