
window.addEventListener("load", function() {
	Game.initialize("game",sprites,startGame);
});

var sprites = {
	frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
	bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
	car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
	car2: { sx: 191, sy: 0, w: 48, h: 48, frames: 1 },  
	car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
	car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
	car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
	trunk: { sx: 287, sy: 383, w: 144, h: 48, frames: 1 },
	death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 }
};

var enemies = {
	cars: { x: 0,   y: -50, sprite: 'car1'}
};

var OBJECT_FROG = 1,
	OBJECT_TRUNK = 2;

var startGame = function() {
	Game.setBoard(0,new Background());
	Game.setBoard(1,new TitleScreen("Frogger", 
									"Press space to start playing",
									playGame));
};

var level1 = [
	// Start,   End, Gap,  Type,   Override
	[ 0,  25000, 400, 'cars', { x: 100 }]
];



var playGame = function() {
	console.log("playGame");
	var board = new GameBoard();
	board.add(new Frog());
	board.add(new Level(level1,winGame));
	Game.setBoard(1,board);
};

var winGame = function() {
	Game.setBoard(1,new TitleScreen("You win!", 
									"Press space to play again",
									playGame));
};

var loseGame = function() {
	Game.setBoard(1,new TitleScreen("You lose!", 
									"Press space to play again",
									playGame));
};


var Background = function() {
	this.setup('bg', {x:0, y:0});
	// This method is called to update
	this.step = function(dt) { };
};
Background.prototype = new Sprite();

var Frog = function() { 
	this.setup('frog', 
			   {vx: 0, vy: 0, angle: 0, 
				elapsedAnimatingTime: 0, animating: false, 
				steppingTime: 0, timeToStep: 0.2, 
				frames: 3});

	this.y = Game.height - this.h;
	this.x = Game.width/2 - this.w / 2;
	this.animatingTime = this.timeToStep/(this.frames + 1);
	this.maxVel = this.h/this.timeToStep; 
	this.frame = this.frames - 1;

	this.step = function(dt) {
		if(!this.animating){
			if(Game.keys['left']) { 
				this.steppingTime = 0; 
				this.vx = -this.maxVel; 
				this.animating = true; 
				this.angle = -90;
			} else if(Game.keys['right']) { 
				this.steppingTime = 0; 
				this.vx = this.maxVel; 
				this.animating = true; 
				this.angle = 90;
			} else if(Game.keys['up']) { 
				this.steppingTime = 0; 
				this.vy = -this.maxVel; 
				this.animating = true; 
				this.angle = 0;
			} else if(Game.keys['down']) { 
				this.steppingTime = 0; 
				this.vy = this.maxVel; 
				this.animating = true;
				this.angle = 180;
			}
		}

		if(this.animating){
			// Take care of the time that the frog will use to step
			this.steppingTime += dt;
			if(this.steppingTime >= this.timeToStep){
				this.elapsedAnimatingTime = 0;
				this.animating = false;
				this.vx = this.vy = 0;
			}

			// Update the position
			if(this.vx != 0){
				this.x += this.vx * dt;
			} else if(this.vy != 0){
				this.y += this.vy * dt;
			}

			// Take care of the game bounds
			if(this.x < 0) { 
				this.x = 0; 
			} else if(this.x > Game.width - this.w) { 
				this.x = Game.width - this.w;
			}
			if(this.y + this.h > Game.height) {
				this.y = Game.height - this.h;
			} else if(this.y < 0){ 
				this.y = 0; 
			}

			// Take care of the frame-based animation
			this.elapsedAnimatingTime += dt;
			if(this.elapsedAnimatingTime >= this.animatingTime){
				this.frame = (this.frame+1)%this.frames;
				this.elapsedAnimatingTime = 0;
			}
		}
	};

	this.draw = function(ctx){
		if(this.angle == 0){
			SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
		} else {
			SpriteSheet.drawRotated(ctx,this.sprite,this.x,this.y,this.frame, this.angle);
		}
	}
};

Frog.prototype = new Sprite();
Frog.prototype.type = OBJECT_FROG;

Frog.prototype.hit = function(target) {
	if(target.type == OBJECT_TRUNK){
		this.vx = target.vx;
		this.y = target.y;
	}
};

var Trunk = function(posY) { 
	this.setup('trunk', { vx: 150, y: posY});

	this.x = -this.w;

	this.step = function(dt) {
		this.x += this.vx * dt;

		var collision = this.board.collide(this,OBJECT_FROG);
		if(collision) {
			collision.hit(this);
		} else if(this.x > Game.width){
			this.board.remove(this);
		}
	};
};

Trunk.prototype = new Sprite();
Trunk.prototype.type = OBJECT_TRUNK;

Trunk.prototype.hit = function(damage) {
	if(this.board.remove(this)) {
		loseGame();
	}
};



