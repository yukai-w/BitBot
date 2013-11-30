/**
 * A Battery.
 */
function Battery(pos) {

	this.x = pos.x;
	this.y = pos.y;
	this.drawing_vert_offset = 5;
	this.useSfx = new Howl({
		urls : ['./assets/sounds/fx/powerup.mp3', './assets/sounds/fx/powerup.ogg', './assets/sounds/fx/powerup.wav'],
		volume : 0.35
	});
	
	
	/* Sprite attributes*/
	this.sprite = new jaws.Sprite({
		x : pos.x,
		y : pos.y - this.drawing_vert_offset,
		scale : 1.60,
		anchor : "center",
		image : "./assets/art/Battery.png"
	});
	
	//create a collision rect which matches the in-game tile collision system
	this.collisionRect = new jaws.Rect(this.sprite.x-16, this.sprite.y-32, 8, 15);
	
	this.shadowSprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y + 6),
		anchor : "center_bottom",
		scale : 0.35,
		image : "./assets/art/Shadow.png"
	});

	/* Game logic attributes */
	var battery_power = 25.0;

	this.draw = function() {
		this.shadowSprite.draw();
		this.sprite.draw();
	}

	this.rect = function() {
		return this.collisionRect;
	}

	this.use = function() {
		this.useSfx.play();
		return battery_power;
	}
}
