/*
 * The LevelStage.
 */
function LevelStage() {

	var player;
	var background;
	var level_tiles;
	var tile_map;
	var active_level;
	
	this.setup = function(playerReference) {
		
		var level_data = setup_sample_level();
		
		// Player setup.
		player = playerReference;
		
		// Level setup.
		active_level = new Level(level_data);
		
		// To quit, press 'esc'
		jaws.on_keydown("esc", function() {
			jaws.switchGameState(MenuState);
		});

		// Prevent the browser from catching the following keys:
		jaws.preventDefaultKeys(["2", "3", "up", "down", "left", "right", "space"]);
	}

	this.update = function() {
		
		active_level.update();
		player.update();
		

		// delete items for which isOutsideCanvas(item) is true
		fps.innerHTML = jaws.game_loop.fps;
	}

	this.draw = function() {
		
		active_level.draw();
		player.draw();
		// will call draw() on all items in the list
	}
	
	function setup_sample_level() {
		
		var sample_level = 	[[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1, 0, 0, 4, 0, 0,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0, 0, 0, 0,40,-1,-1,-1],
							[-1,-1,-1,-1,-1, 0, 4, 0, 0, 0, 0, 4, 0,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,30, 0, 0, 4, 0, 0, 0, 0,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1, 0, 4, 0, 0,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1, 3, 3,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
							[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]];								
		
		return sample_level;
	}	
}

