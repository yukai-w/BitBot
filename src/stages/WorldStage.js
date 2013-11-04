/*
 * The WorldStage.
 */
function WorldStage() {

	var player;
	var background;
	var level_tiles;
	var tile_map;
	
	this.setup = function(playerReference) {
		
		var cell_width = jaws.TileMap.prototype.default_options.cell_size[0]; //32
		var cell_height = jaws.TileMap.prototype.default_options.cell_size[1];//32
		var canvas_width = jaws.width; //768
		var canvas_height = jaws.height; //576
		var number_of_horizontal_cells = canvas_width/cell_width; //24
		var number_of_vertical_cells = canvas_height/cell_height; //18
		var level_data = setup_sample_level();
			
		// A tilemap, each cell is 32x32 pixels. There's 24 such cells across and 18 downwards.
		tile_map = new jaws.TileMap({
			size : [number_of_horizontal_cells, number_of_vertical_cells],
			cell_size : [cell_width, cell_height]
		});
		
		var img_scale_factor = 32/42;
		
		//level_data, max_rows, max_cols, tile_width, tile_height, tile_img_scale_factor
		level_tiles = setup_level_tiles(level_data, number_of_vertical_cells, number_of_horizontal_cells, cell_width, cell_height);
		tile_map.push(level_tiles);

		// Player setup.
		player = playerReference;
		
		// To quit, press 'esc'
		jaws.on_keydown("esc", function() {
			jaws.switchGameState(MenuState);
		});

		// Prevent the browser from catching the following keys:
		jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	}

	this.update = function() {
		
		player.update();

		// delete items for which isOutsideCanvas(item) is true
		fps.innerHTML = jaws.game_loop.fps;
	}

	this.draw = function() {
		jaws.context.clearRect(0, 0, jaws.width, jaws.height);
		level_tiles.draw();
		player.draw();
		// will call draw() on all items in the list
	}
	
	function setup_sample_level() {
		
		var sample_level = [[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 1, 1, 1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 1, 4, 2, 2,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 1, 2, 3, 3,43,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 4, 1, 1, 1, 1, 4, 3,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 1, 2, 2, 2, 2, 2, 3,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,30, 0, 1, 4, 3, 3, 3, 3,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 1, 4, 2, 3,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 2, 2, 3,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 3, 3,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]];
		
		return sample_level;
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
					
					console.log(tile); 				
	
					lvl_tiles.push(tile);
				}
			}
		}
		
		return lvl_tiles;
	}
	
	function scale_image() {
		
	}
}

