const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../css')));
app.use(express.static(path.join(__dirname, '../javascript')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/tictactoe.html'));
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});