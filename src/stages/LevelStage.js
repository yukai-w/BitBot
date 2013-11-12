/*
 * The LevelStage.
 */
function LevelStage() {

	/* Class initialization */
	this.activeLevel = new Level(setup_sample_level());
	this.player = new Robot(this.activeLevel.getStartTileCoordinates(), 'human_controlled');

	// To quit, press 'esc'
	jaws.on_keydown("esc", function() {
		jaws.switchGameState(MenuState);
	});

	this.update = function() {
		this.activeLevel.update();
		this.player.update();		
	}

	this.draw = function() {
		this.activeLevel.draw();
		this.player.draw();
	}
	
	function setup_sample_level() {
		
		var sample_level = [[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 4, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 1, 1, 1, 1, 8, 1, 1, 1, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 3, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];								
		
		return sample_level;
	}	
}

