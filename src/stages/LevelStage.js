/*
 * The LevelStage.
 */
function LevelStage() {

	/* Fx files */
	var powerupSound = new Howl({urls : ['./assets/sounds/fx/powerup.mp3']});
	var errorSound = new Howl({urls : ['./assets/sounds/fx/error.mp3']});

	/* Music files */
	var gameOverMusic = new Howl({urls : ['./assets/sounds/music/gameover.mp3']});
	var metonymyMusic = new Howl({
		urls : ['./assets/sounds/music/metonymy.mp3'],
		loop : true,
		volume : 0.1,
		sprite : {
			loop : [0, 30000]
		}

	}).play('loop');

	/* Level initialization */
	this.robotsInPlay = [];
	this.robotsOutOfPlay = [];
	this.robotsFreezeFrameInPlay = [];
	this.robotsFreezeFrameOutOfPlay = [];	
	this.activeLevel = new Level(setup_sample_level());
	var level_elements = LevelStage.extractLevelElementInformation(setup_sample_elements(), this.activeLevel);
	this.enemies = level_elements.robots;
	this.batteries = level_elements.batteries;
	this.player = new Robot({
		position : this.activeLevel.startTile.getCenterCoordinate(),
		type : 'player_controlled',
		world : this
	});

	this.robots = this.enemies;
	this.robots[this.robots.length] = this.player;
	
	
	this.hud = new HUD(this.player);

	// To quit, press 'esc'
	jaws.on_keydown("esc", function() {
		jaws.switchGameState(MenuState);
	});

	this.update = function() {
		this.activeLevel.update();
		jaws.update(this.robots);

		//create freeze frames
		if (this.player.isPlanning) {
			if (this.robotsFreezeFrameInPlay.length == 0 && this.robotsFreezeFrameOutOfPlay.length == 0) {
				var number_of_robots = this.robots.length, robot = null;
				for (var robot_idx = 0; robot_idx < number_of_robots; robot_idx++) {
					robot = this.robots[robot_idx];
					pos = {x : robot.sprite.x, y : robot.sprite.y - robot.drawing_vert_offset};

					if (robot.isFalling) {
						this.robotsFreezeFrameOutOfPlay.push(new Robot({
							position : pos,
							type : robot.type,
							direction : robot.directionCode,
							orientation : robot.orientation,
							world : this
						}));

					} else {
						this.robotsFreezeFrameInPlay.push(new Robot({
							position : pos,
							type : robot.type,
							direction : robot.directionCode,
							orientation : robot.orientation,
							world : this
						}));
					}
				}
			}
		} else {
			if (this.robotsFreezeFrameInPlay.length != 0) {
				goog.array.clear(this.robotsFreezeFrameInPlay);
			}

			if (this.robotsFreezeFrameOutOfPlay.length != 0) {
				goog.array.clear(this.robotsFreezeFrameOutOfPlay);
			}
		}

		//clear the auxiliary robot arrays
		this.robotsInPlay = [];
		this.robotsOutOfPlay = [];
		var number_of_robots = this.robots.length, robot = null;
		for (var robot_idx = 0; robot_idx < number_of_robots; robot_idx++) {
			robot = this.robots[robot_idx];
			if (robot.isFalling) {//if it's falling, it's out of play
				this.robotsOutOfPlay.push(robot);
			} else {
				this.robotsInPlay.push(robot);
			}
		}

		var number_of_robots = this.robotsInPlay.length, robot = null;
		for (var robot_idx = 0; robot_idx < number_of_robots; robot_idx++) {
			robot = this.robotsInPlay[robot_idx];
			var x_pos = robot.sprite.x;
			var y_pos = robot.sprite.y;
			var tiles_at_robot_pos = this.activeLevel.tileMap.at(x_pos, y_pos);

			if (tiles_at_robot_pos != undefined) {

				//if the robot updates and moves to an empty space...
				if (tiles_at_robot_pos.length == 0) {

					//the check below happens when the player is still for the
					//brief instant that she is finding a new tile to target -
					//needed so that the player actually animates to move over
					//the hole, and then falls.
					if (robot.targetPosition == undefined) {
						robot.setMode('falling');
						//...have the robot fall
					}
				} else {
					var tile = tiles_at_robot_pos[0];
					//guaranteed to be of length 1

					if (tile.type == 'obstacle_tile') {
						//if the robot moves to a place where there is an obstacle
						//tile, then revert the move and apply a penalty

						robot.targetPosition = {
							x : robot.previousPosition.x,
							y : robot.previousPosition.y
						};
						robot.setMode('executing');
						robot.actionQueue.clear();
						if (robot.isPlayerControlled) {
							errorSound.play();
						}

						//TODO: Apply penalty
					} else if (tile.type == 'goal_tile') {
						//TODO: you win!
					}
				}
			}
		}

		if (this.robotsInPlay.length > 1) {

			//if the player updates and moves to a place where there is an enemy robot,
			//then revert the move and apply a penalty
			jaws.collideManyWithMany(this.robotsInPlay, this.robotsInPlay, function(r1, r2) {

				var prev_position = r1.previousPositionStack.pop();
				r1.targetPosition = prev_position || {
					x : r1.previousPosition.x,
					y : r1.previousPosition.y + 32
				};
				r1.setMode('executing');
				r1.actionQueue.clear();
				if (r1.isPlayerControlled) {
					errorSound.play();
				}

				var prev_position = r2.previousPositionStack.pop();
				r2.targetPosition = prev_position || {
					x : r2.previousPosition.x,
					y : r2.previousPosition.y + 32
				};
				r2.setMode('executing');
				r2.actionQueue.clear();
				if (r2.isPlayerControlled) {
					errorSound.play();
				}
			});
		}

		//if you collide against batteries, take the battery value and add it to your Robot
		if (this.player.isInPlay()) {
			var collided_batteries = jaws.collideOneWithMany(this.player, this.batteries);
			var number_of_batteries = collided_batteries.length, battery = null;
			for (var battery_idx = 0; battery_idx < number_of_batteries; battery_idx++) {
				var battery = collided_batteries[battery_idx];
				console.log(battery);
				console.log(goog.array.remove(this.batteries, battery));
				this.player.batteryLevel += battery.level;
			}
		}

		this.hud.update();

		//sort robots in drawing order - closer ones go first
		goog.array.stableSort(this.robots, drawing_order_compare);
	}

	this.draw = function() {

		if (!this.player.isPlanning) {
			jaws.draw(this.robotsOutOfPlay);
			this.activeLevel.draw();
			jaws.draw(this.robotsInPlay);
		} else {
			jaws.draw(this.robotsFreezeFrameOutOfPlay);
			this.activeLevel.draw();
			jaws.draw(this.robotsFreezeFrameInPlay);
		}

		jaws.draw(this.batteries);
		this.hud.draw();
	}
	function setup_sample_level() {

		var sample_level = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 2, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

		return sample_level;
	}

	function setup_sample_elements() {

		var sample_elems = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

		return sample_elems;
	}

}

/**
 * Returns a map of level elements.
 * @param {Object} elements_data the elements data
 * @param {Number} data_rows number of rows in the robot_data (defaults to 18)
 * @param {Number} data_cols number of cols in the robot_data (defaults to 18)
 * @param {Number} tile_width the width of the tile in which robots roam (defaults to 32)
 * @param {Number} tile_height the height of the tile in which robots roam (defaults to 32)
 */
LevelStage.extractLevelElementInformation = function(elements_data, world, data_rows, data_cols, tile_width, tile_height) {

	var max_rows = data_rows || 18;
	var max_cols = data_cols || 18;
	var t_width = tile_width || 32;
	var t_height = tile_height || 32;
	var world_info = world || undefined; 

	var robots = [];
	var batteries = [];
	for (var row_idx = 0; row_idx < max_rows; row_idx++) {
		for (var col_idx = 0; col_idx < max_cols; col_idx++) {
			var data = elements_data[row_idx][col_idx];
			if (data != 0) {
				var position = {
					x : (col_idx * t_width) + (t_width / 2),
					y : (row_idx * t_height) + (t_height / 2)
				};

				if (data == 9) {
					var battery = new Battery(position);
					batteries.push(battery);
				} else {
					var type = 'dreyfus_class';
					var dir_code = data;
					var robot = new Robot({
						position : position,
						type : type,
						direction : dir_code,
						world : world_info
						
					});
					robots.push(robot);
				}
			}
		}
	}

	return {
		'robots' : robots,
		'batteries' : batteries
	};
}

