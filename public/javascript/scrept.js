console.log("Welcome to Tic Tac Toe")
// let music = new Audio("music.mp3")
// let audioTurn = new Audio("ting.mp3")
// let gameover = new Audio("gameover.mp3")
 
 
let turn = "X"
let isgameover = false;

// Function to change the turn
const changeTurn = ()=>{
    return turn === "X"? "0": "X"
}

// Function to check for a win
const checkWin = ()=>{
    let boxtext = document.getElementsByClassName('boxtext');
    let wins = [
        [0, 1, 2, 5, 5, 0],
        [3, 4, 5, 5, 15, 0],
        [6, 7, 8, 5, 25, 0],
        [0, 3, 6, -5, 15, 90],
        [1, 4, 7, 5, 15, 90],
        [2, 5, 8, 15, 15, 90],
        [0, 4, 8, 5, 15, 45],
        [2, 4, 6, 5, 15, 135],
    ]
    wins.forEach(e =>{
        if((boxtext[e[0]].innerText === boxtext[e[1]].innerText) && (boxtext[e[2]].innerText === boxtext[e[1]].innerText) && (boxtext[e[0]].innerText !== "") ){
            document.querySelector('.info-container').innerText = boxtext[e[0]].innerText + " Won"
            isgameover = true
            document.querySelector(".imgbox").style.display = "block";
            document.querySelector(".imgbox").style.position = "fixed";
            document.querySelector(".imgbox").style.bottom = "20px";
    
 
   
            document.querySelector('.imgbox').style.display = "block";
        }
    })
}

// Game Logic
// music.play()
let boxes = document.getElementsByClassName("box");
Array.from(boxes).forEach(element =>{
    let boxtext = element.querySelector('.boxtext');
    element.addEventListener('click', ()=>{
        if(boxtext.innerText === ''){
            boxtext.innerText = turn;
            turn = changeTurn();
            // audioTurn.play();
            checkWin();
            if (!isgameover){
           let infoContainer = document.querySelector(".info-container") ;
          let info1 = document.querySelector(".info1") ;
          let info2 = document.querySelector(".info2") ;
  
          info1.style.transform = `translateX(${turn === "X" ?  info1.classList.add("bg-amber-400")    : info1.classList.remove("bg-amber-400")})`;
          info2.style.transform = `translateX(${turn === "X" ?  info2.classList.remove("bg-amber-400") : info2.classList.add("bg-amber-400")})`;
           
            } 
        }
    })
})

// Add onclick listener to reset button
reset.addEventListener('click', ()=>{
    let boxtexts = document.querySelectorAll('.boxtext');
    Array.from(boxtexts).forEach(element => {
        element.innerText = ""
    });
    turn = "X"; 
    isgameover = false
    document.querySelector(".line").style.width = "0vw";
    document.getElementsByClassName("info")[0].innerText  = "Turn for " + turn;
    document.querySelector('.imgbox').getElementsByTagName('img')[0].style.width = "0px"
})
