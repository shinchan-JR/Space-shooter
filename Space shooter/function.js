let tile = 48;
let row = 18;
let col = 9;

let board;
let context; 
let shipImg;

let ship = {
    x : (tile * (col-1)/2 )+1,
    y : tile * row - tile,
    width : tile,
    height : tile
}

let alianArr = [];
let aw = tile;
let ah = tile;
let ax = tile;
let ay = tile;
let alianImg;

let alianRow = 0;
let alianCol = 0;
let alianCount = 0;
let av = 0.2;

let bulletArr =[];
let bv = -5;

let score = 0;
let gameOver = false;
let paused = false;
let play = false;
let val;

window.onload = ()=> {
    board = document.getElementById("board");
    board.width = tile * col;
    board.height = tile * row;
    context = board.getContext("2d");

    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function(){
        context.drawImage(shipImg,ship.x,ship.y,ship.width,ship.height);
    }
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup",shoot);

    alianImg = new Image();
    alianImg.src = "./alien.png";
    alianImg.onload = function () {
        createAlians();
        requestAnimationFrame(update);
    };

    document.addEventListener("keydown", togglePause);

    function togglePause(e) {
        if (e.code === "KeyP") {
            paused = !paused;
        }
    }

};

function update() {
    if(!play) {
        context.fillStyle = "#00ffcc";
        context.font = "38px Arial";
        context.fillText("Let's destroy !", board.width / 2 - 120, board.height / 2 - 20);
        return;
    }

    if (gameOver) {
        context.fillStyle = "#00ffcc";
        context.font = "48px Arial";
        context.fillText("Game Over!", board.width / 2 - 120, board.height / 2 - 40);
        context.fillStyle = "#00ffcc";
        context.font = "24px Arial";
        context.fillText("Final Score: " + score, board.width / 2 - 80, board.height / 2 + 20);
        return;
    }
    requestAnimationFrame(update);

    if (paused) {
        context.fillStyle = "#00ffcc";
        context.font = "48px Arial";
        context.fillText("Paused", board.width / 2 - 80, board.height / 2 - 20);
        context.fillStyle = "#00ffcc";
        context.font = "28px Arial";
        context.fillText("Press 'p' to continue!", board.width / 2 - 120, board.height / 2 + 40);
        return;
    }


    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipImg,ship.x,ship.y,ship.width,ship.height);
    for(let i=0;i<alianArr.length;i++){
        let alian = alianArr[i];
        if(alian.alive){
            alian.y += av;
            if (alian.y + alian.height >= board.height) {
                gameOver = true;
                return;
            }
            context.drawImage(alianImg,alian.x,alian.y,alian.width,alian.height);
        }
    }
    for (let i = 0; i < bulletArr.length; i++) {
        let bullet = bulletArr[i];
        let oldY = bullet.y;
        bullet.y += bv;

        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alianArr.length; j++) {
            let alian = alianArr[j];

            if (!bullet.used && alian.alive && detectVerticalCollision(bullet, oldY, alian)) {
                bullet.used = true;
                alian.alive = false;
                alianCount--;
                score += 5;
            }
        }
    }

    while(bulletArr.length > 0 && (bulletArr[0].used || bulletArr[0].y < 0)) {
        bulletArr.shift();
    }

    // bulletArr = bulletArr.filter(bullet => bullet.y + bullet.height > 0);

    if (alianCount == 0) {
        alianRow++;
        // av += 0.1;
        alianArr = [];
        bulletArr = [];
        createAlians();
    }


    context.fillStyle = "white";
    context.font = "26px courier";
    context.fillText("Score : " + score,5,20);

    document.addEventListener("keydown", resetGame);

    function resetGame(e) {
        if (e.code === "KeyR") {
            ship.x = (tile * (col-1)/2 )+1;
            ship.y = tile * row - tile;
            alianRow = 0;
            av = 0.2;
            score = 0;
            gameOver = false;
            paused = false;
            bulletArr = [];
            createAlians();
        }
    }

}

function moveShip(e){
    if(gameOver) { return; }
    if(e.code == "ArrowLeft" && ship.x-tile >=0 ){
        ship.x -= tile;
    }
    else if(e.code == "ArrowRight" && ship.x+tile < board.width){
        ship.x += tile;
    }
    else if(e.code == "ArrowDown" && ship.y+tile < board.height){
        ship.y += tile;
    }
    else if(e.code == "ArrowUp" && ship.y-tile >= tile*row - tile*4 + tile){
        ship.y -= tile;
    }
}

function createAlians() {
    alianArr = [];
    for (let r = 0; r < alianRow; r++) {
        let numAliens = 1 + r * 2; 
        let totalWidth = numAliens * aw;
        let startX = (board.width - totalWidth) / 2; 
        for (let c = 0; c < numAliens; c++) {
            let alian = {
                img: alianImg,
                x: startX + c * aw,
                y: r * ah,
                width: aw,
                height: ah,
                alive: true
            };
            alianArr.push(alian);
        }
    }
    alianCount = alianArr.length;
}

function shoot(e){
    if(gameOver){
        return;
    }
    if(e.code == "Space"){
        let bullet = {
            x: ship.x + ship.width * 15 / 32,
            y: ship.y,
            width: tile / 10,
            height: tile / 4,
            used: false
        };
        bulletArr.push(bullet);
    }
}

function detectVerticalCollision(bullet, oldY, alien) {
    return (
        bullet.x < alien.x + alien.width &&
        bullet.x + bullet.width > alien.x &&
        ((oldY >= alien.y + alien.height && bullet.y <= alien.y) ||
         (bullet.y < alien.y + alien.height && bullet.y + bullet.height > alien.y))
    );
}

function playgame() {
    const playBtn = document.getElementById("play");
    // const btnText = playBtn.innerText.trim().toLowerCase();

    if (!play) {
        play = true;
        paused = false;
        playBtn.innerText = "Pause";
        requestAnimationFrame(update);
    } else {
        paused = !paused;
        playBtn.innerText = paused ? "Play" : "Pause";
    }
}

