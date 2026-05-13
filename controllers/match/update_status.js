const db = require("../../config/db");

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