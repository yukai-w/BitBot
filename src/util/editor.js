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
 * @author Ian Coleman
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
	 * @author Ian Coleman
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
	 * @author Ian Coleman
	 */
	clearGrid: function() {
		for(var i=0; i < this.height; i++) {
			this.grid[i] = new Array(this.width);
			for(var j=0; j < this.width; j++) {
				this.grid[i][j] = -1;
			}
		}
		console.log(this.grid);
	},
	
	/**
	 * Draws flat representation of grid
	 * @author Ian Coleman
	 */
	draw: function() {
		var width = this.tileWidthPx;
		var height = this.tileHeightPx;
		var gridContainer = $("<div id='editor-grid-container'></div>");
		$.each(this.grid, function(rowIndex, row) {						
			$.each(row, function(index, value) {
				var editorTile = $("<div class='editor-tile'></div>");
				editorTile.attr('x', index);
				editorTile.attr('y', rowIndex);				
				var leftOffset = index * width;
				var topOffset = rowIndex * height;
				editorTile.css({left: leftOffset+"px", top: topOffset+"px"});
				gridContainer.append(editorTile);
			});
			$("body").append(gridContainer);
		});		
	},
	
	/**
	 * Attaches mouse events to elements
	 * @author Ian Coleman
	 */
	attachBehaviors: function() {
		var gridContainer = $("#editor-grid-container");
		var editor = this;
		
		// set mouseDown
		$("body").on("mousedown", null, null, function(event) {
			if(event.which == 1)
				editor.mouseDown = true;			
		});
		
		// clear mouseDown
		$("body").on("mouseup", null, null, function(event) {
			if(event.which == 1)
				editor.mouseDown = false;			
		});
		
		// attach mousedown behavior to tiles in grid
		gridContainer.on('mousedown', '.editor-tile', function(event) {
			if(event.which == 1)
				$(this).addClass("editor-tile-level1");
		});
		
		// attach mouseover behavior to tiles in grid
		gridContainer.find('.editor-tile').on('mouseover', function(event) {
			if(editor.mouseDown && event.which == 1) {
				$(this).attr("level", "1");
				$(this).addClass("editor-tile-level1");
			}
		});
	}
};

