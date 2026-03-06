require('dotenv').config();
const mysql = require('mysql2');

// Configurar pool de conexiones usando variables de entorno
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar conectividad al iniciar
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
  connection.release();
});

module.exports = db;