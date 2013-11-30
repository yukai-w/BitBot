/*
 *
 * MenuState is the TitleScreen.
 *
 */
function MenuState() {
	
	/* Cookie loading */
	this.userHasBeenHereBefore = $.cookie('userHasBeenHereBefore');
	this.userMaxLevelCompleted = $.cookie('userMaxLevelCompleted');
	if(isNaN(this.userMaxLevelCompleted)) {
		this.userMaxLevelCompleted = 0;
	}
	
	
	/* Sprite and Animation attributes */
	var title_intro_animation = new jaws.Animation({
		sprite_sheet : "./assets/art/BitBotTitleIntro-SpriteSheet.png",
		frame_size : [288, 288],
		frame_duration : 300, //ms
		loop : false,
		orientation : 'right'
	});
	
	var title_loop_animation = new jaws.Animation({
		sprite_sheet : "./assets/art/BitBotTitleLoop-SpriteSheet.png",
		frame_size : [288, 288],
		frame_duration : 300, //ms
		loop : true,
		orientation : 'right'
	});
	
	var show_menu = false;
	this.titleMusic = new Howl({
		urls : ['./assets/sounds/music/title.mp3','./assets/sounds/music/title.ogg','./assets/sounds/music/title.wav'],
		loop : true,
		volume : 0.6
	});
	
	this.backgroundSprite = new jaws.Sprite({x : 0, y : 0, scale : 2});
	
	if(this.userHasBeenHereBefore) {
		this.backgroundSprite.setImage(title_loop_animation.frames[0]);
		title_intro_animation.index = title_intro_animation.frames.length-1;
		$.cookie('userHasBeenHereBefore', 'true', { expires: 7 }); //register user for 7 more days
		
	} else {
		this.backgroundSprite.setImage(title_intro_animation.frames[0]);
		$.cookie('userHasBeenHereBefore', 'true', { expires: 7 }); //register user for 7 days
	}
	
	var index = 0;
	var items = this.userMaxLevelCompleted > 0  ? ["Load Game", "New Game", "About"] : ["New Game", "About"]
	var menu_select_sfx = new Howl({
		urls : ['./assets/sounds/fx/menuselect.mp3', './assets/sounds/fx/menuselect.ogg', './assets/sounds/fx/menuselect.wav']
	});
	
	jaws.preventDefaultKeys(["down","s","up","w","enter"]);
	
	this.setup = function() {
		
		jaws.on_keydown(["down", "s"], function() {
			index++;
			if (index >= items.length) {
				index = items.length - 1
			}
		});
		
		jaws.on_keydown(["up", "w"], function() {
			index--;
			if (index < 0) {
				index = 0
			}
		});
		
		if(this.titleMusic.pos() == 0) {
			this.titleMusic.play();
		}
	}
	
	this.update = function() {
		
		/* Input Management */
		if (jaws.pressedWithoutRepeat(["enter"]) && show_menu) {
			//only accept input when the menu is being shown
			
			//sound the confirmation
			menu_select_sfx.play();
			
			if(items[index] == "New Game") {
				if(this.userMaxLevelCompleted > 0) {
					var doDelete = confirm("Selecting New Game will erase all your saved progress. Are you sure you want to start over?");
					if(doDelete) {
						$.removeCookie('userMaxLevelCompleted');
						jaws.switchGameState(PlayState, {fps:60}, 0); //load level 0 for the first time playing
						if(this.titleMusic.pos() != 0) {
							this.titleMusic.stop();
						}
					}
				} else {
					jaws.switchGameState(PlayState, {fps:60}, 0); //load level 0 for the first time playing
					if(this.titleMusic.pos() != 0) {
						this.titleMusic.stop();
					}
				}
				
			}
			
			else if(items[index] == "Load Game") {
				
				jaws.switchGameState(LevelSelectState, {fps:60});
				
			} else {//switch to About State
				jaws.switchGameState(AboutState, {fps:60});
			}
		}
		
		/* Background Updates */
		if(title_intro_animation.atLastFrame()) {
			this.backgroundSprite.setImage(title_loop_animation.next());
		} else {
			this.backgroundSprite.setImage(title_intro_animation.next());
		}
		
		if(title_loop_animation.atLastFrame()) {
			show_menu = true;
		}
		
	}

	this.draw = function() {
		
		jaws.clear();
		
		this.backgroundSprite.draw();

		if(show_menu) {
			jaws.context.fillStyle = 'Black';
			if(this.userMaxLevelCompleted > 0) {
				jaws.context.fillRect(0, jaws.height/1.5, jaws.width, 125);
			} else {
				jaws.context.fillRect(0, jaws.height/1.5, jaws.width, 90);
			}
	      	
			for (var i = 0; items[i]; i++) {
	
				jaws.context.font = "24pt Orbitron";
				jaws.context.lineWidth = 12;
				jaws.context.fillStyle = (i == index) ? "White" : "Gray";
				jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
				jaws.context.fillText(items[i], 200, 420 + i * (36));
			}
		}
	}
}