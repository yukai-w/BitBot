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
		y : (pos.y + 6),
		anchor : "center_bottom",
		scale : 0.35,
		image : "./assets/art/Shadow.png"
	});
	
	/* Game logic attributes */
	this.level = 25.0;
		
	this.draw = function() {
		this.shadowSprite.draw();
		this.sprite.draw();
	}
	
	this.rect = function() {
		return this.sprite.rect().resizeTo(8,15);
	}
	
	
}
