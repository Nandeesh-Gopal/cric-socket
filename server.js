const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const matchRoutes =
  require("./routes/match.route");

const socketHandler =
  require("./sockets/socket");

const app = express();

app.use(cors());

app.use(express.json());

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

socketHandler(io);

app.use("/api", matchRoutes);

server.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );
});