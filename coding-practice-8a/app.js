const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const connect = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
connect();

app.get("/todos/", async (req, res) => {
  let { status, priority, search_q = "" } = req.query;
  if (status !== undefined && priority !== undefined && search_q !== "") {
    let query1 = `select * from TODO where status = '${status}' and 
      priority = '${priority}' and todo like '%${search_q}%'`;
    let api1 = await db.all(query1);
    res.send(api1);
  } else if (status !== undefined && priority !== undefined) {
    let query1 = `select * from TODO where status = '${status}' and 
      priority = '${priority}'`;
    let api1 = await db.all(query1);
    res.send(api1);
    console.log(query1);
  } else if (status !== undefined) {
    let query1 = `select * from TODO where status = '${status}'`;
    let api1 = await db.all(query1);
    res.send(api1);
  } else if (priority !== undefined) {
    let query1 = `select * from TODO where priority = '${priority}'`;
    let api1 = await db.all(query1);
    res.send(api1);
    console.log(priority);
  } else {
    let query1 = `select * from TODO where todo like '%${search_q}%'`;
    let api1 = await db.all(query1);
    res.send(api1);
  }
});
app.get("/todos/:todoId/", async (req, res) => {
  let { todoId } = req.params;
  let query2 = `select * from todo where id = ${todoId}`;
  let api2 = await db.get(query2);
  res.send(api2);
});
app.post("/todos/", async (req, res) => {
  try {
    let { id, todo, priority, status } = req.body;
    let query3 = `insert into todo (id, todo, priority, status) 
  values (${id}, '${todo}', '${priority}', '${status}')`;

    await db.run(query3);
    res.send("Todo Successfully Added");
  } catch (e) {
    console.log(e);
  }
});

app.put("/todos/:todoId/", async (req, res) => {
  let { todoId } = req.params;
  let { status, priority, todo } = req.body;
  let k = "";
  switch (true) {
    case status !== undefined:
      k = "status";
      break;
    case priority !== undefined:
      k = "priority";
      break;
    default:
      k = "todo";
      break;
  }
  let p = req.body;
  let query4 = `update todo set ${k} = '${p[k]}' where id = ${todoId}`;
  console.log(query4);
  await db.run(query4);
  let s = k[0].toUpperCase();
  s = s + k.slice(1);
  res.send(s + " Updated");
});

app.delete("/todos/:todoId/", async (req, res) => {
  let { todoId } = req.params;
  let query = `delete from todo where id = ${todoId}`;
  await db.run(query);
  res.send("Todo Deleted");
});

module.exports = app;
