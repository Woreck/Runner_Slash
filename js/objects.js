/********************************************
	BLOCK
********************************************/
function Block(x,y,game,type){
	this.refGame = game;
	
	this.type = type || "1";
	
	this.sprite = this.refGame.obstacles.create(x,y,'block'+this.type);
	this.sprite.body.immovable = true;
	
	switch(this.type){
		case "1":
		this.weight = 1;
		break;
		default:
		this.weight = 1;
	}
};
Block.prototype.constructor = Block;
Block.prototype.kill = function(){
	console.log("remove",this.refGame.obstacles.remove(this.sprite));
	this.sprite.kill();
	delete this.refGame;
	delete this.type;
};



/********************************************
	COINS
********************************************/
function Coins(x,y,game,type){
	
	this.refGame = game;
	
	this.type = type || "1";
	

	this.sprite = this.refGame.coins.create(x,y,'coins'+this.type);
	this.sprite.refThis = this;
	
	this.sprite.animations.add('turn', ['sprite1', 'sprite2', 'sprite3', 'sprite4', 'sprite5', 'sprite6', 'sprite7', 'sprite8']);
    this.sprite.animations.play('turn',15,true);
    
    this.audio = this.refGame.add.audio('coins');
	
	this.points = parseInt(game.parameters.coins["type"+this.type].points);

};
Coins.prototype.constructor = Coins;
Coins.prototype.addToScore = function(){
	this.refGame.player.score += this.points;
	this.audio.play();
	this.kill();
};
Coins.prototype.kill = function(){
	this.sprite.kill();
	delete this.refGame;
	delete this.type;
	delete this.points;
	return true;
};




/********************************************
	ENEMIES
********************************************/
function Enemies(x,y,game,type){
	this.refGame = game;
	
	this.type = type || "1";
	
	

	this.sprite = this.refGame.enemies.create(x,y,'enemies'+this.type);
    this.sprite.refThis = this;
	
	this.sprite.animations.add('lol', ['1', '2', '3', '4', '5', '6', '7']);
    this.sprite.animations.play('lol',15,true);
    
    this.sprite.scale.x = 0.5;
    this.sprite.scale.y = 0.5;
    
    this.audio = this.refGame.add.audio('coins');
	
	switch(this.type){
		case "1":
		this.points = 100;
		break;
	}

};
Enemies.prototype.addToScore = function(){
	this.refGame.player.score+=this.points;
	this.audio.play()
	this.kill();
};
Enemies.prototype.kill = function(){
	this.sprite.kill();
	delete this.refGame;
	delete this.type;
	delete this.points;
	return true;
};




/********************************************
	RED BLOCK DEBUG
********************************************/
function RedBlock(x,y,refGame,type){
	this.refGame = refGame;
	this.sprite = refGame.redBlock.create(x,y,"redBlock");
	this.sprite.refThis = this;
	this.speed = 1;
};
RedBlock.prototype.update = function(){
	this.sprite.body.velocity.x -= 10*this.speed;
};
RedBlock.prototype.kill = function(){
	this.sprite.kill();
	delete this.refGame;
	delete this.type;
	return true;
};




/********************************************
	DOOR
********************************************/
function Door(x,y,refGame,id){
	this.refGame = refGame;
	this.sprite = refGame.doors.create(x,y,"redBlock");
	this.sprite.scale.y = 2;
	this.sprite.body.immovable = true;
	this.sprite.refThis = this;
	this.idNumber = id;
	this.open = false;
};
Door.prototype.kill = function(){
	this.sprite.kill();

};



/********************************************
	TRIGGER DOOR
********************************************/
function Trigger(x,y,refGame,callback){
	this.refGame = refGame;
	this.sprite = refGame.triggers.create(x,y,"redBlock");
	this.sprite.body.immovable = true;
	this.sprite.refThis = this;
	this.callback = callback;
	this.activated = false;
};
Trigger.prototype.use = function(){
	this.activated = !this.activated;
	this.callback();
};



/********************************************
	DISPLAY OBJECT
********************************************/
function DisplayObject(x,y,text,style,key,game,callback,context){
	
	this.refGame = game;
	
	this.x = x;
	this.y = y;
	
	this.text = text || "text";
	
	this.style = style || {fill:"#ffffff",font:"60px Arial",align:"center"};
	this.display = this.refGame.add.text(this.x,this.y,this.text,this.style);
	
	this.key = key || 'button';
	
	this.callback = callback || null;
	
	this.context = context || this;
	
	if(this.callback){
		this.interact = this.refGame.add.button(this.display.x,this.display.y,this.key,this.callback,this.context);
		this.interact.x-=this.interact.width+10;
	}

};
DisplayObject.prototype.constructor = DisplayObject;



function Hud(game){
	var that = this;
	this.refGame = game;
	this.fury = {
		sprites: {
			jauge: game.add.sprite(this.refGame.parameters.hud.jauge.x,this.refGame.parameters.hud.jauge.y,'jauge'),
			remplissage: game.add.sprite(this.refGame.parameters.hud.remplissage.x,this.refGame.parameters.hud.remplissage.y,'remplissage'),
		},
		update: function(){
			this.sprites.jauge.x = that.refGame.camera.x+50;
			this.sprites.remplissage.x = that.refGame.camera.x+50;
			this.sprites.remplissage.width = (this.sprites.jauge.width/100)*that.refGame.player.fury.amount;
		}
	};
};
Hud.prototype.constructor = Hud;
Hud.prototype.update = function(){
	this.fury.update();
};

function CloseRangeWeapon(refGame, type, name, damage, speed, range){
	this.refGame = refGame;
	this.type = type;
	this.name = name;
	
	this.damage = damage;
	this.speed = speed;
	this.range = range;
};
CloseRangeWeapon.prototype.use = function(player){
	var rect = this.refGame.add.sprite(player.sprite.x+player.sprite.width,player.sprite.y,"redBlock");
	console.log(rect.body)

	this.refGame.physics.overlap(rect,this.refGame.enemies,function(weapon,enemy){
		enemy.refThis.addToScore();
	});
};

function LongRangeWeapon(type, name, damage, fireRate, range, amountOfClipsMax, ammoPerClips, reloadingSpeed){
	this.type = type;
	this.name = name;
	
	this.damage = damage;
	this.fireRate = speed;
	this.range = range;
	
	this.amountOfClipsMax = amountOfClipsMax;
	this.clipsRemaining = amountOfClipsMax;
	
	this.ammoPerClips = ammoPerClips;
	this.ammoRemaining = ammoPerClips;

	this.reloadingSpeed = reloadingSpeed;
};