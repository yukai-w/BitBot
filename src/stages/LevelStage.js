/*
 * The LevelStage.
 */
function LevelStage() {

	/* Class initialization */
	this.activeLevel = new Level(setup_sample_level());
	this.player = new Robot(this.activeLevel.getStartTileCoordinates(), 'human_controlled');
	this.hud = new HUD(this.player);

	// To quit, press 'esc'
	jaws.on_keydown("esc", function() {
		jaws.switchGameState(MenuState);
	});

	this.update = function() {
		this.activeLevel.update();
		this.player.update();
		
		var player_x_pos = this.player.sprite.x;
		var player_y_pos = this.player.sprite.y;
		var tiles_at_new_player_position = this.activeLevel.tileMap.at(player_x_pos, player_y_pos);
		
		//if the player updates and moves to a place where there is no tile,
		//have the player fall
		
		
		//if the player updates and moves to a place where there is an obstacle tile, 
		//then revert the move and apply a penalty
		if(tiles_at_new_player_position != undefined && tiles_at_new_player_position.length > 0) {
			var tile = tiles_at_new_player_position[0];  //guaranteed to be of length 1
			if(tile.type == 'obstacle_tile') {
				this.player.sprite.moveTo(this.player.previousPosition.x, this.player.previousPosition.y);
			}
			
			
			//TODO: Apply penalty
			
		}
		
		//if the player updates and moves to a place where there is an enemy
		//robot, then revert the move and apply a penalty
			
		this.hud.update();
	}

	this.draw = function() {
		
		if(this.player.isFalling) {
			this.player.draw();
			this.activeLevel.draw();
		} else {
			this.activeLevel.draw();
			this.player.draw();
		}
		
		this.hud.draw();
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

