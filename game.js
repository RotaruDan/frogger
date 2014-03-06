
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
	OBJECT_TRUNK = 2,
	OBJECT_CAR = 3,
	OBJECT_WATER = 4,
	OBJECT_OTHER = -1;

var startGame = function() {
	Game.setBoard(0,new Background());
	Game.setBoard(1,new TitleScreen("Frogger", 
									"Press space to start playing",
									playGame));
};

var playGame = function() {
	console.log("playGame");
	var board = new GameBoard();
	board.add(new Level());
	board.add(new Frog());
	board.add(new Water());
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
			   {elapsedAnimatingTime: 0, animating: false, 
				steppingTime: 0, timeToStep: 0.25, 
				vx: 0, vy: 0, angle: 0, 
				frames: 3});

	this.animatingTime = this.timeToStep/(this.frames + 1);
	this.x = Game.width/2 - this.w / 2;
	this.maxVel = this.h/this.timeToStep; 
	this.y = Game.height/2 - this.h;
	this.finalX = this.finalY = 0;
	this.frame = this.frames - 1;
	this.additionalXvelocity = 0;

	this.step = function(dt) {
		if(!this.animating){
			if(Game.keys['up']) { 
				this.steppingTime = 0; 
				this.vy = -this.maxVel; 
				this.animating = true; 
				this.angle = 0;
				this.finalX = this.x;
				this.finalY = this.y - this.h;
				if(this.finalY > Game.height - this.h) {
					this.finalY = Game.height - this.h;
				} else if(this.finalY < 0){ 
					this.finalY = 0; 
				}
			} else if(Game.keys['down']) { 
				this.steppingTime = 0; 
				this.vy = this.maxVel; 
				this.animating = true;
				this.angle = 180;
				this.finalX = this.x;
				this.finalY = this.y + this.h;
				if(this.finalY > Game.height - this.h) {
					this.finalY = Game.height - this.h;
				} else if(this.finalY < 0){ 
					this.finalY = 0; 
				}
			} else if(Game.keys['left']) { 
				this.steppingTime = 0; 
				this.vx = -this.maxVel + this.additionalXvelocity; 
				this.animating = true; 
				this.angle = -90;
				this.finalY = this.y;
				this.finalX = this.x - this.w;
				if(this.finalX < 0) { 
					this.finalX = 0; 
				} else if(this.finalX > Game.width - this.w) { 
					this.finalX = Game.width - this.w;
				}
			} else if(Game.keys['right']) { 
				this.steppingTime = 0; 
				this.vx = this.maxVel + this.additionalXvelocity; 
				this.animating = true; 
				this.angle = 90;
				this.finalY = this.y;
				this.finalX = this.x + this.w;
				if(this.finalX < 0) { 
					this.finalX = 0; 
				} else if(this.finalX > Game.width - this.w) { 
					this.finalX = Game.width - this.w;
				}
			} 
		}

		if(this.animating){
			// Update the position
			this.x += this.vx * dt;
			this.y += this.vy * dt;

			// Take care of the game bounds
			if(this.x < 0) { 
				this.x = 0; 
			} else if(this.x > Game.width - this.w) { 
				this.x = Game.width - this.w;
			}
			if(this.y > Game.height - this.h) {
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

			// Take care of the time that the frog will use to step
			this.steppingTime += dt;
			if(this.steppingTime >= this.timeToStep){
				this.elapsedAnimatingTime = 0;
				this.animating = false;
				this.vx = this.vy = 0;
				this.x = this.finalX;
				this.y = this.finalY;
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

	this.startDying = function(){
		this.board.add(new DeadFrog(this.x, this.y));
		this.board.remove(this);		
	}
};

Frog.prototype = new Sprite();
Frog.prototype.type = OBJECT_FROG;

Frog.prototype.hit = function(target) {
	this.additionalXvelocity = 0;
	if(target.type == OBJECT_TRUNK){
		console.log("over a trunk, x: " + target.x + ", y: " + target.y + ", target vx: " + target.vx);
		this.additionalXvelocity = target.vx;

	} else if (target.type == OBJECT_CAR){
		this.startDying();
	} else if(target.type == OBJECT_WATER){
		
		var collision = this.board.collide(this,OBJECT_TRUNK);
		if(!collision) {
			console.log("hitting water...");
			this.startDying();
		} 
		//this.startDying();

	}		
};

var DeadFrog = function(posX, posY) { 
	this.setup('death', {x: posX, y: posY, elapsedAnimatingTime: 0, animationTime: 1, frames: 4});
	this.animatingTime = this.animationTime/this.frames;

	this.step = function(dt) {
		console.log("animatingTime: " + this.animatingTime +
					", elapsedAnimatingTime: " + this.elapsedAnimatingTime +
					", frame: " + this.frame + 
					", sprite: " + this.sprite);
		// Take care of the frame-based animation
		this.elapsedAnimatingTime += dt;
		if(this.elapsedAnimatingTime >= this.animatingTime){
			this.frame = (this.frame+1);
			this.elapsedAnimatingTime = 0;
			if(this.frame >= this.frames){
				loseGame();
			}
		}
	};
	/*this.draw = function(ctx){
		console.log("drawing dead frog...");
		SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);		
	}*/
};

DeadFrog.prototype = new Sprite();
DeadFrog.prototype.type = OBJECT_OTHER;

DeadFrog.prototype.hit = function(damage) {
};

var Trunk = function(velX, posY) { 
	this.setup('trunk', { vx: velX, y: posY});

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

Trunk.prototype.hit = function(damage) { };

var Water = function() { 
	this.x = 0;
	this.y = 48;
	this.w = Game.width;
	this.h = 48*3;
	this.step = function(dt) {
		var collision = this.board.collide(this,OBJECT_FROG);
		if(collision) {
			collision.hit(this);
		}
	};
	this.draw = function(ctx){ }
};

Water.prototype = new Sprite();
Water.prototype.type = OBJECT_WATER;

Water.prototype.hit = function(damage) { };

var Car = function(type, velx, posY) { 
	this.setup(type, { vx: velx, y: posY});

	this.x = this.vx > 0 ? -this.w : Game.width;

	this.step = function(dt) {
		this.x += this.vx * dt;

		var collision = this.board.collide(this,OBJECT_FROG);
		if(collision) {
			collision.hit(this);
		} else if(this.vx > 0){
			if(this.x > Game.width){
				this.board.remove(this);
			}
		} else {
			if(this.x < -this.w){
				this.board.remove(this);				
			}
		}
	};
};

Car.prototype = new Sprite();
Car.prototype.type = OBJECT_CAR;

Trunk.prototype.hit = function(damage) {
	if(this.board.remove(this)) {
		loseGame();
	}
};



