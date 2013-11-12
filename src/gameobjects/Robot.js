/**
 * A Robot. 
 */
function Robot(pos, type) {
	
	/* Sprite attributes */
	this.flatSprite = new jaws.Sprite({x:pos.x,y:pos.y,image:Robot.types[type].tile_img});
	// this.blockSprite = new jaws.Sprite({x:pos.x,y:pos.y,anchor:"center",image:Robot.types[type].block_img});
	this.activeSprite = this.flatSprite;
	
	
	/* Drawing attributes */
	var robot_tile_step_offset = jaws.TileMap.prototype.default_options.cell_size[0]-1; //31px

	/* Game logic attributes */
	this.batteryLevel = 100;
	this.isPlayerControlled = (type == 'human_controlled' ? true : false);
	this.isPlanning = false;
	this.isExecuting = false;
	this.isIdle = true;
	this.actionQueue = new goog.structs.Queue();
	
	/* Game input attributes */
	// Prevent the browser from catching the following keys:
	jaws.preventDefaultKeys(["up", "down", "left", "right"]); 

	
	
	this.update = function() {
		
		if(this.isPlayerControlled) {
			handle_player_input(this);
		}
		
		else { // Do AI
			handle_AI_input(this); //TODO: IMPLEMENT
		}
		
	}

	this.draw = function() {
		this.activeSprite.draw();
	}
	
	this.setMode = function(mode) {
		if(mode == 'planning') {
			this.isIdle = false;
			this.isPlanning = true;
			this.isExecuting = false;
		} else if(mode == 'executing') {
			this.isIdle = false;
			this.isPlanning = false;
			this.isExecuting = true;
		} else {
			this.isIdle = true;
			this.isPlanning = false;
			this.isExecuting = false;
		}
	}
	
	
	function handle_AI_input(player_AI) {
		
	}
	
	
	/**
	 * Auxiliary function to handle player input if this object
	 * is player controlled.
	 */
	function handle_player_input(player) {
		
		if (jaws.pressedWithoutRepeat("left")) {
			player.activeSprite.x -= robot_tile_step_offset;
		} else if (jaws.pressedWithoutRepeat("right")) {
			player.activeSprite.x += robot_tile_step_offset;			
		} else if(jaws.pressedWithoutRepeat("up")) {
			player.activeSprite.y -= robot_tile_step_offset;
		} else if(jaws.pressedWithoutRepeat("down")) {
			player.activeSprite.y += robot_tile_step_offset;
		}
		
	}
	
		
	/**
	 * Checks to see if the player has moved from the previous position
	 * (relative to before/after player input), and resets the walking animation
	 * for the sprite if the player has not moved.  
	 *
	 * @param {Object} previous_position the position map of the player prior to checking input
 	 * @param {Object} player the player whose sprite animation will be reset
	 */
	function if_idle_reset_direction_animation(previous_position, player) {
		if(previous_position.x == player.sprite.x)
		{
			if(player.isLookingLeft && player.animWalkLeft.index != 0) {
				look_left(player);
			}
			
			else if(player.isLookingRight && player.animWalkRight.index != 0) {
				look_right(player);
			}
		}
	}
	
	
}

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
