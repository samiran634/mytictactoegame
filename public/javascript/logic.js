 export   function isWon( boxes ){
       let arr=[[0,1,2],
       [3,4,5],
       [6,7,8],
       [0,4,8],
       [2,4,6]]
       for(let i=0;i<arr.length;i++){
              if(boxes[arr[i][0]].innerText===boxes[arr[i][0]].innerText===boxes[arr[i][0].innerText])return true;
       }
       return false;
       //is any trio box has same characters according to the above pair of array than end the game and decleare the last player winner also display the gif in the winner side but not the looser side in looser side just display you lose the game 
 }
 
 
