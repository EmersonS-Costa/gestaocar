require("dotenv").config();
const connStr = process.env.CONNECTION_STRING;
const sql = require("mssql");
 
async function createTable() {
    try {
       await sql.connect(connStr);
       console.log("Conectou!")

    } catch (err) {
       console.error(err);
    }
 }
 createTable();