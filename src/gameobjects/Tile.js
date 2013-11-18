/**
 * Tiles in the world have an image associated to them, and also have a type.
 * @param {Number} x the starting x coordinate for this Tile
 * @param {Number} y the starting y coordinate for this Tile
 * @param {Number} enum_val the enum of this Tile.  See Tile.enum for available types.
 */
function Tile(x, y, enum_val) {	
	
	/* Sprite attributes */
	this.x = x; //I use internal 'x' and 'y' attributes for use in a TileMap. 
	this.y = y;
	this.img  = Tile.enum[enum_val].img;
	this.type = Tile.enum[enum_val].type;
	this.sprite = new jaws.Sprite({x:this.x, y:this.y, image:this.img});
	this.width  = this.sprite.rect().width;
	this.height = this.sprite.rect().height;
	this.centerX = this.x + this.width/2;
	this.centerY = this.y + this.height/2; 

	this.update = function() {
		// these aren't necessary because tiles won't move, but
		// I put them here so I don't forget if I need them to move later
		this.x = this.sprite.x;
		this.y = this.sprite.y; 
	}

	this.draw = function() {
		this.sprite.draw();
	}
	
	this.getPositionAsCoordinate = function() {
		return {x:this.x, y:this.y};
	}
	
	this.getCenterCoordinate = function() {
		return {x:this.centerX, y:this.centerY};
	}
	
}

Tile.default_size = {
	height : jaws.TileMap.prototype.default_options.cell_size[0],
	width  : jaws.TileMap.prototype.default_options.cell_size[1]
};

/**
 * Contains the kinds of Tiles this game has.
 */
Tile.enum = {
	0 : {
		img : undefined,
		type  : undefined
	},
	
	1 : {
		img : "./assets/art/Tile.png",
		type  : 'regular_tile' 
	},
	
	3 : {
		img : "./assets/art/StartTile.png",
		type  : 'start_tile'
	},
	
	4 : {
		img : "./assets/art/GoalTile.png",
		type  : 'goal_tile'
	},
	
	8 : {
		img : "./assets/art/ObstacleTile.png",
		type  : 'obstacle_tile'
	}

};

/**
 * Returns the enum value for the Tile given by the String tile_type.
 * See Tile.enum for more information.
 * @param {Object} tile_type the String that denotes the tile's type
 */
Tile.enumValueForType = function(tile_type) {
	if(tile_type == 'regular_tile') {
		return 1;
	} else if(tile_type == 'start_tile') {
		return 3;
	} else if(tile_type == 'goal_tile') {
		return 4;
	} else if(tile_type == 'obstacle_tile') {
		return 8;
	} else {
		return 0;
	}
}

