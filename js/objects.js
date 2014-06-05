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

function Hud(refGame,lifeBarKey,lifeFillKey,ammoKey,actionButtonKey){
	var that = this;

	this.refGame = refGame;


	this.sprites = {
		lifeBar: refGame.add.sprite(refGame.width*0.01,refGame.height*0.01,lifeBarKey),
		lifeFill: refGame.add.sprite(refGame.width*0.01,refGame.height*0.01,lifeFillKey),
		ammo: refGame.add.sprite(refGame.width*0.12, refGame.height*0.01,ammoKey)
	};


	this.sprites.lifeBar.fixedToCamera = true;
	this.sprites.lifeBar.cameraOffset.x = this.sprites.lifeBar.x;

	this.sprites.lifeFill.fixedToCamera = true;
	this.sprites.lifeFill.cameraOffset.x = this.sprites.lifeFill.x;
	this.sprites.lifeFill.width = this.sprites.lifeBar.width;
	
	this.sprites.ammo.fixedToCamera = true;
	this.sprites.ammo.cameraOffset.x = this.sprites.lifeBar.cameraOffset.x + this.sprites.lifeBar.width + 20;

	this.actionButton = refGame.add.button(0,0,actionButtonKey,function(){
		var CloseCombat = false;
		that.refGame.enemies.forEach(function(enemy){
			if(enemy.x-that.refGame.player.sprite.x+that.refGame.player.sprite.width <= that.refGame.player.weaponCac.range){
				CloseCombat = true;
			}
		});

		if(CloseCombat){
			that.refGame.player.weaponCac.use(that.refGame.player);
		}
		else{
			that.refGame.player.weaponLongRange.shoot();
		}
	});

	this.actionButton.fixedToCamera = true;
	this.actionButton.cameraOffset.x = this.refGame.width*0.9;
	this.actionButton.cameraOffset.y = 500;
	this.actionButton.alpha = 0.3;
};
Hud.prototype.updateLifeFill = function(amountToUpdate){
	this.sprites.lifeFill.width -= amountToUpdate;
	if(this.sprites.lifeFill.width < 0){
		this.sprites.lifeFill.width = 0;
	}
};

function CloseRangeWeapon(refGame, type, name, damage, speed, range){
	this.refGame = refGame;
	this.type = type;
	this.name = name;
	
	this.damage = damage;
	this.speed = speed;
	this.range = range;
	this.frameSinceUse = 0;
};
CloseRangeWeapon.prototype.update = function(){
	if(this.frameSinceUse < this.speed){
		this.frameSinceUse++;	
	}
};
CloseRangeWeapon.prototype.use = function(player){
	if(this.frameSinceUse >= this.speed){
		var rect = this.refGame.add.sprite(player.sprite.x+player.sprite.width,player.sprite.y,"redBlock");
		rect.width = this.range;
		rect.body.width = this.range;
		rect.alpha = 0.4;

		this.refGame.physics.overlap(rect,this.refGame.enemies,function(weapon,enemy){
			enemy.refThis.addToScore();
		});
		this.frameSinceUse = 0;
	}
};

function LongRangeWeapon(refGame, type, name, damage, fireRate, range, amountOfClipsMax, ammoPerClips, reloadingSpeed){
	this.refGame = refGame;
	this.type = type;
	this.name = name;
	
	this.damage = damage;
	this.fireRate = fireRate;
	this.range = range;
	
	this.amountOfClipsMax = amountOfClipsMax;
	this.clipsRemaining = amountOfClipsMax;
	
	this.ammoPerClips = ammoPerClips;
	this.ammoRemaining = ammoPerClips;

	this.reloadingSpeed = reloadingSpeed;
	this.isReloading = false;

	this.frameSinceShoot = 0;
	this.frameReload = 0;
	
};
LongRangeWeapon.prototype.update = function(){
	if(this.isReloading){
		this.frameReload++;
		if(this.frameReload >= this.reloadingSpeed){
			this.ammoRemaining = this.ammoPerClips;
			this.clipsRemaining--;
			this.isReloading = false;
		}
	}
	else{
		this.frameSinceShoot++;
	}
};
LongRangeWeapon.prototype.shoot = function(){
	console.log(this.ammoRemaining,this.clipsRemaining)
	if(this.ammoRemaining > 0 && this.frameSinceShoot >= this.fireRate){
		var bullet = new Bullet(
			this.refGame,															//refGame
			this.refGame.player.sprite.x+this.refGame.player.sprite.width,			//X
			this.refGame.player.sprite.y+this.refGame.player.sprite.height*0.5,		//Y
			10,																		//DGT
			2000
			);																	//Velocity X
		this.ammoRemaining--;
		this.frameSinceShoot = 0;
	}else if(this.clipsRemaining > 0 && this.ammoRemaining == 0 && this.isReloading == false){
		this.isReloading = true;
		this.frameReload = 0;
	}
};
LongRangeWeapon.prototype.reload = function(){
	if(this.clipsRemaining > 0){
		this.isReloading = true;
		this.frameReload = 0;
	}
};
function Bullet(refGame, x, y, damage, velocityX){
	this.refGame = refGame;

	this.damage = damage;

	this.sprite = refGame.bullets.create(x,y,"redBlock");

	this.sprite.body.velocity.x = velocityX;

	this.sprite.scale.x = 0.25;
	this.sprite.scale.y = 0.25;

	this.sprite.body.width /= 4;
	this.sprite.body.height /= 4;

	this.sprite.alpha = 0.8;
};