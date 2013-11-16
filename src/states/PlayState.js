/*
 *
 * PlayState is the actual game play. We switch to it once user choses "Start game"
 *
 */
function PlayState() {

	var current_stage;
	var current_background;
	var current_background_idx;
	var do_background_anim;
	var background_sprites;

	this.setup = function() {

		/* Background setup */
		var bg_x_pos = jaws.width/2;
		var bg_y_pos = jaws.height/2;
		
		var bg01 = new jaws.Sprite({x : bg_x_pos, y : bg_y_pos, anchor : "center", image : "./assets/art/LevelBackground01.png"});
		var bg02 = new jaws.Sprite({x : bg_x_pos, y : bg_y_pos, anchor : "center", image : "./assets/art/LevelBackground02.png"});
		var bg03 = new jaws.Sprite({x : bg_x_pos, y : bg_y_pos, anchor : "center", image : "./assets/art/LevelBackground03.png"});
		var bg04 = new jaws.Sprite({x : bg_x_pos, y : bg_y_pos, anchor : "center", image : "./assets/art/LevelBackground04.png"});
		var bg05 = new jaws.Sprite({x : bg_x_pos, y : bg_y_pos, anchor : "center", image : "./assets/art/LevelBackground05.png"});
		var bg06 = new jaws.Sprite({x : bg_x_pos, y : bg_y_pos, anchor : "center", image : "./assets/art/LevelBackground06.png"});
		
		background_sprites = [bg01, bg02, bg03, bg04, bg05, bg06];
		current_background_idx = 0;
		current_background = background_sprites[current_background_idx];
		do_background_anim = true;
								

		/* Level setup */
		current_stage = new LevelStage();
		
	}

	this.update = function() {
	
		if(do_background_anim) {
			
			do_background_anim = false;
			current_background_idx = (current_background_idx + 1) % background_sprites.length;
			current_background = background_sprites[current_background_idx];
			setTimeout(function(){
				do_background_anim = true;
			}, 50); //ms
		}
		
		current_stage.update();
		fps.innerHTML = jaws.game_loop.fps;
	}

	this.draw = function() {

		jaws.context.clearRect(0, 0, jaws.width, jaws.height);
		current_background.draw();
		current_stage.draw();
	}
}

