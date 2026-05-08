const db = require("../config/db");
const {
  ballsToOvers,
  calculateRunRate,
} = require("../utils/cricket.utils");

let io;

exports.setSocket = (_io) => {
  io = _io;
};



// ✅ CREATE MATCH
exports.createMatch = async (req, res) => {

  try {

    const {
      teamA,
      teamB,
      overs,
    } = req.body;

    const [result] = await db.execute(
      `
      INSERT INTO matches
      (
        teamA,
        teamB,
        overs,
        runs,
        wickets,
        balls,
        status,
        innings,
        target,
        battingTeam,
        bowlingTeam,
        winner
      )

      VALUES
      (
        ?, ?, ?,
        0, 0, 0,
        'LIVE',
        1,
        0,
        NULL,
        NULL,
        NULL
      )
      `,
      [
        teamA,
        teamB,
        overs,
      ]
    );

    const [rows] = await db.execute(
      "SELECT * FROM matches WHERE id=?",
      [result.insertId]
    );

    res.json(rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to create match",
    });

  }
};



// ✅ GET MATCHES
exports.getMatches = async (req, res) => {

  try {

    const [rows] = await db.execute(
      "SELECT * FROM matches ORDER BY id DESC"
    );

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to fetch matches",
    });

  }
};



// ✅ CHOOSE BATTING TEAM
exports.chooseBatting = async (req, res) => {

  try {

    const { id } = req.params;

    const { battingTeam } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM matches WHERE id=?",
      [id]
    );

    if (!rows.length) {

      return res.status(404).json({
        msg: "Match not found",
      });
    }

    const match = rows[0];

    const bowlingTeam =
      battingTeam === match.teamA
        ? match.teamB
        : match.teamA;

    // SAVE TO DB
    await db.execute(
      `
      UPDATE matches
      SET battingTeam=?, bowlingTeam=?
      WHERE id=?
      `,
      [
        battingTeam,
        bowlingTeam,
        id,
      ]
    );

    const [updatedRows] = await db.execute(
      "SELECT * FROM matches WHERE id=?",
      [id]
    );

    res.json(updatedRows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to choose batting team",
    });

  }
};



// ✅ UPDATE SCORE
exports.updateScore = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      runs,
      isWicket,
    } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM matches WHERE id=?",
      [id]
    );

    if (!rows.length) {

      return res.status(404).json({
        msg: "Match not found",
      });
    }

    const match = rows[0];

    let newRuns =
      match.runs + runs;

    let newBalls =
      match.balls + 1;

    let newWickets =
      match.wickets +
      (isWicket ? 1 : 0);

    let newStatus =
      match.status;

    let winner =
      match.winner;



    // ✅ FIRST INNINGS COMPLETE
    if (
      match.innings === 1 &&
      newBalls >= match.overs * 6
    ) {

      const target =
        newRuns + 1;

      const newBattingTeam =
        match.bowlingTeam;

      const newBowlingTeam =
        match.battingTeam;

      await db.execute(
        `
        UPDATE matches
        SET
          innings=2,
          target=?,
          runs=0,
          wickets=0,
          balls=0,
          battingTeam=?,
          bowlingTeam=?
        WHERE id=?
        `,
        [
          target,
          newBattingTeam,
          newBowlingTeam,
          id,
        ]
      );

      const [updatedRows] =
        await db.execute(
          "SELECT * FROM matches WHERE id=?",
          [id]
        );

      const updatedMatch =
        updatedRows[0];

      const response = {
        ...updatedMatch,

        overs: 0,

        runRate: 0,
      };

      io?.emit(
        "scoreUpdate",
        response
      );

      return res.json(response);
    }



    // ✅ SECOND INNINGS
    if (match.innings === 2) {

      // chasing team wins
      if (
        newRuns >= match.target
      ) {

        winner =
          match.battingTeam;

        newStatus =
          "COMPLETED";
      }

      // bowling team wins
      else if (
        newBalls >= match.overs * 6
      ) {

        winner =
          match.bowlingTeam;

        newStatus =
          "COMPLETED";
      }
    }



    // UPDATE DB
    await db.execute(
      `
      UPDATE matches
      SET
        runs=?,
        balls=?,
        wickets=?,
        status=?,
        winner=?
      WHERE id=?
      `,
      [
        newRuns,
        newBalls,
        newWickets,
        newStatus,
        winner,
        id,
      ]
    );



    const response = {

      id: match.id,

      teamA: match.teamA,
      teamB: match.teamB,

      runs: newRuns,
      wickets: newWickets,
      balls: newBalls,

      overs:
        Number(
          ballsToOvers(newBalls)
        ),

      runRate:
        Number(
          calculateRunRate(
            newRuns,
            newBalls
          )
        ),

      innings:
        match.innings,

      target:
        match.target,

      battingTeam:
        match.battingTeam,

      bowlingTeam:
        match.bowlingTeam,

      winner,

      status:
        newStatus,
    };



    // SOCKET UPDATE
    io?.emit(
      "scoreUpdate",
      response
    );

    res.json(response);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to update score",
    });

  }
};



// ✅ UPDATE STATUS
exports.updateStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { status } = req.body;

    await db.execute(
      `
      UPDATE matches
      SET status=?
      WHERE id=?
      `,
      [
        status,
        id,
      ]
    );

    res.json({
      msg: "Status updated",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to update status",
    });

  }
};
