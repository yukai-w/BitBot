/*
 *
 * MenuState is our lobby/welcome menu were gamer can chose start, high score and settings.
 * For this example we have only implemented start. Start switches active game state by simply:
 *   jaws.switchGameState(play)   (jaws.switchGameState(PlayState) would have worked too)
 *
 */
function MenuState() {
	
	/* Cookie loading */
	this.userHasBeenHereBefore = $.cookie('userHasBeenHereBefore');
	this.userMaxLevelCompleted = $.cookie('userMaxLevelCompleted');
	
	
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
	jaws.preventDefaultKeys(["down","s","up","w","enter"]);
	
	this.setup = function() {
		
		jaws.on_keydown(["down", "s"], function() {
			index++;
			if (index >= items.length) {
				index = items.length - 1
			}
		})
		
		jaws.on_keydown(["up", "w"], function() {
			index--;
			if (index < 0) {
				index = 0
			}
		})
		
		jaws.on_keydown(["enter", "space"], function() {
			if (items[index] == "New Game") {
				jaws.switchGameState(PlayState, {
					fps : 60
				});
			} else {
				jaws.switchGameState(AboutState, {
					fps : 60
				});
			}
		})
	}
	
	this.update = function() {
		
		/* Input Management */
		if (jaws.pressedWithoutRepeat(["enter", "space"])) {
			
			if(items[index] == "New Game") {
				if(this.userMaxLevelCompleted > 0) {
					var doDelete = confirm("Selecting New Game will erase all your saved progress. Are you sure you want to start over?");
					if(doDelete) {
						$.removeCookie('userMaxLevelCompleted');
					}
				}
				jaws.switchGameState(PlayState, {fps:60});
			}
			
			else if(items[index] == "Load Game") {
				//do something
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
		
		jaws.context.clearRect(0, 0, jaws.width, jaws.height)
		
		this.backgroundSprite.draw();

		if(show_menu || this.userHasBeenHereBefore) {
			jaws.context.fillStyle = 'Black';
			if(this.userMaxLevelCompleted > 0) {
				jaws.context.rect(0, jaws.height/1.5, jaws.width, 125);	
			} else {
				jaws.context.rect(0, jaws.height/1.5, jaws.width, 90);
			}
			jaws.context.fill();
	      	
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