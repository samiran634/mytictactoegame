// Create User Entry Modal
export function createUserEntryModal(socket, gameContainer) {
  let playerName;

  // Create Modal Elements
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center mt-10';

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-white p-8 rounded-lg shadow-xl';

  const heading = document.createElement('h2');
  heading.className = 'text-2xl font-bold mb-4 text-gray-800';
  heading.textContent = 'Welcome to Tic Tac Toe!';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter your name';
  input.className = 'border-2 border-gray-300 rounded-md p-2 w-full mb-4 focus:outline-none focus:border-amber-400';

  const button = document.createElement('button');
  button.className = 'bg-amber-400 text-white px-4 py-2 rounded-md hover:bg-amber-500 transition-colors';
  button.textContent = 'Search for a Player';

  // Append Elements
  modalContent.appendChild(heading);
  modalContent.appendChild(input);
  modalContent.appendChild(button);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Check for existing playerName in localStorage
  const storedPlayerName = localStorage.getItem('playerName');
  if (storedPlayerName) {
    playerName = storedPlayerName;
    console.log('Reconnecting as:', playerName);
    modal.remove();
    startPlayerSession(playerName);
  }

  // Handle Button Click
  button.addEventListener('click', () => {
    playerName = input.value.trim();
    if (playerName) {
      localStorage.setItem('playerName', playerName);
      modal.remove();
      startPlayerSession(playerName);
    } else {
      input.classList.add('border-red-500');
      input.placeholder = 'Name is required';
      alert('Name is required');
    }
  });

  // Prevent Modal Closure on Click Outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) e.stopPropagation();
  });

  // Start Player Session
  function startPlayerSession(playerName) {
    console.log('Player name set to:', playerName);
    socket.emit('playerJoined', { name: playerName });

    // Show Find Opponent Button
    const findOpponentButton = document.getElementById('findOpponent');
    findOpponentButton.style.display = 'block';

    // Handle Game Start
    socket.on('startGame', (e) => {
      console.log('Game started:', e);
      findOpponentButton.style.display = 'none';

      const allPlayers = e.allPlayers;
      const game = allPlayers.find(player =>
        player.player1.name === playerName || player.player2.name === playerName
      );

      if (game) {
        console.log ("game started :",game);
        const opponent = game.player1.name === playerName ? game.player2.name : game.player1.name;
        const playerSymbol = game.player1.name === playerName ? game.player1.pvalue : game.player2.pvalue;

        // Update Player and Opponent Info
        document.querySelector('#player-name').textContent = playerName;
        document.querySelector('#player-symbol').textContent = playerSymbol.toUpperCase();
        document.querySelector('#opponent-name').textContent = opponent;
        document.querySelector('#opponent-symbol').textContent = playerSymbol === 'X' ? 'O' : 'X';
        
        // Show Game Container
        document.querySelector('.hole-container').style.display = 'block';

        // Update Game Info Styling
        updateGameInfoStyling(playerSymbol);
      }


// Handle Box Clicks
document.querySelectorAll('.box').forEach(box => {
  
  box.addEventListener('click', () => {
    let  move=game.player1.name===playerName?game.player1.p1Move:game.player2.p2Move;
    const boxText = box.querySelector('.boxtext').textContent;
    const boxId = box.id;

    if (boxText === '') { // Prevent overwriting moves
      const playerSymbol = document.querySelector('#player-symbol').textContent; // Get player's symbol
      box.querySelector('.boxtext').textContent = playerSymbol; // Local Update (Visual Feedback)
      move=move===true?false:true;
      console.log("from boxclick ",move);
      localStorage.setItem("move",JSON.stringify(move));
      // Emit event to server
      socket.emit('boxClicked', { id: boxId, value: playerSymbol,nxtMove: move });
    }
  });
});


// Listen for updates from the server
socket.on('updateBoard', (data) => {
  console.log("this is from updateboard in frontend",data);
  const box = document.getElementById(data.id);
  if (box && box.querySelector('.boxtext').textContent === '') { // Update only if box is empty
    box.querySelector('.boxtext').textContent = data.value;
  let localmove = JSON.parse(localStorage.getItem("move"));
if (localmove === null) {
  localmove = true;
}
localStorage.setItem("move", JSON.stringify(!localmove));
    console.log(localmove);
    if (localmove === true) {
      // Enable all boxes for the next move
      document.querySelectorAll('.box').forEach(box => {
        box.classList.remove('opacity-50', 'cursor-not-allowed'); // Remove disabled classes
        box.disabled = false; // Enable the box
        console.log("boxes enabled")
      });
    } else {
      // Disable all boxes for the next move
      document.querySelectorAll('.box').forEach(box => {
        box.classList.add('opacity-50', 'cursor-not-allowed'); // Add disabled classes
        box.disabled = true; // Disable the box
        console.log("boxes desabled")
      });
    }
 
  }
});
});
  
  }

  // Helper: Update Game Info Styling
  function updateGameInfoStyling(playerSymbol) {
    const info1 = document.querySelector('.info1');
    const info2 = document.querySelector('.info2');
    if (playerSymbol === 'X') {
      info1.classList.add('bg-amber-400');
      info1.classList.remove('bg-zinc-600');
      info2.classList.add('bg-zinc-100');
      info2.classList.remove('bg-amber-200');
    } else {
      info2.classList.add('bg-amber-100');
      info2.classList.remove('bg-zinc-200');
      info1.classList.add('bg-zinc-600');
      info1.classList.remove('bg-amber-400');
    }
  }
}
