require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const Match = require("./models/Match");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Create match
app.post("/create-match", async (req, res) => {
  const match = new Match(req.body);
  await match.save();
  res.json(match);
});

// Get matches
app.get("/matches", async (req, res) => {
  const matches = await Match.find();
  res.json(matches);
});

// Update score
app.post("/update-score", async (req, res) => {
  const { matchId, runs, wicket } = req.body;

  const match = await Match.findById(matchId);

  match.score.runs += runs;
  if (wicket) match.score.wickets += 1;

  // simple over logic
  match.score.overs += 0.1;

  await match.save();

  io.emit("scoreUpdate", match);

  res.json(match);
});

io.on("connection", (socket) => {
  console.log("Client connected");
});

server.listen(process.env.PORT, () => {
  console.log("Server running...");
});