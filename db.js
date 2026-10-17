'use strict';
require('dotenv').config();
const mysql = require('mysql2/promise');

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  // On n'affiche que les NOMS des variables manquantes, jamais leurs valeurs.
  console.error('Variables d\'environnement manquantes :', missing.join(', '));
  process.exit(1);
}

// Aiven impose TLS. Le certificat CA est fourni via la variable DB_CA_CERT.
const ca = process.env.DB_CA_CERT
  ? process.env.DB_CA_CERT.replace(/\\n/g, '\n')
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 15000,   // délai d'expiration de connexion (15 s)
  enableKeepAlive: true,
  charset: 'utf8mb4'
});

// Évite le blocage d'une requête trop longue.
async function query(sql, params) {
  const [rows] = await pool.query({ sql, timeout: 10000 }, params);
  return rows;
}

module.exports = { pool, query };
