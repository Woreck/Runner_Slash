function Stage(refGame,tileWidth,tileHeight){
        var that = this;
        this.parameters = {
                tiles:{
                        width:tileWidth,
                        height:tileHeight
                },
        };
        this.refGame = refGame;

        this.map = [];
        this.amountOfPatternCreated = 0;

        this.createPattern = function(_offsetX,_offsetY){
            refGame.add.text(_offsetX,_offsetY,"New PATTERN");
                var pattern = [];
                var holes = [];
                var obstacles = [];
                var enemies = [];
                var triggers = [];
                var doors = [];

                for(var y = 0; y < this.parameters.pattern.y; y++){
                        for(var x = 0; x < this.parameters.pattern.x; x++){
                                if(pattern[x+(y*this.parameters.pattern.x)] === undefined){
                                    var inAHole = false;
                                    var inATrigger = false;
                                    var inADoors = false;
                                    var inAnObstacle = false;
    
                                    var currentCase = {x:(x*this.parameters.tiles.width)+_offsetX, y:(y*this.parameters.tiles.height)+_offsetY,type:0,objectType:0};
    
                                    //ON EST DANS UN TROU ?
                                    for(var i = 0; i < holes.length; i++){
                                        if(x >= holes[i].x && x < holes[i].x+holes[i].width){
                                            inAHole = true;
                                        }
                                    }
                                    
                                    //ON EST DANS TRIGGERS ?
                                    for(var i = 0; i < triggers.length; i++){
                                        if(x == triggers[i].x && y == triggers[i].y+1){
                                            inATrigger = true;
                                        }
                                    }
    
                                    //ON EST DANS DOORS ?
                                    for(var i = 0; i < doors.length; i++){
                                        var distance = {x:Math.abs((doors[i].x*this.parameters.tiles.width)-currentCase.x), y:Math.abs((doors[i].y*this.parameters.tiles.height)-currentCase.y)}
                                        if(distance.x <= this.parameters.tiles.width*2){
                                            inADoors = true;
                                        }
                                    }

                                    //ON EST DANS UN OBSTACLE ?

                                    for(var i = 0; i < obstacles.length; i++){
                                        var distance = {x:Math.abs(obstacles[i].x-currentCase.x), y:Math.abs(obstacles[i].y-currentCase.y)};
                                        if(distance.x <= this.parameters.tiles.width * 2){
                                            inAnObstacle = true;
                                        }
                                    }
    
                                    //SI AU NIVEAU DU SOL
                                    if(currentCase.y > refGame.height * 0.75 && !inAHole && !inATrigger && !inADoors && !inAnObstacle){
                                        var rng = Math.random();
                                        //TROU
                                        if(rng > 1){
                                            //Ligne du dessus
                                            var yTop = y-1 >= 0 ? y-1 : 0;
                                            //Si la ligne du dessus est déjà un bloc (évite la formation de "pont")
                                            if(pattern[x+(yTop*this.parameters.pattern.x)].type == 1){
                                                currentCase.type = 1;
                                                currentCase.objectType = 1;
                                            }
                                            //Sinon on créé le trou
                                            else{
                                                holes.push({x:x,y:y,width:((Math.random()*4)+1)|0,height:this.parameters.pattern.y-y});
                                            }
                                        }
                                        //OBSTACLES
                                        else if(rng > 0.9){
                                            //La case actuelle devient un sol
                                            currentCase.type = 1;
                                            currentCase.objectType = 1;
    
                                            //Hauteur de l'obstacle (1->3 blocs)
                                            var height = ((Math.random()*3)+1)|0;
                                            for(var i = 0; i < height; i++){
                                                var yTop = y-(1+i) >= 0 ? y-(1+i) : 0;
                                                pattern[x+(yTop*this.parameters.pattern.x)].type = 1;
                                                pattern[x+(yTop*this.parameters.pattern.x)].objectType = 1;
                                            }
                                            obstacles.push({x:x,y:y,width:1,height:height,xPix:currentCase.x,yPix:currentCase.y});
                                        }
                                        else if(rng < 0.1 && doors.length < 1 && x-2 > 0 ){
                                            var id = (this.amountOfPatternCreated*10)+doors.length;
                                            console.log(id)
    
                                            currentCase.y = (this.parameters.pattern.y - 4)*this.parameters.tiles.height;
                                            currentCase.type = 5;
                                            currentCase.objectType = 1;
                                            currentCase.id = id;
    
                                            var trigger = {x:x-2, y:this.parameters.pattern.y-3};
                                            
                                            trigger.xPix = trigger.x * this.parameters.tiles.width;
                                            trigger.yPix = trigger.y * this.parameters.height;
    
                                            for(var i = this.parameters.pattern.y-5; i >= 0; i--){
                                                pattern[x+(i*this.parameters.pattern.x)].type = 1;
                                                pattern[x+(i*this.parameters.pattern.x)].objectType = 1;
                                            }
    
                                            pattern[trigger.x+(trigger.y*this.parameters.pattern.x)].type = 4;
                                            pattern[trigger.x+(trigger.y*this.parameters.pattern.x)].objectType = 1;
                                            pattern[trigger.x+(trigger.y*this.parameters.pattern.x)].callback = function(){
                                                refGame.doors.forEach(function(_door){
                                                    if(_door.refThis.idNumber == id){
                                                        _door.refThis.open = true;
                                                        _door.refThis.kill();
                                                    }
                                                });
                                            };
    
                                            triggers.push(trigger);
                                            doors.push({x:x,y:y-2});
                                        }
                                        //SOL
                                        else{
                                            currentCase.type = 1;
                                            currentCase.objectType = 1;
                                        }
                                    }
                                    else if(currentCase.y <= refGame.height * 0.75 && !inADoors){
                                        var rng = Math.random();
                                        if(rng > 1){
                                            currentCase.type = 3;
                                            currentCase.objectType = 1;
                                        }
                                    }
                                    else if(inATrigger && !inADoors){
                                        currentCase.type = 1;
                                        currentCase.objectType = 1;
                                    }
                                    pattern.push(currentCase);
                                }
                        }
                }
                this.translatePatternToSprite(pattern,_offsetX,this.parameters.pattern.xPix);
                this.amountOfPatternCreated++;
        };

        /*this.createPattern = function(){
            var pattern = [];
            var patternDifficulty= 0;

            var x = 0;
            var y = 0;
            
            var xPix = 0;
            var yPix = 0;
            
            var rng = Math.random();


            //INITIALISATION DU PATTERN
            for(var i = 0; i < this.parameters.pattern.x * this.parameters.pattern.y; i++){
                x = i%this.parameters.pattern.x;
                y = (i/this.parameters.pattern.x)|0;
                pattern[i] = {x:x,y:y,xPix:x*this.parameters.tiles.width,yPix:y*this.parameters.tiles.height,type:0,objectType:0};
            }

            //MISE EN PLACE DU SOL
            for(var i = 0; i < this.parameters.pattern.x * this.parameters.pattern.y; i++){
                x = i%this.parameters.pattern.x;
                y = (i/this.parameters.pattern.x)|0;
                xPix = x*this.parameters.tiles.width;
                yPix = y*this.parameters.tiles.height;

                if(yPix > refGame.height * 0.75){
                    pattern[i].type = 1;
                    pattern[i].objectType = 1;
                }
            }

            //MISE EN PLACE DES TROU
            if(rng < 0.1){
                
                var amountOfHoles = ((Math.random()*2)+1)|0;
                var holes = [];
                
                for(var i = 0; i < amountOfHoles; i++){    
                    hole = {x:((Math.random()*this.parameters.pattern.x))|0,width:((Math.random()*3)+1)|0};
                    holes.push(hole);
                    
                    for(var j = 0; j < hole.width; j++){

                    }
                }
            }

            //MISE EN PLACE DES OBSTACLES

            //MISE EN PLACE DES ENEMIES
        };*/

        this.destroyPattern = function(id){
                for(var i = 0; i < this.map[id].array.length; i++){
                        this.map[id].array[i].kill();
                }
                this.map.splice(id,1);
        };

        this.translatePatternToSprite = function(pattern,_offsetX,_endX){
                
                var patternArraySprite = {array:[],startX:_offsetX,endX:_endX};

                for(var i = 0; i < pattern.length; i++){
                        if(pattern[i] === undefined){
                                //VIDE
                                continue;
                        }
                        if(pattern[i].type === 1){
                            //SOL
                            var floor = new Block(pattern[i].x,pattern[i].y,refGame,pattern[i].objectType);
                            patternArraySprite.array.push(floor.sprite);
                        }
                        if(pattern[i].type === 2){
                            //PIECES
                            patternArraySprite.array.push(this.refGame.obstacles.create(pattern[i].x,pattern[i].y,"coins1"));
                        }
                        if(pattern[i].type === 3){
                            //ENNEMI
                            var enemy = new RedBlock(pattern[i].x,pattern[i].y,refGame,pattern[i].objectType);
                            patternArraySprite.array.push(enemy.sprite)
                        }
                        if(pattern[i].type === 4){
                            //TRIGGER
                            var trigger = new Trigger(pattern[i].x,pattern[i].y,refGame,pattern[i].callback);
                            patternArraySprite.array.push(trigger.sprite);
                        }
                        if(pattern[i].type === 5){
                            //DOOR
                            var door = new Door(pattern[i].x,pattern[i].y, refGame, pattern[i].id);
                            var floor = new Block(pattern[i].x,pattern[i].y+(2*this.parameters.tiles.height),refGame,pattern[i].objectType);
                            patternArraySprite.array.push(door.sprite);
                        }
                }
                this.map.push(patternArraySprite);
        };

        this.determinePatternSize = function(){
                var patternSize = {
                        x: 0,
                        y: 0,
                        xPix: 0,
                        yPix: 0
                };

                var done = false;

                for(var y = 0; y < refGame.height; y += this.parameters.tiles.height){
                        patternSize.y++;
                        patternSize.yPix += this.parameters.tiles.height;
                }

                for(var x = 0; x < refGame.width; x += this.parameters.tiles.width){
                        patternSize.x++;
                        patternSize.xPix += this.parameters.tiles.width;
                }

                return patternSize;
        };

        this.isInHoles = function(x,y,holes){

                for(var i = 0; i < holes.length; i++){
                        if(x >= holes[i].x && x <= holes[i].width && y >= holes[i].y && y <= holes[i].height){
                                return true;
                        }
                }

                return false;
        };

        this.createHoles = function(x,y,holes){
                 holes.push({
                        x:x,
                        y:y,
                        width:(((Math.random()*2)+1)|0)*this.parameters.tiles.width,
                        height:this.parameters.pattern.yPix-y
                });
        };

        this.parameters.pattern = this.determinePatternSize();

        this.update = function(){
                if(this.map[0].startX+this.map[0].endX < refGame.camera.x){
                        this.createPattern(this.map[1].startX+this.map[1].endX,0);
                        this.destroyPattern(0);
                }
        };
};