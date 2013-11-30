/*
 *
 * PlayState is the actual game play. We switch to it once user choses "Start game"
 *
 */
function PlayState() {

	/* Cookie Loading */
	this.userMaxLevelCompleted = parseInt($.cookie('userMaxLevelCompleted'));
	if (isNaN(this.userMaxLevelCompleted)) {
		this.userMaxLevelCompleted = 0;
	}

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

	var pause_overlay = new jaws.Sprite({
		x : 0,
		y : 0,
		color : 'Black',
		alpha : 0.75,
		width : jaws.width,
		height : jaws.height
	});

	var current_player_level = 0;
	this.currentStage = undefined;
	this.isPaused = false;

	var index = 0;
	var items = this.userMaxLevelCompleted > 0 ? ["Continue", "Restart", "Test Selection Screen", "Quit"] : ["Continue", "Restart", "Quit"];
	var menu_select_sfx = new Howl({
		urls : ['./assets/sounds/fx/menuselect.mp3']
	});
	
	
	var max_levels = 19;

	this.setup = function(level_to_load) {

		/* Level setup */
		current_player_level = level_to_load;
		this.currentStage = generate_stage(current_player_level);
		this.currentStage.setup();
		
		//if the user navigates to another window, pause the game
		var that = this;
		window.onblur = function() {
			that.isPaused = true;
		}
	}

	this.update = function() {

		items = this.userMaxLevelCompleted > 0 ? ["Continue", "Restart", "Test Selection Screen", "Quit"] : ["Continue", "Restart", "Quit"];
		background_sprite.setImage(background_animation.next());

		if (jaws.pressedWithoutRepeat("esc")) {
			this.isPaused = !this.isPaused;
		}

		if (!this.isPaused) {

			if (!this.currentStage.isDone) {

				this.currentStage.update();

			} else {//this.currentStage.isDone

				var old_player_level = current_player_level;

				if (this.currentStage.isNarrativeStage) {
					current_player_level++;
					//auto-advance levels for narratives
				} else {
					//is a Level
					//we must check if the player succeeded; if so, she can continue.
					if (this.currentStage.hasBeenCompletedSuccessfully) {
						current_player_level++;
					}
				}

				var is_retrying = true;
				//if this is true, the player has advanced a level
				if (old_player_level != current_player_level) {
					
					is_retrying = false;

					//if we've gotten farther than ever before,
					if (current_player_level > this.userMaxLevelCompleted && current_player_level != 20) {
						//record that in a cookie...FOR 10 YEARS
						$.cookie('userMaxLevelCompleted', current_player_level, {
							expires : 365 * 10
						});
					}
				}
				
				this.currentStage.destroy();
				
				if(current_player_level != 20) {
					this.currentStage = generate_stage(current_player_level, is_retrying);
					this.currentStage.setup();
				} else {
					jaws.switchGameState(MenuState);
				}
				
				
				
					
			}
		} else {//we're in the pause menu!

			if (jaws.pressedWithoutRepeat(["down", "s"])) {
				index++;
				if (index >= items.length) {
					index = items.length - 1;
				}
			}

			if (jaws.pressedWithoutRepeat(["up", "w"])) {
				index--;
				if (index < 0) {
					index = 0
				}
			}

			if (jaws.pressedWithoutRepeat(["enter"])) {

				//sound the confirmation				
				menu_select_sfx.play();

				if (items[index] == "Test Selection Screen") {
					stop_all_music();
					jaws.switchGameState(LevelSelectState, {
						fps : 60
					});
					//load level 0 for the first time playing
				} else if (items[index] == "Restart") {
					//restart myself!
					stop_all_music();
					jaws.switchGameState(PlayState, {
						fps : 60
					}, current_player_level);

				} else if (items[index] == "Continue") {
					this.isPaused = !this.isPaused; //unpause
					
				} else {//switch to Menu State
					stop_all_music();
					jaws.switchGameState(MenuState, {
						fps : 60
					});
				}
			}
		}

		// fps.innerHTML = jaws.game_loop.fps;
	}

	this.draw = function() {

		jaws.context.clearRect(0, 0, jaws.width, jaws.height);
		
		if (this.isPaused) {
			pause_overlay.draw();

			jaws.context.font = "24pt Orbitron";
			jaws.context.fillStyle = 'White';
			wrap_text(jaws.context, "Paused", 220, jaws.height / 2, 350, 30);

			for (var i = 0; items[i]; i++) {

				jaws.context.font = "24pt Orbitron";
				jaws.context.lineWidth = 12;
				jaws.context.fillStyle = (i == index) ? "White" : "Gray";
				jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
				jaws.context.fillText(items[i], 100, 350 + i * (36));
			}
		}
		
		else {
			background_sprite.draw();
			background_overlay.draw();
			this.currentStage.draw();
		}
	}
	/**
	 * Stops all the music that could possibly be playing.
	 */
	function stop_all_music() {
		$.each(PlayState.sound_map, function(key, val) {
			val.stop();
		});
	}

	/**
	 * Loads the level information from a JSON file identified by the parameter.
	 * Makes a synchronous jQuery call, so this method could take a while.
	 * 	You have been warned!
	 * @param {Number} level_number the level to load. Assumed to exist as
	 * 	./assets/levels/level(level_number).json
	 */
	function load_level(level_number) {
		var load_url = "http://127.0.0.1:8020/game-off-2013/assets/levels/levelXX.json".replace("XX", level_number);
		// var load_url = "http://rogel.io/projects/assets/levels/levelXX.json".replace("XX", level_number);
		// var load_url = "http://recardona.github.io/BitBot/assets/levels/levelXX.json".replace("XX", level_number);
		
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

		return level_data;
	}

	/**
	 * Generates the Stage given by the level number.  The stage could be either a
	 * NarrativeStage (see NarrativeStage.js) or a LevelStage (see LevelStage.js)
	 * @param {Number} level_number the number that identifies the JSON file containing
	 * 	the level information (see load_level(level_number))
	 */
	function generate_stage(level_number, retrying) {

		var data = load_level(level_number);
		var new_stage = undefined;
		var is_narrative_stage = data.narrative_level;
		var is_retrying = retrying || false;

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
				player_is_retrying : is_retrying,
				battery : data.battery
			});
		}

		return new_stage;
	}

}

/**
 * A map of all the sounds that are relevant for the PlayState.
 */
PlayState.sound_map = {
	intro : new Howl({
		urls : ['./assets/sounds/music/intro.mp3', './assets/sounds/music/intro.ogg', './assets/sounds/music/intro.wav'],
		loop : true,
		volume : 0.05
	}),
	
	metonymy : new Howl({
		urls : ['./assets/sounds/music/metonymy.mp3', './assets/sounds/music/metonymy.ogg', './assets/sounds/music/metonymy.wav'],
		loop : true,
		volume : 0.6
	}),
	
	morallyambiguousai : new Howl({
		urls : ['./assets/sounds/music/morallyambiguousai.mp3', './assets/sounds/music/morallyambiguousai.ogg', './assets/sounds/music/morallyambiguousai.wav'],
		loop : true,
		volume : 0.6
	}),
	
	gameover : new Howl({
		urls : ['./assets/sounds/music/gameover.mp3', './assets/sounds/music/gameover.ogg', './assets/sounds/music/gameover.wav'],
		volume : 0.6
	}),
	
	victory : new Howl({
		urls : ['./assets/sounds/music/victory.mp3', './assets/sounds/music/victory.ogg', './assets/sounds/music/victory.wav'],
		volume : 0.6
	}),
	
	success : new Howl({
		urls : ['./assets/sounds/fx/success.mp3', './assets/sounds/fx/success.ogg', './assets/sounds/fx/success.wav'],
		volume : 0.6
	}),
	
	title : new Howl({
		urls : ['./assets/sounds/music/title.mp3', './assets/sounds/music/title.ogg', './assets/sounds/music/title.wav'],
		volume : 0.6
	})
	
};

