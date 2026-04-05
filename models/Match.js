const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  teamA: String,
  teamB: String,
  score: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 }
  },
  status: { type: String, default: "LIVE" }
});

module.exports = mongoose.model("Match", matchSchema);