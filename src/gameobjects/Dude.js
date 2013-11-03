/**
 * The dude.
 * @param {Object} x the starting x coordinate for this Dude
 * @param {Object} y the starting y coordinate for this Dude
 */
function Dude(x, y) {
	
	/* Sprite & Animation attributes */
	this.spriteSheet = new jaws.SpriteSheet({image: "./assets/art/dude.png", frame_size: [25,45], orientation: "right"});
	this.anim = new jaws.Animation({frames: this.spriteSheet.frames});
	this.animWalk = this.anim.slice(0,8); //slices 0-7
	this.animJumpUp = this.anim.slice(8,12); //slices 8-11
	this.animJumpDown = this.anim.slice(12,14); //slices 12, 13
	
	this.sprite = new jaws.Sprite({
		x : x,
		y : y,
		anchor : "center",
		scale : 1.0
	});
	this.sprite.setImage(this.animWalk.next());

	/* Movement attributes */
	this.velocityX = 0.0;
	this.velocityY = 0.0;
	this.accelerationX = 0.0;
	this.accelerationY = 0.0
	var jumpHeight = 5;
	var speed = 5;
	var MAX_SPEED = 10;
	
	/* Game logic attributes */
	this.facingLeft = false;
	this.can_fire = false;
	this.jumping  = false;
	this.falling  = false;
	
	this.updateVelocity = function(accelerationComponents, timePassed) {
		
		// no external horizontal force applied
		if(accelerationComponents.x == 0.0) {
			// at this point, we're coasting on our own inertia -
			// update the velocity with acceleration in the opposite direction
			this.velocityX += (-1 * (this.accelerationX * speed) * timePassed);
			
			//TODO:  I NEED TO TEST WHY THE CHECK BELOW NEEDS TO HAPPEN
			// SHOULDN'T I BE TESTING WHEN THE VELOCITY CHANGES SIGN?
			
			// if the velocity changes sign to match the previous acceleration, stop
			if (sign(this.velocityX) == sign(this.accelerationX)) {
				this.velocityX = 0.0;
				this.accelerationX = 0.0;
			}
			
		}
		
		// no external vertical force applied
		if(accelerationComponents.y == 0.0) {
			// at this point, we're coasting on our own inertia -
			// update the velocity with acceleration in the opposite direction
			this.velocityY += (-1 * (this.accelerationY * speed) * timePassed);
			
		}
		
		// if any external force was applied, go ahead and apply it!
		if(accelerationComponents.x != 0.0 || accelerationComponents.y != 0.0) {
			this.velocityX += (this.accelerationX) * timePassed;
			this.velocityX = cap_horizontal_velocity(this.velocityX);
		}
		
		this.accelerationX = accelerationComponents.x;
		this.accelerationY = accelerationComponents.y;
	}	
	
	this.updatePosition = function(timePassed) {
		
	}

	this.update = function() {
		
	}

	this.draw = function() {
		this.sprite.draw();
	}
	
	/**
	 * Returns the sign of the parameter number: -1 if negative, +1 if positive
	 * (0 if the number is 0.)  The function assumes the parameter is a number,
	 * and has undefined behavior if it is not.
	 */
	function sign(number) {
		return (number ? number < 0 ? -1 : 1 : 0);
	}
	
	/**
	 * Caps the input horizontal velocity to the value of MAX_SPEED. 
	 */
	function cap_horizontal_velocity(horizontal_velocity) {
		return (horizontal_velocity > MAX_SPEED ? MAX_SPEED : horizontal_velocity);
	}
}