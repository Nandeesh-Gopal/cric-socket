const db = require("../../config/db");

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