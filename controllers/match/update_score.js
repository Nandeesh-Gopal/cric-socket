const db = require("../../config/db");

const {
  ballsToOvers,
  calculateRunRate,
} = require("../../utils/cricket.utils");

exports.updateScore = async (req, res) => {

  try {

    const io = req.app.get("io");

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

    // FIRST INNINGS COMPLETE
    if (
      match.innings === 1 &&
      newBalls >= match.overs * 6
    ) {

      const target =
        newRuns + 1;

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
          match.bowlingTeam,
          match.battingTeam,
          id,
        ]
      );

      return res.json({
        msg: "Second innings started",
      });
    }

    // SECOND INNINGS
    if (match.innings === 2) {

      if (newRuns >= match.target) {

        winner =
          match.battingTeam;

        newStatus =
          "COMPLETED";
      }

      else if (
        newBalls >= match.overs * 6
      ) {

        winner =
          match.bowlingTeam;

        newStatus =
          "COMPLETED";
      }
    }

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

    io.emit(
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