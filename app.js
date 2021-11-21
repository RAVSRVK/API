const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const filePath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
let db = null;

const connectdb = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Connected Successfully");
    });
  } catch (e) {
    console.log(e);
  }
};
connectdb();

let convertplayer = (ele) => {
  return {
    playerId: ele.player_id,
    playerName: ele.player_name,
  };
};
let convertMatch = (ele) => {
  return {
    matchId: ele.match_id,
    match: ele.match,
    year: ele.year,
  };
};

let convertmatchId = (ele) => {
  return {
    playerId: ele.player_id,
    playerName: ele.player_name,
  };
};

app.get("/players/", async (req, res) => {
  let query1 = `select * from player_details`;
  let api1 = await db.all(query1);
  res.send(api1.map((ele) => convertplayer(ele)));
});

app.get("/players/:playerId/", async (req, res) => {
  let { playerId } = req.params;
  let query2 = `select * from player_details where player_id = ${playerId}`;
  let api2 = await db.all(query2);
  res.send({
    playerId: api2[0].player_id,
    playerName: api2[0].player_name,
  });
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query3 = `
  UPDATE
    player_details
  SET
    player_name ='${playerName}'
  WHERE
    player_id = ${playerId};`;

  await db.run(query3);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (req, res) => {
  let { matchId } = req.params;
  let query4 = `select * from match_details where match_id = ${matchId}`;
  let api4 = await db.all(query4);
  res.send({
    matchId: api4[0].match_id,
    match: api4[0].match,
    year: api4[0].year,
  });
});

app.get("/players/:playerId/matches/", async (req, res) => {
  let { playerId } = req.params;
  let query5 = `select player_match_score.match_id, match, year from player_match_score inner join match_details on match_details.match_id = player_match_score.match_id where player_id = ${playerId}`;
  let api5 = await db.all(query5);
  res.send(api5.map((ele) => convertMatch(ele)));
});

app.get("/matches/:matchId/players/", async (req, res) => {
  let { matchId } = req.params;
  let query6 = `select player_match_score.player_id, player_name from player_match_score inner join player_details on player_match_score.player_id = player_details.player_id 
  where match_id = ${matchId}`;
  let api6 = await db.all(query6);
  res.send(api6.map((ele) => convertmatchId(ele)));
});

app.get("/players/:playerId/playerScores/", async (req, res) => {
  let { playerId } = req.params;
  let query7 = `select player_match_score.player_id, player_name, sum(score), sum(fours), sum(sixes) from player_match_score inner join player_details on player_match_score.player_id = player_details.player_id
   where player_match_score.player_id = ${playerId} group by player_name`;
  let api7 = await db.all(query7);
  console.log(api7);
  let p = {
    playerId: api7[0].player_id,
    playerName: api7[0]["player_name"],
    totalScore: api7[0]["sum(score)"],
    totalFours: api7[0]["sum(fours)"],
    totalSixes: api7[0]["sum(sixes)"],
  };
  console.log(p);
  res.send(p);
});
module.exports = app;
