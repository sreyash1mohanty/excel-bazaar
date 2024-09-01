const { Server } = require("socket.io");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinSheet", (sheetId) => {
      socket.join(sheetId);
      console.log(`User joined sheet: ${sheetId}`);
    });

    socket.on("sheetUpdated", (updatedData) => {
      const { sheetId, data } = updatedData;
      socket.to(sheetId).emit("updateSheet", data);
      console.log(`Sheet ${sheetId} updated`);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { setupSocket };

// This