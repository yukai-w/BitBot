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
	gameObjectGrid: [],
	mouseDown: false,
	editorContainer: null,
	printoutContainer: null,
	keyModifier: undefined,
	generateGridButton: null,
	clearGridTilesButton: null,
	goalLimit: 1,
	goalCount: 0,
	startLimit: 1,
	startCount: 0,
	maxHorizontalTile: 0,
	minHorizontalTile: 0,
	maxVerticalTile: 0,
	minVerticalTile: 0,
	maxGameplayWidth: 12,
	maxGameplayHeight: 12,
	
	// tile type enum
	tileTypes:  {
		UNDEFINED: 0,
		REGULAR: 1,
		START: 2,
		GOAL: 3,
		OBSTACLE: 4,
		ROBOT_DREYFUSS_LEFT: 5,
		ROBOT_DREYFUSS_DOWN: 6,
		ROBOT_DREYFUSS_RIGHT: 7,
		ROBOT_DREYFUSS_UP: 8,
		BATTERY: 9,
		ROBOT_PLAYER: 10	
	},

	/**
	 * Sets up the Editor
	 * @author Ian Coleman
	 * @param int widthTileCount -- number of tiles across
	 * @param int heightTileCount -- number of tiles down
	 */
	init: function(widthTileCount, heightTileCount) {
		this.width = widthTileCount;
		this.height = heightTileCount;
		this.editorContainer = $("#editor-container");
		this.gridPrintoutContainer = $("#editor-grid-printout-container");
		this.gameObjectGridPrintoutContainer = $("#editor-gameobject-grid-printout-container");
		this.generateGridButton = $("#editor-gen-grid-btn");
		this.clearGridTilesButton = $("#editor-clear-grid-btn");
		$("#alert").hide();
		this.clearGrid();
		this.draw();
		this.attachBehaviors();
		var editor = this;
		
		$(document).keydown(function(event) {
			if(event.which == 84) {
				editor.keyModifier = 't';
			}
			else if(event.which == 79) {
				editor.keyModifier = 'o';
			} 
			else if(event.which == 83) {
				editor.keyModifier = 's';
			}
			else if(event.which == 71) {
				editor.keyModifier = 'g';
			} 
		});
		
		$(document).keyup(function(event) {
			editor.keyModifier = undefined;
		});
	},
	
	/**
	 * Sets all tiles to value -1 (empty tile)
	 * @author Ian Coleman
	 */
	clearGrid: function() {
		for(var i=0; i < this.height; i++) {
			this.grid[i] = new Array(this.width);
			this.gameObjectGrid[i] = new Array(this.width);
			for(var j=0; j < this.width; j++) {				
				this.grid[i][j] = 0;
				this.gameObjectGrid[i][j] = 0;
				this.outputGrid();
				this.outputGameObjectGrid();
			}
		}
	},
	
	/**
	 * Draws flat representation of grid
	 * @author Ian Coleman
	 */
	draw: function() {
		var width = this.tileWidthPx;
		var height = this.tileHeightPx;
		var gridContainer = $("#editor-grid-container");
		$.each(this.grid, function(rowIndex, row) {						
			$.each(row, function(index, value) {
				var editorTile = $("<div class='editor-tile'></div>");
				if(index >= 3 && index <=14 && rowIndex >= 3 && rowIndex <= 14) {
					editorTile.addClass("valid");
				}
				editorTile.attr('x', index);
				editorTile.attr('y', rowIndex);				
				var leftOffset = index * width;
				var topOffset = rowIndex * height;
				editorTile.css({left: leftOffset+"px", top: topOffset+"px"});
				gridContainer.append(editorTile);
			});			
		});	
		this.editorContainer.append(gridContainer);
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
			if(event.which == 1) {
				editor.mouseDown = true;
			}
		});
		
		// clear mouseDown
		$("body").on("mouseup", null, null, function(event) {
			if(event.which == 1) {
				editor.mouseDown = false;
			}
		});
		
		// attach mousedown behavior to tiles in grid
		gridContainer.on('mousedown', '.editor-tile', function(event) {
			// console.log("mousedown on tile");
			editor.mouseDown = true;
			editor.updateTile($(this));
		});
		
		// attach mouseover behavior to tiles in grid
		gridContainer.find('.editor-tile').on('mouseover', function(event) {
			if(editor.mouseDown) {
				// editor.updateTile($(this));
			}
		});
		
		// generate grid definition button click event
		this.generateGridButton.on('click', null, null, function(event) {
			editor.submitOutputGrid();
		});
		
		// clear grid button click event
		this.clearGridTilesButton.on('click', null, null, function(event) {
			editor.submitResetGridTiles();
		});
		
		// draggables
		// $("#editor-bit-bot-fixed-container").draggable({
			// revert: true,
			// revertDuration: 0
		// });
		$("#editor-enemy-bot-fixed-container").draggable({
			revert: true,
			revertDuration: 0
		});
		$("#editor-enemy-bot-ping-pong-fixed-container").draggable({
			revert: true,
			revertDuration: 0
		});
		$("#editor-enemy-bot-ell-pattern-fixed-container").draggable({
			revert: true,
			revertDuration: 0
		});
		$("#editor-enemy-bot-konami-fixed-container").draggable({
			revert: true,
			revertDuration: 0
		});
		$("#editor-battery-fixed-container").draggable({
			revert: true,
			revertDuration: 0
		});
		
		// droppables
		$(".editor-tile").droppable( {
			accept: "#editor-enemy-bot-fixed-container, .editor-enemy-bot-container, \
					#editor-enemy-bot-ping-pong-fixed-container, .editor-enemy-bot-ping-pong-container, \
					#editor-enemy-bot-ell-pattern-fixed-container, .editor-enemy-bot-ell-pattern-container, \
					#editor-enemy-bot-konami-fixed-container, .editor-enemy-bot-konami-container, \
					#editor-battery-fixed-container, .editor-battery-container",
			hoverClass: "editor-tile-drop-hover",
			drop: function(event, ui) {
				// snap object to tile
				// ui.draggable.css({top: $(this).offset().top, left: $(this).offset().left});
				// $("<div class='editor-bit-bot-container'><img src='assets/art/editor-bot-player.png' /></div>");
				// add player bot to game object grid
				// if(ui.draggable.attr('id') === 'editor-bit-bot-fixed-container') {
					// editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), '10');
					// var newBitbotDraggable = $("<div class='editor-bit-bot-container'><img src='assets/art/editor-bot-player.png' /></div>");
					// editor.makeDraggable(newBitbotDraggable);
					// newBitbotDraggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});					
					// $("#editor-bit-bot-fixed-container").before(newBitbotDraggable);
				// }
				// add enemy bot to game object grid
				// else
				 
				// set coordinates of object dropped
				ui.draggable.attr('x', $(this).attr('x'));
				ui.draggable.attr('y', $(this).attr('y'));
				
				if(ui.draggable.attr('id') === "editor-enemy-bot-fixed-container") {
					editor.doFixedContainerDrop(5, $(this));
					// editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), '5');
					// var newEnemybotDraggable = $("<div class='editor-enemy-bot-container'><img src='assets/art/editor-bot-enemy.png' /></div>");
					// editor.makeDraggable(newEnemybotDraggable);
					// newEnemybotDraggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});					
					// // set coordinates of new enemy bot
					// newEnemybotDraggable.attr('x', $(this).attr('x'));
					// newEnemybotDraggable.attr('y', $(this).attr('y'));
					// $("#editor-enemy-bot-fixed-container").before(newEnemybotDraggable);
				}
				else if(ui.draggable.hasClass("editor-enemy-bot-container")) {
					editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), '5');
					ui.draggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});
				}
				else if(ui.draggable.attr('id') === "editor-enemy-bot-ping-pong-fixed-container") {
					editor.doFixedContainerDrop(6, $(this));
				}
				else if(ui.draggable.hasClass("editor-enemy-bot-ping-pong-container")) {
					editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), 6);
					ui.draggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});
				}
				else if(ui.draggable.attr('id') === "editor-enemy-bot-ell-pattern-fixed-container") {
					editor.doFixedContainerDrop(7, $(this));
				}
				else if(ui.draggable.hasClass("editor-enemy-bot-ell-pattern-container")) {
					editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), 7);
					ui.draggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});
				}
				else if(ui.draggable.attr('id') === "editor-enemy-bot-konami-fixed-container") {
					editor.doFixedContainerDrop(8, $(this));
				}
				else if(ui.draggable.hasClass("editor-enemy-bot-konami-container")) {
					editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), 8);
					ui.draggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});
				}				
				// add battery to game object grid	
				else if(ui.draggable.attr('id') === "editor-battery-fixed-container") {
					editor.doFixedContainerDrop(9, $(this));
					// editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), '9');
					// var newBatteryDraggable = $("<div class='editor-battery-container'><img src='assets/art/Battery.png' /></div>");
					// editor.makeDraggable(newBatteryDraggable);
					// newBatteryDraggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});
					// newBatteryDraggable.attr('x', $(this).attr('x'));
					// newBatteryDraggable.attr('y', $(this).attr('y'));					
					// $("#editor-battery-fixed-container").before(newBatteryDraggable);
				}	
				else if(ui.draggable.hasClass("editor-battery-container")) {
					editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), '9');
					ui.draggable.css({top: $(this).offset().top, left: $(this).offset().left, position: "absolute"});
				}						
			}
		});
	},
	
	
	/**
	 * Behavior for when a container is dragged from object pool and dropped
	 * @param objectId - id of the game object that is dropped
	 */
	doFixedContainerDrop: function(objectId, tile) {
		var editor = this;
		
		editor.updateGameObjectGrid(tile.attr('x'), tile.attr('y'), objectId);
		var newEnemybotDraggable = null;
		
		switch(objectId) {
			case 5:
				newEnemybotDraggable = $("<div class='editor-enemy-bot-container'><img src='assets/art/editor-bot-enemy.png' /></div>");
				break;
			case 6:
				newEnemybotDraggable = $("<div class='editor-enemy-bot-ping-pong-container'><img src='assets/art/editor-bot-enemy.png' /></div>");
				break;
			case 7:
				newEnemybotDraggable = $("<div class='editor-enemy-bot-ell-pattern-container'><img src='assets/art/editor-bot-enemy.png' /></div>");
				break;
			case 8:
				newEnemybotDraggable = $("<div class='editor-enemy-bot-konami-container'><img src='assets/art/editor-bot-enemy.png' /></div>");
				break;
			case 9:
				newEnemybotDraggable = $("<div class='editor-battery-container'><img src='assets/art/Battery.png' /></div>");
				break;
			default:
				break;
		}
		editor.makeDraggable(newEnemybotDraggable);
		newEnemybotDraggable.css({top: tile.offset().top, left: tile.offset().left, position: "absolute"});					
		// set coordinates of new enemy bot
		newEnemybotDraggable.attr('x', tile.attr('x'));
		newEnemybotDraggable.attr('y', tile.attr('y'));
		$("#editor-enemy-bot-fixed-container").before(newEnemybotDraggable);
	},
	
	/**
	 * Makes any object draggable
	 */
	makeDraggable: function(obj) {
		var editor = this;
		obj.draggable({
			revert: 'invalid',
			start: function(event, ui) {
				// reset coordinates on grid when dragged (will be reset on drop)
				editor.updateGameObjectGrid($(this).attr('x'), $(this).attr('y'), "0");				
			}
		});
	},
	
	/**
	 * Sets styles,attributes for @tile of corresponding to @type
	 * @author Ian Coleman
	 * @param object tile
	 * @param int type
	 */
	setTileType: function(tile, type) {
		// reset css class -- @TODO: figure out way to selectively remove type class
		tile.removeClass();
		tile.addClass("editor-tile");
		
		// decrement count of tiles being removed/overwritten
		if(type !== tile.attr("type")) {
			if(tile.attr("type") === "start")
				this.startCount--;
			if(tile.attr("type") === "goal")
				this.goalCount--;
		}
		
		// add new type class
		switch(type) {
		case this.tileTypes.REGULAR:
			tile.addClass("editor-tile-flat");
			tile.attr("type", "flat");
			break;
		case this.tileTypes.START:
			if(this.startCount == this.startLimit) {
				this.showAlert("start tile limit reached");
			} else {
				tile.addClass("editor-tile-start");
				tile.attr("type", "start");
				this.startCount++;
			}
			break;
		case this.tileTypes.GOAL:			
			if(this.goalCount == this.goalLimit) {
				this.showAlert("goal tile limit reached");
			} else {
				tile.addClass("editor-tile-goal");
				tile.attr("type", "goal");
				this.goalCount++;
			}
			break;
		case this.tileTypes.OBSTACLE:
			tile.addClass("editor-tile-raised");
			tile.attr("type", "raised");
			break;
		case this.tileTypes.UNDEFINED:
		default:
			tile.addClass("editor-tile-undefined");
			tile.attr("type", "undefined");
			break;
		}
	},
	
	/**
	 * Updates tile info based on input events
	 * @author Ian Coleman <ian@sweetcarolinagames.com>
	 */
	updateTile: function(tile) {
		var editor = this;
		
		var tileType = editor.tileTypes.UNDEFINED;
		var rowIndex = parseInt(tile.attr('y'));
		var columnIndex = parseInt(tile.attr('x'));
		
		if(editor.keyModifier === 't') {					
			tileType = editor.tileTypes.REGULAR;					
		}
		else if(editor.keyModifier === 's') {
			if(editor.startCount < editor.startLimit) {					
				tileType = editor.tileTypes.START;			
			}		
			else {
				this.showAlert("start tile limit reached");
			}
		}
		else if(editor.keyModifier === 'g') {
			if(editor.goalCount < editor.goalLimit) {					
				tileType = editor.tileTypes.GOAL;
			}					
			else {
				this.showAlert("goal tile limit reached");
			}
		}
		else if(editor.keyModifier === 'o') {
			tileType = editor.tileTypes.OBSTACLE;
		}
		else if(editor.keyModifier === undefined) {
			tileType = editor.tileTypes.UNDEFINED;
		}
		
		// console.log(tileType);
		editor.setTileType(tile, tileType);
		editor.updateGrid(columnIndex, rowIndex, tileType);
	},
	
	/**
	 * Sets value of grid at index <x,y>
	 */
	updateGrid: function(x, y, value) {
		this.grid[y][x] = value;
	},
	
	/**
	 * Sets @param value of grid containing game object codes at index [@param x, @param y]
	 */
	updateGameObjectGrid: function(x, y, value) {
		this.gameObjectGrid[y][x] = value;
	},
	
	/**
	 * Handler for button that outputs grid definition
	 * @author Ian Coleman
	 */
	submitOutputGrid: function(button) {		
		this.outputGrid();
		this.outputGameObjectGrid();
		// this.showAlert("outputting grid");
	},
	
	/**
	 * Action attached to clear button
	 * @author Ian Coleman <ian@sweetcarolinagames.com>
	 */
	submitResetGridTiles: function(button) {
		if(confirm("Reset grid?"))
			this.resetGridTiles();
	},
	
	/**
	 * Outputs grid info on page as a 2D array 
	 * @author Ian Coleman
	 */
	outputGrid: function() {
		var editor = this;
		editor.gridPrintoutContainer.empty();
			
		
		editor.gridPrintoutContainer.append("[");
		$.each(this.grid, function(index, row) {
			editor.gridPrintoutContainer.append("<span class='editor-output-row'>[" + row.toString() + "]" + ((index < $(this).length-1) ? "," : "") + "<span><br />");			
		});
		editor.gridPrintoutContainer.append("]");
	},
	
	/**
	 * Outputs game object grid info on page as a 2D array 
	 * @author Ian Coleman
	 */
	outputGameObjectGrid: function() {
		var editor = this;
		editor.gameObjectGridPrintoutContainer.empty();	
		
		editor.gameObjectGridPrintoutContainer.append("[");
		$.each(this.gameObjectGrid, function(index, row) {
			editor.gameObjectGridPrintoutContainer.append("<span class='editor-output-row'>[" + row.toString() + "]" + ((index < $(this).length-1) ? "," : "") + "<span><br />");			
		});
		editor.gameObjectGridPrintoutContainer.append("]");
	},
	
	/**
	 * Display notification window
	 * @param string msg -- text of notification
	 */
	showAlert: function(msg) {
		$("#alert").html(msg).fadeIn(500).delay(3000).fadeOut(500);
	},
	
	/**
	 * Removes type info from grid array and resets all tile css
	 * classes to undefined 
	 */
	resetGridTiles: function() {
		var editorTiles = $(".editor-tile");
		editorTiles.removeClass();
		editorTiles.addClass("editor-tile editor-tile-undefined");
		$(".editor-enemy-bot-container, .editor-enemy-bot-ping-pong-container, .editor-enemy-bot-ell-pattern-container, .editor-enemy-bot-konami-container").remove();
		this.startCount = 0;
		this.goalCount = 0;		
		this.clearGrid();
	}
};

