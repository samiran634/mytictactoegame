 export function isWon(boxes) {
  let arr = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]
  ];
  for (let i = 0; i < arr.length; i++) {
    const [a, b, c] = arr[i];
    if (
      boxes[a].innerText !== "" &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[a].innerText === boxes[c].innerText
    ) {
      return true;
    }
  }
  return false;
  // If any trio of boxes has the same character according to the above pairs of array, then end the game and declare the last player as the winner. Also, display the gif on the winner's side but not on the loser's side; just display "You lose the game".
}
