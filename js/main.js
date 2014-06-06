window.onload = function() {
    var game = new Phaser.Game(800, 600, Phaser.AUTO, '');


    /**********************************
    STATE RUN 
    **********************************/
    var run = {
        //PRELOAD
        preload: function(){
            //PARAMETERS
            this.game.load.text('parameters','config/parameters.json');
            //COINS
            this.game.load.atlas('coins1','assets/Coins.png','config/coin.json')
            //BLOCKS
            this.game.load.image('block1','assets/Bloc.png');
            this.game.load.image('blockBreakable','assets/Destructible.png');
<<<<<<< HEAD
            //doors and trigger
            this.game.load.image('doors','assets/doors.png');
            this.game.load.image('switch','assets/switch.png');
=======
>>>>>>> b438ce8fabcad6dfd88f4d0cff3f8b23b409f262
            //SKIES
            this.game.load.image('sky','assets/sky.png');
            //ENEMIES
            this.game.load.atlas('enemies1','assets/sqdqsd.png', 'config/ennemi.json');
            //PLAYER
            this.game.load.atlas('player', 'assets/character1.png', 'config/chara.json');
            //STARS
            this.game.load.image('star', 'assets/star.png');
            //FURIE
            this.game.load.image('jauge', 'assets/jauge.png');
            this.game.load.image('remplissage', 'assets/remplissage.png');
            //AURA
            this.game.load.spritesheet('aura', 'assets/aura.png',80,90, 5);
            //SOUNDS
            this.game.load.audio('coins', ["assets/Pickup_Coin26.wav"]);
            this.game.load.audio('jump1', ["assets/Jump12.wav"]);
            this.game.load.audio('jump2', ["assets/Jump13.wav"]);
            //REDBLOCK DEBUG
            this.game.load.image("redBlock", "assets/enemi.png");
            //DONE
            console.log("PRELOAD RUN DONE",this.game);
        },
        //CREATE
        create: function(){
            
            this.game.speed = 1;
            
            this.game.frameDuration = 1;
            
            this.game.state.states.run.state = "RUNNER";

            //Curseur custom permettant de récupérer des directions et tout les bails
            this.game.input.mousePointer2 = this.game.input.mousePointer;
            //Positions De la frame d'avant
            this.game.input.mousePointer2.oldX = this.game.input.mousePointer2.x;
            this.game.input.mousePointer2.oldY = this.game.input.mousePointer2.y;
            //L'écart entre les deux positions
            this.game.input.mousePointer2.deltaX = this.game.input.mousePointer2.oldX-this.game.input.mousePointer2.x;
            this.game.input.mousePointer2.deltaY = this.game.input.mousePointer2.oldY-this.game.input.mousePointer2.y;
            //L'écart nécéssaire pour considérer le curseur comme ayant changé de direction
            this.game.input.mousePointer2.MARGE_X = this.game.input.mousePointer2.MARGE_X || 3;
            this.game.input.mousePointer2.MARGE_Y = this.game.input.mousePointer2.MARGE_Y || 3;

            window.onkeydown = function(e){
                if(that.game.player.fury.amount == that.game.player.fury.parameters.amountMax && !that.game.player.dash){
                    that.game.player.fury.activated = true;
                    that.game.speed = 0;
                    that.game.player.sprite.animations.stop();
                    that.game.player.sprite.animations.play('run',that.game.parameters.player.animations.frameRate.run*that.game.speed,true);
                    that.game.coins.forEach(function(coin){
                        coin.animations.stop();
                        coin.animations.play('turn',that.game.parameters.coins*that.game.speed,true);
                    });
                    that.game.enemies.forEach(function(enemy){
                        enemy.animations.stop();
                        enemy.animations.play('lol',that.game.parameters.enemies.animations.idle.frameRate*that.game.speed,true);
                    });
                    that.game.player.sprite.body.gravity.y = 0;
                    that.game.player.sprite.body.velocity.y = 0;
                    if(that.game.player.sprite.body.velocity.y < that.game.parameters.player.jump.velocity*that.game.speed){
                        console.log("trop de vitesse")
                        that.game.player.sprite.body.velocity.y = that.game.parameters.player.jump.velocity*that.game.speed;
                    }
                }
            };

            var that = this;
            
            this.game.parameters = JSON.parse(this.game.cache.getText("parameters"));
            readJson(this.game.parameters);
        
            

            //PARALLAX
            this.game.parallax = {
                refGame: this.game,
                spriteArray: [this.game.add.sprite(1000,0,'sky'),this.game.add.sprite(1800,0,'sky')],
                update: function(){
                    if(this.spriteArray[0].x+this.spriteArray[0].width <= this.refGame.camera.x){
                        this.replace(this.spriteArray[0],{x:this.spriteArray[1].x+this.spriteArray[1].width,y:0})
                    }
                    if(this.spriteArray[1].x+this.spriteArray[1].width <= this.refGame.camera.x){
                        this.replace(this.spriteArray[1],{x:this.spriteArray[0].x+this.spriteArray[0].width,y:0})
                    }
                },
                replace: function(sprite,place){
                    sprite.x = place.x;
                    sprite.y = place.y;
                },
            };
            


            //TIMER
            this.game.framer = {
                currentFrame:0,
                limit:-1,
                reached:false,
                resetFrame:    function(){this.currentFrame = 0;},
                setLimit:      function(limit){limit = limit || -1; this.limit = limit|0;},
                update:        function(){this.currentFrame++;},
                check:         function(){if(this.currentFrame>=this.limit){this.reached=true}},
            };
            

            //PLAYER
            this.game.player = new Player(this.game.add.sprite(0,300,'player'),this.game);
            
            //HUD
            this.game.hud = new Hud(this.game,'jauge','remplissage','lol','redBlock');
            
            //CAMERA
            this.game.camera.bounds = null;
            this.game.camera.x = this.game.player.sprite.x;
            this.game.camera.speed = this.game.parameters.camera.speed.normal;
            
            //OBSTACLES/LEVEL
            this.game.obstacles = this.game.add.group();
            this.game.enemies = this.game.add.group();
            this.game.coins = this.game.add.group();
            this.game.redBlock = this.game.add.group();
            this.game.blockBreakable = this.game.add.group();
            this.game.doors = this.game.add.group();
            this.game.triggers = this.game.add.group();
            this.game.bullets = this.game.add.group();
            
            this.game.level = new ManagerPattern(this.game);
            //DONE
            console.log("CREATE RUN DONE");
        },
        //UPDATE
        update: function(){

            this.game.framer.update();
            this.game.framer.check();

            this.game.parallax.update();
            
            var direction = whatHappenedWithYourMouse(this.game);
            
            /********************************
                DEBUG SLASH
            ********************************/
            if(this.game.renderDebugA){
                this.game.renderDebugA.kill();
                this.game.renderDebugB.kill();
                this.game.renderDebugC.kill();
            }


            /*********************************
                PHYSIC
            *********************************/
            if(!this.game.player.dash){
                this.game.physics.collide(this.game.player.sprite, this.game.blockBreakable);
            }
            else{
            //collision avec les breakable
            this.game.physics.overlap(this.game.player.sprite, this.game.blockBreakable, function(player, blockBreakable){
                        blockBreakable.refThis.kill();
                });
            }
            this.game.physics.collide(this.game.player.sprite, this.game.obstacles);
            this.game.physics.collide(this.game.player.sprite, this.game.enemies,function(player,enemy){
                player.health -= 10;
            });
            this.game.physics.overlap(this.game.player.sprite, this.game.coins,function(player,coin){
                coin.refThis.addToScore();
            },null);
            this.game.physics.overlap(this.game.player.sprite, this.game.redBlock, function(player, redBlock){
                player.health -= 10;
            });
            this.game.physics.collide(this.game.player.sprite,this.game.doors);
            this.game.physics.overlap(this.game.player.sprite,this.game.triggers,function(player,trigger){
                if(!trigger.refThis.activated){
                    trigger.refThis.use();
                    player.body.velocity.x -= 3000;
                };
            });
            if(this.game.bullets.length > 0){
                this.game.physics.overlap(this.game.bullets, this.game.enemies,function(bullet,enemy){
                    enemy.refThis.addToScore();
                    bullet.kill();
                });
            }
            /*********************************
                UPDATE PLAYER
            *********************************/
            this.game.player.update(direction);
            
            if(this.game.player.sprite.inWorld){
                this.game.camera.x += this.game.camera.speed*this.game.speed;
            }
            if(!this.game.player.sprite.inWorld || this.game.player.sprite.health <= 0){
                this.game.hud.actionButton.fixedToCamera = false;
                this.game.state.start('death');
            }
            
            /***************************************
                DIFFICULTY
            ***************************************/
            if(this.game.framer.currentFrame > 6000){
                this.game.parameters.difficulty = 3;
            }
            else if(this.game.framer.currentFrame > 4000){
                this.game.parameters.difficulty = 2;
            }
            else if(this.game.framer.currentFrame > 2000){
                this.game.parameters.difficulty = 1;
            }
            

            /***************************************
                UPDATE LEVEL
            ***************************************/
            this.game.level.update();
            this.game.redBlock.forEach(function(redBlock,lol){
                redBlock.refThis.update();
            });


            /**************************************
                UPDATE MOUSE
            **************************************/
            this.game.input.mousePointer2.oldX = this.game.input.mousePointer2.pageX;
            this.game.input.mousePointer2.oldY = this.game.input.mousePointer2.pageY;

            this.game.hud.actionButton.bringToTop();
            //DONE
        },
    };


/*--------------------------------------------------------------------
      ( )_        ( )_                                           
  ___ | ,_)   _ _ | ,_)   __       ___ ___     __    ___   _   _ 
/',__)| |   /'_` )| |   /'__`\   /' _ ` _ `\ /'__`\/' _ `\( ) ( )
\__, \| |_ ( (_| || |_ (  ___/   | ( ) ( ) |(  ___/| ( ) || (_) |
(____/`\__)`\__,_)`\__)`\____)   (_) (_) (_)`\____)(_) (_)`\___/'
--------------------------------------------------------------------*/                                                                 
    var menu = {
        preload: function(){
            this.game.load.audio("ost",["assets/soundOST.mp3"]);
            this.game.load.image('cube','assets/Character.png');
            this.game.load.spritesheet('button','assets/Button.png',64,64);
            //DONE
            console.log("PRELOAD MENU DONE")
        },
        create: function(){
//--------------------------------A changer de positions--------------------------------------------------------------
            //Curseur custom permettant de récupérer des directions et tout les bails
            this.game.input.mousePointer2 = this.game.input.mousePointer;
            //Positions De la frame d'avant
            this.game.input.mousePointer2.oldX = this.game.input.mousePointer2.x;
            this.game.input.mousePointer2.oldY = this.game.input.mousePointer2.y;
            //L'écart entre les deux positions
            this.game.input.mousePointer2.deltaX = this.game.input.mousePointer2.oldX - this.game.input.mousePointer2.x;
            this.game.input.mousePointer2.deltaY = this.game.input.mousePointer2.oldY - this.game.input.mousePointer2.y;
            //L'écart nécéssaire pour considérer le curseur comme ayant changé de direction
            this.game.input.mousePointer2.MARGE_X = this.game.input.mousePointer2.MARGE_X || 3;
            this.game.input.mousePointer2.MARGE_Y = this.game.input.mousePointer2.MARGE_Y || 3;
//-----------------------------------------------------------------------------------------------------------------------
            //Le bouton qui lance le state run
            this.buttons = [
                this.game.add.button(200,100, 'button', switchToRun, this),
                this.game.add.button(200,200, 'button', switchToOptions, this),
            ];            
            for (var i = 0; i < this.buttons.length; i++) {
                this.buttons[i].x=this.game.width/2-this.buttons[i].width/2-i*-100
                this.buttons[i].anchor={x:0.5,y:0.5};
                this.buttons[i].scale={x:0,y:0};
                game.add.tween(this.buttons[i].scale).to({x:1,y:1}, 500, Phaser.Easing.Bounce.Out,true,500*i);
            };
            //DONE
            console.log("CREATE MENU DONE");
        },
        update: function(){
            
            //On récupère l'objet contenant les directions
            var direction = whatHappenedWithYourMouse(this.game);

            //On sauvegarde les positions !!!!A LA FIN!!!!! de update pour les considérer comme old
            this.game.input.mousePointer2.oldX = this.game.input.mousePointer2.pageX;
            this.game.input.mousePointer2.oldY = this.game.input.mousePointer2.pageY;
        }
    };
/*------------------------------------------------------------------
     ( )_        ( )_               ( )              ( )_ ( )    
  ___ | ,_)   _ _ | ,_)   __        _| |   __     _ _ | ,_)| |__  
/',__)| |   /'_` )| |   /'__`\    /'_` | /'__`\ /'_` )| |  |  _ `\
\__, \| |_ ( (_| || |_ (  ___/   ( (_| |(  ___/( (_| || |_ | | | |
(____/`\__)`\__,_)`\__)`\____)   `\__,_)`\____)`\__,_)`\__)(_) (_)
-------------------------------------------------------------------*/
    var death = {
        preload: function(){

        },
        create: function(){
            var title = game.add.text(0,0,"GAME OVER",{font:"60px Arial",fill:"#ffffff",align:"center"});
            
            var tryAgain = this.game.add.button(0,0,"button",function(){
                this.game.state.start("run");
            });

            var tryAgainText = this.game.add.text(0,0,"Try again",{font:"60px Arial",fill:"#ffffff",align:"center"});

            title.x = this.game.width*0.5 - (title.width*0.5);
            tryAgain.x = this.game.width * 0.5 - (tryAgain.width * 0.5);
            tryAgain.y = this.game.height * 0.75;

            tryAgainText.x = tryAgain.x+tryAgain.width + 20;
            tryAgainText.y = tryAgain.y;
        },
        update: function(){

        }
    };
/*--------------------------------------------------------------------------
      ( )_        ( )_                         ( )_  _                     
  ___ | ,_)   _ _ | ,_)   __        _    _ _   | ,_)(_)   _     ___    ___ 
/',__)| |   /'_` )| |   /'__`\    /'_`\ ( '_`\ | |  | | /'_`\ /' _ `\/',__)
\__, \| |_ ( (_| || |_ (  ___/   ( (_) )| (_) )| |_ | |( (_) )| ( ) |\__, \
(____/`\__)`\__,_)`\__)`\____)   `\___/'| ,__/'`\__)(_)`\___/'(_) (_)(____/
                                        | |                                
                                        (_) 
---------------------------------------------------------------------------*/    
    var options = {
        preload: function(){
            this.game.load.spritesheet('button','assets/Button.png',64,64);
        },
        create: function(){
            
            var that = this;

            this.game.hud = {
                title: new DisplayObject(this.game.width*0.5,0,"OPTIONS",{font:"60px Arial",fill:"#ffffff",align:"center"},"button",this.game),
                back: new DisplayObject(this.game.width*0.5,100,"BACK",{font:"60px Arial",fill:"#ffffff",align:"center"},"button",this.game,switchToMenu,this),
            };
            
            this.game.hud.title.display.x-=this.game.hud.title.display.width*0.5;

            var lessMARGE_X = game.add.button(0,0,"button",function(){
                that.game.input.mousePointer2.MARGE_X--;
                if(that.game.input.mousePointer2.MARGE_X < 1){
                    that.game.input.mousePointer2.MARGE_X = 1;
                }
                console.log(that.game.input.mousePointer2.MARGE_X)
            });
            var moreMARGE_X = game.add.button(0,0,"button",function(){
                that.game.input.mousePointer2.MARGE_X++;
                if(that.game.input.mousePointer2.MARGE_X > 10){
                    that.game.input.mousePointer2.MARGE_X = 10;
                }
                console.log(that.game.input.mousePointer2.MARGE_X)
            });

            lessMARGE_X.x = this.game.width*0.25 - (lessMARGE_X.width*0.5);
            moreMARGE_X.x = this.game.width*0.75 - (moreMARGE_X.width * 0.5);
            lessMARGE_X.y = this.game.height * 0.5;
            moreMARGE_X.y = this.game.height * 0.5;
        },
        update: function(){

        }
    };
                   
/*-----------------------------------------------------------
      ( )_        ( )_                 ( )                  
  ___ | ,_)   _ _ | ,_)   __       ___ | |__     _    _ _   
/',__)| |   /'_` )| |   /'__`\   /',__)|  _ `\ /'_`\ ( '_`\ 
\__, \| |_ ( (_| || |_ (  ___/   \__, \| | | |( (_) )| (_) )
(____/`\__)`\__,_)`\__)`\____)   (____/(_) (_)`\___/'| ,__/'
                                                     | |    
                                                     (_)
--------------------------------------------------------------*/    
    var shop = {
        preload: function(){
            
        },
        create: function(){
            
           
        },
        
        update: function(){

        }

    };

/*----------------------------------------------------------
                                          _       _         
                                         ( )_  _ (_ )       
  ___    _     ___ ___     __      _   _ | ,_)(_) | |   ___ 
/',__) /'_`\ /' _ ` _ `\ /'__`\   ( ) ( )| |  | | | | /',__)
\__, \( (_) )| ( ) ( ) |(  ___/   | (_) || |_ | | | | \__, \
(____/`\___/'(_) (_) (_)`\____)   `\___/'`\__)(_)(___)(____/
-------------------------------------------------------------*/
                                                            
    function whatHappenedWithYourMouse(game){
        //Si on appuie
        if(game.input.mousePointer2.isDown){
            
            //Calcul du delta mouse
            game.input.mousePointer2.deltaX = (game.input.mousePointer2.oldX - game.input.mousePointer2.pageX);
            game.input.mousePointer2.deltaY = (game.input.mousePointer2.oldY - game.input.mousePointer2.pageY);
            
            //Si on avait appuyé auparavant
            if(this.object){
                //attribue la direction
                direction(game,this.object);
                return this.object;
            }
            //Si on avait pas encore appuyé
            else{
                //On créé l'objet et on quitte
                this.object = {
                    direction:{
                        left:false,
                        up:false,
                        right:false,
                        down:false
                    },
                    x:game.input.mousePointer2.pageX,
                    y:game.input.mousePointer2.pageY,
                    worldX:game.input.mousePointer2.worldX,
                    worldY:game.input.mousePointer2.worldY,
                    width:0,
                    height:0
                };
                return;
            }
        }
        //Si on appuie pas
        else{
            //On détruit l'objet
            this.object = undefined;
            return undefined;
        }
    };
    function direction(game, object){
        //X
        if(game.input.mousePointer2.deltaX > game.input.mousePointer2.MARGE_X){
            object.direction.left = true;
            object.direction.right = false;
            object.width+=-game.input.mousePointer2.deltaX;
        }
        else if(game.input.mousePointer2.deltaX < -game.input.mousePointer2.MARGE_X){
            object.direction.right = true;
            object.direction.left = false;
            object.width+= -game.input.mousePointer2.deltaX;
        }
        else{
            object.direction.right = false;
            object.direction.left = false;
        }
        //Y
        if(game.input.mousePointer2.deltaY > game.input.mousePointer2.MARGE_Y){
            object.direction.up = true;
            object.direction.down = false;
            object.height+= -game.input.mousePointer2.deltaY;
        }
        else if(game.input.mousePointer2.deltaY < -game.input.mousePointer2.MARGE_Y){
            object.direction.down = true;
            object.direction.up = false;
            object.height+= -game.input.mousePointer2.deltaY
        }
        else{
            object.direction.up = false;
            object.direction.down = false;
        }
    };
    function switchToRun(){
        this.game.state.start('run');
    }
    function switchToPause(){
        this.game.state.start('pause');
    }
    function switchToMenu(){
        this.game.state.start('menu');
    }
    function switchToOptions(){
        this.game.state.start('options');
    }
    function readJson(parameters){
        for(var key in parameters){
            if(typeof parameters[key] === "object"){
                readJson(parameters[key]);
            }
            else if(typeof parameters[key] === "string"){
                if(parameters[key] == "true"){
                    parameters[key] = true;
                }
                else if(parameters[key] == "false"){
                    parameters[key] = false;
                }
                else{
                    var a = parseFloat(parameters[key]);
                    if(!isNaN(a) && a.toString().indexOf('.') != -1){
                        parameters[key] = a;
                    }
                    else{
                        var b = parseInt(parameters[key]);
                        if(!isNaN(b)){
                            parameters[key] = b;
                        }
                    }
                }
            }
        }
    };

    game.state.add("death", death);
    game.state.add('run', run);
    game.state.add('menu', menu);
    game.state.add('options', options);
    game.state.add('shop', shop);  
    game.state.start('menu');
    //DONE
};
//STATE RUN