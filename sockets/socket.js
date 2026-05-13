module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log(
      "User connected:",
      socket.id
    );

    socket.on(
      "joinMatch",
      (matchId) => {

        socket.join(matchId);

        console.log(
          `Joined room: ${matchId}`
        );
      }
    );

    socket.on(
      "disconnect",
      () => {

        console.log(
          "User disconnected:",
          socket.id
        );
      }
    );
  });
};