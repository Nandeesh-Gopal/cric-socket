const db = require("../../config/db");
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