/***********************************************
    PATTERN
***********************************************/
function Pattern(map,width,height,tileWidth,tileHeight,type,scoreNeeded,game,available){
    this.map = {
        array:map,                    //Tableau Numérique
        spriteArray:[],               //Tableau de sprite
        width:width,                  //Longueur de ligne
        height:height,                //Longueur de colonne
        widthPx:tileWidth*width,      //Largeur en pixel du pattern
        heightPx:tileHeight*height,   //Hauteur en pixel du pattern
        tileWidth:tileWidth,          //Largeur d'un tile en pixel
        tileHeight:tileHeight         //Hauteur d'un tile en pixel
    };
    this.type = type;                     //Type de pattern ( enemies, holes, walls)
    this.scoreNeeded = scoreNeeded;         //Difficulté estimée du pattern
    this.available = available || false;  //Disponibibilité
    this.refGame = game;                  //Référence à game
    this.x = null;                        //Le worldX du pattern
    this.y = null;                        //Le worldY du pattern
};
Pattern.prototype.constructor = Pattern;
//Traduit le tableau numérique en tableau de sprite Phaser, dans this.spriteArray
Pattern.prototype.translateToSprite = function(_offsetX,_offsetY){
    var offsetX = _offsetX || this.refGame.level.patterns[0].x + this.refGame.level.patterns[0].widthPx;
    var offsetY = _offsetY || 0;

    var triggerId = (_offsetX)|0;
    
    //Attribution des coordonées du groupe
    this.x = offsetX;
    this.y = offsetY;
    
    //Début de l'interprétation du tableau numérique en tableau de sprite
    for(var i = 0; i < this.map.array.length; i++){
        //Récupération des coordonées X/Y de chaque case du tableau
        var x = i%this.map.width;
        var y = (i/this.map.width)|0;

        if ( this.map.array[i] === 1 ) {
            //BLOCK
            this.map.spriteArray.push(new Block(this.x+x*this.map.tileWidth,this.y+y*this.map.tileHeight,this.refGame,"1"));
            this.map.spriteArray[this.map.spriteArray.length-1].sprite.body.immovable = true;
        }
        else if ( this.map.array[i] === 2 ) {
            //ENEMIES
            this.map.spriteArray.push(new Enemies(this.x+x*this.map.tileWidth,this.y+y*this.map.tileHeight,this.refGame,"1"));
            this.map.spriteArray[this.map.spriteArray.length-1].sprite.body.immovable = true;
        }
        else if( this.map.array[i] === 3 ) {
            //COINS
            this.map.spriteArray.push(new Coins(this.x+x*this.map.tileWidth,this.y+y*this.map.tileHeight,this.refGame,'1'));
            this.map.spriteArray[this.map.spriteArray.length-1].sprite.body.immovable = true;
        }
        else if ( this.map.array[i] === 4 ) {
            //BREAKABLE BLOCK
            this.map.spriteArray.push(new BlockBreakable(this.x+x*this.map.tileWidth,this.y+y*this.map.tileHeight,this.refGame,'1'));
            this.map.spriteArray[this.map.spriteArray.length-1].sprite.body.immovable = true;
        }
        else if ( this.map.array[i] === 5 ) {
            //DOORS
            this.map.spriteArray.push(new Door(this.x+x*this.map.tileWidth,this.y+y*this.map.tileHeight,triggerId,this.refGame,'1'));
            this.map.spriteArray[this.map.spriteArray.length-1].sprite.body.immovable = true;
        }
        else if ( this.map.array[i] === 6 ) {
            //TRIGGERS
            this.map.spriteArray.push(new Trigger(this.x+x*this.map.tileWidth,this.y+y*this.map.tileHeight,triggerId,this.refGame,'1'));
            this.map.spriteArray[this.map.spriteArray.length-1].sprite.body.immovable = true;
        }

    }
}
//Retourne la map au format numérique
Pattern.prototype.getMap = function(){
    return this.map;
};
//Retourne le type du pattern
Pattern.prototype.getType = function(){
    return this.type;
};
//Retourne la difficulté du pattern
Pattern.prototype.getDifficulty = function(){
    return this.difficulty;
};
//Supprime les sprites du pattern pour libérer la mémoire, retourne true si aucun problème
Pattern.prototype.kill = function(){
    for(var i = 0; i < this.map.spriteArray.length; i++){
        this.map.spriteArray[i].kill();
    }
    return true;
};
/*************************************
    MANAGER
*************************************/
function ManagerPattern(game){
    this.refGame = game;                                                           //Référence au game
    this.dataBase = new DataBase(game);                                            //Base de donnée des patterns
    this.patterns = [];                                                            //Patterns actuellement dans le monde
    this.addPattern(this.dataBase.clone(this.dataBase.base.walls[0]),1000);        //Ajout de pattern à this.patterns
    this.addPattern(this.dataBase.clone(this.dataBase.base.walls[0]));        //Identique
    this.addPattern(this.dataBase.clone(this.dataBase.base.walls[0]));        //Identique
}
ManagerPattern.prototype.constructor = ManagerPattern;
//Fonction principal, à répéter à chaque frame (ex: dans une RAF )
ManagerPattern.prototype.update = function(){
    this.checkIsDone();
}
ManagerPattern.prototype.chooseNextPattern = function(){
    var random = Math.random();
        //On choisit au hasard un type de pattern
    if(random < 0.33){
        //WALLS
                //list récupère l'ensemble des patterns disponible correspondant à la difficulté, dans la section walls
        var list = this.dataBase.getByScore('walls',this.refGame.player.distanceParcourue);
                //choose s'occupe de cloner un des patterns contenu dans la liste
        var choose = this.dataBase.clone(list[(Math.random()*list.length)|0]);
                //On ajoute le pattern à la liste des patterns du monde
        this.addPattern(choose,this.patterns[this.patterns.length-1].x+this.patterns[this.patterns.length-1].map.widthPx);
    }
    else if( random < 0.66){
        //HOLES
                //list récupère l'ensemble des patterns disponible correspondant à la difficulté, dans la section holes
        var list = this.dataBase.getByScore('holes',this.refGame.player.distanceParcourue);
                //choose s'occupe de cloner un des patterns contenu dans la liste
        var choose = this.dataBase.clone(list[(Math.random()*list.length)|0]);
                //On ajoute le pattern à la liste des patterns du monde
        this.addPattern(choose,this.patterns[this.patterns.length-1].x+this.patterns[this.patterns.length-1].map.widthPx);
    }
    else{
        //ENEMIES
                //list récupère l'ensemble des patterns disponible correspondant à la difficulté, dans la section enemies
        var list = this.dataBase.getByScore('enemies',this.refGame.player.distanceParcourue);
                //choose s'occupe de cloner un des patterns contenu dans la liste
        var choose = this.dataBase.clone(list[(Math.random()*list.length)|0]);
                //On ajoute le pattern à la liste des patterns du monde
        this.addPattern(choose,this.patterns[this.patterns.length-1].x+this.patterns[this.patterns.length-1].map.widthPx);
    }
}
ManagerPattern.prototype.checkIsDone = function(){
        //Si le plus ancien pattern est dépassé par la caméra
    if(this.patterns[0].x+this.patterns[0].map.widthPx<=this.refGame.camera.x){
                //On détruit les sprites qu'il contient
        this.patterns[0].kill();
                //On le retire de la liste des patterns du monde
        this.patterns.shift();
                //On choisit un nouveau pattern
                this.chooseNextPattern();
    }
}
ManagerPattern.prototype.addPattern = function(pattern, offset){
    var _offset = offset || this.patterns[this.patterns.length-1].x+this.patterns[this.patterns.length-1].map.widthPx;
    this.patterns.push(pattern);
    this.patterns[this.patterns.length-1].translateToSprite(_offset)
}
/************************************************
    DATABASE
************************************************/
function DataBase(game){
    var WIDTH = 13; 
    var HEIGHT = 10;
    var TILEWIDTH = 64;
    var TILEHEIGHT = 64;
    this.refGame = game;
    this.base = {
        /********************************************
        *                                           *   // ici ca sera mieux de les classer par difficulté
        *               HOLES                       *       
        *                                           *
        ********************************************/
        holes: [
        new Pattern(    [0,0,0,0,0,1,0,0,0,0,0,0,0,
                        0,0,0,0,0,1,0,0,0,0,0,0,0,
                        0,0,0,0,0,1,0,0,0,0,0,0,0,
                        0,0,0,0,0,1,0,0,0,0,0,0,0,
                        0,0,0,0,0,1,0,0,0,0,0,0,0,
                        0,0,0,0,0,4,0,0,0,0,0,0,0,
                        0,0,0,0,0,4,0,0,0,0,0,0,0,
                        0,0,1,1,1,1,0,0,0,0,0,0,0,
                        1,1,1,1,1,1,0,0,0,1,1,1,1,
                        1,1,1,1,1,1,0,0,0,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"holes",0,game,true),
        new Pattern(    [0,0,0,0,0,0,0,1,0,0,0,0,0,
                        0,0,0,0,0,0,0,1,0,0,0,0,0,
                        0,0,0,0,0,0,0,1,0,0,0,0,0,
                        0,0,0,0,0,0,0,1,0,0,0,0,0,
                        0,0,0,0,0,0,0,1,0,0,0,0,0,
                        0,0,0,0,0,0,0,1,0,0,0,0,0,
                        0,0,0,0,0,0,0,5,0,0,0,0,0,
                        0,0,0,6,0,0,0,5,0,0,0,0,0,
                        1,1,1,1,0,0,1,1,1,0,0,1,1,
                        1,1,1,1,0,0,1,1,1,0,0,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"holes",0,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,1,0,0,0,0,0,0,0,
                        0,0,1,0,0,1,0,0,0,0,0,0,0,
                        1,1,1,1,1,0,0,0,0,1,1,1,1,
                        1,1,1,1,1,0,0,0,0,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"holes",100,game,true),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,1,1,0,0,0,0,0,
                        1,1,1,0,0,0,0,0,0,0,0,1,1,
                        1,1,1,0,0,0,0,0,0,0,0,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"holes",100,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        1,1,0,0,0,0,1,0,0,0,0,0,1,
                        1,1,0,0,0,0,0,0,0,0,0,0,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"holes",200,game,true),
        new Pattern([   0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,1,1,1,1,1,0,0,0,
                        0,0,0,0,0,1,1,0,1,1,0,0,0,
                        0,0,0,0,0,1,1,0,1,1,0,0,0,
                        0,0,0,0,0,1,1,0,1,1,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        1,1,0,0,1,0,0,1,0,0,1,0,1,
                        1,1,0,0,0,0,0,0,0,0,0,0,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"holes",200,game),
        ],
        /********************************************
        *                                           *
        *               WALLS                       *       
        *                                           *
        ********************************************/
        walls: [
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,3,3,3,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"walls",0,game,true),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,1,0,0,1,0,0,1,0,0,1,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"walls",0,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,1,0,0,0,0,0,0,
                        0,0,0,0,0,0,1,0,0,0,0,0,0,
                        0,0,0,1,1,1,1,0,0,0,0,0,0,
                        0,0,0,1,1,1,1,0,0,0,0,0,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"walls",0,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,1,1,0,0,0,0,0,0,0,0,
                        0,0,0,1,1,0,0,0,1,0,0,0,0,
                        0,0,0,1,1,0,0,0,1,0,0,0,0,
                        1,1,1,1,1,0,0,1,1,1,1,1,1,
                        1,1,1,1,1,0,0,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"walls",100,game,true),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,1,1,1,1,1,1,1,1,1,
                        0,0,0,0,1,0,0,0,1,0,0,0,1,
                        0,0,0,0,1,0,0,0,1,0,0,0,1,
                        0,0,0,0,1,0,0,0,1,0,0,0,1,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,1,0,0,0,1,0,0,0,1,0,0,
                        0,0,1,0,0,0,1,0,0,0,1,0,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"walls",100,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,1,1,1,1,1,1,1,1,0,
                        0,0,0,0,1,1,1,1,1,1,1,1,0,
                        0,0,0,0,1,1,1,1,1,1,1,1,0,
                        0,0,0,0,0,0,0,0,0,1,0,0,0,
                        0,0,0,0,0,1,0,1,0,0,0,1,0,
                        0,0,0,0,1,1,1,1,1,1,1,1,0,
                        0,0,0,0,1,1,1,1,1,1,1,1,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"walls",200,game,true),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"walls",200,game),
        ],
        /********************************************
        *                                           *
        *               ENEMIES                     *       
        *                                           *
        ********************************************/
        enemies: [
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,1,0,0,0,2,0,0,0,2,0,0,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"enemies1",0,game,true),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,2,2,0,0,0,0,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"enemies1",0,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,2,0,0,0,0,0,0,0,
                        0,0,0,1,1,1,0,0,0,0,0,0,0,
                        0,0,1,1,1,1,0,0,0,0,0,0,2,
                        1,1,1,1,1,1,0,0,0,1,1,1,1,
                        1,1,1,1,1,1,0,0,0,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"enemies1",100,game,true),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,2,0,0,0,0,
                        0,0,0,0,0,0,0,0,2,0,0,0,0,
                        1,1,1,1,1,1,0,0,1,1,1,1,1,
                        1,1,1,1,1,1,0,0,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"enemies1",100,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,1,0,0,0,0,0,0,0,
                        0,0,1,0,0,1,0,0,0,0,0,0,0,
                        1,1,1,1,1,1,0,0,0,1,1,1,1,
                        1,1,1,1,1,1,0,0,0,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"enemies1",200,game,true),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,2,0,0,2,0,0,0,0,
                        1,1,1,1,1,1,0,0,1,1,1,1,1,
                        1,1,1,1,1,1,0,0,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"enemies1",200,game),
        new Pattern(    [0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,0,0,0,0,0,0,0,
                        0,0,0,0,0,0,2,2,0,0,0,0,0,
                        0,0,0,1,1,1,1,1,1,1,0,0,0,
                        0,0,0,4,0,0,0,0,0,2,0,0,0,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,],WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"enemies1",200,game),
        /********************************************
        *                                           *
        *               ALL                         *       
        *                                           *
        ********************************************/
        ],
    }
    console.log("DATABASE CREATED");
}
DataBase.prototype.constructor = DataBase;
DataBase.prototype.getByScore = function(type,scoreNeeded){
    var object = [];
    for(var i= 0; i < this.base[type].length; i++){
        if(this.base[type][i].scoreNeeded <= scoreNeeded){
            object.push(this.base[type][i]);
        }
    }
    if(object.length > 0){
        return object;
    }
    else{
        return null;
    }
}
//Les parametres sont optionnels
//De base l'intégralité des patterns n'est pas available
DataBase.prototype.getByAvailability = function(type,difficulty){
    var _type = type || null;
    var _difficulty = difficulty;
    var object = {};

    for(var prop in this.base){
        if(!_type){
            if(!_difficulty){
                object[prop] = [];
                for(var i = 0; i < this.base[prop].length; i++){
                    object[prop].push(this.base[prop][i]);
                }
            }
            else{
                object[prop] = [];
                for(var i = 0; i < this.base[prop].length; i++){
                    if(this.base[prop][i].available && this.base[prop][i].difficulty == _difficulty){
                        object[prop].push(this.base[prop][i]);
                    }
                }
            }
        }
        else{
            if(!_difficulty){
                if(_type == prop){
                    object[prop] = [];
                    for(var i = 0; i < this.base[prop].length; i++){
                        if(this.base[prop][i].available){
                            object[prop].push(this.base[prop][i]);
                        }
                    }
                }
            }
            else{
                if(_type == prop){
                    object[prop] = [];
                    for(var i = 0; i < this.base[prop].length; i++){
                        if(this.base[prop][i].available && this.base[prop][i].difficulty == _difficulty){
                            object[prop].push(this.base[prop][i]);
                        }
                    }
                }
            }
        }
    }
    if(object){
        return object;
    }
    else{
        return null;
    }
}
//CLONE UN PATTERN
DataBase.prototype.clone = function(obj){
        var temp = new Pattern();
        temp.map.array = arrayClone(obj.map.array);
        temp.map.spriteArray = arrayClone(obj.map.spriteArray);
        temp.map.width = obj.map.width;
        temp.map.height = obj.map.height;
        temp.map.widthPx = obj.map.widthPx;
        temp.map.heightPx = obj.map.heightPx;
        temp.map.tileWidth = obj.map.tileWidth;
        temp.map.tileHeight = obj.map.tileHeight;
        temp.type = obj.type;
        temp.difficulty = obj.difficulty;
        temp.available = obj.available;
        temp.refGame = obj.refGame;
        temp.x = obj.x;
        temp.y = obj.y;
        temp.translateToSprite = obj.translateToSprite;
        temp.kill = obj.kill;
        return temp;
}
//Affiche le pattern dans la console
DataBase.prototype.debug = function(type,index){
    for(var y = 0; y < 10; y++){
        console.log(this.base[type][index].map.array[y*13+0],this.base[type][index].map.array[y*13+1],this.base[type][index].map.array[y*13+2],this.base[type][index].map.array[y*13+3],this.base[type][index].map.array[y*13+4],this.base[type][index].map.array[y*13+5],this.base[type][index].map.array[y*13+6],this.base[type][index].map.array[y*13+7],this.base[type][index].map.array[y*13+8],this.base[type][index].map.array[y*13+9],this.base[type][index].map.array[y*13+10],this.base[type][index].map.array[y*13+11],this.base[type][index].map.array[y*13+12],y)
    }
}
function arrayClone(_array){
        return _array.slice();
}