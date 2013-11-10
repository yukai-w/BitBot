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
	tileWidthPx: 40,
	height: 0, // counted in number of tiles
	tileHeightPx: 40,
	grid: [],

	
	/**
	 * Sets up the Editor
	 * 
	 */
	init: function(widthTileCount, heightTileCount) {
		this.width = widthTileCount;
		this.height = heightTileCount; 
		this.clearGrid();
		this.draw();
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
		var width = this.tileWidthPx;
		var height = this.tileHeightPx;
		$.each(this.grid, function(rowIndex, row) {
			var gridContainer = $("<div class='editor-grid-container'></div>");			
			$.each(row, function(index, value) {
				var editorTile = $("<div class='editor-tile'></div>");
//				console.log(index);
				var leftOffset = index * width;
				var topOffset = rowIndex * height;
				console.log(leftOffset+"px");
				editorTile.css({left: leftOffset+"px", top: topOffset+"px"});
//				editorTile.css({left: "20px"});
				gridContainer.append(editorTile);
			});
			$("body").append(gridContainer);
		})
	},
	
	
};

