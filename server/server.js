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
//Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});