import express from "express";
import cors from "cors";
import db from "./database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send({ id: this.lastID });
      }
    }
  );
});

app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rows);
    }
  });
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});