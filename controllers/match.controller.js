const db = require("../config/db");
const { ballsToOvers, calculateRunRate } = require("../utils/cricket.utils");

let io;

exports.setSocket = (_io) => {
  io = _io;
};

// ✅ CREATE MATCH
exports.createMatch = async (req, res) => {
  try {
    const { teamA, teamB, overs } = req.body;

    const [result] = await db.execute(
      "INSERT INTO matches (teamA, teamB, overs, runs, wickets, balls, status, innings, target) VALUES (?, ?, ?, 0, 0, 0, 'LIVE', 1, 0)",
      [teamA, teamB, overs]
    );

    const [rows] = await db.execute(
      "SELECT * FROM matches WHERE id = ?",
      [result.insertId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create match" });
  }
};

// ✅ GET MATCHES
exports.getMatches = async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM matches ORDER BY id DESC");
  res.json(rows);
};

// ✅ UPDATE SCORE
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute(
      "UPDATE matches SET status=? WHERE id=?",
      [status, id]
    );

    res.json({ msg: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};
exports.updateScore = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const runs = Number(req.body.runs) || 0;
    const isWicket = req.body.isWicket || false;

    const [rows] = await db.execute(
      "SELECT * FROM matches WHERE id = ?",
      [id]
    );

    if (!rows.length) return res.status(404).json({ msg: "Match not found" });

    const match = rows[0];

    let newRuns = (match.runs || 0) + runs;
    let newBalls = (match.balls || 0) + 1;
    let newWickets = (match.wickets || 0) + (isWicket ? 1 : 0);
    let newStatus = match.status;
    let winner = match.winner;

    // 🟢 FIRST INNINGS END
    if (match.innings === 1 && newBalls >= match.overs * 6) {
      const target = newRuns + 1;

      await db.execute(
        "UPDATE matches SET innings=2, target=?, runs=0, wickets=0, balls=0 WHERE id=?",
        [target, id]
      );

      const response = {
        ...match,
        innings: 2,
        target,
        runs: 0,
        wickets: 0,
        balls: 0,
        overs: 0,
      };

      io?.emit("scoreUpdate", response);
      return res.json(response);
    }

    // 🔵 SECOND INNINGS (CHASE)
    if (match.innings === 2) {
      if (newRuns >= match.target) {
        winner = match.teamB;
        newStatus = "COMPLETED";
      } else if (newBalls >= match.overs * 6) {
        winner = match.teamA;
        newStatus = "COMPLETED";
      }
    }

    await db.execute(
      "UPDATE matches SET runs=?, balls=?, wickets=?, status=?, winner=? WHERE id=?",
      [newRuns, newBalls, newWickets, newStatus, winner, id]
    );

    const response = {
      id,
      teamA: match.teamA,
      teamB: match.teamB,
      runs: newRuns,
      wickets: newWickets,
      balls: newBalls,
      overs: Number(ballsToOvers(newBalls)),
      runRate: Number(calculateRunRate(newRuns, newBalls)),
      status: newStatus,
      innings: match.innings,
      target: match.target,
      winner,
    };

    io?.emit("scoreUpdate", response);

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update score" });
  }
};
