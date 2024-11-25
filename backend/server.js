const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware for parsing and serving static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.resolve("./public/tictactoe.html"));
});

// Game state management
let waitingPlayers = []; // Waiting players queue
let playerArray = [];    // Active games

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Player joining logic
  socket.on("playerJoined", (data) => {
    const { name } = data;

    if (name) {
      console.log("Player joined:", name);

      // Check if player is reconnecting
      const existingPlayer = waitingPlayers.find((player) => player.name === name);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id; // Update socket ID for reconnection
        console.log("Player reconnected:", name);
      } else {
        // Add player to waiting queue
        waitingPlayers.push({ name, socketId: socket.id });
      }

      // Pair players if possible
      if (waitingPlayers.length >= 2) {
        const [player1, player2] = waitingPlayers.splice(0, 2);
        const newGame = {
          player1: { ...player1, pvalue: "X", p1Move: true },
          player2: { ...player2, pvalue: "O", p2Move: false },
          sum: 0,
        };

        playerArray.push(newGame);

        // Notify both players to start the game
        io.to(player1.socketId).emit("startGame", { allPlayers: playerArray });
        io.to(player2.socketId).emit("startGame", { allPlayers: playerArray });

        // Create a private room for the game
        socket.join(player1.socketId);
        socket.join(player2.socketId);
      }
    }
  });

  // Handle player moves
  socket.on("boxClicked", (data) => {
    const { id, value,nxtMove} = data;

    // Find the game the player belongs to
    const game = playerArray.find(
      (g) => g.player1.socketId === socket.id || (g.player2 && g.player2.socketId === socket.id)
    );
  
    if (game) {
      // Update the server-side game state
      if (game.player1.pvalue === value) {
        game.player1.p1Move = nxtMove;
      } else if (game.player2 && game.player2.pvalue === value) {
        game.player2.p2Move = nxtMove;
      }

      game.sum += 1;

      // Broadcast the move to both players in the game
      io.to(game.player1.socketId).emit("updateBoard", { id, value,nxtMove });
      if (game.player2) {
        io.to(game.player2.socketId).emit("updateBoard", { id, value,nxtMove });
      }

      console.log(`Move updated: Player ${value}, Box ${id}`);
    } else {
      alert("Game not found for the current player.Please reload");
    }
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    // Remove the player from waitingPlayers
    waitingPlayers = waitingPlayers.filter((player) => player.socketId !== socket.id);

    // Remove disconnected player's game
    playerArray = playerArray.filter((game) => {
      const isDisconnected =
        game.player1.socketId === socket.id || (game.player2 && game.player2.socketId === socket.id);

      if (isDisconnected) {
        // Notify the opponent
        const opponentSocketId =
          game.player1.socketId === socket.id ? game.player2?.socketId : game.player1.socketId;
        if (opponentSocketId) {
          io.to(opponentSocketId).emit("opponentDisconnected");
        }
      }

      return !isDisconnected;
    });

    console.log("Updated player and game states.");
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
