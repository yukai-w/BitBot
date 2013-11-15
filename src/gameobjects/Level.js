/**
 * The Level GameObject.
 */
function Level(level_data) {
	
	/* Pathfinding information */
	var pathfinding_information;
	
	/* These correspond to the tile (flat) representation of the level.*/
	this.levelTiles = [];
	this.tileMap = undefined;
	

	/* Class attributes */
	this.levelData = level_data;
	this.cellHeight = 0;
	this.cellWidth  = 0;
	var startTileCoordinates = undefined;
	var goalTileCoordinates = undefined;

	/* Class initialization */
	var tile_information = setup(level_data);
	this.levelTiles = tile_information.level_tiles;
	this.tileMap = tile_information.tile_map;
	jaws.preventDefaultKeys(["2", "3"]);

	this.update = function() {
		
	}

	this.draw = function() {
		jaws.draw(this.levelTiles);	
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
	
	function setup(level_data, level_tiles, tile_map) {
				
		this.cellWidth = jaws.TileMap.prototype.default_options.cell_size[0]; // 32
		this.cellHeight = jaws.TileMap.prototype.default_options.cell_size[1]; // 32

		var canvas_width = jaws.width; // 576
		var canvas_height = jaws.height; // 576

		var num_of_horiz_cells = canvas_width / this.cellWidth; // 18
		var num_of_vert_cells = canvas_height / this.cellHeight; // 18
			
		/* Flat world setup */
		var level_tiles = setup_level_tiles(level_data, num_of_vert_cells, num_of_horiz_cells, this.cellWidth - 1, this.cellHeight - 1);
		var tile_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [this.cellWidth, this.cellHeight]
		});
		tile_map.push(level_tiles);
		
		// this.cellWidth and this.cellHeight are modified by -1 so that when drawn, the border lines overlap, as opposed to
		// lying side by side (if they are side by side, they create a "bolded line" effect)

		startTileCoordinates = find_tile_coordinates(level_data, num_of_vert_cells, num_of_horiz_cells, this.cellWidth - 1, this.cellHeight - 1, 'start');
		goalTileCoordinates = find_tile_coordinates(level_data, num_of_vert_cells, num_of_horiz_cells, this.cellWidth - 1, this.cellHeight - 1, 'goal');
		
		pathfinding_information = extract_pathfinding_information(level_data);
		console.log("Level.js: setup complete");
		
		return {level_tiles:level_tiles,tile_map:tile_map};
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
		offset : undefined
	},
	
	1 : {
		tile : "./assets/art/Tile.png",
		offset : 0
	},
	
	3 : {
		tile : "./assets/art/StartTile.png",
		offset : 0
	},
	
	4 : {
		tile : "./assets/art/GoalTile.png",
		offset : 0
	},
	
	8 : {
		tile : "./assets/art/TileGap.png",
		offset : 1 
	}

};




	

