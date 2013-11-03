/*
 *
 * PlayState is the actual game play. We switch to it once user choses "Start game"
 *
 */
function PlayState() {

	var player;
	var currentStage;
	
	this.setup = function() {
		
		/* Player setup */
		start_x_position = jaws.width/2;
		player = new Person(true, start_x_position, "./assets/art/person1.png");
		
		/* Level setup */
		currentStage = new HallwayStage()
		currentStage.setup(player);

	}

	this.update = function() {
		
		currentStage.update();

	}

	this.draw = function() {
		
		currentStage.draw();
		
	}
}

