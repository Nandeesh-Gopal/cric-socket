
const express = require("express");
// require function import the exported value like "module.export"
const http = require("http");
// socketio works with http server
const { Server } = require("socket.io");
// ojbect destructuring
const cors = require("cors");

const matchRoutes = require("./routes/match.route");
// imports all the routes
const socketHandler =require("./sockets/socket");

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

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.set("io", io);

socketHandler(io);

app.use("/api", matchRoutes);

server.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );
});