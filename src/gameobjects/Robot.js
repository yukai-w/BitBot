/**
 * A Robot.
 */
function Robot(configuration_options) {

	/* Configuration Attributes */
	var pos = configuration_options.position || {
		x : 0,
		y : 0
	};
	this.directionCode = configuration_options.direction || undefined;
	this.orientation = configuration_options.orientation || this.walkDownFrame;
	this.type = configuration_options.type || 'player_controlled';
	this.internalWorldRepresentation = configuration_options.world || undefined;

	/* Drawing attributes */
	//32px
	var robot_step_distance = Tile.default_size.width;
	this.drawing_vert_offset = 10;

	/* Sound attributes */
	this.fallingSfx = new Howl({
		urls : ['./assets/sounds/fx/fall.mp3']
	});
	this.executingSfx = new Howl({
		urls : ['./assets/sounds/fx/move.mp3']
	});
	this.respawningSfx = new Howl({
		urls : ['./assets/sounds/fx/respawn.mp3']
	});
	this.errorSfx = new Howl({
		urls : ['./assets/sounds/fx/error.mp3']
	});
	this.rebootSfx = new Howl({
		urls : ['./assets/sounds/fx/reboot.mp3'],
	});

	/* Sprite and Animation attributes */
	var animation = new jaws.Animation({
		sprite_sheet : Robot.types[this.type].sprite_sheet,
		frame_size : [39, 54],
		loop : true,
		orientation : 'right'
	});

	this.walkUpFrame = animation.frames[0];
	this.walkDownFrame = animation.frames[1];
	this.idleAnimation = animation.slice(2, 5);
	this.walkLeftFrame = animation.frames[5];
	this.walkRightFrame = animation.frames[6];
	this.spawnAnimation = animation.slice(7, 32);
	this.rebootAnimation = new jaws.Animation({
		frames : [this.walkLeftFrame, this.walkUpFrame, this.walkRightFrame, this.walkDownFrame],
		index : 0,
		loop : true
	});
	this.exitAnimation = animation.slice(7, 32);
	this.exitAnimation.frame_direction = -1; 
	
	
	this.sprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y + this.drawing_vert_offset),
		anchor : "center_bottom",
		scale : 0.85
	});
	
	//the shadow sprite is just for aesthetic effect
	this.shadowSprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y + this.drawing_vert_offset),
		anchor : "center_bottom",
		scale : 0.65,
		image : "./assets/art/Shadow.png"
	});
	
	//the spawn point sprite is invisible, and we use it
	//for collision detection over the spawn point - if
	//it collides with something, it means the spawn point
	//is currently occupied (ergo we can't respawn yet)
	this.spawnPointSprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y + this.drawing_vert_offset),
		anchor : "center_bottom",
		scale : 0.85,
		alpha : 0
	});
	this.spawnPointSprite.setImage(this.idleAnimation.frames[0]);

	/* This is only useful for when making a deep copy of this Robot */
	this.sprite.setImage(this.orientation);

	/* Helper attributes */
	this.width = this.sprite.rect().width;
	this.height = this.sprite.rect().height;
	this.speed = (this.type == 'player_controlled' ? 3 : 2);
	this.velocityX = 0.0;
	this.velocityY = 0.0;

	/* Game logic attributes */
	this.startingPosition = {
		x : pos.x,
		y : pos.y + this.drawing_vert_offset
	};
	this.previousPosition = undefined;
	this.targetPostion = undefined;

	this.batteryLevel = 100.0;
	var battery_movement_cost = 5.0;
	var battery_decay = 0.1;

	this.isPlayerControlled = (this.type == 'player_controlled' ? true : false);
	this.isPlanning = false;
	this.isExecuting = false;
	this.isFalling = false; //true if we just fell off the game level
	this.isRespawning = false;
	this.isRebooting = false; //true if we encountered a weird state
	this.isExiting = false; //true if we just finished the level
	this.isOff = false; //true if we're done with the level
	this.canRespawn = true;

	this.isIdle = true;
	this.actionQueue = new goog.structs.Queue();
	this.previousPositionStack = [];
	this.actionQueueSizeMax = 12;

	this.planningWatchdogTimer = 0.0;
	var planning_timer_threshold = 1000.0;
	this.executingWatchdogTimer = 0.0;
	var executing_timer_threshold = 3000.0;
	

	/* Game input attributes */
	// Prevent the browser from catching the following keys:
	jaws.preventDefaultKeys(["up", "down", "left", "right"]);
	
	this.update = function() {
		
		if(this.isRespawning) {
			this.respawn();
		} else if(this.isRebooting) {
			this.reboot();
		} else if(this.isFalling) {
			this.fall();
		} else if(this.isPlanning) {
			this.plan();
		} else if(this.isExecuting) {
			this.execute();
		} else if(this.isExiting) {
			this.exit();
		} else if(this.isOff) {
			//do nothing!  
		} else { //this is idle
			this.standby();
		}
		
		this.batteryLevel -= battery_decay;
		bound_player_attributes(this);
		this.moveToMyPosition(this.shadowSprite);
	}

	this.draw = function() {
		if (this.isFalling || this.isRespawning || this.isExiting || this.isOff) {
			this.sprite.draw();
		} else {
			this.shadowSprite.draw();
			this.sprite.draw();
		}

		this.spawnPointSprite.draw();
	}

	this.rect = function() {
		return this.sprite.rect().resizeTo(this.width / 2, this.height / 2);
	}

	/**
	 * Updates this Robot's knowledge of the world.
	 */
	this.updateInternalWorldRepresentation = function(world_update) {
		this.internalWorldRepresentation = world_update;
	}
	
	/**
	 * Begins the respawn process by wiping this Robot's memory and setting it
	 * to 'respawning' mode.
	 */
	this.beginRespawn = function() {
		this.wipeMemory();
		this.setMode('respawning');
	}
	
	/**
	 * Respawns this Robot by moving it to its spawn point, and animating its entrance.
	 * This Robot's watchdog timer is reset, and if this Robot is the player, it will
	 * also play a sound.  When finished, this method sets this Robot to 'idle' mode.
	 */
	this.respawn = function() {
		this.executingWatchdogTimer = 0.0;
		this.sprite.setImage(this.spawnAnimation.next());
		this.sprite.moveTo(this.startingPosition.x, this.startingPosition.y);
		this.orientation = this.spawnAnimation.currentFrame();

		if (this.spawnAnimation.index == 1 && this.isPlayerControlled) {
			this.respawningSfx.play();
		}

		if (this.spawnAnimation.atLastFrame()) {
			this.previousPositionStack.push(this.startingPosition);
			this.setMode('idle');
		}
	}
	
	/**
	 * Begins the reboot process by wiping this Robot's memory and setting it
	 * to 'rebooting' mode.
	 */
	this.beginReboot = function() {
		this.setMode('rebooting');
		this.wipeMemory();
	}
	
	/**
	 * Reboots this Robot by resetting its watchdog timer, and animating the reboot.
	 * If this Robot is the player, it will also play a sound.  When finished, this
	 * method sets this Robot to 'idle' mode.
	 */
	this.reboot = function() {
		this.executingWatchdogTimer = 0.0;
		this.sprite.setImage(this.rebootAnimation.next());
		this.orientation = this.rebootAnimation.currentFrame();
		
		//if the Robot was moving, stop the sound 
		if(this.executingSfx.pos() > 0) {
			this.executingSfx.stop();
		}
			
		if(this.rebootAnimation.index == 1 && this.isPlayerControlled) {
			if(this.rebootSfx.pos() == 0) {
				this.rebootSfx.play();	
			}
		}
				
		if(this.rebootSfx.pos() > 2) {
			this.setMode('idle');
		}
	}
	
	/**
	 * Executes the planning process for this Robot.  If commands are entered during
	 * the process, the planning timer resets.  If the timer expires, you are forced
	 * into execution - and if you hit max actions, you're also forced into execution.
	 */
	this.plan = function() {

		// in planning mode, several things could force you to jump into execution mode...
		var robot_must_begin_executing = false;
		
		//  ...you only have x seconds to keep inputting commands, and...
		if (this.planningWatchdogTimer > planning_timer_threshold) {
			robot_must_begin_executing = true;
		}
		
		// ...you can't exceed the max number of actions
		if (this.actionQueue.getCount() == this.actionQueueSizeMax) {
			robot_must_begin_executing = true;
		}

		if (robot_must_begin_executing) {
			
			this.setMode('executing');
			this.planningWatchdogTimer = 0.0;
			
			if (this.isPlayerControlled) {
				this.executingSfx.play();
			}
			
		} else {
			this.planningWatchdogTimer += jaws.game_loop.tick_duration;

			//when you're planning, and you input commands, the planning timer resets
			if (handle_player_input(this)) {
				this.planningWatchdogTimer = 0.0;
			}
		}		
	}
	
	/**
	 * Carries out the execution process for the robot.  If the robot has a target to
	 * move to, it does so.  Otherwise, it tries to calculate a target from its
	 * action queue.  If no actions remain, this method sets the Robot to 'idle'
	 * Also, if we execute for too long, the Robot has a failsafe, which reboots it.
	 */
	this.execute = function() {
		
		//if we have a target, move to it.
		if (this.targetPosition != undefined) {
			var tx = this.targetPosition.x - this.sprite.x;
			var ty = this.targetPosition.y - this.sprite.y;
			var distance_to_target = Math.sqrt((tx * tx) + (ty * ty));

			this.velocityX = (tx / distance_to_target) * this.speed;
			this.velocityY = (ty / distance_to_target) * this.speed;

			if (ty < 0) {
				this.sprite.setImage(this.walkUpFrame);
				this.orientation = this.walkUpFrame;
			}

			if (ty > 0) {
				this.sprite.setImage(this.walkDownFrame);
				this.orientation = this.walkDownFrame;
			}

			if (tx < 0 && distance_to_target > 1) {
				this.sprite.setImage(this.walkLeftFrame);
				this.orientation = this.walkLeftFrame;
			}

			if (tx > 0 && distance_to_target > 1) {
				this.sprite.setImage(this.walkRightFrame);
				this.orientation = this.walkRightFrame;
			}

			if (distance_to_target > 1) {
				this.sprite.x += this.velocityX;
				this.sprite.y += this.velocityY;
			} else {
				this.sprite.x = this.targetPosition.x;
				this.sprite.y = this.targetPosition.y;
				this.targetPosition = undefined;
			}
		}

		//otherwise, try to find a new target.
		else if (! this.actionQueue.isEmpty()) {
			this.previousPosition = {
				x : this.sprite.x,
				y : this.sprite.y
			};
			this.previousPositionStack.push({
				x : this.sprite.x,
				y : this.sprite.y
			});
			var action = this.actionQueue.dequeue();
			this.findActionTarget(action);
			this.batteryLevel -= battery_movement_cost;
		}

		//but if there are no more actions, then you're done.
		else {
			this.setMode('idle');
		}
		
		//check if you have been there too long!
		this.executingWatchdogTimer += jaws.game_loop.tick_duration;
		if (this.executingWatchdogTimer >= executing_timer_threshold) {
			//that means we've gotten into a weird state :( - RESET!
			this.executingWatchdogTimer = 0.0;
			this.beginReboot();
		}
	}
	
	/**
	 * Handles standing by in the Robot's 'idle' state.
	 */
	this.standby = function() {
		this.executingWatchdogTimer = 0.0;

		//if we're idle, and the executing sfx was playing, stop it
		if (this.executingSfx.pos() > 0) {
			this.executingSfx.stop();
		}

		if (this.isPlayerControlled) {
			if (handle_player_input(this)) {
				// when you're idle, and you begin inputting commands,
				// you enter planning mode.
				this.setMode('planning');
			} else {
				this.sprite.setImage(this.idleAnimation.next());
				this.orientation = this.walkDownFrame;
			}

		} else {
			// Do AI
			handle_AI_input(this);
			this.setMode('executing');
		}
	}
	
	/**
	 * Makes the robot fall from its current location, until it falls beyond
	 * twice the canvas' height, at which point it begins the process for respawning.
	 */
	this.fall = function() {
		
		//if the robot was executing, stop the sfx (otherwise it'll sound all the way down)
		if (this.executingSfx.pos() > 0) {
			this.executingSfx.stop();
		}

		//this is true only once, right before we fall, so play the fall sound
		if (this.sprite.x == this.previousPosition.x || this.sprite.y == this.previousPosition.y) {
			if (this.isPlayerControlled) {
				this.fallingSfx.play();
				//only play sounds for the player
			}
		}

		//if we're falling, we must increase 'y' until we're way off the screen
		if (!has_fallen_twice_screen_height(this.sprite)) {
			this.sprite.y += 9.8;
			this.sprite.x += 0.1; //x is increased to avoid playing the falling sound forever
		} else {
			
			//if any robot is invading your spawn point sprite, do not respawn
			var other_robots_in_the_world = this.internalWorldRepresentation.player;
			var blocking_robots = jaws.collideOneWithOne(this.spawnPointSprite, other_robots_in_the_world);
			this.canRespawn = !blocking_robots ? true : false;

			//check if you're able to respawn (no one is blocking your spawn point)
			if (this.canRespawn) {
				this.beginRespawn();
			}
		}
	}
	
	/**
	 * Called when the Robot should exit the level.  Animates the exit sequence,
	 * and plays a sound effect.
	 */
	this.exit = function() {
		
		this.executingWatchdogTimer = 0.0;
		this.sprite.setImage(this.exitAnimation.next());
		this.orientation = this.exitAnimation.currentFrame();
		if (this.executingSfx.pos() > 0) {
			this.executingSfx.stop();
		}

		if (this.exitAnimation.atLastFrame() && this.isPlayerControlled) {
			this.respawningSfx.play();
		}

		if (this.exitAnimation.atFirstFrame()) {
			this.setMode('off');
		}
	}
	
	/**
	 * Wipes this Robot's memory by clearing its target position, its
	 * action queue, and its previous position stack. 
	 */
	this.wipeMemory = function() {
		this.targetPosition = undefined;
		this.actionQueue.clear();
		goog.array.clear(this.previousPositionStack);
	}
	
	/**
	 * Moves the paramter jaws.Sprite to my position.
	 * @param sprite a jaws.Sprite.
	 */
	this.moveToMyPosition = function(sprite) {
		sprite.x = this.sprite.x;
		sprite.y = this.sprite.y;
	}
	
	/**
	 * Sets this Robot to the parameter mode.
	 * @param mode a String which represents the mode to switch into.
	 * (defaults to 'idle' if mode is unrecognized.)
	 */
	this.setMode = function(mode) {
		
		this.isIdle = false;
		this.isPlanning = false;
		this.isExecuting = false;
		this.isFalling = false;
		this.isRespawning = false;
		this.isRebooting = false;
		this.isExiting = false;
		this.isOff = false;
		
		if (mode == 'planning') {
			this.isPlanning = true;
		} else if (mode == 'executing') {
			this.isExecuting = true;
		} else if (mode == 'falling') {
			this.isFalling = true;
		} else if (mode == 'respawning') {
			this.isRespawning = true;
		} else if (mode == 'rebooting') {
			this.isRebooting = true;
		} else if (mode == 'exiting') {
			this.isExiting = true;
		} else if(mode == 'off') {
			this.isOff = true;
		} else {
			this.isIdle = true;
		}
	}
	
	/**
	 * Gets this Robots current mode.
	 * Returns 'planning', 'executing', 'idle', 'respawning' or 'falling';
	 */
	this.getMode = function() {

		if (this.isPlanning) {
			return 'planning';
		} else if (this.isExecuting) {
			return 'executing';
		} else if (this.isFalling) {
			return 'falling';
		} else if (this.isRespawning) {
			return 'respawning';
		} else if (this.isRebooting) {
			return 'rebooting';
		} else if (this.isExiting) {
			return 'exiting';
		} else if (this.isOff) {
			return 'off';
		} else {
			return 'idle'
		}
	}
	
	/**
	 * Determines whether this robot is in play.
	 */
	this.isInPlay = function() {
		return (this.isPlanning || this.isExecuting || this.isIdle);
	}
	
	/**
	 * Sets this Robot's target given the action to execute.
	 * @param action the action to execute ('left','right','up', or 'down')
	 */
	this.findActionTarget = function(action) {

		this.targetPosition = {
			x : this.sprite.x,
			y : this.sprite.y
		};

		if (action == 'left') {
			this.targetPosition.x -= robot_step_distance;
		} else if (action == 'right') {
			this.targetPosition.x += robot_step_distance;
		} else if (action == 'up') {
			this.targetPosition.y -= robot_step_distance;
		} else {//action == 'down'
			this.targetPosition.y += robot_step_distance;
		}
	}
	
	/**
	 * Executes this Robot's collide protocol: Try pop the
	 * previous position if it exists, and move to it, otherwise, 
	 * move down.  Clear your action queue.
	 */
	this.doCollideProtocol = function() {
		var prev_position = this.previousPositionStack.pop();
		this.targetPosition = prev_position || {
			x : this.previousPosition.x,
			y : this.previousPosition.y + robot_step_distance
		};
		
		this.setMode('executing');
		this.actionQueue.clear();
		
		if(this.isPlayerControlled) {
			this.errorSfx.play();
		}
		
		//TODO: Apply penalty
	}
	
	/**
	 * Auxiliary function to handle AI input.  Very limited right now.
	 * @param player_AI the Robot whom you'd like to apply AI moves.
	 */
	function handle_AI_input(player_AI) {
		if (player_AI.type == 'dreyfus_class') {
			for (var action_idx = 0; action_idx < player_AI.actionQueueSizeMax; action_idx++) {
				player_AI.actionQueue.enqueue(Robot.types[player_AI.type].direction[player_AI.directionCode]);
			}
		}
	}

	/**
	 * Auxiliary function to handle player input if this object is player controlled.
	 * Returns true if a key was pressed.
	 * @param player the player we're tracking - should be an instance of a Robot.
	 */
	function handle_player_input(player) {
		var key_was_pressed = false;
		if (jaws.pressedWithoutRepeat("left")) {
			player.actionQueue.enqueue('left');
			key_was_pressed = true;
		} else if (jaws.pressedWithoutRepeat("right")) {
			player.actionQueue.enqueue('right');
			key_was_pressed = true;
		} else if (jaws.pressedWithoutRepeat("up")) {
			player.actionQueue.enqueue('up');
			key_was_pressed = true
		} else if (jaws.pressedWithoutRepeat("down")) {
			player.actionQueue.enqueue('down');
			key_was_pressed = true;
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
	'player_controlled' : {
		sprite_sheet : "./assets/art/BlueBitBot-SpriteSheet.png",
	},

	'dreyfus_class' : {
		sprite_sheet : "./assets/art/GrayBitBot-SpriteSheet.png",
		direction : {
			5 : 'left',
			6 : 'down',
			7 : 'right',
			8 : 'up',
			undefined : undefined
		}
	}
};