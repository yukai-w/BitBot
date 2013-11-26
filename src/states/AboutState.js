/*
 *
 * AboutState is our Credits.
 *
 */
function AboutState() {
	
	var background_overlay;
	var rogelio_info;
	var rogelio_sprite;
	var jose_info;
	var jose_sprite;
	var ian_info;
	var ian_sprite;
	var about_string;
	var team_heading;
	var contributor_heading;
	var title_screen_frame;
	
	jaws.preventDefaultKeys(["esc"]);

	this.setup = function() {
		
		//grab the last frame from the title screen
		title_screen_frame = jaws.previous_game_state.backgroundSprite;
		background_overlay = new jaws.Sprite({x : 0, y : 0, color : 'Gray', alpha : 0.85, width : jaws.width, height : jaws.height});
	
		rogelio_info = {name : 'Rogelio E. Cardona-Rivera', role : 'Game Designer, Programmer', twitter : '@recardona', site : 'http://rogel.io'}; 
		rogelio_sprite = new jaws.Sprite({x : 100, y : jaws.height*3.2/10, image : "./assets/art/Rogelio.png", scale : 3.5});
	
		jose_info = {name : 'Jos\xE9 D. V\xE9lez', role : 'Game Designer, Artist', twitter : '@danivive', site : 'http://jdvelez.tumblr.com'};
		jose_sprite = new jaws.Sprite({x : 365, y : jaws.height*5.2/10, image : "./assets/art/Jose.png", scale : 3.5});
	
		ian_info = {name : 'Ian Coleman', role : 'Level Editor, Programmer', twitter : '@iancoleman', site : 'http://www.ianpcoleman.com'};
		ian_sprite = new jaws.Sprite({x : 100, y : jaws.height*8/10, image : "./assets/art/Ian.png", scale : 3.5});
	
		about_string = "BitBot is an HTML5/JS game built as part of the 2013 Github Game Jam." + 
			"For more information about this game, including licensing, please visit: http://github.com/recardona/game-off-2013";
		team_heading = "BitBot was built by: ";
		contributor_heading = "Special Thanks to: ";
	}
	
	this.update = function() {
		if(jaws.pressedWithoutRepeat("esc")) {
			jaws.switchGameState(jaws.previous_game_state, {fps : 60});
		}
	}
	
	this.draw = function() {
		
		jaws.clear();

		title_screen_frame.draw();		
		background_overlay.draw();
		jaws.context.font = "14pt Orbitron";
		
				
		jaws.context.fillStyle = "White";
		wrap_text(jaws.context, about_string, 30, jaws.height/10, jaws.width-30, 25);
		
		jaws.context.fillStyle = "Black";
		wrap_text(jaws.context, team_heading, 30, jaws.height*3/10, jaws.width-30, 20);
		
		jaws.context.fillStyle = "White";
		print_person_map(255, jaws.height*3.7/10, rogelio_info);
		rogelio_sprite.draw();
		
		print_person_map(35, jaws.height*5.7/10, jose_info);
		jose_sprite.draw();
		
		jaws.context.fillStyle = "Black";
		wrap_text(jaws.context, contributor_heading, 30, jaws.height*7.8/10, jaws.width-30, 20);
		
		jaws.context.fillStyle = "White";	
		print_person_map(255, jaws.height*8.5/10, ian_info);
		ian_sprite.draw();
	}
	
	/**
	 * Auxiliary function to print the elements of a person map. 
 	 * @param {Object} start_x_pos the starting x position for the first element of the map
 	 * @param {Object} start_y_pos the starting y position for the first element of the map
	 * @param {Object} person_map a map, with person information
	 */
	function print_person_map(start_x_pos, start_y_pos, person_map) {
		jaws.context.lineWidth = 20;
		jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
		jaws.context.fillText(person_map.name, start_x_pos, (start_y_pos));
		jaws.context.fillText(person_map.role, start_x_pos, (start_y_pos + 25));
		jaws.context.fillText(person_map.twitter, start_x_pos, (start_y_pos + 50));
		jaws.context.fillText(person_map.site, start_x_pos, (start_y_pos + 75));
	}
	
}