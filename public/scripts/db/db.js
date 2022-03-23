const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    database: process.env.NAME_DATABASE
});

connection.connect((err)=>{
    if(err) throw err;
    console.log(`connected to db ${process.env.USER_DATABASE}!`);
});

module.exports = connection;