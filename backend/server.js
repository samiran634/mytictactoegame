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
      // Notify other waiting players if a new player is waiting
      if (waitingPlayers.length > 0) {
        const waitingPlayersIds = waitingPlayers.map((player) => player.socketId);
        io.to(waitingPlayersIds).emit("newPlayerWaiting", { waitingPlayersCount: waitingPlayers.length });
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
    const { id, value } = data;
  const game = playerArray.find(
      (g) => g.player1.socketId === socket.id || (g.player2 && g.player2.socketId === socket.id)
    );
    if (game.sum === 0) {
      // Refresh the board and restart the game
      io.to(game.player1.socketId).emit("refreshBoard");
      io.to(game.player2.socketId).emit("refreshBoard");

      // Reset the game state
      game.player1.p1Move = true;
      game.player2.p2Move = false;
      game.sum = 0;
    }

    // Find the game the player belongs to
  
    if (game) {
      // Check if it's the correct player's turn
      const isPlayer1 = game.player1.socketId === socket.id;
      const isPlayer2 = game.player2 && game.player2.socketId === socket.id;

      if ((isPlayer1 && game.player1.p1Move) || (isPlayer2 && game.player2.p2Move)) {
        // Update the server-side game state
        if (isPlayer1) {
          game.player1.p1Move = false;
          game.player2.p2Move = true;
          console.log(`Player X (${game.player1.name}) made a move.`);
        } else if (isPlayer2) {
          game.player2.p2Move = false;
          game.player1.p1Move = true;
          console.log(`Player O (${game.player2.name}) made a move.`);
        }

        game.sum += 1;

        // Determine the next player
        const nextPlayer = isPlayer1 ? game.player2.pvalue : game.player1.pvalue;

        // Broadcast the move to both players in the game
        io.to(game.player1.socketId).emit("updateBoard", { id, value, nextPlayer });
        if (game.player2) {
          io.to(game.player2.socketId).emit("updateBoard", { id, value, nextPlayer });
        }

        console.log(`Move updated: Player ${nextPlayer}, Box ${id}`);
      } else {
        console.log("Not this player's turn.");
      }
    } else {
      console.log("Game not found for the current player. Please reload.");
    }
  });

  // Handle game reset
  socket.on("resetGame", () => {
    // Find the game the player belongs to
    const game = playerArray.find(
      (g) => g.player1.socketId === socket.id || (g.player2 && g.player2.socketId === socket.id)
    );

    if (game) {
      const opponentSocketId = game.player1.socketId === socket.id ? game.player2.socketId : game.player1.socketId;

      // Notify the opponent that the game has been restarted
      io.to(opponentSocketId).emit("opponentRestarted");

      // Remove both players from the game
      playerArray = playerArray.filter((g) => g !== game);

      // Add the opponent back to the waiting queue
      const opponent = waitingPlayers.find((player) => player.socketId === opponentSocketId);
      if (!opponent) {
        waitingPlayers.push({ name: game.player1.socketId === socket.id ? game.player2.name : game.player1.name, socketId: opponentSocketId });
      }
    }
  });
  socket.on("gameOver", (data) => {
    let findingPlayer = data.playerName;
  
    // Find the game where the player is involved
    let game = playerArray.find((g) => g.player1.name === findingPlayer || (g.player2 && g.player2.name === findingPlayer));
  
    if (game) {
      // Determine the winner based on the player name
      let winner = game.player1.name === findingPlayer ? game.player1.name : game.player2.name;
      
      // Emit the winner's name to all connected clients
      io.emit("winner", { winner: winner });
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
