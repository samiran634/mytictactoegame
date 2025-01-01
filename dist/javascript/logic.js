export function isWon() {
  let arr = [
    ['box1', 'box2', 'box3'],
    ['box4', 'box5', 'box6'],
    ['box7', 'box8', 'box9'],
    ['box1', 'box4', 'box7'],
    ['box2', 'box5', 'box8'],
    ['box3', 'box6', 'box9'],
    ['box1', 'box5', 'box9'],
    ['box3', 'box5', 'box7']
  ];

  for (let i = 0; i < arr.length; i++) {
    const box1Element = document.getElementById(arr[i][0]);
    const box2Element = document.getElementById(arr[i][1]);
    const box3Element = document.getElementById(arr[i][2]);

    if (!box1Element || !box2Element || !box3Element) {
      console.error('Box elements not found');
      continue;
    }

    const box1 = box1Element.querySelector('.boxtext')?.textContent || '';
    const box2 = box2Element.querySelector('.boxtext')?.textContent || '';
    const box3 = box3Element.querySelector('.boxtext')?.textContent || '';

    // console.log(`Checking: ${arr[i][0]}=${box1}, ${arr[i][1]}=${box2}, ${arr[i][2]}=${box3}`);

    if (box1 !== '' && box1 === box2 && box2 === box3) {
      console.log('Winning condition met');
      return true;
    }
  }
  return false;
}