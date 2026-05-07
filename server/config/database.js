// importar Sequelize y configurar conexión a la base de datos MySQL utilizando
//  variables de entorno (.env) para mayor seguridad y flexibilidad

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Crea una unica instancia de Sequelize con configuración de conexión a MySQL

const sequelize = new Sequelize(

  // Utilizar variables de entorno para configurar la conexión a la base de datos
  
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

module.exports = sequelize;
