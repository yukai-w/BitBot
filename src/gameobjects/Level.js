
function Level(level_data) {
	
	/* These correspond to the tile (flat) representation of the level.*/
	var tile_map;
	var level_tiles;
	
	/* These correspond to the block (isometric) representation of the level.*/
	var block_map;
	var level_blocks;
	
	/* Class attributes */
	this.isDisplayingFlat = false; // Are we displaying flat?
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
			// draw block (isometric)
			level_blocks.draw();
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
	
		level_tiles = setup_level_tiles(level_data, num_of_vert_cells, num_of_horiz_cells, cell_width-1, cell_height-1);
		tile_map.push(level_tiles);
		// cell_width and cell_height are modified by -1 so that when drawn, the border lines overlap, as opposed to
		// lying side by side (if they are side by side, they create a "bolded line" effect)
		
		
		/* Block (orthographic) world setup */
		block_map = new jaws.TileMap({
			size : [num_of_horiz_cells, num_of_vert_cells],
			cell_size : [cell_width, cell_height]
		});
		
		
		level_blocks = setup_level_blocks(level_data, num_of_vert_cells, num_of_horiz_cells, cell_width, cell_height);
		block_map.push(level_blocks);
		
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
					if(data >= 50) {//a battery tile
						//TODO: IMPLEMENT
					}
					
					else if(data >= 40) {//an end tile
						imgString = "./assets/art/GoalTile.png";						
					}
					
					else if(data >= 30) {//a start tile
						imgString = "./assets/art/StartTile.png";
					}
					
					else if(data >= 20) {//a down-pointing staircase tile
						//TODO: IMPLEMENT
					}
					
					else if(data >= 10) {//a right-pointing staircase tile
						//TODO: IMPLEMENT
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
		
		var lvl_blocks = new jaws.SpriteList();

		
		/**
		 * For setting up the level blocks, I must iterate across the level_data antidiagonally
		 * e.g. if the two dimensional array looks like:
		 * 
		 * { 1,  2,  3,  4
		 * 	 5,  6,  7,  8,
		 *   9, 10, 11, 12 }
		 * 
		 * Iteration should yield:  [1], [5, 2], [9, 6, 3], [10, 7, 4], [11, 8], [12]
		 * Numbers belonging to one bracket, all belong to the same antidiagonal
		 * Source: http://stackoverflow.com/questions/2112832/traverse-rectangular-matrix-in-diagonal-strips
		 */
		var grid_row_index = 0;
		var grid_col_index = 0;
		for(var antidiagonal = 0; antidiagonal < max_rows + max_cols - 1; antidiagonal++) {
			
			var offset_from_left = antidiagonal < max_rows ? 0 : antidiagonal - max_rows + 1;
			/*
			 * indicates how many items must be skipped before the first number should be printed
			 * this number is zero for the first (max_rows) antidiagonals, and increased by 1 thereafter
			 * 
			 * e.g.
			 * when iterating on the 3rd antidiagonal [10, 7, 4],
			 * we must skip over one number from the left (the 9)
			 * 
			 * offset_from_left = 3 < 3 ? 0 : 3 - 3 + 1
			 * offset_from_left = 1
			 * 
			 */
			
			var limit_from_top = antidiagonal < max_cols ? 0 : antidiagonal - max_cols + 1;
			/*
			 * indicates how far we should go in iterating on the antidiagonal, because no
			 * more can be found on it.  this number is zero for the first (max_cols) antidiagonals,
			 * and increased by 1 thereafter
			 * 
			 * e.g.
			 * when iterating on the 4th antidiagonal [11, 8],
			 * we must stop at the 8, instead of going on to the non-existent position of (0,5),
			 * which would be adjacent to the 4 in the matrix (if it existed).
			 * 
			 * limit_from_top = 4 < 4 ? 0 : 4 - 4 + 1
			 * limit_from_top = 1, -> this 1 causes the iter_index to stay at 1 or above
			 * 
			 * causing us to go from [2][3], to [1][4]
			 * and then stopping at  [1][4] (instead of advancing to [0][5])
			 */
			
			
			// indicates how many items must be skipped at the end of the diagonal, because no more
			// can be found on the antidiagonal
			// this number is zero for the first (max_cols) antidiagonals, and increased by 1 thereafter
			
			for(var iter_index = antidiagonal - offset_from_left; iter_index >= limit_from_top; iter_index--) 
			{	
				var row_idx = iter_index;
				var col_idx = antidiagonal-iter_index;
				
				// console.log("At position: ("+row_idx+","+col_idx+")");
				var data = level_data[row_idx][col_idx];
				var imgString = null;
				var levelOffset = 0;
				var doSkip = false;
				if(data != -1) 
				{
					if(data >= 50) {//a battery tile
						//TODO: IMPLEMENT
					}
					
					else if(data >= 40) {//an end block
						imgString = "./assets/art/GoalBlock.png";
						data = data-40;						
					}
					
					else if(data >= 30) {//a start tile
						imgString = "./assets/art/StartBlock.png";
						data = data-30;
					}
					
					else if(data >= 20) {//a down-pointing staircase tile
						//TODO: IMPLEMENT
						data = data-20;
					}
					
					else if(data >= 10) {//a right-pointing staircase tile
						//TODO: IMPLEMENT
						data = data-10;
					}
					
					else {//a regular block
						imgString = "./assets/art/Block.png";
					}

					
					if(data == 4) {//a gap
						doSkip = true;
					}
					
					else {
						//offset by negative pixels, because levels go down
						levelOffset = -31*data;
					}
										
					if(!doSkip) 
					{
						var block = new jaws.Sprite({
							image : imgString,
							x : col_idx * 18,
							y : (row_idx * 18) + levelOffset
						});
						
						lvl_blocks.push(block)
					}
				}
				grid_col_index++;
			}
			grid_row_index++;
		}
 		
 		return lvl_blocks;
	}

}
