/**
 * The Level GameObject.
 */
function Level(level_data) {
	
	/* Pathfinding information */
	var pathfinding_information;
	
	/* These correspond to the tile (flat) representation of the level.*/
	var tile_map;
	var level_tiles;

	/* These correspond to the block (isometric) representation of the level.*/
	var block_map;
	var level_blocks;
	
	/* Class attributes */
	this.isDisplayingFlat = true; // Are we displaying flat?
	this.levelData = level_data;
	this.cellHeight = 0;
	this.cellWidth  = 0;
	this.blockHeight = 0;
	this.blockWidth  = 0;
	var startTileCoordinates = undefined;
	var goalTileCoordinates = undefined;

	/* Class initialization */
	setup(level_data);
	jaws.preventDefaultKeys(["2", "3"]);

	this.update = function() {
		
		if(jaws.pressed("2")) {
			this.isDisplayingFlat = true;
		}
		
		if(jaws.pressed("3")) {
			this.isDisplayingFlat = false;
		}

	}

	this.draw = function() {
		if (this.isDisplayingFlat) {
			// draw flat
			jaws.draw(level_tiles);
			
		} else {
			// draw block (isometric)
			jaws.draw(level_blocks);
		}
	}

	this.toggleDisplayType = function() {
		this.isDisplayingFlat = !(this.isDisplayingFlat);
	}
	
	this.getPathFindingInformation = function() {
		if(pathfinding_information != undefined) {
			var pathfinding_information_clone = pathfinding_information.clone();
			return pathfinding_information_clone;
		} else {
			return undefined;
		}
	}
	
	this.getStartTileCoordinates = function() {
		return startTileCoordinates;
	}
	
	function setup(level_data) {
				
		this.cellWidth = jaws.TileMap.prototype.default_options.cell_size[0]; // 32
		this.cellHeight = jaws.TileMap.prototype.default_options.cell_size[1]; // 32

		var canvas_width = jaws.width; // 576
		var canvas_height = jaws.height; // 576

		var num_of_horiz_cells = canvas_width / this.cellWidth; // 18
		var num_of_vert_cells = canvas_height / this.cellHeight; // 18
			
		/* Flat world setup */
		tile_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [this.cellWidth, this.cellHeight]
		});

		level_tiles = setup_level_tiles(level_data, num_of_vert_cells, num_of_horiz_cells, this.cellWidth - 1, this.cellHeight - 1);
		tile_map.push(level_tiles);
		// this.cellWidth and this.cellHeight are modified by -1 so that when drawn, the border lines overlap, as opposed to
		// lying side by side (if they are side by side, they create a "bolded line" effect)

		/* Block (isometric) world setup */
		block_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [this.cellWidth, this.cellHeight]
		});
		
		this.blockWidth  = this.cellWidth  / 2;
		this.blockHeight = this.cellHeight / 2;

		level_blocks = setup_level_blocks(level_data, num_of_vert_cells, num_of_horiz_cells, this.blockWidth, this.blockHeight);
		block_map.push(level_blocks);
		
		startTileCoordinates = find_tile_coordinates(level_data, num_of_vert_cells, num_of_horiz_cells, this.cellWidth - 1, this.cellHeight - 1, 'start');
		goalTileCoordinates = find_tile_coordinates(level_data, num_of_vert_cells, num_of_horiz_cells, this.cellWidth - 1, this.cellHeight - 1, 'goal');
		
		pathfinding_information = extract_pathfinding_information(level_data);
		console.log("Level.js: setup complete");
	}
	
	function find_tile_coordinates(level_data, max_rows, max_cols, tile_width, tile_height, tile_type) {
		var data_to_match = 0;
		if(tile_type == 'start') {
			data_to_match = 3;
		} else if(tile_type == 'goal') {
			data_to_match = 4;
		} else {
			data_to_match = -1; //error
		}
		
		var tile_coordinates = undefined;
		for (var row_idx = 0; row_idx < max_rows; row_idx++) {
			for (var col_idx = 0; col_idx < max_cols; col_idx++) {
				var data = level_data[row_idx][col_idx];
				
				if(data == data_to_match) {
					tile_coordinates = {x:col_idx*tile_width, y:row_idx*tile_height};
					break;
				}
			}
		}
		return tile_coordinates;		
	}

	function setup_level_tiles(level_data, max_rows, max_cols, tile_width, tile_height) {
		var lvl_tiles = [];
		for (var row_idx = 0; row_idx < max_rows; row_idx++) {
			for (var col_idx = 0; col_idx < max_cols; col_idx++) {
				var data = level_data[row_idx][col_idx];
				var img_string = Level.image_map[data].tile;
				if (img_string != undefined) {
					var tile = new jaws.Sprite({
						image : img_string,
						x : col_idx * tile_width,
						y : row_idx * tile_height
					});

					lvl_tiles[lvl_tiles.length]=tile;
				}
			}
		}
		return lvl_tiles;
	}

	function setup_level_blocks(level_data, max_rows, max_cols, tile_width, tile_height) {

		var lvl_blocks = [];
		var x_pos = jaws.width*4.5/10;
		var y_pos = 0;
		var x_offset = tile_width;
		var y_offset = tile_height;

		for (var row_idx = 0; row_idx < max_rows; row_idx++) {
			for (var col_idx = 0; col_idx < max_cols; col_idx++) {
				var data = level_data[row_idx][col_idx];
				var img_string = Level.image_map[data].block;
				if (img_string != undefined) {
					var block = new jaws.Sprite({
						image: img_string,
						x : x_pos,
						y : y_pos - calculate_level_height_offset(data, tile_height)
					});
					
					lvl_blocks[lvl_blocks.length] = block;	
				}
				
				x_pos = x_pos + x_offset;
				y_pos = y_pos + y_offset;				
			}
			
			x_pos = x_pos - ((max_cols-1) * x_offset) - (2*x_offset);
			y_pos = y_pos - ((max_cols-1) * y_offset);
		}
		return lvl_blocks;
	}	

	function calculate_level_height_offset(cell_entry, cell_height) {
		var offsetUnits = Level.image_map[cell_entry].offset;
		return offsetUnits * cell_height;
	}
	
	/**
	 * Returns a pathfinding object from the pathfinding.js library, which contains
	 * information on the traversable paths within level_data 
 	 * @param {Object} level_data the raw data
	 */
	function extract_pathfinding_information(level_data) {
		
		var pf_info_grid = undefined;

		if (level_data != null) {
			if (level_data.length != null && level_data.length > 0) {
				if (level_data[0].length != null && level_data[0].length > 0) {
					var rows = level_data.length;
					var cols = level_data[0].length;
					
					pf_info_grid = new PF.Grid(cols, rows);
					
					for (var row_idx = 0; row_idx < rows; row_idx++) {
						for (var col_idx = 0; col_idx < cols; col_idx++) {
							var data = level_data[row_idx][col_idx];
							if(data == 0 || data == 8) {
								pf_info_grid.setWalkableAt(col_idx,row_idx,false);
							}
						}
					}
				}
			}
		}
		
		return pf_info_grid;
	}
	
}

Level.image_map = {
	0 : {
		tile : undefined,
		block : undefined,
		offset : undefined
	},
	
	1 : {
		tile : "./assets/art/Tile.png",
		block : "./assets/art/Block.png",
		offset : 0
	},
	
	3 : {
		tile : "./assets/art/StartTile.png",
		block : "./assets/art/StartBlock.png",
		offset : 0
	},
	
	4 : {
		tile : "./assets/art/GoalTile.png",
		block : "./assets/art/GoalBlock.png",
		offset : 0
	},
	
	8 : {
		tile : "./assets/art/TileGap.png",
		block : "./assets/art/Block.png",
		offset : 1 
		
	}

};




	

