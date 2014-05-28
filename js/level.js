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

                for(var y = 0; y < this.parameters.pattern.y; y++){
                        for(var x = 0; x < this.parameters.pattern.x; x++){
                                var xPix = (x * this.parameters.tiles.width) + _offsetX;
                                var yPix = (y * this.parameters.tiles.height) + _offsetY;
                                var inAHole = false;
                                for(var i = 0; i < holes.length; i++){
                                    if(x >= holes[i].x && x < holes[i].x+holes[i].width){
                                        inAHole = true;
                                    }
                                }
                                var currentCase = {x:xPix,y:yPix,type:0,objectType:0};

                                if(currentCase.y > refGame.height * 0.75 && !inAHole){
                                    
                                    var rng = Math.random();
                                    //TROU
                                    if(rng < 0.1){
                                        //Ligne du dessus
                                        var yTop = y-1 >= 0 ? y-1 : 0;
                                        if(pattern[x+(yTop*this.parameters.pattern.x)].type == 1){
                                            currentCase.type = 1;
                                            currentCase.objectType = 1;
                                        }
                                        else{
                                            holes.push({x:x,y:y,width:((Math.random()*8)+1)|0,height:this.parameters.pattern.y-y});
                                        }
                                    }
                                    //OBSTACLES
                                    else if(rng < 0.2){
                                        //La case actuelle devient un sol
                                        currentCase.type = 1;
                                        currentCase.objectType = 1;

                                        //La case du dessus devient l'obstacle
                                        var height = ((Math.random()*3)+1)|0;
                                        for(var i = 0; i < height; i++){
                                            var yTop = y-(1+i) >= 0 ? y-(1+i) : 0;
                                            pattern[x+(yTop*this.parameters.pattern.x)].type = 1;
                                            pattern[x+(yTop*this.parameters.pattern.x)].objectType = 1;
                                        }
                                    }
                                    //SOL
                                    else{
                                        currentCase.type = 1;
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
                                continue;
                        }
                        if(pattern[i].type === 1){
                                var object = new Block(pattern[i].x,pattern[i].y,refGame,pattern[i].objectType);
                                patternArraySprite.array.push(object.sprite);
                        }
                        if(pattern[i].type === 2){
                                patternArraySprite.array.push(this.refGame.obstacles.create(pattern[i].x,pattern[i].y,"coins1"));
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