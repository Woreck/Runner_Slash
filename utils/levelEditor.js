window.addEventListener("load", function(){
	var levelEditor = new LevelEditor("levelEditorCanvasView",64*13,64*10);
	window.addEventListener("click", function(eventData){
		console.log(eventData)
		levelEditor.emit("click mouse", eventData);
	});
});



function LevelEditor( idCanvas, width, height){
	

	addEventCapabilities(this);

	this.canvas = document.getElementById(idCanvas);
	this.canvas.width = width || 64*13;
	this.canvas.height = height || 64*10;
	
	this.context = this.canvas.getContext("2d");

	this.map = new Map( this, this.canvas.width, this.canvas.height );

	this.buttons = {};

	this.currentTile = null;


	this.addDomElement = function( id, type, params ){
		
		var element = document.createElement(type);
		
		element.innerHTML = params.name;

		element.onclick = params.onclick;

		document.body.appendChild(element);
		
		return element;
	};

	this.exportDomElement = this.addDomElement( "exportingArea", "textarea", {onclick:function(){
			//Do Nothing
		},
		name: ""
	});

	/************************************
		EVENTS SUBSCRIBING
	************************************/
	var that = this;

	this.on( "click mouse", function(eventData){
		if(eventData.target.id == "levelEditorCanvasView"){
			var mouse = {
				clickCase:{
					x: (eventData.offsetX/64)|0,
					y: (eventData.offsetY/64)|0
				},
				tile: that.currentTile
			};
			that.emit("remplace tile", mouse);
		}
	});

	this.buttons.tileBlock = this.addDomElement( "tileBlockChooser", "button", {onclick:function(){
			that.currentTile = 1;
		},
		name:"Bloc"
	});

	this.buttons.tileEnemy = this.addDomElement( "tileEnemyChooser", "button", {onclick:function(){
			that.currentTile = 2;
		},
		name:"Ennemi"
	});

	this.buttons.tileCoin = this.addDomElement( "tileCoinChooser", "button", {onclick:function(){
			that.currentTile = 3;
		},
		name:"Pièce"
	});

	this.buttons.tileEmpty = this.addDomElement( "tileEraseChooser", "button", {onclick:function(){
			that.currentTile = 0;
		},
		name:"Gomme"
	});

	this.buttons.changeDifficulty1 = this.addDomElement( "Difficulty1Chooser", "button", {onclick:function(){
			that.map.changeDifficulty(0);
		},
		name:"difficulty 0"
	});

	this.buttons.changeDifficulty1 = this.addDomElement( "Difficulty1Chooser", "button", {onclick:function(){
			that.map.changeDifficulty(1);
		},
		name:"difficulty 1"
	});

	this.buttons.changeDifficulty2 = this.addDomElement( "Difficulty1Chooser", "button", {onclick:function(){
			that.map.changeDifficulty(2);
		},
		name:"difficulty 2"
	});

	this.buttons.exportDomSubmit = this.addDomElement( "exportToDataBase", "button", {onclick:function(){
			var html = that.map.exportToDataBase()
			that.exportDomElement.innerHTML = html;
		},
		name:"Export"
	});

};


function Map( refLE, width, height ){

	this.refLE = refLE;


	this.sprites = {
		background: new Image(),
		bloc: new Image(),
		enemy: new Image(),
		coin: new Image()
	};

	this.sprites.background.src = "../assets/sky.png";
	this.sprites.bloc.src = "../assets/Bloc.png";
	this.sprites.enemy.src = "../assets/Character.png";
	this.sprites.coin.src = "../assets/coinGold.png";


	this.width = width || 800;
	this.height = height || 600;

	this.tiles = {
		width: 64,
		height: 64
	};

	this.type = "holes";


	this.difficulty = 0;

	this.array = [
		[0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,1,1,1,0,0,0,0,0,0],
		[0,0,0,0,0,0,1,0,0,0,0,0,0],
		[0,0,0,0,0,0,2,0,0,0,0,0,0],
		[0,0,0,0,0,0,3,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0]
	];

	this.drawMap = function(context){
		context.clearRect(0,0,64*13,64*10);

		context.drawImage(this.sprites.background,0,0,this.sprites.background.width,this.sprites.background.height,0,0,64*13,64*10);
		
		for(var indexY = 0; indexY < this.array.length; indexY++){
			for(var indexX = 0; indexX < this.array[indexY].length; indexX++){
				
				var x = indexX * 64;
				var y = indexY * 64;
				
				if(this.array[indexY][indexX] === 0){
					continue;
				}
				//BLOCKS
				else if(this.array[indexY][indexX] === 1){
					console.log(context)
					context.drawImage(this.sprites.bloc,0,0,this.sprites.bloc.width,this.sprites.bloc.height,x,y,64,64);
				}
				//ENEMIES
				else if(this.array[indexY][indexX] === 2){
					context.drawImage(this.sprites.enemy,0,0,this.sprites.enemy.width,this.sprites.enemy.height,x,y,64,64);
				}
				//COINS
				else if (this.array[indexY][indexX] === 3){
					context.drawImage(this.sprites.coin,0,0,this.sprites.coin.width,this.sprites.coin.height,x,y,64,64);
				}
			}
		}

		context.fillStyle = "red";
		context.fillRect(800,0,3,600);
		context.fillRect(0,600,800,3);
	};

	this.addTile = function(mouse,tile){
		this.array[mouse.clickCase.y][mouse.clickCase.x] = tile;
	};

	this.deleteTile = function(mouse){
		this.array[mouse.clickCase.y][mouse.clickCase.x] = 0;
	};

	this.changeType = function(type){
		this.type = type;
	};

	this.changeDifficulty = function(difficulty){
		this.difficulty = difficulty;
	};

	this.exportToDataBase = function(){
		var array = [];
		var text = "new Pattern(";
		
		for(var y = 0; y < this.array.length; y++){
			for(var x = 0; x < this.array[y].length; x++){
				array.push(this.array[y][x]);
			}
		}

		for(var i=0; i < this.array.length; i++){
			text += "["+this.array[i]+"],";
		}

		text += 'WIDTH,HEIGHT,TILEWIDTH,TILEHEIGHT,"'+this.type+'",'+this.difficulty+',game),'

		return text;

	};

	/****************************
		EVENTS SUBSCRIBING
	****************************/
	var that = this;

	this.refLE.on( "map changed", function(){
		that.drawMap(that.refLE.context);
	});

	this.refLE.on( "remplace tile", function(mouse){
		that.addTile(mouse,mouse.tile);
		that.refLE.emit( "map changed");
	});
};


function addEventCapabilities(object){
	
	object.listOfEvents = {};

	object.on = function(eventName, callback){
		
		if(!this.listOfEvents[eventName]){
			this.listOfEvents[eventName] = [];
		}

		this.listOfEvents[eventName].push(callback);

	};

	object.emit = function(eventName, object){
		
		if(this.listOfEvents[eventName]){
			for(var i = 0; i < this.listOfEvents[eventName].length; i++){
				this.listOfEvents[eventName][i](object);
			}
		}
		else{
			console.warn("Pas d'écouteurs sur "+eventName+".");
		}

	};

};