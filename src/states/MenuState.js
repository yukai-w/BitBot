/*
 *
 * MenuState is our lobby/welcome menu were gamer can chose start, high score and settings.
 * For this example we have only implemented start. Start switches active game state by simply:
 *   jaws.switchGameState(play)   (jaws.switchGameState(PlayState) would have worked too)
 *
 */
function MenuState() {
	this.userHasBeenHereBefore = false; //this will be set by cookies later
	
	/* Sprite and Animation attributes */
	var title_intro_animation = new jaws.Animation({
		sprite_sheet : "./assets/art/BitBotTitleIntro-SpriteSheet.png",
		frame_size : [288, 288],
		frame_duration : 50, //ms
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
	
	this.sprite = new jaws.Sprite({x : 0, y : 0, scale : 2});
	
	if(this.userHasBeenHereBefore) {
		this.sprite.setImage(title_intro_animation.frames[0]);
	} else {
		this.sprite.setImage(title_loop_animation.frames[0]);
	}
	
	var index = 0
	var items = ["Start", "About"]

	this.setup = function() {
		
		index = 0
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
			if (items[index] == "Start") {
				jaws.switchGameState(PlayState, {
					fps : 60
				})
			}
		})
	}
	
	this.update = function() {
		
		if(title_intro_animation.atLastFrame()) {
			this.sprite.setImage(title_loop_animation.next());
		} else {
			this.sprite.setImage(title_intro_animation.next());
		}
		
	}

	this.draw = function() {
		
		jaws.context.clearRect(0, 0, jaws.width, jaws.height)
		
		this.sprite.draw();
		
		jaws.context.fillStyle = 'Black';
		jaws.context.rect(175, jaws.height/1.5, 225, 150);
		jaws.context.fill();
      	
		for (var i = 0; items[i]; i++) {

			jaws.context.font = "60pt VT323";
			jaws.context.lineWidth = 25
			jaws.context.fillStyle = (i == index) ? "White" : "Gray"
			jaws.context.strokeStyle = "rgba(200,200,200,0.0)"
			jaws.context.fillText(items[i], 205, jaws.height / 1.3 + i * (75))
		}
	}
}