function Level(level_data) {

	/* These correspond to the tile (flat) representation of the level.*/
	var tile_map;
	var level_tiles;

	/* These correspond to the block (isometric) representation of the level.*/
	var block_map;
	var level_blocks;
	
	/* Class attributes */
	this.isDisplayingFlat = false; // Are we displaying flat?
	this.levelData = level_data;
	this.cellHeight = 0;
	this.cellWidth  = 0;
	this.blockHeight = 0;
	this.blockWidth  = 0;
	this.startTileCoordinates  = {x : 0, y : 0};
	this.goalTileCoordinates   = {x : 0, y : 0};
	this.startBlockCoordinates = {x : 0, y : 0};
	this.goalBlockCoordinates  = {x : 0, y : 0};
		

	/* Class initialization */
	setup(level_data);

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
			level_tiles.draw();
		} else {
			// draw block (isometric)
			level_blocks.draw();
		}
	}

	this.toggleDisplayType = function() {
		this.isDisplayingFlat = !(this.isDisplayingFlat);
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

		/* Block (orthographic) world setup */
		block_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [this.cellWidth, this.cellHeight]
		});
		
		this.blockWidth  = this.cellWidth  / 2;
		this.blockHeight = this.cellHeight / 2;

		level_blocks = setup_level_blocks(level_data, num_of_vert_cells, num_of_horiz_cells, this.blockWidth, this.blockHeight);
		block_map.push(level_blocks);

		console.log("Level.js: setup complete");
	}

	function setup_level_tiles(level_data, max_rows, max_cols, tile_width, tile_height) {
		var lvl_tiles = new jaws.SpriteList();
		for (var row_idx = 0; row_idx < max_rows; row_idx++) {
			for (var col_idx = 0; col_idx < max_cols; col_idx++) {
				var data = level_data[row_idx][col_idx];
				var img_string = img_string_lookup(data,true); //it's true, we're looking for tiles (as opposed to blocks)
				if (img_string != null) {
					var tile = new jaws.Sprite({
						image : img_string,
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

		var lvl_blocks = new jaws.SpriteList();
		var x_pos = jaws.width*4.5/10;
		var y_pos = 0;
		var x_offset = tile_width;
		var y_offset = tile_height;

		for (var row_idx = 0; row_idx < max_rows; row_idx++) {
			for (var col_idx = 0; col_idx < max_cols; col_idx++) {
				var data = level_data[row_idx][col_idx];
				var img_string = img_string_lookup(data,false); //it's false, we're not looking for tiles (we're looking for blocks)
				if (img_string != null) {
					
					var block = new jaws.Sprite({
						image: img_string,
						x : x_pos,
						y : y_pos + calculate_level_height_offset(data, tile_height)
					});
					
					lvl_blocks.push(block);	
				}
				
				x_pos = x_pos + x_offset;
				y_pos = y_pos + y_offset;				
			}
			
			x_pos = x_pos - ((max_cols-1) * x_offset) - (2*x_offset);
			y_pos = y_pos - ((max_cols-1) * y_offset);
		}
		return lvl_blocks;
	}	

	/**
	 * Looks up the tile image that corresponds to the parameter level data
	 * @param {Object} data the level tile data
	 * @param {Boolean} whether or not we're looking up a tile (alternative is a block)
	 * @return {String} the directory path of the tile image
	 */
	function img_string_lookup(data, is_tile) {

		var img_string = null;
		var is_D_stair = false;
		var is_R_stair = false;

		if (data != -1) {
			if (data >= 40) {//an end tile
				img_string = is_tile ? "./assets/art/GoalTile.png" : "./assets/art/GoalBlock.png";
			} else if (data >= 30) {//a start tile
				img_string = is_tile ? "./assets/art/StartTile.png": "./assets/art/StartBlock.png";
			} else if (data >= 20) {//a down-pointing staircase tile
				is_D_stair = true;
				data = data - 20;
			} else if (data >= 10) {//a right-pointing staircase tile
				is_R_stair = true;
				data = data - 10;
			} else {
				
			}

			if (data == 4 && is_tile) {//a gap tile
				img_string = "./assets/art/TileGap.png";
			} else if (data == 3) {//a level 3 block
				if (is_D_stair) {
					img_string = is_tile ? "./assets/art/Level3TileLadderD.png" : "./assets/art/LadderLeftBlock.png";
				} else if (is_R_stair) {
					img_string = is_tile ? "./assets/art/Level3TileLadderR.png" : "./assets/art/LadderRightBlock.png";
				} else {
					img_string = is_tile ? "./assets/art/Level3Tile.png" : "./assets/art/Block.png";
				}
			} else if (data == 2) {//a level 2 block
				if (is_D_stair) {
					img_string = is_tile ? "./assets/art/Level2TileLadderD.png" : "./assets/art/LadderLeftBlock.png";
				} else if (is_R_stair) {
					img_string = is_tile ? "./assets/art/Level2TileLadderR.png" : "./assets/art/LadderRightBlock.png";
				} else {
					img_string = is_tile ? "./assets/art/Level2Tile.png" : "./assets/art/Block.png";
				}
			} else if (data == 1) {//a level 1 block
				if (is_D_stair) {
					img_string = is_tile ? "./assets/art/Level1TileLadderD.png" : "./assets/art/LadderLeftBlock.png";
				} else if (is_R_stair) {
					img_string = is_tile ? "./assets/art/Level1TileLadderR.png" : "./assets/art/LadderRightBlock.png";
				} else {
					img_string = is_tile ? "./assets/art/Level1Tile.png" : "./assets/art/Block.png";
				}

			} else if (data == 0) {//a level 0 block
				img_string = is_tile ? "./assets/art/Level0Tile.png" : "./assets/art/Block.png";
			} else {
								
			}
		}
		return img_string;
	}	
	
	function calculate_level_height_offset(cell_entry, cell_height) {

		//this returns the second digit of 'cell_offset'.
		if(cell_entry >= 10) {
			cell_entry = Math.round( ( (cell_entry/10) % 1) * 10 );
		}
		
		return (cell_entry*cell_height);
	}
	
	
}

	

