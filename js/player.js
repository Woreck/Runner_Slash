function Player(sprite, game){
  
  this.refGame = game;
  
  this.parameters = this.refGame.parameters.player;
  
  this.score = 0;

  //SPRITE\\
  this.sprite = sprite;

  this.sprite.refThis = this;
  
  this.sprite.animations.add('run', ['sprite1', 'sprite2', 'sprite3', 'sprite4', 'sprite5', 'sprite6', 'sprite7', 'sprite8', 'sprite9']);
  this.sprite.animations.play('run',this.parameters.animations.frameRate.run||15,true);
  
  this.sprite.scale.x = 0.5;
  this.sprite.scale.y = 0.5;
  
  this.sprite.x = 1000;
  
  this.sprite.body.gravity.y = this.parameters.gravity;
  
  this.sprite.outOfBoundsKill = true;
  

  this.canSlash = true;


  //FURY
  this.fury = {
    parameters:this.parameters.fury,
    amount: 0,
    activated: false,
    chain: [],
  };


  //AUDIO
  this.audio = {
    jump1: this.refGame.add.audio('jump1'),
    jump2: this.refGame.add.audio('jump2'),
  };


  //JUMP
  this.jump = {
    parameters:this.parameters.jump,
    mouseReleased:this.parameters.jump.mouseReleased,
    amount:this.parameters.jump.amount,
  };


  //DASH
  this.dash = false;
  this.dashTime = 0;
  this.canDash = true;
  this.timeBeforeCanDash = 0;


  //AURA
  this.aura = this.refGame.add.sprite(410,90,'aura');
  this.aura.animations.add('walk');
  this.aura.scale.x = 3;
  this.aura.scale.y = 3;
  this.aura.alpha = 0.4;
  this.aura.animations.play('walk', 10, true)
  this.refGame.add.tween(this.aura).to({ x: this.refGame.width }, 10000, Phaser.Easing.Linear.None, true);


  //Particles
  this.emitterParticles = this.refGame.add.emitter(this.refGame.camera.x+20, 200, 200);
  this.emitterParticles.makeParticles('star');
  this.emitterParticles.start(false, 1000,0.1);

};
Player.prototype.constructor = Player;


/***********************************************
Fonction a éxécuter a 60FPS
***********************************************/
Player.prototype.update = function update(direction){
  
  if(this.sprite.y < 0){
    this.sprite.body.velocity.y = -this.sprite.body.velocity.y;
    //RUSTINE By Timoté Guyot A l'AiZE
    this.sprite.y = 10;
  }


  //PARTICLES
  if(this.dash){
    this.emitterParticles.x = this.sprite.x + this.sprite.width/2;
    this.emitterParticles.y = this.sprite.y + this.sprite.height/2;
  }
  else{
    this.emitterParticles.x = 0;
    this.emitterParticles.y = 0;
  }


  /*****************************
    ROUTINE
  *****************************/
  this.checkCollisionGround();
  this.checkJump(direction);
  this.checkReleasedInput();
  this.adjust();
  this.slash(direction);
  this.dashing(direction);
  this.earthQuaking(direction);
  this.updateFury();
};


/*****************************************************
Regarde si le joueur est en collision avec 
un élément en dessous
*****************************************************/
Player.prototype.checkCollisionGround = function checkCollisionGround(){
  if(this.sprite.body.touching.down){
    this.jump.amount = this.jump.parameters.amountMax;
    return true;
  }
  return false;
};


/*****************************************************
Regarde si le joueur peux encore sauter
puis si celui ci trace un trait vers le haut
*****************************************************/
Player.prototype.checkJump = function checkJump(direction){
  if(this.jump.amount > 0){
    if(this.checkInput(direction,"up") && this.jump.mouseReleased && direction.height < this.jump.parameters.heightToJump){
      this.jump.mouseReleased = false;
      this.jumping();
    }
  }
};


/*****************************************************
Donne une impulsion au joueur et réduit son nombre
de saut.
*****************************************************/
Player.prototype.jumping = function jumping(){
  this.audio['jump'+this.jump.amount].play()
  this.sprite.body.velocity.y = this.jump.parameters.velocity*this.refGame.speed;
  this.jump.amount--;
};


/*****************************************************
Regarde si le joueur appuie ou non sur la souris
*****************************************************/
Player.prototype.checkReleasedInput = function checkReleasedInput(){
  if(this.refGame.input.mousePointer2.isUp){
    this.jump.mouseReleased = true;
    return true;
  }
  return false;
};


/*****************************************************
Regarde si le joueur trace un trait vers "where"
*****************************************************/
Player.prototype.checkInput = function checkInput(input,where){
  if(!!input && input.direction[where]){
    return true;
  }
  return false;
};


/*****************************
Ajustement camera
*****************************/
Player.prototype.adjust = function(){
  //SPRITE TROP A GAUCHE
  if(this.sprite.x < this.refGame.camera.x + 100){
    this.sprite.body.velocity.x = this.parameters.adjust.right*this.refGame.speed;
  }
  //SPRITE TROP A DROITE
  else if(this.sprite.x > this.refGame.camera.x + 200){
    this.sprite.body.velocity.x = this.parameters.adjust.left*this.refGame.speed;
  }
  else{
    this.sprite.body.velocity.x =  this.parameters.adjust.normal*this.refGame.speed;
  }
};


/****************************
Manager de Fury ?
****************************/
Player.prototype.updateFury = function(){
  if(!this.fury.activated){
    if(this.fury.amount < this.fury.parameters.amountMax){
      this.fury.amount+=this.fury.parameters.amountGainedPerFrame;
    }
    if(this.fury.amount > this.fury.parameters.amountMax){
      this.fury.amount = this.fury.parameters.amountMax;
    }
  }
  else{
    this.fury.amount-=this.fury.parameters.amountLosedPerFrame;
    if(this.fury.amount <= 0){

      var that = this;

      this.fury.activated = false;
      
      //PLAY PLAYER ANIMATION
      this.sprite.animations.stop();
      this.sprite.animations.play('run',this.parameters.animations.frameRate.run,true);
      
      //PLAY COINS ANIMATIONS
      this.refGame.coins.forEach(function(coin){
        coin.animations.stop();
        coin.animations.play('turn',that.refGame.parameters.coins.animations.turn.frameRate,true);
      });
      
      //PLAY ENEMIES ANIMATIONS
      this.refGame.enemies.forEach(function(enemy){
        enemy.animations.stop();
        enemy.animations.play('lol',that.refGame.parameters.enemies.animations.idle.frameRate,true);
      });
      
      //GAME SPEED
      this.refGame.speed = 1;
      //GRAVITY
      this.sprite.body.gravity.y = this.parameters.gravity;
    }
  }
};


/***********************************************************
Attaque "SLASH" du joueur
***********************************************************/
Player.prototype.slash = function slash(direction){
  if(this.refGame.input.mousePointer.isDown && this.canSlash){
    if(direction){
      var points = {
        enter: {
          x: direction.worldX,
          y: direction.worldY
        },
        mid: {
          x: direction.worldX+direction.width*0.5,
          y: direction.worldY+direction.height*0.5
        },
        end: {
          x: direction.worldX+direction.width,
          y: direction.worldY+direction.height
        },
        greater:{
          x:0,
          y:0
        },
        lesser:{
          x:0,
          y:0
        }
      };
      this.upperPoint(points);
      this.downerPoint(points);
      /********************************
            DEBUG SLASH
       *******************************/
      this.refGame.renderDebugA = this.refGame.add.sprite(points.enter.x,points.enter.y,'lol');
      this.refGame.renderDebugB = this.refGame.add.sprite(points.mid.x,points.mid.y,'lol');
      this.refGame.renderDebugC = this.refGame.add.sprite(points.end.x,points.end.y,'lol');
      var that = this
      this.refGame.enemies.forEachExists(function(enemy){
        //Si collision clic/enemy
        if(this.isOut(points.enter, enemy) &&
           this.isIn(points.mid, enemy) && 
           this.isOut(points.end, enemy)){
            enemy.refThis.addToScore();
          this.canSlash = false;
        }
      },this);
    }
  }
  else if(!this.canSlash && this.refGame.input.mousePointer.isUp){
    this.canSlash = true;
  }
};


Player.prototype.upperPoint = function(arg){
  if(arg.enter.x > arg.end.x){
    arg.greater.x = arg.enter.x;
  }
  else{
    arg.greater.x = arg.end.x;
  }
  if(arg.enter.y > arg.end.y){
    arg.greater.y = arg.enter.y;
  }
  else{
    arg.greater.y = arg.end.y;
  }
};


Player.prototype.downerPoint = function(arg){
  if(arg.enter.x < arg.end.x){
    arg.lesser.x = arg.enter.x;
  }
  else{
    arg.lesser.x = arg.end.x;
  }
  if(arg.enter.y < arg.end.y){
    arg.lesser.y = arg.enter.y;
  }
  else{
    arg.lesser.y = arg.end.y;
  }
};


Player.prototype.isIn = function(point, target){
  if(point.x >= target.x &&
    point.x <= target.x+target.width &&
    point.y >= target.y &&
    point.y <= target.y+target.height){
    return true;
  }
  return false;
};


Player.prototype.isOut = function(point, target){
  if((point.x < target.x || point.x > target.x+target.width) ||
     (point.y < target.y || point.y > target.y+target.height)){
    return true;
  }
  return false;
};


/**************************************************
Permet de foncer vers le sol
**************************************************/
Player.prototype.earthQuaking = function(dir){
  if(dir){ 
    if(dir.direction.down && dir.height > this.jump.parameters.heightToEarthQuake && !this.fury.activated){ 
      this.sprite.body.velocity.y = this.jump.parameters.earthQuakingVelocity;
    }
  }  
};


/*************************************************
Permet de sprinter vers l'avant en tracant un 
trait vers la droite
*************************************************/
Player.prototype.dashing = function(dir){
  
  this.timeBeforeCanDash++;


  //Si pas entrain de dasher
  if(this.canDash && !this.dash ){
      this.aura.x = this.sprite.x - 100;
      this.aura.y = this.sprite.y - 100;
  }
  else{
     this.aura.x = 0;
  }


  //Si par terre + time > 30
  if(this.sprite.body.touching.down && this.timeBeforeCanDash > this.parameters.dash.timeBeforeCanDash ){
    this.canDash = true;
  }
  

  //Si il peut dasher et qu'on trace vers la droite un trait de 151 px min
  if(dir && this.canDash && dir.width > this.parameters.dash.mouseWidthToDash && !this.fury.activated){
    if(dir.direction.right){
      this.dash = true;
    }
  }
  

  //Si le dash est activé
  if(this.dash){
    
    this.dashTime++;
    
    this.sprite.body.gravity.y = 0;
    this.sprite.body.velocity.x = this.parameters.dash.velocity;
    
    this.sprite.alpha = 0.5;
    
    //Si il atteint les 10 frames il s'arrete
    if(this.dashTime >= 10){
      
      this.dashTime = 0;
      
      this.dash = false;
      this.canDash = false;
      
      this.sprite.body.velocity.x = this.parameters.adjust.normal;
      this.sprite.body.gravity.y = this.parameters.gravity;
      this.sprite.alpha = 1;
      
      this.timeBeforeCanDash = 0;
      
    }
    
  }
};