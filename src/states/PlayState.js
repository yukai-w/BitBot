/*
 *
 * PlayState is the actual game play. We switch to it once user choses "Start game"
 *
 */
function PlayState() {

	var background_animation = new jaws.Animation({
		sprite_sheet : "./assets/art/BitBotTitleLoop-SpriteSheet.png",
		frame_size : [288, 288],
		frame_duration : 300, //ms
		loop : true,
		orientation : 'right'
	});
	
	var background_sprite = new jaws.Sprite({x : 0, y : 0, scale : 2});
	background_sprite.setImage(background_animation.frames[0]);
	var background_overlay = new jaws.Sprite({x : 0, y : 0, color : 'Gray', alpha : 0.85, width : jaws.width, height : jaws.height});
	this.currentStage = undefined;
	

	this.setup = function() {

		/* Level setup */
		this.currentStage = new NarrativeStage();
		this.currentStage.setup();
		
	}

	this.update = function() {
	
		background_sprite.setImage(background_animation.next());
		
		if(! this.currentStage.isDone) {
	
			this.currentStage.update();	
				
		} else {//this.currentStage.isDone
			this.currentStage.destroy();
			this.currentStage = new LevelStage();
			this.currentStage.setup();
		}
		
		fps.innerHTML = jaws.game_loop.fps;
	}

	this.draw = function() {

		jaws.context.clearRect(0, 0, jaws.width, jaws.height);
		background_sprite.draw();
		background_overlay.draw();
		this.currentStage.draw();
	}
}

