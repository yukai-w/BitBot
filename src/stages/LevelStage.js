/*
 * The LevelStage.
 */
function LevelStage(options) {
	
	/* Game logic attributes */
	this.isBeingRetried = options.player_is_retrying || false;
	this.isInIntro = true;
	this.isPlaying = false;
	this.isInOutro = false;
	this.isDone = false;
	this.hasBeenCompletedSuccessfully = undefined;
	this.isNarrativeStage = false;
	
	/* Level initialization */
	var level_data = options.level_data;
	var element_data = options.element_data;
	var intro_dialogue = options.intro_dialogue;
	var outro_dialogue = options.outro_dialogue;
	var fail_dialogue = options.fail_dialogue;
	var retry_dialogue = options.retry_dialogue;
	var intro_music = options.intro_music;
	var outro_music = options.outro_music,
		outro_music_should_play = false;
	var fail_music = options.fail_music,
		fail_music_should_play = false;
	var play_music = options.play_music,
		play_music_is_playing = false;
		
	var music_fade_time = 750; //ms
	
	this.activeLevel = new Level(level_data);
	var level_elements = LevelStage.extractLevelElementInformation(element_data, this.activeLevel);
	this.enemies = level_elements.robots;
	this.batteries = level_elements.batteries;
	this.player = new Robot({
		position : this.activeLevel.startTile.getCenterCoordinate(),
		type : 'player_controlled',
		world : this,
		battery : options.battery
	});
	this.hud = new HUD(this.player);
	this.introDialogueSequence = new DialogueSequence();
	this.outroDialogueSequence = new DialogueSequence();
	this.failDialogueSequence = new DialogueSequence();
	this.retryDialogueSequence = new DialogueSequence();
	this.activeDialogueSequence = undefined;
	
	
	/* Auxiliary arrays for drawing/collision detection. */
	this.robots = this.enemies;
	this.robots.push(this.player);
	this.robotsInPlay = [];
	this.robotsOutOfPlay = [];
	this.foregroundFreezeFrame = [];
	this.backgroundFreezeFrame = [];
	
	this.setup = function() {
		//queue up the narrative
		this.initAndStartDialogueSequences();
		
		if(intro_music != undefined) {
			this.stopAllMusic();
			intro_music.play(); //play
		}
	}

	this.update = function() {
		
		if(this.isInIntro) {
						
			if(this.isBeingRetried) {
				this.activeDialogueSequence = this.retryDialogueSequence;
				this.retryDialogueSequence.update();
				if(this.retryDialogueSequence.isFinished) {
					this.setMode('playing');
					
					if(intro_music != undefined) {
						intro_music.stop();						
					}
					
					if(play_music != undefined) {
						play_music.stop();
						play_music.fadeIn(0.6, music_fade_time, function() {
							play_music_is_playing = true;	
						});
					}
				}
				
			} else {
				this.activeDialogueSequence = this.introDialogueSequence;
				this.introDialogueSequence.update();
				if(this.introDialogueSequence.isFinished) {
					this.setMode('playing');
					
					if(intro_music != undefined) {
						intro_music.stop();						
					}
				}
			}
			
		} else if(this.isPlaying) {
			
			if(play_music != undefined) {
				if(!play_music_is_playing) {
					play_music.stop();
					play_music.fadeIn(0.6, music_fade_time, function() {
						play_music_is_playing = true;
					});	
				}
			}
			
			this.updateGameplayLoop();
			
		} else if(this.isInOutro) {
			
			var that = this;
			
			if(play_music != undefined) {
				if(play_music_is_playing) {
					play_music.fadeOut(0.0, music_fade_time, function() {
					  play_music.stop();
					  play_music_is_playing = false;
					});
				}
			}
			
			if(this.hasBeenCompletedSuccessfully) {
				this.activeDialogueSequence = this.outroDialogueSequence;
				this.outroDialogueSequence.update();
				
				if(outro_music != undefined) {
					if(outro_music_should_play) {
						outro_music.play();
						outro_music_should_play = false;
					}
				}
				
				if(this.outroDialogueSequence.isFinished) {
					this.setMode('done');
				}
			} else {
				this.activeDialogueSequence = this.failDialogueSequence;
				this.failDialogueSequence.update();
				
				this.player.stopRobotSounds();
				
				if(fail_music != undefined) {
					if(fail_music_should_play) {
						fail_music.play();
						fail_music_should_play = false;
					}
				}
				if(this.failDialogueSequence.isFinished) {
					this.setMode('done');
				}
			}
		}
	}

	this.draw = function() {
		
		if(this.isPlaying) {

			if (!this.player.isPlanning) {
				jaws.draw(this.robotsOutOfPlay);
				this.activeLevel.draw();
				jaws.draw(this.batteries);
				jaws.draw(this.robotsInPlay);
			} else {
				jaws.draw(this.backgroundFreezeFrame);
				this.activeLevel.draw();
				jaws.draw(this.batteries);
				jaws.draw(this.foregroundFreezeFrame);
			}

			this.hud.draw(); 
		} else {
			this.activeDialogueSequence.draw();
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
				that.player.boundBatteryAttributes();
			});
		}

		//update the heads up display
		this.hud.update();

		//sort robots in drawing order - closer ones go first
		goog.array.stableSort(this.robots, drawing_order_compare);
		
		//if the player is off at the end, we've beaten the level!
		if(this.player.isOff) {
			this.setMode('outro');
			this.hasBeenCompletedSuccessfully = true;
			outro_music_should_play = true;
		}
		
		//if the player is dead, you lose! :(
		if(! this.player.isAlive()) {
			this.setMode('outro');
			this.hasBeenCompletedSuccessfully = false;
			fail_music_should_play = true;
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
	 * Initializes the following dialogue sequences for this LevelStage:
	 * Intro, Outro, Retry, and Fail Dialogues.  Starts each of them
	 * when loaded.
	 */
	this.initAndStartDialogueSequences = function() {
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
		
		$.each(retry_dialogue, function(index, dialogue_beat) {
			$.each(dialogue_beat, function(speaker, text) {
				that.retryDialogueSequence.enqueueDialogueBeat(speaker,text);
			});
		});
		
		$.each(fail_dialogue, function(index, dialogue_beat) {
			$.each(dialogue_beat, function(speaker, text) {
				that.failDialogueSequence.enqueueDialogueBeat(speaker,text);
			});
		});
		
		this.introDialogueSequence.start();
		this.outroDialogueSequence.start();
		this.retryDialogueSequence.start();
		this.failDialogueSequence.start();
		
		this.activeDialogueSequence = this.isBeingRetried ? this.retryDialogueSequence : this.introDialogueSequence;
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
	
	this.stopAllMusic = function() {
		intro_music.stop();
		outro_music.stop();
		fail_music.stop();
		play_music.stop();
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

