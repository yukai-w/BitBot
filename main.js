
function init() {
	////Art
	jaws.assets.add("./assets/art/person1.png");

	//Background
	jaws.assets.add("./assets/art/LevelBackground01.png");
	jaws.assets.add("./assets/art/LevelBackground02.png");
	jaws.assets.add("./assets/art/LevelBackground03.png");
	jaws.assets.add("./assets/art/LevelBackground04.png");
	jaws.assets.add("./assets/art/LevelBackground05.png");
	jaws.assets.add("./assets/art/LevelBackground06.png");
	

	//Tiles
	jaws.assets.add("./assets/art/Tile.png");
	jaws.assets.add("./assets/art/TileGap.png");
	jaws.assets.add("./assets/art/StartTile.png");
	jaws.assets.add("./assets/art/GoalTile.png");
	
	//Robots
	jaws.assets.add("./assets/art/Robot.png");
	jaws.assets.add("./assets/art/TileRobot.png");
	
	//HUD
	jaws.assets.add("./assets/art/CommandPrompt.png");
	jaws.assets.add("./assets/art/ArrowDown.png");
	jaws.assets.add("./assets/art/ArrowLeft.png");
	jaws.assets.add("./assets/art/ArrowRight.png");
	jaws.assets.add("./assets/art/ArrowUp.png");
	jaws.assets.add("./assets/art/Battery.png");
	jaws.assets.add("./assets/art/MeterBar.png");
	jaws.assets.add("./assets/art/BatteryIndicator.png");
	
	
	////Music
	// jaws.assets.add("./assets/sound/crowd.wav");
	jaws.start(MenuState);
	
}
