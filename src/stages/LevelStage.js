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
		urls : ['./assets/sounds/music/gameover.mp3']
	});
	
	var metonymyMusic = new Howl({
		urls : ['./assets/sounds/music/metonymy.mp3'],
		loop : true,
		volume : 0.1
	}).play(); 

	

	/* Level initialization */
	this.activeLevel = new Level(setup_sample_level());
	this.enemies = Robot.extractRobotInformation(setup_sample_enemies());
	this.player = new Robot(this.activeLevel.startTile.getCenterCoordinate(), 'human_controlled');
	this.hud = new HUD(this.player);

	// To quit, press 'esc'
	jaws.on_keydown("esc", function() {
		jaws.switchGameState(MenuState);
	});

	this.update = function() {
		this.player.update();
		this.activeLevel.update();
		jaws.update(this.enemies);
		
		
		var x_pos = this.player.sprite.x;
		var y_pos = this.player.sprite.y;
		var tiles_at_new_player_position = this.activeLevel.tileMap.at(x_pos,y_pos);
		
		//TODO:
		//I need to do the below for everyone, not just the player - 
		//otherwise, the robot might land on top of an obstacle.
		
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
					errorSound.play();
					//TODO: Apply penalty
				} else if(tile.type == 'goal_tile') {
					//TODO: you win!
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
		
		jaws.draw(this.enemies);
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
							[ 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 2, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];								
		
		return sample_level;
	}
	
	function setup_sample_enemies() {
		
		var sample_enemies = [[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 7, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
							
		return sample_enemies;	
	}
}

