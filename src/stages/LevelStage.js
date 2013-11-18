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
	this.player = new Robot(this.activeLevel.startTile.getCenterCoordinate(), 'player_controlled');

	this.robots = this.enemies;
	this.robots[this.robots.length] = this.player;
	
	this.robotsInPlay = [];
	this.robotsOutOfPlay = [];
	
	this.robotsFreezeFrameInPlay = [];
	this.robotsFreezeFrameOutOfPlay = [];

	this.hud = new HUD(this.player);

	// To quit, press 'esc'
	jaws.on_keydown("esc", function() {
		jaws.switchGameState(MenuState);
	});

	this.update = function() {
		this.activeLevel.update();
		jaws.update(this.robots);
		
		//create freeze frames
		if(this.player.isPlanning) {
			if(this.robotsFreezeFrameInPlay.length == 0 && this.robotsFreezeFrameOutOfPlay.length == 0) {
				var number_of_robots = this.robots.length, robot = null;
				for (var robot_idx = 0; robot_idx < number_of_robots; robot_idx++) {
					robot = this.robots[robot_idx];
					pos = {x:robot.sprite.x, y:robot.sprite.y-robot.drawing_vert_offset};
					
					if(robot.isFalling) {
						this.robotsFreezeFrameOutOfPlay[this.robotsFreezeFrameOutOfPlay.length] = new Robot(pos, robot.type, robot.directionCode, robot.orientation);
					} else {
						this.robotsFreezeFrameInPlay[this.robotsFreezeFrameInPlay.length] = new Robot(pos, robot.type, robot.directionCode, robot.orientation);
					}
					
					
				}
			}
		} else {
			if(this.robotsFreezeFrameInPlay.length != 0) {
				goog.array.clear(this.robotsFreezeFrameInPlay);
			}
			
			if(this.robotsFreezeFrameOutOfPlay.length != 0) {
				goog.array.clear(this.robotsFreezeFrameOutOfPlay);
			}
		}
		
		
		//clear the auxiliary robot arrays
		this.robotsInPlay = [];
		this.robotsOutOfPlay = [];
		var number_of_robots = this.robots.length, robot = null;
		for (var robot_idx = 0; robot_idx < number_of_robots; robot_idx++) {
			robot = this.robots[robot_idx];
			if(robot.isFalling) { //if it's falling, it's out of play
				this.robotsOutOfPlay[this.robotsOutOfPlay.length] = robot;
			} else {
				this.robotsInPlay[this.robotsInPlay.length] = robot;
			}
		}
		

		var number_of_robots = this.robots.length, robot = null;
		for (var robot_idx = 0; robot_idx < number_of_robots; robot_idx++) {
			robot = this.robots[robot_idx];
			var x_pos = robot.sprite.x;
			var y_pos = robot.sprite.y;
			var tiles_at_robot_pos = this.activeLevel.tileMap.at(x_pos,y_pos);
			
			if(tiles_at_robot_pos != undefined) {
				
				//if the robot updates and moves to an empty space...
				if(tiles_at_robot_pos.length == 0) {
					
					//the check below happens when the player is still for the
					//brief instant that she is finding a new tile to target -
					//needed so that the player actually animates to move over
					//the hole, and then falls.
					if(robot.targetPosition == undefined) {
						robot.setMode('falling'); //...have the robot fall			
					}
				} else {
					var tile = tiles_at_robot_pos[0]; //guaranteed to be of length 1
					
					if (tile.type == 'obstacle_tile') {
						//if the robot moves to a place where there is an obstacle
						//tile, then revert the move and apply a penalty

						robot.targetPosition = {
							x : robot.previousPosition.x,
							y : robot.previousPosition.y
						};
						robot.setMode('executing');
						robot.actionQueue.clear();
						if(robot.isPlayerControlled) {
							errorSound.play();	
						}
						
						//TODO: Apply penalty
					} else if (tile.type == 'goal_tile') {
						//TODO: you win!
					}
				}
			}
		}

		//if the player updates and moves to a place where there is an enemy robot,
		//then revert the move and apply a penalty
		if(this.robotsInPlay.length > 1) {
			var colliding_pairs = jaws.collideManyWithMany(this.robotsInPlay, this.robotsInPlay, function(r1,r2) {
				r1.targetPosition = {x: r1.previousPosition.x, y:r1.previousPosition.y};
				r1.setMode('executing');
				r1.actionQueue.clear();
				if(r1.isPlayerControlled) {
					errorSound.play();
				}
				
				r2.targetPosition = {x: r2.previousPosition.x, y:r2.previousPosition.y};
				r2.setMode('executing');
				r2.actionQueue.clear();
				if(r2.isPlayerControlled) {
					errorSound.play();
				}
			}); 
		}

		this.hud.update();
	}

	this.draw = function() {
		
		if(!this.player.isPlanning) {
			jaws.draw(this.robotsOutOfPlay);
			this.activeLevel.draw();
			jaws.draw(this.robotsInPlay);
		} else {
			jaws.draw(this.robotsFreezeFrameOutOfPlay);
			this.activeLevel.draw();
			jaws.draw(this.robotsFreezeFrameInPlay);
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
		
		var sample_enemies=[[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
							
		return sample_enemies;	
	}
}

