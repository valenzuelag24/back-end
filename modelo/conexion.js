import mysql2 from 'mysql2/promise';

const pool = mysql2.createPool({
    host:'Localhost',
    user:'root',
    password:'',
    database:'TP_users'

})

export default pool;