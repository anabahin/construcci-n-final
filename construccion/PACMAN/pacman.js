/*
    JavaScript Pacman Game.
    .
*/

var canvas, ctx, texture, pat, pacmanimg, pacman, img_change, blueimg, pinkimg, ghostblue, ghostpink;
var lines = [];
var points = [];
var isMoving = false;
var GoRight = false;
var notMove = false;
var pos_x;
var pos_y;
var crashed_x;
var crashed_y;
var firstmove = false;
var active_ghosts = [];
var dead_ghosts = [];
var game_started = false;
var not_set = true;
var delayMillis = 1000; //1 second
var myscore = 0;

setTimeout(function(){}, delayMillis);

// para dibujar mis extremos de mi laberinto.
function line(x, y, width, height) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    //ctx.fillStyle = pat;
		var grd = ctx.createLinearGradient(10,90,400,0);
		grd.addColorStop(0,"#df1540");
		grd.addColorStop(1,"#f9a940");
		ctx.fillStyle = grd;
    ctx.fillRect(this.x, this.y, this.width, this.height);
}

// para dibujar mis puntos que son circulos.
function point(x, y){
	this.x = x;
	this.y = y;
	this.draw = function(){
		ctx.beginPath();
		ctx.arc(x, y, 5, 0, 2*Math.PI);
		ctx.fillStyle = "yellow";
		ctx.fill();
		ctx.stroke();
	}
}

// para dibujar mi pacman.
function drawPacman(x, y) {
    this.x = x;
    this.y = y;
		this.SpeedX = 1.8;
		this.SpeedY = 1.8;
		this.limits = function () {
			if (this.x > canvas.width) {
				this.x = 0;
			} else if (this.x < 0) {
				this.x = canvas.width - 1;
			}
		};
    //moverse con una velocidad
		this.draw = function(){
		  ctx.drawImage(pacmanimg, this.x, this.y);
		};
		this.GoUp = function() {
			this.y -= this.SpeedY;
		};
		this.GoDown = function() {
			this.y += this.SpeedY;
		};
		this.GoRight = function() {
			this.x += this.SpeedX;
		};
		this.GoLeft = function() {
			this.x -= this.SpeedX;
		};
		this.update = function() {
      ctx.drawImage(pacmanimg, this.x, this.y);
    }
    //chocar con los elementos de mi tablero
		this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + 20;
        var mytop = this.y;
        var mybottom = this.y + 20;
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
           crash = false;
        }
        return crash;
    }
		this.madePoint = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + 20;
        var mytop = this.y;
        var mybottom = this.y + 20;
        var otherleft = otherobj.x;
        var otherright = otherobj.x + 4;
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + 4;
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
           crash = false;
        }
        return crash;
    }
}

// para dibujar mi fantasma.
function Ghost(x, y, image) {
    this.x = x;
    this.y = y;
		this.image = image;
		this.draw = function(){
		  ctx.drawImage(this.image, this.x, this.y);
		};
}
//cambio la imagen para que aparezca la cara en funcion de donde esta mirando
function movePacman(event) {
	if(start_game){
		var pac_color = pacmanimg.id.split("-")[1];
		var change = pacmanimg.src.split("/");
		change = change[change.length-1];
	}
	switch (event.code) {
	case "ArrowUp":
		isMoving = true;
		GoRight = false;
		GoLeft = false;
		GoUp = true;
		GoDown = false;
		if(change == pac_color + ".png"){
			pacmanimg.src = pac_color + "-s-up.png";
		} else if (change == pac_color + "-inverted.png"){
			pacmanimg.src = pac_color + "-i-up.png";
		} else if (change == pac_color + "-i-down.png"){
			pacmanimg.src = pac_color + "-i-up.png";
		} else if (change == pac_color + "-s-down.png"){
			pacmanimg.src = pac_color + "-s-up.png";
		}
		break
	case "ArrowDown":
		isMoving = true;
		GoRight = false;
		GoLeft = false;
		GoUp = false;
		GoDown = true;
		if(change == pac_color + ".png"){
			pacmanimg.src = pac_color + "-s-down.png";
		} else if (change == pac_color + "-inverted.png"){
			pacmanimg.src = pac_color + "-i-down.png";
		} else if (change == pac_color + "-i-up.png"){
			pacmanimg.src = pac_color + "-i-down.png";
		} else if (change == pac_color + "-s-up.png"){
			pacmanimg.src = pac_color + "-s-down.png";
		}
		break
	case "ArrowLeft":
		isMoving = true;
		GoRight = false;
		GoLeft = true;
		GoUp = false;
		GoDown = false;
		pacmanimg.src = pac_color + "-inverted.png";
		break
	case "ArrowRight":
		isMoving = true;
		GoRight = true;
		GoLeft = false;
		GoUp = false;
		GoDown = false;
		pacmanimg.src = pac_color + ".png";
		break
		}
};

//creo las dimensiones de mi laberninto
function makelabyrinth(){
	// dibujando el borde
	lines.push(new line(10, 10, 580, 20));
	lines.push(new line(10, 570, 580, 20));
	lines.push(new line(10, 10, 20, 290));
	lines.push(new line(0, 280, 20, 20));
	lines.push(new line(0, 340, 20, 20));
	lines.push(new line(10, 340, 20, 250));
	lines.push(new line(570, 340, 20, 250));
	lines.push(new line(570, 10, 20, 290));
	lines.push(new line(570, 340, 40, 20));
	lines.push(new line(570, 280, 40, 20));

	// dibujando dentro
	// t rara
	lines.push(new line(60, 60, 70, 20));
	lines.push(new line(130, 60, 20, 100));
	lines.push(new line(180, 60, 90, 100));
	lines.push(new line(60, 110, 40, 50));

	// bordes que sobresalen
	lines.push(new line(300, 10, 20, 150));
	lines.push(new line(300, 460, 20, 110));

	// cuadrados
	lines.push(new line(250, 195, 120, 30));
	lines.push(new line(350, 120, 190, 40));
	lines.push(new line(350, 60, 190, 30));
	lines.push(new line(400, 195, 140, 30));
	lines.push(new line(60, 195, 160, 30));
	lines.push(new line(350, 460, 90, 80));
	lines.push(new line(170, 460, 100, 80));
	lines.push(new line(110, 460, 30, 110));
	lines.push(new line(65, 460, 10, 80));
	lines.push(new line(470, 460, 30, 110));
	lines.push(new line(530, 460, 10, 80));
	lines.push(new line(60, 260, 120, 130));
	lines.push(new line(440, 260, 100, 130));


	// centro de salida de fantasmas
	lines.push(new line(250, 340, 120, 10));
	lines.push(new line(250, 260, 10, 80));
	lines.push(new line(250, 260, 40, 10));
	lines.push(new line(330, 260, 40, 10));
	lines.push(new line(360, 260, 10, 80));

	// relleno luego del centro
	lines.push(new line(210, 340, 10, 80));
	lines.push(new line(210, 220, 10, 80));
	lines.push(new line(250, 390, 120, 40));
	lines.push(new line(250, 195, 120, 0));
	lines.push(new line(60, 420, 160, 10));
	lines.push(new line(400, 220, 140, 10));
	lines.push(new line(60, 220, 160, 10));
	lines.push(new line(400, 220, 10, 80));
	lines.push(new line(400, 340, 10, 80));
	lines.push(new line(400, 420, 140, 10));

};

function makepoints(){
	points.push(new point(15, 320));
	points.push(new point(585, 320));
	points.push(new point(45, 45));
	points.push(new point(100, 45));
	points.push(new point(165, 45));
	points.push(new point(220, 45));
	points.push(new point(285, 45));
	points.push(new point(335, 45));
	points.push(new point(385, 45));
	points.push(new point(435, 45));
	points.push(new point(485, 45));
	points.push(new point(555, 45));
	points.push(new point(45, 95));
	points.push(new point(45, 145));
	points.push(new point(165, 120));
	points.push(new point(165, 180));
	points.push(new point(220, 180));
	points.push(new point(285, 180));
	points.push(new point(285, 120));
	points.push(new point(555, 180));
	points.push(new point(335, 180));
	points.push(new point(395, 180));
	points.push(new point(455, 180));
	points.push(new point(515, 180));
	points.push(new point(45, 180));
	points.push(new point(45, 245));
	points.push(new point(45, 295));
	points.push(new point(45, 345));
	points.push(new point(45, 405));
	points.push(new point(155, 405));
	points.push(new point(45, 445));
	points.push(new point(155, 445));
	points.push(new point(90, 445));
	points.push(new point(45, 495));
	points.push(new point(155, 495));
	points.push(new point(90, 550));
	points.push(new point(90, 495));
	points.push(new point(90, 405));
	points.push(new point(115, 145));
	points.push(new point(555, 105));
	points.push(new point(515, 105));
	points.push(new point(455, 105));
	points.push(new point(395, 105));
	points.push(new point(335, 105));
	points.push(new point(90, 95));
	points.push(new point(90, 245));
	points.push(new point(90, 180));
	points.push(new point(555, 145));
	points.push(new point(555, 180));
	points.push(new point(555, 215));
	points.push(new point(555, 245));
	points.push(new point(555, 295));
	points.push(new point(555, 345));
	points.push(new point(195, 245));
	points.push(new point(155, 245));
	points.push(new point(235, 245));
	points.push(new point(385, 245));
	points.push(new point(425, 245));
	points.push(new point(455, 245));
	points.push(new point(515, 245));
	points.push(new point(310, 245));
	points.push(new point(310, 370));
	points.push(new point(195, 320));
	points.push(new point(235, 320));
	points.push(new point(385, 320));
	points.push(new point(425, 320));
	points.push(new point(555, 405));
	points.push(new point(195, 405));
	points.push(new point(235, 405));
	points.push(new point(385, 405));
	points.push(new point(425, 405));
	points.push(new point(455, 405));
	points.push(new point(515, 405));
	points.push(new point(220, 445));
	points.push(new point(555, 445));
	points.push(new point(395, 445));
	points.push(new point(455, 445));
	points.push(new point(515, 445));
	points.push(new point(555, 445));
	points.push(new point(285, 495));
	points.push(new point(555, 495));
	points.push(new point(335, 495));
	points.push(new point(455, 495));
	points.push(new point(515, 495));
	points.push(new point(45, 550));
	points.push(new point(155, 550));
	points.push(new point(220, 550));
	points.push(new point(285, 550));
	points.push(new point(555, 550));
	points.push(new point(335, 550));
	points.push(new point(395, 550));
	points.push(new point(455, 550));
	points.push(new point(515, 550));
}

//comienzo mi juego pulsando y con el pacman amarillo
function start_game(){
	if(!game_started){
		clearInterval(animation_press);
		clearInterval(animation_press2);
		pacmanimg = document.getElementById("pacman-yellow");
		blueimg = document.getElementById("ghost1");
		pinkimg = document.getElementById("ghost2");
		makelabyrinth();
		pacman = new drawPacman(300, 435);
		ghostblue = new Ghost(300, 310, blueimg);
		ghostblue.draw();
		pacman.draw();
		ghostpink = new Ghost(300, 270, pinkimg);
		ghostpink.draw();
		repaint = setInterval(render, 20);
		document.addEventListener("keydown", movePacman, false);
		game_started = true;
		makepoints();
	}else{
		alert("Are you sure you want to re-start the game?");
	}
}

function checkhits(){
	for(i=0; i<lines.length; i++){
		if (pacman.crashWith(lines[i])){
			isMoving = false;
			crashed_x = lines[i].x;
			crashed_y = lines[i].y;
			break;
		}
	}
	if (isMoving) {
		if (GoRight){
			pacman.GoRight();
		} else if (GoLeft){
			pacman.GoLeft();
		} else if (GoUp){
			pacman.GoUp();
		} else if (GoDown){
			pacman.GoDown();
		}
	} else {
		if (pacman.x < crashed_x){
			if (GoLeft) {
			 	pacman.GoLeft();
			} else if (GoUp){
				pacman.GoUp();
			} else if (GoDown){
				pacman.GoDown();
			}
		} else if (pacman.x > crashed_x){
			if (GoRight) {
			 	pacman.GoRight();
			} else if (GoUp){
				pacman.GoUp();
			} else if (GoDown){
				pacman.GoDown();
			}
		}
	}
}

function checkpoints(){
	var gotit = false;
	for(i=0; i<points.length; i++){
		if (pacman.madePoint(points[i])){
			gotit = true;
			points.splice(i, 1);
			break;
		}
	}
	if (gotit) {
		myscore += 20;
		document.getElementById("score").innerHTML = myscore;
	}
}

function render(){
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	makelabyrinth();
	checkhits();
	for(i=0; i<points.length; i++){
		points[i].draw();
	}
	checkpoints();
	pacman.update();
	pacman.limits();
	ghostblue.draw();
	ghostpink.draw();
}

function pause_game(){
	alert("deberia parar el juego");
}

function highscore(){
	alert("AQUI HE DE MOSTRAR EL HIGHSCORE");
}

function instructions(){
	canvas = document.getElementById("gameboard");
	ctx = canvas.getContext("2d");
	ctx.font='800 60px Courier New';
	ctx.fillStyle = "#df1540";
	ctx.textAlign = "center";
	ctx.fillText("Press play", 300, 100);
	ctx.fillStyle = "#fcf944";
	ctx.fillText("to", canvas.width/2, canvas.height/2);
	ctx.fillStyle = "#df1540";
	ctx.fillText("Start the game", 300, 500);

	if(not_set){
		animation_press = setInterval(animate, 600);
		animation_press2 = setInterval(animate2, 800);
		not_set = false;
	}
}

function animate(){
	ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

function animate2(){
	instructions();
}

// Para Poder arrastrar distintos colores de pacman a mi canvas
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev){
	if (!not_set){
		ev.dataTransfer.setData("image", ev.target.id);
		event = ev;
		img_change = ev.target.id;
	}
}
//
function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("image");
	changePacmanColor(img_change);
}

// Para permitir cambiar el color al pacman
function changePacmanColor(id_img){
	console.log(img_change);
	if (game_started){
		img_change.style = "none";
		console.log(img_change.style)
		pacmanimg = document.getElementById(id_img);
	}
}
