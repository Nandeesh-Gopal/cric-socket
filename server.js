const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const routes = require("./routes/match.routes");
const socketSetup = require("./sockets/socket");
const controller = require("./controllers/match.controller");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", routes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

controller.setSocket(io);
socketSetup(io);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});