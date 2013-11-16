/**
 * Tiles in the world have an image associated to them, and also have a type.
 * @param {Number} x the starting x coordinate for this Tile
 * @param {Number} y the starting y coordinate for this Tile
 * @param {Number} tile_type the type of this Tile.  See Tile.enum for available types.
 */
function Tile(x, y, tile_type) {	
	
	/* Sprite attributes */
	this.x = x; //I use internal 'x' and 'y' attributes for use in a TileMap. 
	this.y = y;
	this.img  = Tile.enum[tile_type].img;
	this.type = Tile.enum[tile_type].type;
	this.sprite = new jaws.Sprite({x:this.x, y:this.y, image:this.img});

	this.update = function() {
		// these aren't necessary because tiles won't move, but
		// I put them here so I don't forget if I need them to move later
		this.x = this.sprite.x;
		this.y = this.sprite.y; 
	}

	this.draw = function() {
		this.sprite.draw();
	}
}

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