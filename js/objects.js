/********************************************
	BLOCK
********************************************/
function Block(x,y,game,type){
	this.refGame = game;
	this.type = type || "1";
	this.sprite = this.refGame.obstacles.create(x,y,'block'+this.type);
	switch(this.type){
		case "1":
		this.weight = 1;
		break;
	}
};
Block.prototype.constructor = Block;
Block.prototype.kill = function(){
	this.sprite.kill();
	delete this.refGame;
	delete this.type;
	delete this.lol;
};
/********************************************
	COINS
********************************************/
function Coins(x,y,game,type){
	this.refGame = game;
	this.type = type || "1";
	this.sprite = this.refGame.coins.create(x,y,'coins'+this.type);
	this.sprite.animations.add('turn', ['sprite1', 'sprite2', 'sprite3', 'sprite4', 'sprite5', 'sprite6', 'sprite7', 'sprite8']);
    this.sprite.animations.play('turn',15,true);
    this.audio = this.refGame.add.audio('coins');
	this.points = parseInt(game.parameters.coins["type"+this.type].points);
	this.sprite.refThis = this;
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
	this.sprite.animations.add('lol', ['1', '2', '3', '4', '5', '6', '7']);
    this.sprite.animations.play('lol',15,true);
    this.sprite.scale.x = 0.5;
    this.sprite.scale.y = 0.5;
    this.sprite.refThis = this;
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
	DISPLAY OBJECT
********************************************/
function DisplayObject(x,y,text,style,key,game,callback,context){
	this.refGame = game;
	this.x = x;
	this.y = y;
	this.text = text || "text";
	this.style = style || {fill:"#ffffff",font:"60px Arial",align:"center"};
	this.key = key || 'button';
	this.callback = callback || null;
	this.context = context || this;
	this.display = this.refGame.add.text(this.x,this.y,this.text,this.style);
	if(this.callback){
		this.interact = this.refGame.add.button(this.display.x,this.display.y,this.key,this.callback,this.context);
		this.interact.x-=this.interact.width+10;
	}
}
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
}