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
	this.type="redBlock"
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
	BLOCK BREAKABLE
********************************************/
function BlockBreakable(x,y,refGame,type){
	this.refGame= refGame;
	this.sprite=refGame.blockBreakable.create(x,y,"blockBreakable");
	this.sprite.refThis = this;
	this.speed = 1;
	this.type="blockBreakable";
}
BlockBreakable.prototype.kill = function(){
	this.sprite.kill();
};

/********************************************
	DOOR
********************************************/
function Door(x,y,id,refGame){
	this.refGame = refGame;
	this.sprite = refGame.doors.create(x,y,"doors");
	this.sprite.scale.y = 2;
	this.sprite.body.immovable = true;
	this.sprite.refThis = this;
	this.type="doors"
	this.id = id;
	
};
Door.prototype.kill = function(){
	this.sprite.kill();
};
/********************************************
	TRIGGER DOOR
********************************************/
function Trigger(x,y,id,refGame){
	this.refGame = refGame;
	this.sprite = refGame.triggers.create(x,y,"switch");
	this.sprite.body.immovable = true;
	this.sprite.refThis = this;
	this.type= "trigger"
	this.id = id;
};
Trigger.prototype.kill= function(){
	var that = this;
	this.refGame.doors.forEachAlive(function(door){
		console.log(that.id,door.refThis.id)
		if(door.refThis.id == that.id){
			door.refThis.kill();
		}
	});
    this.sprite.kill();
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
		ammo: refGame.add.text(0,0,refGame.player.weaponLongRange.ammoRemaining),
		meters: refGame.add.text(0,0,refGame.player.distanceParcourue)
	};
	this.sprites.lifeBar.fixedToCamera = true;
	this.sprites.lifeBar.cameraOffset.x = this.sprites.lifeBar.x;

	this.sprites.lifeFill.fixedToCamera = true;
	this.sprites.lifeFill.cameraOffset.x = this.sprites.lifeFill.x;
	this.sprites.lifeFill.width = this.sprites.lifeBar.width;

	this.sprites.ammo.x = this.sprites.lifeBar.cameraOffset.x + this.sprites.lifeBar.width + 20+ refGame.camera.x;

	this.sprites.meters.x = this.sprites.ammo.x + this.sprites.ammo.width + 20;

	this.actionButton = refGame.add.button(0,0,actionButtonKey,function(){
		var CloseCombat = false;
		that.refGame.enemies.forEachAlive(function(enemy){
			console.log(Math.abs(enemy.x-that.refGame.player.sprite.x+that.refGame.player.sprite.width),that.refGame.player.weaponCac.range)
			if(Math.abs(enemy.x-that.refGame.player.sprite.x+that.refGame.player.sprite.width) <= that.refGame.player.weaponCac.range){
				CloseCombat = true;
			}
		});

		if( CloseCombat || that.refGame.player.weaponLongRange.ammoRemaining == 0){
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
Hud.prototype.updateMeters = function(){
	this.sprites.meters.setText((this.refGame.player.distanceParcourue|0)+"m");
};
Hud.prototype.updateAmmo = function(){
	this.sprites.ammo.setText(this.refGame.player.weaponLongRange.ammoRemaining);
};
Hud.prototype.updateLifeFill = function(amountToUpdate){
	this.sprites.lifeFill.width -= amountToUpdate;
	if(this.sprites.lifeFill.width < 0){
		this.sprites.lifeFill.width = 0;
	}
};
Hud.prototype.bringToTop = function(){
	this.actionButton.bringToTop();
	this.sprites.lifeBar.bringToTop();
	this.sprites.lifeFill.bringToTop();
};
Hud.prototype.kill = function(){
	this.actionButton.fixedToCamera = false;
	this.sprites.lifeBar.fixedToCamera = false;
	this.sprites.lifeFill.fixedToCamera = false;
};

function CloseRangeWeapon(refGame, key){
	this.refGame = refGame;
	this.parameters = this.refGame.parameters.weapons.closeRange[key];
	this.type = this.parameters.type;
	this.name = this.parameters.name;
	
	this.damage = this.parameters.damage;
	this.speed = this.parameters.speed;
	this.range = this.parameters.range;
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
		rect.alpha = 0.5;

		this.refGame.physics.overlap(rect,this.refGame.enemies,function(weapon,enemy){
			enemy.refThis.addToScore();
		});
		this.frameSinceUse = 0;
	}
};

function LongRangeWeapon(refGame, key){
	this.refGame = refGame;
	this.parameters = this.refGame.parameters.weapons.longRange[key];
	this.type = this.parameters.type;
	this.name = this.parameters.name;
	
	this.damage = this.parameters.damage;
	this.fireRate = this.parameters.fireRate;
	this.range = this.parameters.range;
	
	this.ammoRemaining = this.parameters.ammo;

	this.frameSinceShoot = 0;
};
LongRangeWeapon.prototype.update = function(){
	this.frameSinceShoot++;
};
LongRangeWeapon.prototype.shoot = function(){
	if(this.frameSinceShoot >= this.fireRate && this.ammoRemaining > 0){
		var bullet = new Bullet(
			this.refGame,															//refGame
			this.refGame.player.sprite.x+this.refGame.player.sprite.width,			//X
			this.refGame.player.sprite.y+this.refGame.player.sprite.height*0.5,		//Y
			10,																		//DGT
			2000
			);																	//Velocity X
		this.ammoRemaining--;
		this.frameSinceShoot = 0;
		this.refGame.hud.updateAmmo();
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
};