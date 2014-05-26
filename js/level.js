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
                var _endX = 0;
                var holes = [];
                for(var y = 0; y < this.refGame.height; y += this.parameters.tiles.height){
                        for(var x = 0; x < this.refGame.width; x += this.parameters.tiles.width){
                                if(y > this.refGame.height*0.75){
                                        var rng = Math.random();
                                        if(rng < 0.1){
                                                var inAHole = false;
                                                var canBeAHole = true
                                                for(var i = 0; i < holes.length; i++){
                                                        if(x >= holes[i].x && x < holes[i].endX){
                                                                inAHole = true;
                                                        }
                                                }
                                                for(var i = 0; i < pattern.length; i++){
                                                        if(pattern[i].x == x+_offsetX){
                                                                canBeAHole = false;
                                                        }
                                                }
                                                if(inAHole || !canBeAHole){
                                                        continue;
                                                }
                                                //TROU INCOMING
                                                holes.push({x:x,y:y,endX:x+(((Math.random()*3)+1)|0)*this.parameters.tiles.width});
                                        }else{
                                                var inAHole = false;
                                                for(var i = 0; i < holes.length; i++){
                                                        if(x >= holes[i].x && x <= holes[i].endX){
                                                                inAHole = true;
                                                        }
                                                }
                                                if(inAHole){
                                                        continue;
                                                }
                                                pattern.push({x:_offsetX+x,y:_offsetY+y,type:1,objectType:1});
                                        }
                                }
                                _endX += x+this.parameters.tiles.width;
                        }
                }
                console.log("done create Pattern",pattern)
                this.translatePatternToSprite(pattern,_offsetX,_endX);
        };

        this.destroyPattern = function(id){
                for(var i = 0; i < this.map[id].array.length; i++){
                        this.map[id].array[i].kill();
                }
                this.map.splice(id,1);
                console.log(refGame.obstacles.length);
        };

        this.translatePatternToSprite = function(pattern,_offsetX,_endX){
                var patternArraySprite = {array:[],startX:_offsetX,endX:_endX};
                for(var i = 0; i < pattern.length; i++){
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

        this.update = function(){
                if(this.map[0].startX+this.map[0].endX < refGame.camera.x){
                        this.createPattern(this.map[1].startX+this.map[1].endX,0);
                        this.destroyPattern(0);
                }
        };
};