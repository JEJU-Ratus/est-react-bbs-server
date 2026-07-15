const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
const dotenv = require("dotenv");
const port = 3000;
const multer = require("multer");

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // json -> object
app.use("/uploads", express.static("uploads")); // uploads 폴더 접근 권한
// cors 허용
let corsOptions = {
  origin: "*",
};

app.use(cors());

// file 경로와 파일명
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    originExt = file.originalname.split(".")[1];
    console.log(file.fieldname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1000);
    cb(null, uniqueSuffix + "-" + file.fieldname + "." + originExt);
  },
});

const upload = multer({ storage: storage });
// sql 연동
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect();
// get요청 주소에 따른 출력 (read에 가까운)
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/list", (req, res) => {
  const sqlQuery =
    "SELECT id, title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board";
  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});
// detail page 보기(view)
app.get("/view", (req, res) => {
  // console.log(req.query);
  const id = req.query.id;
  const sqlQuery =
    "SELECT title, content, writer,image_path, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board where id=?;";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});
// create(write)
app.post("/write", upload.single("image"), (req, res) => {
  console.log(req.body);
  const { title, writer, content } = req.body;
  const imagePath = req.file ? req.file.path : null; // true면 업로드 된 파일의 경로
  const sqlQuery = "INSERT INTO board (title, content, writer, image_path) values (?,?,?,?);";
  db.query(sqlQuery, [title, content, writer, imagePath], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});
// update
app.post("/update", (req, res) => {
  console.log(req.body);
  const { name, title, content, id } = req.body;
  const sqlQuery = "UPDATE board SET writer=?, title=?, content=? where id=?;";
  db.query(sqlQuery, [name, title, content, id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});
// delete
app.post("/delete", (req, res) => {
  console.log(req.body);
  const { id } = req.body;
  const sqlQuery = "DELETE FROM board where id=?;";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});
// deleteSelect
app.post("/deleteselect", (req, res) => {
  console.log(req.body);
  const { boardIdList } = req.body;
  const sqlQuery = `DELETE FROM board where id in (${boardIdList})`;
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
