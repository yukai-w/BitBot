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
	Editor.init();
}); 

/**
 * Using JSON-like class creating since
 * Editor is a singleton
 */
var Editor = {
		
	width: 0,
	height: 0,
	
	/**
	 * Sets up the Editor
	 * 
	 */
	init: function(widthTileCount, heightTileCount) {
		this.width = widthTileCount;
		this.height = heightTileCount; 
	},
	
	draw: function() {
		
	},
	
	
};

