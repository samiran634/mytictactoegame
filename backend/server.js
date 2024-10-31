const express = require('express');
const os = require('os');
const cluster = require('cluster');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = createServer(app);
const io = new Server(server);
 
app.use(express.urlencoded({ extended: true }));
console.log(app.path());
console.log(os.hostname());
console.log(os.platform());
console.log(os.arch());
console.log(os.freemem());
console.log(os.totalmem());
console.log(os.cpus().length);
app.use(express.static(path.resolve('./public')));
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/tictactoe.html'));
});
io.on('connection', (socket) => {
  console.log('a user connected');
});
 
 let arr = [];
 let playerArray = [];
io.on('playerJoined', (e) => {
  if(e.name){
   arr.push(e.name);
  }
  if(arr.length>=2){
    let player1 = {
      name:arr[0],
      socketId:socket.id,
      pvalue:"x",
      nextMove:true

    };
    let player2 = {
      name:arr[1],
      socketId:socket.id,
      pvalue:"o",
      nextMove:false
    };
    let obj = {
      player1,
      player2
    };
    playerArray.push(obj);
    arr.splice(0,2);
    io.emit('startGame',{allPlayers:playerArray});
  }
});
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
