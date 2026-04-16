const db = require("../config/db");
const { ballsToOvers, calculateRunRate } = require("../utils/cricket.utils");

let io;

// set socket instance
exports.setSocket = (_io) => {
  io = _io;
};

// ✅ Create Match
exports.createMatch = async (req, res) => {
  const { teamA, teamB, totalOvers } = req.body;

  const [result] = await db.execute(
    "INSERT INTO matches (teamA, teamB, totalOvers, status) VALUES (?, ?, ?, 'LIVE')",
    [teamA, teamB, totalOvers]
  );

  const [rows] = await db.execute("SELECT * FROM matches WHERE id = ?", [
    result.insertId,
  ]);

  res.json(rows[0]);
};

// ✅ Get Matches
exports.getMatches = async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM matches ORDER BY id DESC");
  res.json(rows);
};

// ✅ Update Score
exports.updateScore = async (req, res) => {
  const { id } = req.params;
  const { runs, isWicket } = req.body;

  const [rows] = await db.execute("SELECT * FROM matches WHERE id = ?", [id]);

  if (rows.length === 0)
    return res.status(404).json({ msg: "Match not found" });

  const match = rows[0];

  if (match.status === "COMPLETED") {
    return res.status(400).json({ msg: "Match already completed" });
  }

  let newRuns = match.runs + runs;
  let newBalls = match.balls + 1;
  let newWickets = match.wickets + (isWicket ? 1 : 0);

  let newStatus = match.status;

  // complete match if overs exceeded
  if (newBalls >= match.totalOvers * 6) {
    newStatus = "COMPLETED";
  }

  await db.execute(
    "UPDATE matches SET runs=?, balls=?, wickets=?, status=? WHERE id=?",
    [newRuns, newBalls, newWickets, newStatus, id]
  );

  const response = {
    id,
    teamA: match.teamA,
    teamB: match.teamB,
    runs: newRuns,
    wickets: newWickets,
    balls: newBalls,
    overs: ballsToOvers(newBalls),
    runRate: calculateRunRate(newRuns, newBalls),
    status: newStatus,
  };

  // 🔥 Socket emit (ROOM)
  io.to(id.toString()).emit("scoreUpdate", response);

  res.json(response);
};

// ✅ Update Status
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  await db.execute("UPDATE matches SET status=? WHERE id=?", [status, id]);

  res.json({ msg: "Status updated" });
};