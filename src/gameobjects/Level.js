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
	
	this.update = function() {
		
	}

	this.draw = function() {
		jaws.draw(this.levelTiles);	
	}
	
	this.getStartTileCoordinates = function() {
		return startTileCoordinates;
	}
	
	function setup(level_data, tile_width, tile_height) {
				
		var canvas_width = jaws.width; // 576
		var canvas_height = jaws.height; // 576

		var num_of_horiz_cells = canvas_width / tile_width; // 18
		var num_of_vert_cells = canvas_height / tile_height; // 18
		
		var level_information = extract_level_information(level_data, num_of_vert_cells, num_of_horiz_cells, tile_width, tile_height);
		var level_tiles = level_information.level_tiles;
		var tile_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [tile_width, tile_height]
		});
		tile_map.push(level_tiles);
		
		// this.cellWidth and this.cellHeight are modified by -1 so that when drawn, the border lines overlap, as opposed to
		// lying side by side (if they are side by side, they create a "bolded line" effect)
		
		
		return {
			level_tiles : level_tiles,
			tile_map : tile_map,
			start_tile : level_information.start_tile,
			goal_tile : level_information.goal_tile,
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
}



	

