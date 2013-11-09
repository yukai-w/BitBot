/**
 * Copyright 2013 Sweet Carolina Games
 */

/**
 * @file editor.js
 * @author Ian Coleman <ian@sweetcarolinagames.com>
 * 
 * Tile-based visual level editor tool
 */


$(document).ready(function() {
	Editor.init(18, 18);
}); 

/**
 * Using JSON-like class definition since
 * Editor is a singleton
 */
var Editor = {
		
	width: 0, // counted in number of tiles
	height: 0, // counted in number of tiles
	grid: [],

	
	/**
	 * Sets up the Editor
	 * 
	 */
	init: function(widthTileCount, heightTileCount) {
		this.width = widthTileCount;
		this.height = heightTileCount; 
		this.clearGrid();
	},
	
	/**
	 * Sets all tiles to value 0 (empty tile)
	 */
	clearGrid: function() {
		for(var i=0; i < this.height; i++) {
			this.grid[i] = new Array(this.width);
			for(var j=0; j < this.width; j++) {
				this.grid[i][j] = 0;
			}
		}
	},
	
	draw: function() {
		
	},
	
	
};

