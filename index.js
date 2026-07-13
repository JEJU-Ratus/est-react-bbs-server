const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
const dotenv = require("dotenv");
const port = 3000;

// cors 허용
let corsOptions = {
  origin: "*",
};

app.use(cors());

// sql 연동
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect();
// 요청 주소에 따른 출력
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/list", (req, res) => {
  const sqlQuery = "SELECT * FROM board";
  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/*
db.query('Sql 쿼리', (err) => {
  if (err) throw err;

});
*/
