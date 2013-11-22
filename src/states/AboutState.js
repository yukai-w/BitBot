/*
 *
 * AboutState is our Credits Stage.
 *
 */
function AboutState() {
	
	this.backgroundOverlaySprite = new jaws.Sprite({
		x : 0,
		y : 0,
		color : 'black',
		alpha : 0.65,
		width : jaws.width,
		height : jaws.height,
	}); 
	
	var team = {
		0 : {
			name : 'Rogelio E. Cardona-Rivera',
			role : 'Game Designer, Programmer',
			twitter : '@recardona',
			site : 'http://rogel.io'
		},
		
		1 : {
			name : 'Jos\xE9 D. V\xE9lez',
			role : 'Game Designer, Artist',
			twitter : '@danivive',
			site : 'http://jdvelez.tumblr.com'	
		}
	};
	
	var about = [];
	

	this.setup = function() {
		
		jaws.on_keydown(["enter", "space", "esc"], function() {
				jaws.switchGameState(jaws.previous_game_state, {
					fps : 60
				})
		});
	}
	
	this.draw = function() {
		
		this.backgroundOverlaySprite.draw();
		jaws.context.fillStyle = "White";
      	
		for (var i = 0; team[i]; i++) {
			jaws.context.font = "20pt VT323";
			jaws.context.lineWidth = 20;
			jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
			jaws.context.fillText(team[i].name, 35, (jaws.height/1.6)+i*110);
			jaws.context.fillText(team[i].role, 35, (jaws.height/1.6 + 25)+i*110);
			jaws.context.fillText(team[i].twitter, 35, (jaws.height/1.6 + 50)+i*110);
			jaws.context.fillText(team[i].site, 35, (jaws.height/1.6 + 75)+i*110);
		}
	}
}