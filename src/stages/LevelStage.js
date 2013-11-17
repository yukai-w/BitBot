/*
 * The LevelStage.
 */
function LevelStage() {

	/* Fx files */
	var powerupSound = new Howl({
		urls : ['./assets/sounds/fx/powerup.mp3']
	});
	var errorSound = new Howl({
		urls : ['./assets/sounds/fx/error.mp3']
	});

	/* Music files */
	var gameOverMusic = new Howl({
		urls : ['./assets/sounds/music/gameover.mid']
	});
	var metonymyMusic = new Howl({
		urls : ['./assets/sounds/music/metonymy.mid'],
		loop : true
	});
	
	metonymyMusic.play();

	/* Level initialization */
	this.activeLevel = new Level(setup_sample_level());
	this.player = new Robot(this.activeLevel.startTile.getPositionAsCoordinate(), 'human_controlled');
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
		
		if(tiles_at_new_player_position != undefined) {
			
			//if the player updates and moves to a place where there is no tile,
			if (tiles_at_new_player_position.length == 0) {
				
				//the check below happens when the player is still 
				//for the brief instant that she is finding a new
				//tile to target - needed so that the player actually
				//animates to move over the hole, and then falls.
				if(this.player.targetPosition == undefined) {
					this.player.setMode('falling'); //have the player fall	
				}
				
			} else {
				var tile = tiles_at_new_player_position[0]; //guaranteed to be of length 1
				if (tile.type == 'obstacle_tile') {
					//if the player updates and moves to a place where there is
					//an obstacle tile, then revert the move and apply a penalty
					
					this.player.targetPosition = {
						x : this.player.previousPosition.x,
						y : this.player.previousPosition.y
					};
					this.player.setMode('executing');
					this.player.actionQueue.clear();
					//TODO: Apply penalty
				}	
			}
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
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];								
		
		return sample_level;
	}	
}

