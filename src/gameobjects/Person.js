/**
 * A Person.  Defined by the position, and the image it will display.
 * @param {Number} x the starting x coordinate for this Person
 * @param {Number} y the starting y coordinate for this Person
 * @param {String} spritesheet the URI for the spritesheet that this Person will use.
 * 	This class assumes that the spritesheet is of the form found here:
 *  http://www.mmorpgmakerxb.com/p/characters-sprites-generator
 */
function Person(is_player_controlled, x_position, spritesheet_URI) {
		
	/* Sprite & Animation attributes */
	this.spriteSheet = new jaws.SpriteSheet({image: spritesheet_URI, frame_size: [32.5,48.5], orientation: "right"});
	this.anim = new jaws.Animation({frames: this.spriteSheet.frames});
	this.animWalkDown = this.anim.slice(0,4); //slices 0-3
	this.animWalkLeft = this.anim.slice(4,8); //slices 4-7
	this.animWalkRight = this.anim.slice(8,12); //slices 8-11
	this.animWalkUp = this.anim.slice(12,16); //slices 12-15
	this.animIdle = this.anim.slice(0,1) //firstSlice
	
	this.sprite = new jaws.Sprite({
		x : x_position,
		y : ((jaws.height/2)+100),
		anchor : "center",
		scale : 1.0
	});
	this.sprite.setImage(this.animWalkRight.next());
	this.sprite.scaleAll(2.5);
	
	/* Animation attributes */
	this.isLookingLeft  = true;
	this.isLookingRight = false;
	this.isLookingUp    = false;
	this.isLookingDown  = false;

	/* Game logic attributes */
	this.pride = 100;
	
	this.update = function() {
		
		
		if(is_player_controlled) {
			handle_player_input(this);
		}
		
		else { // Do AI
			handle_AI_input(this);
		}
		
	}

	this.draw = function() {
		this.sprite.draw();
	}
	
	
	function handle_AI_input(player_AI) {
		// Roll for movement initiative!
		var movement_initiative = random_sigmoid();
		if(movement_initiative > 0.75 || movement_initiative < -0.75) {
			
			// Roll successful! Pick a direction.
			var direction = random_sign();
			
			if(direction < 0) { //move left
				player_AI.sprite.x -= 2;
				player_AI.sprite.setImage(player_AI.animWalkLeft.next());
				toggle_look_direction(player_AI, "left");
				//look_left(player_AI);
			} 
			
			else { //move right
				player_AI.sprite.x += 2;
				player_AI.sprite.setImage(player_AI.animWalkRight.next());
				toggle_look_direction(player_AI, "right");
				//look_right(player_AI);				
			}			
		}
	}
	
	
	/**
	 * Auxiliary function to handle player input if this object
	 * is player controlled.
	 */
	function handle_player_input(player) {
		
		var previous_position = {'x': player.sprite.x, 'y': player.sprite.y};
		
		if (jaws.pressed("left")) {
			player.sprite.x -= 2;
			player.sprite.setImage(player.animWalkLeft.next());
			toggle_look_direction(player, "left");
		} 
		
		else if (jaws.pressed("right")) {
			player.sprite.x += 2;
			player.sprite.setImage(player.animWalkRight.next());
			toggle_look_direction(player, "right");
		}
				
		if_idle_reset_direction_animation(previous_position, player);
	}
	
	
	/**
	 * Toggles the look direction of the parameter player to match that
	 * of the parameter direction. A player can only look at one of the
	 * four cardinal directions. 
 	 * @param {Object} player the player to toggle
 	 * @param {Object} direction the direction to toggle to
 	 * 
 	 * This function assumes that the player parameter has boolean
 	 * flags corresponding to isLooking{DIRECTION}
	 */
	function toggle_look_direction(player, direction) {
		if (direction == "left") {
			player.isLookingLeft  = true;
			player.isLookingRight = false;
		}
		
		else {
			player.isLookingLeft  = false;
			player.isLookingRight = true;
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
	
	function look_left(player) {
		player.animWalkLeft.index = 3;
		player.sprite.setImage(player.animWalkLeft.next());
	}
	
	function look_right(player) {
		player.animWalkRight.index = 3;
		player.sprite.setImage(player.animWalkRight.next());	
	}
	
}