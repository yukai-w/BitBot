/*
 *
 * PlayState is the actual game play. We switch to it once user choses "Start game"
 *
 */
function PlayState() {
	
	/* Cookie Loading */
	this.userMaxLevelCompleted = parseInt($.cookie('userMaxLevelCompleted'));
	
	var background_animation = new jaws.Animation({
		sprite_sheet : "./assets/art/BitBotGameLoop-SpriteSheet.png",
		frame_size : [288, 288],
		frame_duration : 300, //ms
		loop : true,
		orientation : 'right'
	});

	var background_sprite = new jaws.Sprite({
		x : 0,
		y : 0,
		scale : 2
	});
	background_sprite.setImage(background_animation.frames[0]);
	var background_overlay = new jaws.Sprite({
		x : 0,
		y : 0,
		color : 'Gray',
		alpha : 0.85,
		width : jaws.width,
		height : jaws.height
	});
	var current_player_level = 0;
	this.currentStage = undefined;

	this.setup = function(level_to_load) {

		/* Level setup */
		current_player_level = level_to_load;
		this.currentStage = generate_stage(current_player_level);
		this.currentStage.setup();
	}

	this.update = function() {

		background_sprite.setImage(background_animation.next());

		var old_player_level = current_player_level;

		if (!this.currentStage.isDone) {

			this.currentStage.update();

		} else {//this.currentStage.isDone
			
			if(this.currentStage.isNarrativeStage) {
				current_player_level++; //auto-advance levels for narratives
			} else {
				//is a Level
				//we must check if the player succeeded; if so, she can continue.
				if(this.currentStage.hasBeenCompletedSuccessfully) {
					current_player_level++;
				} 
			}
			
			//if this is true, the player has advanced a level
			if(old_player_level != current_player_level) {
				
				//if we've gotten farther than ever before,
				if(current_player_level > this.userMaxLevelCompleted) {
					//record that in a cookie...FOR 10 YEARS
					$.cookie('userMaxLevelCompleted', current_player_level, {expires: 365*10});
				}
			}
			
			this.currentStage.destroy();
			this.currentStage = generate_stage(current_player_level);
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

	function load_level(level_number) {
		var load_url = "http://127.0.0.1:8020/game-off-2013/assets/levels/levelXX.json".replace("XX", level_number);
		var level_data = undefined;

		/* Synchronous data loading! */
		$.ajax({
			url : load_url,
			async : false,
			dataType : 'json',
			success : function(data) {
				level_data = data;
			}
		});

		console.log(level_data);
		return level_data;
	}

	function generate_stage(level_number) {
		
		var data = load_level(level_number);
		var new_stage = undefined;
		var is_narrative_stage = data.narrative_level;

		if (is_narrative_stage) {
			
			var music_file = data.music != null ? PlayState.sound_map[data.music] : undefined; 
			
			new_stage = new NarrativeStage({
				dialogue : data.dialogue, 
				background_img_string : data.background_img_string,
				music : music_file
			});
		} else {
			
			var intro_music_file = data.intro_music != null ? PlayState.sound_map[data.intro_music] : undefined;
			var outro_music_file = data.outro_music != null ? PlayState.sound_map[data.outro_music] : undefined;
			var fail_music_file = data.fail_music != null ? PlayState.sound_map[data.fail_music] : undefined;
			var play_music_file = data.play_music != null ? PlayState.sound_map[data.play_music] : undefined;
			
			new_stage = new LevelStage({
				level_data : data.level_data, 
				element_data : data.element_data, 
				intro_dialogue : data.intro_dialogue, 
				outro_dialogue : data.outro_dialogue, 
				retry_dialogue : data.retry_dialogue, 
				fail_dialogue : data.fail_dialogue,
				intro_music : intro_music_file,
				outro_music : outro_music_file,
				fail_music : fail_music_file,
				play_music : play_music_file,
				player_is_retrying : false
			});
		}
		
		return new_stage;
	}
}

PlayState.sound_map = {
	metonymy : new Howl({urls : ['./assets/sounds/music/metonymy.mp3'], loop : true, volume : 0.3}),
	morallyambiguousai : new Howl({urls : ['./assets/sounds/music/morallyambiguousai.mp3'], loop : true, volume : 0.6}),
	gameover : new Howl({urls : ['./assets/sounds/music/gameover.mp3']}),
	success  : new Howl({urls : ['./assets/sounds/fx/success.mp3']})
};

