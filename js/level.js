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
                console.log("offsetX "+_offsetX)
                for(var y = 0; y < this.refGame.height; y += this.parameters.tiles.height){
                        for(var x = 0; x < this.refGame.width; x += this.parameters.tiles.width){
                                if(y > this.refGame.height*0.75){
                                        console.log(x+_offsetX,y+_offsetY)
                                        pattern.push({x:_offsetX+x,y:_offsetY+y,type:1,objectType:1});
                                        _endX = _endX < x + this.parameters.tiles.width ? x + this.parameters.tiles.width : _endX;
                                }
                        }
                }
                console.log("done create Pattern",pattern)
                this.translatePatternToSprite(pattern,_offsetX,_endX);
        };

        this.destroyPattern = function(id){
                for(var i = 0; i < this.map[id].length;i++){
                        this.map[id][i].kill();
                }
                this.map.splice(id,1);
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
                console.log("done translatePatternToSprite")
        };
        this.update = function(){
                if(this.map[0].startX+refGame.width <= refGame.camera.x){
                        this.createPattern(this.map[1].startX+this.map[1].endX,0);
                        this.destroyPattern(0);
                }
        };
};