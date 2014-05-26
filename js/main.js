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
            this.game.hud = new Hud(this.game);
            
            //CAMERA
            this.game.camera.bounds = null;
            this.game.camera.x = this.game.player.sprite.x;
            this.game.camera.speed = this.game.parameters.camera.speed.normal;
            
            //OBSTACLES/LEVEL
            this.game.obstacles = this.game.add.group();
            this.game.enemies = this.game.add.group();
            this.game.coins = this.game.add.group();
            
            //DONE
            console.log("CREATE RUN DONE");
        },
        //UPDATE
        update: function(){

            this.game.framer.update();
            this.game.framer.check();

            this.game.parallax.update();
            this.game.hud.update();
            
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
            this.game.physics.collide(this.game.player.sprite, this.game.obstacles);
            this.game.physics.collide(this.game.player.sprite, this.game.enemies,function(player,enemy){
                player.health -= 10;
            });
            this.game.physics.overlap(this.game.player.sprite, this.game.coins,function(player,coin){
                coin.refThis.addToScore();
            },null);


            /*********************************
                UPDATE PLAYER
            *********************************/
            this.game.player.update(direction);
            
            if(this.game.player.sprite.inWorld){
                this.game.camera.x += this.game.camera.speed*this.game.speed;
            }
            if(!this.game.player.sprite.inWorld || this.game.player.sprite.health <= 0){
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
            


            /**************************************
                UPDATE MOUSE
            **************************************/
            this.game.input.mousePointer2.oldX = this.game.input.mousePointer2.pageX;
            this.game.input.mousePointer2.oldY = this.game.input.mousePointer2.pageY;

            //DONE
        },
    };



    /*************************************************************
        STATE MENU
    *************************************************************/
    var menu = {
        preload: function(){
            this.game.load.audio("ost",["assets/soundOST.mp3"]);
            this.game.load.image('cube','assets/Character.png');
            this.game.load.spritesheet('button','assets/Button.png',64,64);
            //DONE
            console.log("PRELOAD MENU DONE")
        },
        create: function(){
            
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


            //Le bouton qui lance le state run
            this.game.menu = [
                this.game.add.button(100,100, 'button', switchToRun, this),
                this.game.add.button(100,200, 'button', switchToOptions, this),
            ];
            

            //Le text "run"
            this.game.hud = {button1:{text:'RUN',style:{font:'60px Arial',fill:'#ffffff',align:'center'}}};
            this.game.hud.display = this.game.add.text(this.game.menu[0].x + 96,this.game.menu[0].y,this.game.hud.button1.text,this.game.hud.button1.style);
            
            this.game.hud = {button1:{text:'OPTIONS',style:{font:'60px Arial',fill:'#ffffff',align:'center'}}};
            this.game.hud.display = this.game.add.text(this.game.menu[1].x + 96,this.game.menu[1].y,this.game.hud.button1.text,this.game.hud.button1.style);
            
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

    //STATE DEATH
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



    //STATE OPTIONS
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
    /***************************************************
        SOME UTILS
    ***************************************************/
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
    game.state.start('menu');
    //DONE
};
//STATE RUN