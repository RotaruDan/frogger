//Dan Cristian, Rotaru

var Game = new function() {                                                                  
	var boards = [];

	// Game Initialization
	this.initialize = function(canvasElementId,sprite_data,callback) {
		this.canvas = document.getElementById(canvasElementId);
		this.width = this.canvas.width;
		this.height= this.canvas.height;
		this.carsRow1 = Game.height - 96;
		this.carsRow2 = Game.height - 144; 
		this.carsRow3 = Game.height - 192; 
		this.carsRow4 = Game.height - 240; 
		this.trunksRow1 = 48*3; 
		this.trunksRow2 = 48*2; 
		this.trunksRow3 = 48; 

		this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
		if(!this.ctx) { return alert("Please upgrade your browser to play"); }

		this.canvasMultiplier = 1;
		this.playerOffset = 10;
		this.setupMobile();
		this.setupInput();

		if(this.mobile){
			this.setBoard(2,new TouchControls());
		}
		this.loop(); 

		SpriteSheet.load(sprite_data,callback);
	};

	this.setupMobile = function() {
		var container = document.getElementById("container"),
			hasTouch =  !!('ontouchstart' in window),
			w = window.innerWidth, h = window.innerHeight;

		if(hasTouch) { mobile = true; }

		if(screen.width > 1100) { return false; }

		if(w > h) {
			alert("Please rotate the device and then click OK");
			w = window.innerWidth; h = window.innerHeight;
		}

		container.style.height = h*2 + "px";
		window.scrollTo(0,1);

		h = window.innerHeight;
		container.style.height = h + "px";

		if(h >= this.canvas.height * 1.75 || w >= this.canvas.height * 1.75) {
			this.canvasMultiplier = 2;
			this.canvas.width = w / 2;
			this.canvas.height = h / 2;
			this.canvas.style.width = w + "px";
			this.canvas.style.height = h + "px";
		} else {
			this.canvas.width = w;
			this.canvas.height = h;
		}

		this.canvas.style.position='absolute';
		this.canvas.style.left="0px";
		this.canvas.style.top="0px";

		this.mobile = true;

	};

	// Handle Input
	var KEY_CODES = { 37:'left', 38 :'up', 39:'right', 40:'down' };
	this.keys = {};

	this.setupInput = function() {
		window.addEventListener('keydown',function(e) {
			if(KEY_CODES[event.keyCode]) {
				Game.keys[KEY_CODES[event.keyCode]] = true;
				e.preventDefault();
			}
		},false);

		window.addEventListener('keyup',function(e) {
			if(KEY_CODES[event.keyCode]) {
				Game.keys[KEY_CODES[event.keyCode]] = false; 
				e.preventDefault();
			}
		},false);
	};

	// Game Loop
	this.loop = function() { 
		var dt = 30 / 1000;
		setTimeout(Game.loop,30);

		for(var i=0,len = boards.length;i<len;i++) {
			if(boards[i]) { 
				boards[i].step(dt);
				boards[i].draw(Game.ctx);
			}
		}

	};

	// Change an active game board
	this.setBoard = function(num,board) { boards[num] = board; };

	return this;
};


this.setupMobile = function() {
	var container = document.getElementById("container"),
		hasTouch =  !!('ontouchstart' in window),
		w = window.innerWidth, h = window.innerHeight;

	if(hasTouch) { mobile = true; }

	if(screen.width > 1100) { return false; }

	if(w > h) {
		alert("Please rotate the device and then click OK");
		w = window.innerWidth; h = window.innerHeight;
	}

	container.style.height = h*2 + "px";
	window.scrollTo(0,1);

	h = window.innerHeight;
	container.style.height = h + "px";

	if(h >= this.canvas.height * 1.75 || w >= this.canvas.height * 1.75) {
		this.canvasMultiplier = 2;
		this.canvas.width = w / 2;
		this.canvas.height = h / 2;
		this.canvas.style.width = w + "px";
		this.canvas.style.height = h + "px";
	} else {
		this.canvas.width = w;
		this.canvas.height = h;
	}

	this.canvas.style.position='absolute';
	this.canvas.style.left="0px";
	this.canvas.style.top="0px";

	this.mobile = true;

};

var SpriteSheet = new function() {
	this.map = { }; 
	var TO_RADIANS = Math.PI/180; 

	this.load = function(spriteData,callback) { 
		this.map = spriteData;
		this.image = new Image();
		this.image.onload = callback;
		this.image.src = 'images/spritesFrogger.png';
	};

	this.draw = function(ctx,sprite,x,y,frame) {
		var s = this.map[sprite];
		if(!frame) frame = 0;
		ctx.drawImage(this.image,
					  s.sx + frame * s.w, 
					  s.sy, 
					  s.w, s.h, 
					  Math.floor(x), Math.floor(y),
					  s.w, s.h);
	};

	this.drawRotated = function(ctx,sprite,x,y,frame,angle) {
		var s = this.map[sprite];
		if(!frame) frame = 0;

		ctx.save(); 
		ctx.translate(x + s.w/2, y + s.h/2);
		ctx.rotate(angle * TO_RADIANS);

		ctx.drawImage(this.image,
					  0 + frame * s.w, 
					  0, 
					  s.w, 
					  s.h,
					  -(s.w/2), 
					  -(s.h/2), 
					  s.w, 
					  s.h); 
		ctx.restore(); 
	};

	return this;
};

var TitleScreen = function TitleScreen(title,subtitle,callback) {
	var up = false;
	var goingDown = false;
	this.step = function(dt) {
		if(!Game.keys['up']) up = true;
		if(up && Game.keys['up'] && callback) callback();
	};

	this.draw = function(ctx) {
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";

		ctx.font = "bold 40px bangers";
		ctx.fillText(title,Game.width/2,Game.height/2);

		ctx.font = "bold 20px bangers";
		ctx.fillText(subtitle,Game.width/2,Game.height/2 + 40);
	};

};


var GameBoard = function() {
	var board = this;

	// The current list of objects
	this.objects = [];
	this.cnt = {};

	// Add a new object to the object list
	this.add = function(obj, top) { 
		obj.board=this; 
		if(top)
			this.objects.unshift(obj); 
		else 			
			this.objects.push(obj); 
		this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
		return obj; 
	};

	// Mark an object for removal
	this.remove = function(obj) { 
		var idx = this.removed.indexOf(obj);
		if(idx == -1) {
			this.removed.push(obj); 
			return true;
		} else {
			return false;
		}
	};

	// Reset the list of removed objects
	this.resetRemoved = function() { this.removed = []; };

	// Removed an objects marked for removal from the list
	this.finalizeRemoved = function() {
		for(var i=0,len=this.removed.length;i<len;i++) {
			var idx = this.objects.indexOf(this.removed[i]);
			if(idx != -1) {
				this.cnt[this.removed[i].type]--;
				this.objects.splice(idx,1);
			}
		}
	};

	// Call the same method on all current objects 
	this.iterate = function(funcName) {
		var args = Array.prototype.slice.call(arguments,1);
		for(var i=0,len=this.objects.length;i<len;i++) {
			var obj = this.objects[i];
			obj[funcName].apply(obj,args);
		}
	};

	// Find the first object for which func is true
	this.detect = function(func) {
		for(var i = 0,val=null, len=this.objects.length; i < len; i++) {
			if(func.call(this.objects[i])) return this.objects[i];
		}
		return false;
	};

	// Call step on all objects and them delete
	// any object that have been marked for removal
	this.step = function(dt) { 
		this.resetRemoved();
		this.iterate('step',dt);
		this.finalizeRemoved();
	};

	// Draw all the objects
	this.draw= function(ctx) {
		this.iterate('draw',ctx);
	};

	// Check for a collision between the 
	// bounding rects of two objects
	this.overlap = function(o1,o2) {
		return !((o1.y+o1.h-1<o2.y) || (o1.y>o2.y+o2.h-1) ||
				 (o1.x+o1.w-1<o2.x) || (o1.x>o2.x+o2.w-1));
	};

	// Find the first object that collides with obj
	// match against an optional type
	this.collide = function(obj,type) {
		return this.detect(function() {
			if(obj != this) {
				var col = (!type || this.type & type) && board.overlap(obj,this);
				return col ? this : false;
			}
		});
	};


};

var Sprite = function() { };

Sprite.prototype.setup = function(sprite,props) {
	this.sprite = sprite;
	this.merge(props);
	this.frame = this.frame || 0;
	this.w =  SpriteSheet.map[sprite].w;
	this.h =  SpriteSheet.map[sprite].h;
};

Sprite.prototype.merge = function(props) {
	if(props) {
		for (var prop in props) {
			this[prop] = props[prop];
		}
	}
};

Sprite.prototype.draw = function(ctx) {
	SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
};

Sprite.prototype.hit = function(damage) {
	this.board.remove(this);
};


var Spawner = function() {
	this.elapsedCarTime = 0;
	this.elapsedTrunkTime = 0;
	this.respawnCarTime = 0;
	this.respawnTrunkTime = 0;
};

Spawner.prototype.step = function(dt) {

	// Update cars spawn behavior
	this.elapsedCarTime += dt;

	if(this.elapsedCarTime > this.respawnCarTime){    
		this.elapsedCarTime = 0;
		this.respawnCarTime = 1 + Math.random();
		if(Math.random() < 0.95){
			if(Math.random() < 0.84){
				this.board.add(new Car('car1', -109 - Math.random()*10, Game.carsRow1), true);
			}
			if(Math.random() < 0.88){
				this.board.add(new Car(Math.random() < 0.5 ? 'car2' : 'car5', 149 + Math.random()*10, Game.carsRow2), true);
			}
			if(Math.random() < 0.46){
				this.board.add(new Car('car3', -82 - Math.random()*10, Game.carsRow3), true);
			}
			if(Math.random() < 0.85){
				this.board.add(new Car('car4', 133 + Math.random()*10, Game.carsRow4), true);
			}			
		}
	}

	// Update trunks spawn behavior
	this.elapsedTrunkTime += dt;

	if(this.elapsedTrunkTime > this.respawnTrunkTime){    
		this.elapsedTrunkTime = 0;
		this.respawnTrunkTime = 2 + Math.random();
		if(Math.random() < 0.95){
			if(Math.random() < 0.80){
				this.board.add(new Trunk(92 + Math.random()*8, Game.trunksRow1), true);
			}
			if(Math.random() < 0.87){
				this.board.add(new Trunk(85 + Math.random()*5, Game.trunksRow2), true);
			}
			if(Math.random() < 0.83){
				this.board.add(new Trunk(110 + Math.random()*10, Game.trunksRow3), true);
			}			
		}
	}
};

Spawner.prototype.draw = function(ctx) {
	ctx.fillText(CURRENT_FROG_LIVES, 26, 20);
};


var TouchControls = function() {

	var gutterWidth = 10;
	var unitWidth = Game.width/5;
	var blockWidth = unitWidth-gutterWidth;

	this.drawSquare = function(ctx,x,y,txt,on) {
		ctx.globalAlpha = on ? 0.9 : 0.6;
		ctx.fillStyle =  "#CCC";
		ctx.fillRect(x,y,blockWidth,blockWidth);

		ctx.fillStyle = "#FFF";
		ctx.textAlign = "center";
		ctx.globalAlpha = 1.0;
		ctx.font = "bold " + (3*unitWidth/4) + "px arial";

		ctx.fillText(txt, 
					 x+blockWidth/2,
					 y+3*blockWidth/4);
	};

	this.draw = function(ctx) {
		ctx.save();

		var yLoc = Game.height - unitWidth;
		this.drawSquare(ctx,gutterWidth,yLoc,"\u25C0", Game.keys['left']);
		this.drawSquare(ctx,2*unitWidth + gutterWidth,yLoc,"\u25B6", Game.keys['right']);
		this.drawSquare(ctx,unitWidth + gutterWidth,yLoc - unitWidth,"\u25B2", Game.keys['up']);
		this.drawSquare(ctx,unitWidth + gutterWidth,yLoc ,"\u25BC", Game.keys['down']);

		ctx.restore();
	};

	this.step = function(dt) { };

	this.trackTouch = function(e) {
		var touch, x, y;

		e.preventDefault();
		Game.keys['left'] = false;
		Game.keys['right'] = false;
		Game.keys['up'] = false;
		Game.keys['down'] = false;

		if(e.type == 'touchstart' || e.type == 'touchmove') {
			for(i=0;i<e.changedTouches.length;i++) {
				touch = e.changedTouches[i];
				x = touch.clientX / Game.canvasMultiplier;
				y = touch.clientY / Game.canvasMultiplier;
				if(x < gutterWidth + unitWidth) {
					Game.keys['left'] = true;
				} else if(x > (gutterWidth  + unitWidth) * 2 && x < (gutterWidth + unitWidth) * 3){
					Game.keys['right'] = true;				
				} else if(x > gutterWidth + unitWidth && x < (gutterWidth  + unitWidth) * 2){
					if(y > Game.height - unitWidth){
						Game.keys['down'] = true;					
					} else if(y > Game.height - unitWidth * 2){						
						Game.keys['up'] = true;				
					}
				}
			}
		}

	};

	Game.canvas.addEventListener('touchstart',this.trackTouch,false);
	Game.canvas.addEventListener('touchmove',this.trackTouch,false);
	Game.canvas.addEventListener('touchend',this.trackTouch,false);
	Game.canvas.addEventListener('touchcancel',this.trackTouch,false);

	Game.playerOffset = unitWidth + 20;
};


