import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config()

const pool = mysql2.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database

})

export default pool;