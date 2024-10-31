// Create modal elements
export function createUserEntryModal(socket) {
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
  button.textContent = 'search for a player';

  // Add elements to DOM
  modalContent.appendChild(heading);
  modalContent.appendChild(input);
  modalContent.appendChild(button);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);


  // Handle button click
  button.addEventListener('click', () => {
    const playerName = input.value.trim();
    if (playerName) {
      modal.remove();
      // Store player name
      
   
      localStorage.setItem('playerName', playerName);
      socket.emit('playerJoined', {name:playerName});
      socket.on('startGame',(e)=>{
        let allPlayers = e.allPlayers;
        console.log(allPlayers);

        let findObject = allPlayers.find(player=>player.player1.name === playerName || player.player2.name === playerName);
            let opponent  ;
            let Value;
      
            findObject.player1.name === playerName ? opponent = findObject.player2.name : opponent = findObject.player1.name;
        
            findObject.player1.name === playerName ? Value = findObject.player1.pvalue : Value = findObject.player2.pvalue;

        console.log(opponent);
        document.querySelector('.player-name').textContent = playerName;
        document.querySelector('.opponent-name').textContent = opponent;
        document.querySelector('.hole-container').style.display = 'block';
        
      })
    } else {
      input.classList.add('border-red-500');
      input.placeholder = 'Name is required';
      alert('Name is required');
    }
  });

  // Prevent closing modal by clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      e.stopPropagation();
    }
  });
}
