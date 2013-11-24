/*
 * The LevelStage.
 */
function LevelStage() {
	
	/* Game logic attributes */
	this.isInIntro = true;
	this.isPlaying = false;
	this.isInOutro = false;
	this.isDone = false;
	
	/* Music files */
	var gameOverMusic = new Howl({urls : ['./assets/sounds/music/gameover.mp3']});
	var metonymyMusic = new Howl({
		urls : ['./assets/sounds/music/metonymy.mp3'],
		loop : true,
		volume : 0.25,
		sprite : {
			loop : [0, 30000]
		}

	}).play('loop');

	/* Level initialization */
	var level_data;
	var element_data;
	var intro_dialogue;
	var outro_dialogue;
	
	/* Synchronous data loading! */
	$.ajax({
		url : 'http://127.0.0.1:8020/game-off-2013/assets/levels/level1.json',
		async : false,
		dataType : 'json',
		success : function(data) {
			level_data = data.level_data;
			element_data = data.element_data;
			intro_dialogue = data.intro_dialogue;
			outro_dialogue = data.outro_dialogue;
		}
	}); 

	this.activeLevel = new Level(level_data);
	var level_elements = LevelStage.extractLevelElementInformation(element_data, this.activeLevel);
	this.enemies = level_elements.robots;
	this.batteries = level_elements.batteries;
	this.player = new Robot({
		position : this.activeLevel.startTile.getCenterCoordinate(),
		type : 'player_controlled',
		world : this
	});
	this.hud = new HUD(this.player);
	this.introDialogueSequence = new DialogueSequence();
	this.outroDialogueSequence = new DialogueSequence();
	
	/* Auxiliary arrays for drawing/collision detection. */
	this.robots = this.enemies;
	this.robots.push(this.player);
	this.robotsInPlay = [];
	this.robotsOutOfPlay = [];
	this.foregroundFreezeFrame = [];
	this.backgroundFreezeFrame = [];
	
	// To quit, press 'esc'
	jaws.on_keydown("esc", function() {
		jaws.switchGameState(MenuState);
	});
	
	this.setup = function() {
		//queue up the narrative
		var that = this;
		$.each(intro_dialogue, function(index, dialogue_beat) {
			$.each(dialogue_beat, function(speaker, text) {
				that.introDialogueSequence.enqueueDialogueBeat(speaker,text);
			});
		});
		
		$.each(outro_dialogue, function(index, dialogue_beat) {
			$.each(dialogue_beat, function(speaker, text) {
				that.outroDialogueSequence.enqueueDialogueBeat(speaker,text);
			});
		});
		
		this.introDialogueSequence.start();
		this.outroDialogueSequence.start();
	}

	this.update = function() {
		
		if(this.isInIntro) {
			this.introDialogueSequence.update();
			if(this.introDialogueSequence.isFinished) {
				this.setMode('playing');
			}
		} else if(this.isPlaying) {
			this.updateGameplayLoop();
		} else if(this.isInOutro) {
			this.outroDialogueSequence.update();
			if(this.outroDialogueSequence.isFinished) {
				this.setMode('done');
			}
		} else {
			
		}
	}

	this.draw = function() {
		
		if(this.isInIntro) {
			this.introDialogueSequence.draw();
		} else if(this.isInOutro) {
			this.outroDialogueSequence.draw();
		} else if(this.isPlaying) {

			if (!this.player.isPlanning) {
				jaws.draw(this.robotsOutOfPlay);
				this.activeLevel.draw();
				jaws.draw(this.robotsInPlay);
			} else {
				jaws.draw(this.backgroundFreezeFrame);
				this.activeLevel.draw();
				jaws.draw(this.foregroundFreezeFrame);
			}

			jaws.draw(this.batteries);
			this.hud.draw(); 
		} else {
			
		}

	}

	/**
	 * This function is meant to be called once when the LevelStage has concluded, 
	 * and a new LevelStage will be loaded.  All code cleanup should be done here.
	 */
	this.destroy = function() {
		goog.array.clear(this.robots);
		goog.array.clear(this.robotsInPlay);
		goog.array.clear(this.robotsOutOfPlay);
		goog.array.clear(this.foregroundFreezeFrame);
		goog.array.clear(this.backgroundFreezeFrame);
		goog.array.clear(this.enemies);
		goog.array.clear(this.batteries);
		
		delete this.robots;
		delete this.robotsInPlay;
		delete this.robotsOutOfPlay;
		delete this.foregroundFreezeFrame;
		delete this.backgroundFreezeFrame;
		delete this.enemies;
		delete this.activeLevel;
		delete this.player;
		delete this.hud;
		
		metonymyMusic.stop();
		gameOverMusic.stop();
	}
	
	this.setMode = function(mode) {
		this.isInIntro = false;
		this.isPlaying = false;
		this.isInOutro = false;
		this.isDone = false;
		
		if(mode == "intro") {
			this.isInIntro = true;
		} else if(mode == "playing") {
			this.isPlaying = true;
		} else if(mode == "outro") {
			this.isInOutro = true;
		} else { //done
			this.isDone = true;
		}
	}

	this.updateGameplayLoop = function() {
		//Store a ref. for use in inner functions
		var that = this;
		
		//Update the world
		this.activeLevel.update();
		
		//Broadcast the updated world to the robots
		$.each(this.robots, function(robot_idx, robot) {
			robot.updateInternalWorldRepresentation(that);
		});
		
		//Update the robots
		jaws.update(this.robots);
		
		//Update the freeze frames
		if(this.player.isPlanning) {
			if(this.freezeFramesAreEmpty()) {
				this.initFreezeFrames();
			}
		} else {
			this.clearFreezeFrames();
		}
		
		//Update the auxiliary robot arrays
		this.updateAuxiliaryRobotArrays();
		
		//For each of the robots in play,
		$.each(this.robotsInPlay, function(robot_idx, robot_in_play) {
			
			var x_pos = robot_in_play.sprite.x;
			var y_pos = robot_in_play.sprite.y;
			var tiles_at_robot_pos = that.activeLevel.tileMap.at(x_pos, y_pos);
			
			if (tiles_at_robot_pos != undefined) {
				//if the robot updates and moves to an empty space...
				if (tiles_at_robot_pos.length == 0) {

					//the check below happens when the player is still for the
					//brief instant that she is finding a new tile to target -
					//needed so that the player actually animates to move over
					//the hole, and then falls.
					if (robot_in_play.targetPosition == undefined) {
						robot_in_play.setMode('falling'); //...have the robot fall
					}
					
				} else {
					var tile = tiles_at_robot_pos[0]; //guaranteed to be of length 1
					
					if (tile.type == 'obstacle_tile') {
						//if the robot moves to a place where there is an obstacle
						//tile, then revert the move and apply a penalty
						robot_in_play.doCollideProtocol();

					} else if (tile.type == 'goal_tile' && robot_in_play.isPlayerControlled && robot_in_play.isIdle) {
						
						robot_in_play.setMode('exiting');
					}
				}
			}
		});

		if (this.robotsInPlay.length > 1) {
			//if a robot moves to a place where there another robot, revert the move and apply a penalty
			jaws.collideManyWithMany(this.robotsInPlay, this.robotsInPlay, function(r1, r2) {
				r1.doCollideProtocol();
				r2.doCollideProtocol();
			});
		}

		//if you collided against a battery, use it (get the battery value and add it to your Robot)
		if (this.player.isInPlay()) {
			var collided_batteries = jaws.collideOneWithMany(this.player, this.batteries);
			$.each(collided_batteries, function(battery_idx, battery) {
				goog.array.remove(that.batteries, battery);
				that.player.batteryLevel += battery.use();
			});
		}

		//update the heads up display
		this.hud.update();

		//sort robots in drawing order - closer ones go first
		goog.array.stableSort(this.robots, drawing_order_compare);
		
		//if the player is off at the end, we've beaten the level!
		if(this.player.isOff) {
			this.setMode('outro');
		}
	}
	

	/**
	 * Initializes the freeze frames used when the player is planning.
	 * Freeze frames are displayed instead of the game's robots, for
	 * purposes of game mechanics: while the player is planning, the 
	 * representation they will reason with will be outdated.
	 */	
	this.initFreezeFrames = function() {
		var that = this;
		$.each(this.robots, function(robot_idx, robot) {
			
			var pos = {
				x : robot.sprite.x,
				y : robot.sprite.y - robot.drawing_vert_offset
			};
			
			if(robot.isFalling) {
				var out_of_play_robot = new Robot({
					position : pos,
					type : robot.type,
					direction : robot.directionCode,
					orientation : robot.orientation,
					world : that
				});
				
				that.backgroundFreezeFrame.push(out_of_play_robot);
			} else {
				var in_play_robot = new Robot({
					position : pos,
					type : robot.type,
					direction : robot.directionCode,
					orientation : robot.orientation,
					world : this
				});
				
				that.foregroundFreezeFrame.push(in_play_robot);
			}

		});
	}
	
	/**
	 * Returns true if the freeze frames are empty.
	 */
	this.freezeFramesAreEmpty = function() {
		return (this.foregroundFreezeFrame.length == 0 && this.backgroundFreezeFrame.length == 0);
	}
	
	/**
	 * Clears the freeze frames.
	 */
	this.clearFreezeFrames = function() {
		if (this.foregroundFreezeFrame.length != 0) {
			goog.array.clear(this.foregroundFreezeFrame);
		}

		if (this.backgroundFreezeFrame.length != 0) {
			goog.array.clear(this.backgroundFreezeFrame);
		}
	}
	
	/**
	 * Updates the auxiliary robot arrays: 
	 * this.robotsInPlay - which references robots in play (idle, planning, or executing)
	 * this.robotsThatAreRespawning - which references robots that are respawning
	 * this.robotsOutOfPlay - which references robots out of play (falling, rebooting, exiting, or off)
	 */
	this.updateAuxiliaryRobotArrays = function() {

		this.robotsInPlay = [];
		this.robotsOutOfPlay = [];
		
		var that = this;
		
		$.each(this.robots, function(robot_idx, robot) {
			if(robot.isInPlay() || this.isRespawning || this.isRebooting || this.isExiting) {
				that.robotsInPlay.push(robot);
			} else {
				that.robotsOutOfPlay.push(robot);
			}
		});
	}
	
	function setup_sample_level() {

		var sample_level = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0, 0, 0], 
							[0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 2, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
							];

		return sample_level;
	}

	function setup_sample_elements() {

		var sample_elems = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
							];

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

