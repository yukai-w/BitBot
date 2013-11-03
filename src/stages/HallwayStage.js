/*
 * The HallwayStage is the main foyer of social interaction.
 */
function HallwayStage() {

	var player;
	var background;
	var backgroundFx;
	var crowd = new jaws.SpriteList();
	
	this.setup = function(playerReference) {

		// Background setup.
		background = new jaws.Sprite({x: jaws.width/2, y: jaws.height/2, anchor: "center", image:"./assets/art/hotel.png"});
		
		// Music setup.
		backgroundFx = new Howl({urls:['./assets/sound/crowd.wav']});
		backgroundFx.play();
		
		// Crowd setup.
		crowd = setup_crowd();
				
		// Player setup.
		player = playerReference;
		
		// To quit, press 'esc'
		jaws.on_keydown("esc", function() {
			jaws.switchGameState(MenuState);
		});

		// Prevent the browser from catching the following keys:
		jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
	}

	this.update = function() {
		
		player.update();
		crowd.update();

		// delete items for which isOutsideCanvas(item) is true
		fps.innerHTML = jaws.game_loop.fps;
	}

	this.draw = function() {
		jaws.context.clearRect(0, 0, jaws.width, jaws.height);
		background.draw();
		player.draw();
		crowd.draw();
		// will call draw() on all items in the list
	}
	
	function setup_crowd() {
		
		// List of crowd sprites
		var temp_crowd = new jaws.SpriteList();
		
		// Temp player reference
		var temp_player;
		
		// Decide on a random number between 5 and 10
		var crowd_size = 50;
		
		// For the total number of people,
		for (var person_count = 0; person_count < crowd_size; person_count++) {			
			// calculate an x,
			var x_pos = (jaws.width/2) + (random_sign() * get_random_number(1,300));
			var random_image_URI = "./assets/art/personFOO.png".replace("FOO", get_random_number(1,9));			
			
			temp_player = new Person(false, x_pos, random_image_URI);
			temp_crowd.push(temp_player);
					  
		}
		
		return temp_crowd;
	}

}

