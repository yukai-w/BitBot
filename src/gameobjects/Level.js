/**
 * The Level GameObject.
 */
function Level(level_data) {
	
	/* Class initialization */
	var setup_information = setup(level_data, Tile.default_size.width, Tile.default_size.height);
	this.rawLevelData = level_data;
	this.levelTiles = setup_information.level_tiles;
	this.tileMap = setup_information.tile_map;
	this.startTile = setup_information.start_tile;
	this.goalTile = setup_information.goal_tile;
	var pathfinding_information = setup_information.pathfinding_information;

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
	
	function setup(level_data, tile_width, tile_height) {
				
		var canvas_width = jaws.width; // 576
		var canvas_height = jaws.height; // 576

		var num_of_horiz_cells = canvas_width / tile_width; // 18
		var num_of_vert_cells = canvas_height / tile_height; // 18
		
		var level_information = extract_level_information(level_data, num_of_vert_cells, num_of_horiz_cells, tile_width - 1, tile_height - 1);
		var level_tiles = level_information.level_tiles;
		var tile_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [tile_width, tile_height]
		});
		tile_map.push(level_tiles);
		
		// this.cellWidth and this.cellHeight are modified by -1 so that when drawn, the border lines overlap, as opposed to
		// lying side by side (if they are side by side, they create a "bolded line" effect)
		
		var pathfinding_information = extract_pathfinding_information(level_data);
		console.log("Level.js: setup complete");
		
		
		return {
			level_tiles : level_tiles,
			tile_map : tile_map,
			start_tile : level_information.start_tile,
			goal_tile : level_information.goal_tile,
			pathfinding_information : pathfinding_information
		};
	}
	
	function extract_level_information(level_data, max_rows, max_cols, tile_width, tile_height) {
		var level_tiles = [];
		var start_tile = undefined;
		var goal_tile  = undefined;
		for (var row_idx = 0; row_idx < max_rows; row_idx++) {
			for (var col_idx = 0; col_idx < max_cols; col_idx++) {
				var data = level_data[row_idx][col_idx];
				if (data != 0) {
					var tile = new Tile(col_idx * tile_width, row_idx*tile_height, data);
					level_tiles[level_tiles.length]=tile;
					
					if(Tile.enum[data].type == 'start_tile') {
						start_tile = tile;
					}
					
					if(Tile.enum[data].type == 'goal_tile') {
						goal_tile = tile;
					}
					
				}
			}
		}
		return {level_tiles:level_tiles,start_tile:start_tile,goal_tile:goal_tile};
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



	

