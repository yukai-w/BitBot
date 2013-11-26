/*
 * LevelSelectState.
 *
 */
function LevelSelectState() {
	
	/* Cookie loading */
	this.userMaxLevelCompleted = parseInt($.cookie('userMaxLevelCompleted'));
	
	/* Sprite and Animation attributes */
	var background_loop = new jaws.Animation({
		sprite_sheet : "./assets/art/BitBotGameLoop-SpriteSheet.png",
		frame_size : [288, 288],
		frame_duration : 300, //ms
		loop : false,
		orientation : 'right'
	});
	
	this.backgroundSprite = new jaws.Sprite({x : 0, y : 0, scale : 2});
	this.backgroundSprite.setImage(background_loop.next());
	
	//This is the level we're going to pass to the PlayState
	var level_to_load = 0;
	
	//Find the max level that has been unlocked by the player.
	var maxLevel = this.userMaxLevelCompleted;
	var levels = new Array(maxLevel+2); //we show levels 0 to maxLevel+1, which is maxLevel+2
	for(var level_idx = 0; level_idx <= maxLevel; level_idx++) {
		levels[level_idx] = "Test Protocol "+level_idx;
	}
	
	jaws.preventDefaultKeys(["down","s","up","w","enter","esc"]);
	
	this.setup = function() {
		
		jaws.on_keydown(["down", "s"], function() {
			level_to_load++;
			if (level_to_load >= levels.length) {
				level_to_load = levels.length - 1
			}
		});
		
		jaws.on_keydown(["up", "w"], function() {
			level_to_load--;
			if (level_to_load < 0) {
				level_to_load = 0
			}
		});
	}
	
	this.update = function() {
		
		/* Input Management */
		if (jaws.pressedWithoutRepeat(["enter", "space"])) {
			//switch to the Play State and give to it the level we want to show
			jaws.switchGameState(PlayState, {fps:60}, level_to_load);
		}
		
		if (jaws.pressedWithoutRepeat("esc")) {
			jaws.switchGameState(jaws.previous_game_state);
		}
		
		this.backgroundSprite.setImage(background_loop.next());
	}

	this.draw = function() {
		
		jaws.context.clearRect(0, 0, jaws.width, jaws.height)
		
		this.backgroundSprite.draw();
		jaws.context.fillStyle = 'Black';
		jaws.context.rect(0, jaws.height/6, jaws.width, jaws.height*4/6);	
		jaws.context.fill();
      	
		for (var i = 0; levels[i]; i++) {

			jaws.context.font = "16pt Orbitron";
			jaws.context.lineWidth = 16;
			jaws.context.fillStyle = (i == level_to_load) ? "White" : "Gray";
			jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
			jaws.context.fillText(levels[i], 20, 135 + i * (32));
		}
	}
}