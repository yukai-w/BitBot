
function init() {
	////Art
	jaws.assets.add("./assets/art/BitBotSpriteSheet.png");
	jaws.assets.add("./assets/art/BitBotTrainer-DreyfusClassSpriteSheet.png");

	//Background
	jaws.assets.add("./assets/art/LevelBackground01.png");
	jaws.assets.add("./assets/art/LevelBackground02.png");
	jaws.assets.add("./assets/art/LevelBackground03.png");
	jaws.assets.add("./assets/art/LevelBackground04.png");
	jaws.assets.add("./assets/art/LevelBackground05.png");
	jaws.assets.add("./assets/art/LevelBackground06.png");
	

	//Tiles
	jaws.assets.add("./assets/art/Tile.png");
	jaws.assets.add("./assets/art/ObstacleTile.png");
	jaws.assets.add("./assets/art/StartTile.png");
	jaws.assets.add("./assets/art/GoalTile.png");
	
	//Robots
	jaws.assets.add("./assets/art/BitBot.png");
	jaws.assets.add("./assets/art/SmallBitBot.png");
	jaws.assets.add("./assets/art/BitBotTrainer-DreyfusClass.png");
	
	
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
	jaws.assets.add("./assets/sounds/music/metonymy.mp3");
	jaws.assets.add("./assets/sounds/music/gameover.mp3");
	jaws.assets.add("./assets/sounds/fx/error.mp3");
	jaws.assets.add("./assets/sounds/fx/fall.mp3");
	jaws.assets.add("./assets/sounds/fx/powerup.mp3");
	
	jaws.start(MenuState);
	
}
