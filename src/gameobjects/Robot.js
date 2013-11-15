/**
 * A Robot. 
 */
function Robot(pos, type) {
	
	var starting_position = pos;
	
	/* Sprite attributes */
	this.activeSprite = new jaws.Sprite({x:pos.x,y:pos.y,image:Robot.types[type].tile_img});
	
	/* Drawing attributes */
	var robot_tile_step_offset = jaws.TileMap.prototype.default_options.cell_size[0]-1; //31px

	/* Game logic attributes */
	this.batteryLevel = 100.0;
	var battery_decay = 10.0;
	
	this.isPlayerControlled = (type == 'human_controlled' ? true : false);
	this.isPlanning = false;
	this.isExecuting = false;
	this.isFalling = true; //true if we just fell off the game level
	this.isIdle = false;
	this.actionQueue = new goog.structs.Queue();
	this.actionQueueSizeMax = 12; //max 12 actions queued
	
	this.millisecondsSpentPlanning = 0.0;
	var planning_millisecond_threshold = 1000.0; //2 seconds
	this.millisecondsSpentExecuting = 0.0;
	var executing_millisecond_delay = 500.0; //.5 seconds
	
	
	/* Game input attributes */
	// Prevent the browser from catching the following keys:
	jaws.preventDefaultKeys(["up", "down", "left", "right"]); 
	
	this.update = function() {
		
		if(this.isPlayerControlled && !this.isFalling) {
			
			if(this.isIdle) {
				
				if(handle_player_input(this)) {
					//when you're idle, and you begin inputting commands, you enter planning mode.
					this.setMode('planning'); 
				}

			} else if(this.isPlanning) {
				
				//in planning mode, several things could force you to jump into execution mode: 
				if(this.millisecondsSpentPlanning > planning_millisecond_threshold) {
					this.setMode('executing'); //you have two seconds to keep inputting commands.
					this.millisecondsSpentPlanning = 0.0;
				} else if(this.actionQueue.getCount() == this.actionQueueSizeMax) {
					this.setMode('executing'); //you can't exceed the max number of actions
					this.millisecondsSpentPlanning = 0.0;
				} else {
					this.millisecondsSpentPlanning += jaws.game_loop.tick_duration;
					
					if(handle_player_input(this)) {
						//when you're planning, and you input commands, the planning timer resets
						this.millisecondsSpentPlanning = 0.0;
					}
				}
			} else { //must be in execution
				
				//this execution delay is so that the player takes actions slowly
				//(for game aesthetic purposes)
				if(this.millisecondsSpentExecuting > executing_millisecond_delay) {
					if( ! this.actionQueue.isEmpty()) {
						var action = this.actionQueue.dequeue();
						this.executeAction(action);
						this.batteryLevel -= battery_decay;
					} else {
						this.setMode('idle');	
					}
					
					this.millisecondsSpentExecuting = 0.0;
				} else {
					this.millisecondsSpentExecuting += jaws.game_loop.tick_duration;
				}
				
					
			}
		}
		
		else if(this.isFalling) {
			//if we're falling, we must increase 'y' until we're off the screen
			if(!is_outside_canvas(this.activeSprite)) {
				this.activeSprite.y+=9.8;
			} else {
				this.setMode('idle');
				this.activeSprite.moveTo(starting_position.x, starting_position.y);
			}
			
		}
		
		else { // Do AI
			handle_AI_input(this); //TODO: IMPLEMENT
		}
		
		this.batteryLevel+=0.1; //TODO: REMOVE LATER
		bound_player_attributes(this);
	}

	this.draw = function() {
		this.activeSprite.draw();
	}
	
	/**
	 * Sets this Robot to the parameter mode.
	 * @param mode a String which represents the mode to switch into.
	 * (Acceptable values are 'planning', 'executing', 'idle', and 'falling'; 
	 * defaults to 'idle' if mode is unrecognized.)
	 */
	this.setMode = function(mode) {
		if(mode == 'planning') {
			this.isIdle = false;
			this.isPlanning = true;
			this.isExecuting = false;
			this.isFalling = false;
		} else if(mode == 'executing') {
			this.isIdle = false;
			this.isPlanning = false;
			this.isExecuting = true;
			this.isFalling = false;
		} else if(mode == 'falling') {
			this.isIdle = false;
			this.isPlanning = false;
			this.isExecuting = false;
			this.isFalling = true;
		} else {
			this.isIdle = true;
			this.isPlanning = false;
			this.isExecuting = false;
			this.isFalling = false;
		}
	}
	
	/**
	 * Executes the parameter action on this Robot.
	 * @param action the action to execute ('left','right','up', or 'down')
	 */
	this.executeAction = function(action) {
		if(action == 'left') {
			this.activeSprite.x -= robot_tile_step_offset;
		} else if (action == 'right') {
			this.activeSprite.x += robot_tile_step_offset;
		} else if(action == 'up') {
			this.activeSprite.y -= robot_tile_step_offset;
		} else { //action == 'down'
			this.activeSprite.y += robot_tile_step_offset;
		} 
	}	
	
	function handle_AI_input(player_AI) {
		
	}
	
	
	/**
	 * Auxiliary function to handle player input if this object is player controlled.
	 * Returns true if a key was pressed.
	 * @param player the player we're tracking - should be an instance of a Robot.
	 */
	function handle_player_input(player) {
		var key_was_pressed = false;
		if (jaws.pressedWithoutRepeat("left")) {
			// player.activeSprite.x -= robot_tile_step_offset;
			player.actionQueue.enqueue('left');
			key_was_pressed = true;
		} else if (jaws.pressedWithoutRepeat("right")) {
			// player.activeSprite.x += robot_tile_step_offset;
			player.actionQueue.enqueue('right');
			key_was_pressed = true;
		} else if(jaws.pressedWithoutRepeat("up")) {
			// player.activeSprite.y -= robot_tile_step_offset;
			player.actionQueue.enqueue('up');
			key_was_pressed = true
		} else if(jaws.pressedWithoutRepeat("down")) {
			// player.activeSprite.y += robot_tile_step_offset;
			player.actionQueue.enqueue('down');
			key_was_pressed = true;
		}
		
		if(key_was_pressed) {
			console.log("Key was pressed!");
		}
		
		return key_was_pressed;
	}
	
  	/**
     * Forces the player to have reasonable life values.
     * @param {Object} player the player to bound the attributes of
     */
    function bound_player_attributes(player) {
        if (player.batteryLevel > 100) {
                player.batteryLevel = 100;
        }

        if (player.batteryLevel < 0) {
                player.batteryLevel = 0;
        }
    }
}

/**
 * An enum of the Robot types, which contains information of image files.
 */
Robot.types = {
	'human_controlled' : {
		tile_img : "./assets/art/TileRobot.png",
		block_img : "./assets/art/Robot.png",
	},
	
	'dreyfus_class' : {
		tile_img : "./assets/art/TileRobot.png",
		block_img : "./assets/art/Robot.png"
	}
};
