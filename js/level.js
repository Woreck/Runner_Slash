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

        this.createPattern = function(_offsetX,_offsetY){
                var pattern = [];
                var holes = [];
                var obstacles = [];
                var enemies = [];
                var triggers = [];
                var doors = [];

                for(var y = 0; y < this.parameters.pattern.y; y++){
                        for(var x = 0; x < this.parameters.pattern.x; x++){

                                var xPix = (x * this.parameters.tiles.width) + _offsetX;
                                var yPix = (y * this.parameters.tiles.height) + _offsetY;
                                var inAHole = false;

                                //ON EST DANS UN TROU ?
                                for(var i = 0; i < holes.length; i++){
                                    if(x >= holes[i].x && x < holes[i].x+holes[i].width){
                                        inAHole = true;
                                    }
                                }

                                //SI CASE N'EXISTE PAS
                                if(pattern[x+(y*this.parameters.pattern.x)] === undefined){
                                    var currentCase = {x:xPix,y:yPix,type:0,objectType:0};
                                }

                                //SI AU NIVEAU DU SOL
                                if(currentCase.y > refGame.height * 0.75 && !inAHole){
                                    
                                    var rng = Math.random();
                                    //TROU
                                    if(rng < 0.1){
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
                                    else if(rng < 0.2){
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
                                    else if(rng < 0.25 && doors.length < 1 && x-2 > 0 ){
                                        var id = doors.length;

                                        currentCase.y = (this.parameters.pattern.y - 4)*this.parameters.tiles.height;
                                        currentCase.type = 5;
                                        currentCase.objectType = 1;
                                        currentCase.id = id;

                                        var trigger = {x:x-2, y:this.parameters.pattern.y-2};
                                        
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
                                                if(_door.id == id){
                                                    _door.open = true;
                                                    _door.kill();
                                                }
                                            });
                                        };

                                    }
                                    //SOL
                                    else{
                                        currentCase.type = 1;
                                        currentCase.objectType = 1;
                                    }
                                }
                                else if(currentCase.y <= refGame.height * 0.75){
                                    var rng = Math.random();
                                    if(rng < 0.01){
                                        currentCase.type = 3;
                                        currentCase.objectType = 1;
                                    }
                                }
                                pattern.push(currentCase);
                        }
                }
                this.translatePatternToSprite(pattern,_offsetX,this.parameters.pattern.xPix);
        };

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