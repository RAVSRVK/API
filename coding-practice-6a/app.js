const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;
const filepath = path.join(__dirname, "covid19India.db");
const connectDB = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Hearing");
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
connectDB();
let convertdbtojson = (api1) => {
  let p = {
    stateId: api1.state_id,
    stateName: api1.state_name,
    population: api1.population,
  };
  return p;
};
const convertDistrictDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};
app.get("/states/", async (req, res) => {
  let get_states_query = `select * from state`;
  let api1 = await db.all(get_states_query);
  api1.map((ele) => {
    convertdbtojson(ele);
  });
  res.send(api1);
});

app.get("/states/:stateId/", async (req, res) => {
  let { stateId } = req.params;
  let state_id_query = `select * from state where state_id = '${stateId}'`;
  let api2 = await db.get(state_id_query);
  let p = {
    stateId: api2.state_id,
    stateName: api2.state_name,
    population: api2.population,
  };
  res.send(JSON.parse(JSON.stringify(p)));
});

app.post("/districts/", async (req, res) => {
  let { districtName, stateId, cases, cured, active, deaths } = req.body;
  let district_query = `insert into district (district_name, state_id, cases, cured, active, deaths)
    values '${districtName}', '${stateId}' ,'${cases}' ,'${cured}' , '${active}' ,'${deaths}'`;
  await db.run(district_query);
  res.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (req, res) => {
  let { districtId } = req.params;
  let district_get_query = `select * from district where district_id = '${districtId}'`;
  let p = await db.get(district_get_query);
  res.send(convertDistrictDbObjectToResponseObject(p));
});

app.delete("/districts/:districtId/", async (req, res) => {
  let { districtId } = req.params;
  let district_delete_query = `delete from district where district_id = ${districtId}`;
  await db.run(district_delete_query);
  res.send("District Removed");
});

app.put("/districts/:districtId/", async (req, res) => {
  let { districtId } = req.params;
  let { districtName, stateId, cases, cured, active, deaths } = req.body;
  let update_district_query = `update district set district_name = '${districtName}', 
  state_id = ${stateId}, 'cases = ${cases}', cured = ${cured}, 
  'active = ${active}', deaths = ${deaths} where district_id = ${districtId}`;
  await db.run(update_district_query);
  res.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (req, res) => {
  let { stateId } = req.params;
  let stats_query = `select sum(cases) as totalCases, sum(cured) as totalCured,
    sum(active) as totalActive, sum(deaths) as totalDeaths from district where state_id = ${stateId}`;
  console.log(stats_query);
  let api7 = await db.get(stats_query);
  res.send(api7);
});

module.exports = app;
