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
		loop : true,
		orientation : 'right'
	});
	
	var selectMenuBGSprite = new jaws.Sprite({x : 0, y : 0, scale : 2});
	selectMenuBGSprite.setImage(background_loop.next());
	
	//This is the level we're going to pass to the PlayState
	var level_to_load = 0;
	
	//Find the max level that has been unlocked by the player.
	var maxLevel = this.userMaxLevelCompleted;
	var levels = new Array(maxLevel);
	for(var level_idx = 0; level_idx <= maxLevel; level_idx++) {
		levels[level_idx] = "Test Protocol "+level_idx;
	}
	
	var menu_select_sfx = new Howl({
		urls : ['./assets/sounds/fx/menuselect.mp3']
	});
	
	jaws.preventDefaultKeys(["down","s","up","w","enter","esc"]);
	
	this.setup = function() {
		
		jaws.on_keydown(["down", "s"], function() {
			level_to_load++;
			if (level_to_load >= levels.length) {
				level_to_load = 0;
			}
		});
		
		jaws.on_keydown(["up", "w"], function() {
			level_to_load--;
			if (level_to_load < 0) {
				level_to_load = levels.length - 1
			}
		});
	}
	
	this.update = function() {
		
		selectMenuBGSprite.setImage(background_loop.next());
		
		/* Input Management */
		if (jaws.pressedWithoutRepeat(["enter"])) {
			
			//sound the confirmation
			menu_select_sfx.play();
			
			//if we're loading from the MenuState, then the title music should still be playing.  
			//this will stop it once we've decided to load a level.
			if(jaws.previous_game_state.titleMusic != undefined && jaws.previous_game_state.titleMusic.pos() != 0) {
				
				var title_music = jaws.previous_game_state.titleMusic;
				
				title_music.fadeOut(0.0, 750, function() {
					title_music.stop();	
				});
			}
			
			//switch to the Play State and give to it the level we want to show
			jaws.switchGameState(PlayState, {fps:60}, level_to_load);
		}
		
		if (jaws.pressedWithoutRepeat("esc")) {
			jaws.switchGameState(jaws.previous_game_state, {fps:60});
		}
	}

	this.draw = function() {
		
		jaws.context.clearRect(0, 0, jaws.width, jaws.height);
		
		selectMenuBGSprite.draw();
		jaws.context.fillStyle = 'Black';
		jaws.context.fillRect(0, jaws.height/6, jaws.width, jaws.height*4/6);
		
		jaws.context.font = "24pt Orbitron";
		jaws.context.fillStyle = 'White';
		wrap_text(jaws.context, "Identify Test", 180, (jaws.height/6)+40, jaws.width*4/6, 30);	
		
		if(levels.length <= 9) {
		
			for (var i = 0; levels[i]; i++) {
	
				jaws.context.font = "16pt Orbitron";
				jaws.context.lineWidth = 16;
				jaws.context.fillStyle = (i == level_to_load) ? "White" : "Gray";
				jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
				jaws.context.fillText(levels[i], 20, 175 + i * (32));
			}
			
		} else {
			
			col1 = levels.slice(0, 10);
			col2 = levels.slice(10,levels.length);
			
			for (var i = 0; col1[i]; i++) {
	
				jaws.context.font = "16pt Orbitron";
				jaws.context.lineWidth = 16;
				jaws.context.fillStyle = (i == level_to_load) ? "White" : "Gray";
				jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
				jaws.context.fillText(col1[i], 20, 175 + i * (32));
			}
			
			for (var i = 0; col2[i]; i++) {

				jaws.context.font = "16pt Orbitron";
				jaws.context.lineWidth = 16;
				jaws.context.fillStyle = ((i+10) == level_to_load) ? "White" : "Gray";
				jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
				jaws.context.fillText(col2[i], 356, 175 + i * (32));
			}
		}
	}
}