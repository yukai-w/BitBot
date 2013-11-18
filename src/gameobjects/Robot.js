/**
 * A Robot. 
 */
function Robot(pos, type, speed) {
	
	/* Drawing attributes */
	var robot_step_distance = Tile.default_size.width; //32px
	var robot_vert_offset = 10;
	
	/* Sound attributes */
	this.fallingSfx = new Howl({urls:['./assets/sounds/fx/fall.mp3']});
	
	/* Sprite attributes */	
	this.sprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y+robot_vert_offset),
		image : Robot.types[type].img,
		anchor : "center_bottom",
		scale : 0.85
	}); 

	this.width = this.sprite.rect().width;
	this.height = this.sprite.rect().height;
	this.speed = speed || 3;
	this.velocityX = 0.0;
	this.velocityY = 0.0;
	
	/* Game logic attributes */
	this.startingPosition = {x:pos.x,y:pos.y-robot_vert_offset};
	this.previousPosition = undefined;
	this.targetPostion = undefined;
	
	this.batteryLevel = 100.0;
	var battery_decay = 10.0;
	
	this.isPlayerControlled = (type == 'human_controlled' ? true : false);
	this.isPlanning = false;
	this.isExecuting = false;
	this.isFalling = false; //true if we just fell off the game level
	this.isIdle = true;
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
				
				//if we have a target, move to it.
				if(this.targetPosition != undefined) {
					var tx = this.targetPosition.x - this.sprite.x;
					var ty = this.targetPosition.y - this.sprite.y;
					var distance_to_target = Math.sqrt((tx*tx) + (ty*ty));
					
					this.velocityX = (tx/distance_to_target) * this.speed;
					this.velocityY = (ty/distance_to_target) * this.speed;
					
					if(distance_to_target > 1) {
						this.sprite.x += this.velocityX;
						this.sprite.y += this.velocityY;
					} else {
						this.sprite.x = this.targetPosition.x;
						this.sprite.y = this.targetPosition.y;
						this.targetPosition = undefined;
					}
				} else if (! this.actionQueue.isEmpty()) {
					//otherwise, try to find a new target.
					this.previousPosition = {x:this.sprite.x,y:this.sprite.y};
					var action = this.actionQueue.dequeue();
					this.findActionTarget(action);
					this.batteryLevel -= battery_decay;
				} else {
					this.setMode('idle');
				}
					
			}
		}
		
		else if(this.isPlayerControlled && this.isFalling) {
			console.log(this.sprite);
			
			if(this.sprite.x == undefined) {
				console.log('wat');
			}
			
			//this is true only once, right before we fall, so play the fall sound
			if(this.sprite.x == this.previousPosition.x ||
				this.sprite.y == this.previousPosition.y) {
				this.fallingSfx.play(); 
			}
			
			//if we're falling, we must increase 'y' until we're off the screen
			if(!is_outside_canvas(this.sprite)) {
				this.sprite.y+=9.8;
				this.sprite.x+=0.1; //done to avoid playing the sound forever
			} else {
				this.reset();
			}
			
		}
		
		else { // Do AI
			handle_AI_input(this); //TODO: IMPLEMENT
		}
		
		this.batteryLevel+=0.1; //TODO: REMOVE LATER
		bound_player_attributes(this);
	}

	this.draw = function() {
		this.sprite.draw();
	}
	
	this.rect = function() {
		return this.sprite.rect();
	}
	
	this.reset = function() {
		this.setMode('idle');
		this.sprite.moveTo(this.startingPosition.x, this.startingPosition.y);
		this.targetPosition = undefined;
		this.actionQueue.clear();
	}
	
	this.collisionPoint = function() {
		
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
	 * Sets this Robot's target given the action to execute.
	 * @param action the action to execute ('left','right','up', or 'down')
	 */
	this.findActionTarget = function(action) {
		
		this.targetPosition = {x: this.sprite.x, y: this.sprite.y};
		
		if(action == 'left') {
			this.targetPosition.x -= robot_step_distance;
		} else if (action == 'right') {
			this.targetPosition.x += robot_step_distance;
		} else if(action == 'up') {
			this.targetPosition.y -= robot_step_distance;
		} else { //action == 'down'
			this.targetPosition.y += robot_step_distance;
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
			// player.sprite.x -= robot_step_distance;
			player.actionQueue.enqueue('left');
			key_was_pressed = true;
		} else if (jaws.pressedWithoutRepeat("right")) {
			// player.sprite.x += robot_step_distance;
			player.actionQueue.enqueue('right');
			key_was_pressed = true;
		} else if(jaws.pressedWithoutRepeat("up")) {
			// player.sprite.y -= robot_step_distance;
			player.actionQueue.enqueue('up');
			key_was_pressed = true
		} else if(jaws.pressedWithoutRepeat("down")) {
			// player.sprite.y += robot_step_distance;
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
		img : "./assets/art/BitBot.png",
	},
	
	'dreyfus_class' : {
		img : "./assets/art/BitBotTrainer-DreyfusClass.png",
	}
};
