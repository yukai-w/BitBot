/**
 * A Battery. 
 */
function Battery(pos) {
	
	this.x = pos.x;
	this.y = pos.y;
	this.drawing_vert_offset = 5;
	this.sprite = new jaws.Sprite({x:pos.x, y:pos.y-this.drawing_vert_offset, scale:1.60, anchor:"center", image:"./assets/art/Battery.png"});
	this.shadowSprite = new jaws.Sprite({
		x : pos.x,
		y : (pos.y + this.drawing_vert_offset),
		anchor : "center_bottom",
		scale : 0.25,
		image : "./assets/art/Shadow.png"
	});
	
	/* Game logic attributes */
	this.level = 10.0;
		
	this.draw = function() {
		this.sprite.draw();
	}
	
	this.rect = function() {
		return this.sprite.rect().resizeTo(8,15);
	}
	
	
}
