
function Level(level_data) {
	
	/* These correspond to the tile (flat) representation of the level.*/
	var tile_map;
	var level_tiles;
	
	/* These correspond to the block (orthographic) representation of the level.*/
	var block_map;
	var level_blocks;
	
	/* Class attributes */
	this.isDisplayingFlat = true; // Are we displaying flat?
	this.level_data = level_data;
	
	/* Class initialization */
	setup(level_data);
	
	this.update = function() {
		
	}

	this.draw = function() {
		if(this.isDisplayingFlat) {
			// draw flat
			level_tiles.draw();
		}
		
		else {
			// draw block (orthographic)
			level_blocks_draw();
		}
	}
	
	this.toggleDisplayType = function() {
		this.isDisplayingFlat = !(this.isDisplayingFlat);
	}
	
	function setup(level_data) {
		var cell_width = jaws.TileMap.prototype.default_options.cell_size[0]; // 32
		var cell_height = jaws.TileMap.prototype.default_options.cell_size[1]; // 32
		
		var canvas_width = jaws.width; // 768
		var canvas_height = jaws.height; // 576
		
		var num_of_horiz_cells = canvas_width/cell_width; // 24
		var num_of_vert_cells = canvas_height/cell_height; // 18
	
		/* Flat world setup */	
		tile_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [cell_width, cell_height]
		});
	
		level_tiles = setup_level_tiles(level_data, num_of_vert_cells, num_of_horiz_cells, cell_width, cell_height);
		tile_map.push(level_tiles);
		
		/* Block (orthographic) world setup */
		block_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [cell_width, cell_height]
		});
		
		// level_blocks = setup_level_blocks(level_blocks, num_of_vert_cells, num_of_horiz_cells, cell_width, cell_height);
		// block_map.push(level_blocks);
		
		console.log("Level.js: setup complete");
	}
	
	function setup_level_tiles(level_data, max_rows, max_cols, tile_width, tile_height) {
		var lvl_tiles = new jaws.SpriteList();
		for(var row_idx = 0; row_idx < max_rows; row_idx++) {
			for(var col_idx = 0; col_idx < max_cols; col_idx++) {
				var data = level_data[row_idx][col_idx];
				var imgString;
				if(data != -1) 
				{
					if(data >= 60) {//a staircase tile
						//TODO: IMPLEMENT
					}
					
					else if(data >= 50) {//a battery tile
						//TODO: IMPLEMENT
					}
					
					else if(data >= 40) {//an end tile
						imgString = "./assets/art/GoalTile.png";						
					}
					
					else if(data >= 30) {//a start tile
						imgString = "./assets/art/StartTile.png";
					}
					
					else if(data == 4) {//a gap tile
						imgString = "./assets/art/TileGap.png";
					}
					
					else if(data == 3) {//a level 3 block
						imgString = "./assets/art/Level3Tile.png";						
					}
					
					else if(data == 2) {//a level 2 block
						imgString = "./assets/art/Level2Tile.png";
					}
					
					else if(data == 1) {//a level 1 block
						imgString = "./assets/art/Level1Tile.png";
					}
					
					else if(data == 0) {//a level 0 block
						imgString = "./assets/art/Level0Tile.png";	
					}
					
					else {
						//ERROR
						//TODO: Do proper error handling
					}
					
					var tile = new jaws.Sprite({
						image : imgString,
						x : col_idx * tile_width,
						y : row_idx * tile_height
					});
					
					lvl_tiles.push(tile);
				}
			}
		}
		
		return lvl_tiles;	
	}
	
	function setup_level_blocks(level_data, max_rows, max_cols, tile_width, tile_height) {
		
	}

}