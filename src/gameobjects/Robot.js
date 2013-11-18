/**
 * A Robot.
 */
function Robot(pos, type, direction_code, orientation) {

	/* Drawing attributes */
	var robot_step_distance = Tile.default_size.width; //32px
	this.drawing_vert_offset = 10;

	/* Sound attributes */
	this.fallingSfx = new Howl({urls : ['./assets/sounds/fx/fall.mp3']});
	this.executingSfx = new Howl({urls : ['./assets/sounds/fx/move.mp3']});
	this.respawningSfx = new Howl({urls : ['./assets/sounds/fx/respawn.mp3']});

	/* Sprite and Animation attributes */
	var animation = new jaws.Animation({
		sprite_sheet : Robot.types[type].sprite_sheet,
		frame_size : [39, 54],
		loop : true
	});
	
	this.walkUpFrame = animation.frames[0];
	this.walkLeftFrame = animation.frames[1];
	this.walkRightFrame = animation.frames[2];
	this.walkDownFrame = animation.frames[3];
	this.idleAnimation = animation.slice(3,6);		
	this.sprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y + this.drawing_vert_offset),
		anchor : "center_bottom",
		scale : 0.85
	});
	this.shadowSprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y + this.drawing_vert_offset),
		anchor : "center_bottom",
		scale : 0.85
	});
	
	
	this.spawnAnimation = new jaws.Animation({
		sprite_sheet : Robot.types[type].respawn_sprite_sheet,
		frame_size : [39, 54],
		loop : true,
	});
	
	this.orientation = orientation || this.walkDownFrame;
	
	this.sprite.setImage(this.orientation);
	this.width = this.sprite.rect().width;
	this.height = this.sprite.rect().height;
	this.speed = (type == 'player_controlled' ? 3 : 2);
	this.velocityX = 0.0;
	this.velocityY = 0.0;

	/* Game logic attributes */
	this.type = type;
	this.directionCode = direction_code || undefined;
	this.startingPosition = {
		x : pos.x,
		y : pos.y + this.drawing_vert_offset
	};
	this.previousPosition = undefined;
	this.targetPostion = undefined;

	this.batteryLevel = 100.0;
	var battery_decay = 10.0;

	this.isPlayerControlled = (type == 'player_controlled' ? true : false);
	this.isPlanning = false;
	this.isExecuting = false;
	this.isFalling = false; //true if we just fell off the game level
	this.isRespawning = false;
	
	this.isIdle = true;
	this.actionQueue = new goog.structs.Queue();
	this.actionQueueSizeMax = 12; //max 12 actions queued
	

	this.millisecondsSpentPlanning = 0.0;
	var planning_millisecond_threshold = 1000.0; //1 seconds
	this.millisecondsSpentExecuting = 0.0;
	var executing_millisecond_delay = 500.0; //.5 seconds

	/* Game input attributes */
	// Prevent the browser from catching the following keys:
	jaws.preventDefaultKeys(["up", "down", "left", "right"]);
	
	this.update = function() 
	{
		if (this.isRespawning) 
		{
			this.sprite.setImage(this.spawnAnimation.next());
			this.sprite.moveTo(this.startingPosition.x, this.startingPosition.y);
			this.orientation = this.spawnAnimation.currentFrame();
			
			if(this.spawnAnimation.index == 1 && this.isPlayerControlled) 
			{
				this.respawningSfx.play();
			}
			
			if(this.spawnAnimation.index == (this.spawnAnimation.frames.length-1)) 
			{
				this.setMode('idle');
			}
					
		} 
		
		else if (!this.isFalling) 
		{
			if (this.isIdle) 
			{
				if (this.isPlayerControlled) 
				{
					this.executingSfx.stop();
					
					if (handle_player_input(this)) 
					{
						// when you're idle, and you begin inputting commands, 
						// you enter planning mode.
						this.setMode('planning');
					} 
					
					else 
					{
						this.sprite.setImage(this.idleAnimation.next());
						this.orientation = this.walkDownFrame;
					}
					
				} 
				
				else 
				{
					// Do AI
					handle_AI_input(this);
					this.setMode('executing');
				}

			} 
			
			else if (this.isPlanning) 
			{
				// in planning mode, several things could force you to jump into execution mode...
				
				//  ...you only have two seconds to keep inputting commands, and
				// you can't exceed the max number of actions				
				if (this.millisecondsSpentPlanning > planning_millisecond_threshold ||
					this.actionQueue.getCount() == this.actionQueueSizeMax) 
				{
					this.setMode('executing'); 
					this.millisecondsSpentPlanning = 0.0;
					if(this.isPlayerControlled) 
					{
						this.executingSfx.play();	//we will begin to execute - only play for the player
					}
					
				} 
				
				else 
				{
					this.millisecondsSpentPlanning += jaws.game_loop.tick_duration;
					
					//when you're planning, and you input commands, the planning timer resets
					if (handle_player_input(this)) 
					{
						this.millisecondsSpentPlanning = 0.0;
					}
				}
			} 
			
			//must be in execution
			else 
			{
				//if we have a target, move to it.
				if (this.targetPosition != undefined) 
				{
					var tx = this.targetPosition.x - this.sprite.x;
					var ty = this.targetPosition.y - this.sprite.y;
					var distance_to_target = Math.sqrt((tx * tx) + (ty * ty));

					this.velocityX = (tx / distance_to_target) * this.speed;
					this.velocityY = (ty / distance_to_target) * this.speed;
					
					if(ty < 0) {
						this.sprite.setImage(this.walkUpFrame);
						this.orientation = this.walkUpFrame;
					}
					
					if(ty > 0) {
						this.sprite.setImage(this.idleAnimation.next());
						this.orientation = this.walkDownFrame;
					}
					
					
					if(tx < 0 && distance_to_target > 1) {
						this.sprite.setImage(this.walkLeftFrame);
						this.orientation = this.walkLeftFrame;
					}
					
					if(tx > 0 && distance_to_target > 1) {
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
				else if (! this.actionQueue.isEmpty()) 
				{
					this.previousPosition = {x : this.sprite.x, y : this.sprite.y};
					var action = this.actionQueue.dequeue();
					this.findActionTarget(action);
					this.batteryLevel -= battery_decay;
				} 
				
				//but if there are no more actions, then you're done.
				else 
				{
					this.setMode('idle');
				}

			}
		} 
		
		//this isFalling!
		else 
		{
			//this is true only once, right before we fall, so play the fall sound
			if (this.sprite.x == this.previousPosition.x || this.sprite.y == this.previousPosition.y) 
			{
				if(this.isPlayerControlled) {
					this.fallingSfx.play(); //only play sounds for the player
				}
			}

			//if we're falling, we must increase 'y' until we're off the screen
			if (!is_outside_canvas(this.sprite)) 
			{
				this.sprite.y += 9.8;
				this.sprite.x += 0.1; //done to avoid playing the sound forever
			}
			
			else 
			{
				this.respawn();
			}
		}

		this.batteryLevel += 0.1; //TODO: REMOVE LATER
		bound_player_attributes(this);
		this.moveToMyPosition(this.shadowSprite);
	}

	this.draw = function() {
		if(this.isFalling || this.isRespawning) {
			this.sprite.draw();
		} else {
			this.shadowSprite.draw();
			this.sprite.draw();
		}
	}

	this.rect = function() {
		return this.sprite.rect().resizeTo(this.width/2,this.height/2);
	}

	this.respawn = function() {
		this.setMode('respawning');
		this.targetPosition = undefined;
		this.actionQueue.clear();
	}

	this.moveToMyPosition = function(sprite) {
		sprite.x = this.sprite.x;
		sprite.y = this.sprite.y;
	}
	
	/**
	 * Sets this Robot to the parameter mode.
	 * @param mode a String which represents the mode to switch into.
	 * (Acceptable values are 'planning', 'executing', 'idle', and 'falling';
	 * defaults to 'idle' if mode is unrecognized.)
	 */
	this.setMode = function(mode) {
		if (mode == 'planning') {
			this.isIdle = false;
			this.isPlanning = true;
			this.isExecuting = false;
			this.isFalling = false;
			this.isRespawning = false;
		} else if (mode == 'executing') {
			this.isIdle = false;
			this.isPlanning = false;
			this.isExecuting = true;
			this.isFalling = false;
			this.isRespawning = false;
		} else if (mode == 'falling') {
			this.isIdle = false;
			this.isPlanning = false;
			this.isExecuting = false;
			this.isFalling = true;
			this.isRespawning = false;
		} else if (mode == 'respawning') {
			this.isIdle = false;
			this.isPlanning = false;
			this.isExecuting = false;
			this.isFalling = false;
			this.isRespawning = true;
		} else {
			this.isIdle = true;
			this.isPlanning = false;
			this.isExecuting = false;
			this.isFalling = false;
			this.isRespawning = false;
		}
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

		if (key_was_pressed) {
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
	'player_controlled' : {
		img : "./assets/art/BitBot.png",
		sprite_sheet : "./assets/art/BitBotSpriteSheet.png",
		respawn_sprite_sheet : "./assets/art/BitBotSpawnSpriteSheet.png"
	},

	'dreyfus_class' : {
		img : "./assets/art/BitBotTrainer-DreyfusClass.png",
		sprite_sheet : "./assets/art/BitBotTrainer-DreyfusClassSpriteSheet.png",
		respawn_sprite_sheet : "./assets/art/BitBotSpawnSpriteSheet.png",
		direction : {
			5 : 'left',
			6 : 'down',
			7 : 'right',
			8 : 'up',
			undefined : undefined
		}
	}
};

/**
 * Returns an array of Robot sprites, placed at locations given by robot_data.
 * @param {Object} robot_data the robot data
 * @param {Number} data_rows number of rows in the robot_data (defaults to 18)
 * @param {Number} data_cols number of cols in the robot_data (defaults to 18)
 * @param {Number} tile_width the width of the tile in which robots roam (defaults to 32)
 * @param {Number} tile_height the height of the tile in which robots roam (defaults to 32)
 */
Robot.extractRobotInformation = function(robot_data, data_rows, data_cols, tile_width, tile_height) {

	var max_rows = data_rows || 18;
	var max_cols = data_cols || 18;
	var t_width = tile_width || 32;
	var t_height = tile_height || 32;

	var robots = [];
	for (var row_idx = 0; row_idx < max_rows; row_idx++) {
		for (var col_idx = 0; col_idx < max_cols; col_idx++) {
			var data = robot_data[row_idx][col_idx];
			if (data != 0) {
				var position = {
					x : (col_idx * t_width) + (t_width / 2),
					y : (row_idx * t_height) + (t_height / 2)
				};
				var type = 'dreyfus_class';
				var dir_code = data;

				var robot = new Robot(position, type, data);
				robots[robots.length] = robot;
			}
		}
	}

	return robots;
}
