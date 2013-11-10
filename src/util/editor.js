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
	mouseDown: false,

	
	/**
	 * Sets up the Editor
	 * 
	 */
	init: function(widthTileCount, heightTileCount) {
		this.width = widthTileCount;
		this.height = heightTileCount; 
		this.clearGrid();
		this.draw();
		this.attachBehaviors();
	},
	
	/**
	 * Sets all tiles to value -1 (empty tile)
	 */
	clearGrid: function() {
		for(var i=0; i < this.height; i++) {
			this.grid[i] = new Array(this.width);
			for(var j=0; j < this.width; j++) {
				this.grid[i][j] = -1;
			}
		}
	},
	
	/**
	 * Draws flat representation of grid
	 */
	draw: function() {
		var width = this.tileWidthPx;
		var height = this.tileHeightPx;
		var gridContainer = $("<div id='editor-grid-container'></div>");
		$.each(this.grid, function(rowIndex, row) {						
			$.each(row, function(index, value) {
				var editorTile = $("<div class='editor-tile'></div>");
				var leftOffset = index * width;
				var topOffset = rowIndex * height;
				editorTile.css({left: leftOffset+"px", top: topOffset+"px"});
				gridContainer.append(editorTile);
			});
			$("body").append(gridContainer);
		});		
	},
	
	/**
	 * Attaches events to elements
	 */
	attachBehaviors: function() {
		var gridContainer = $("#editor-grid-container");
		var editor = this;
		
		$("body").on("mousedown", null, null, function(event) {
			editor.mouseDown = true;			
		});
		
		$("body").on("mouseup", null, null, function(event) {
			editor.mouseDown = false;			
		});
		
		// attach click behavior to tiles in grid
//		gridContainer.on('click', '.editor-tile', function() {
//			$(this).css({border: "solid 1px #00ff00"});
//		});
		
		gridContainer.find('.editor-tile').on('mouseover', function(event) {
			if(editor.mouseDown && event.which == 1) {
//				$(this).css({border: "solid 1px #00ff00"});
				$(this).addClass("editor-tile-level1");
			}
		});
	}	
};

