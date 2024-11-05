import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

const db = new pg.Client({
  connectionString: process.env.DBURL,
});

db.connect().then(() => {
  console.log("Connected to Database!");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const checkUserName = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [data.username]
    );
    const checkEmail = await db.query("SELECT * FROM users WHERE email = $1", [
      data.email,
    ]);

    if (checkUserName.rows.length > 0 || checkEmail.rows.length > 0) {
      console.log("400");
      return res.sendStatus(401);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userData = await db.query(
      "INSERT INTO users(username,password,email) VALUES($1,$2,$3) RETURNING userid,username,email",
      [data.username, hashedPassword, data.email]
    );

    const userDataJWT = jwt.sign(userData.rows[0], process.env.JWTToken);
    console.log("200");
    return res.json({ JWT: userDataJWT });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

app.post("/signin", (req, res) => {
  try {
  } catch (error) {}
});

app.listen(port, () => {
  console.log(`Listening on ${port}!`);
});
