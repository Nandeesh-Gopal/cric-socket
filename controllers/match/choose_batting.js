const db = require("../../config/db");

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