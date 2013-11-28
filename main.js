
function init() {
	////Art
	
	//Background
	jaws.assets.add("./assets/art/BitBotTitleIntro-SpriteSheet.png");
	jaws.assets.add("./assets/art/BitBotTitleLoop-SpriteSheet.png");
	jaws.assets.add("./assets/art/BitBotGameLoop-SpriteSheet.png");


	//Tiles
	jaws.assets.add("./assets/art/Tile.png");
	jaws.assets.add("./assets/art/TileBottom.png");
	jaws.assets.add("./assets/art/ObstacleTile.png");
	jaws.assets.add("./assets/art/StartTile.png");
	jaws.assets.add("./assets/art/StartTileBottom.png");
	jaws.assets.add("./assets/art/GoalTile.png");
	jaws.assets.add("./assets/art/GoalTileBottom.png");
	
	
	//Robots
	jaws.assets.add("./assets/art/BlueBitBot-SpriteSheet.png");
	jaws.assets.add("./assets/art/GrayBitBot-SpriteSheet.png");
	jaws.assets.add("./assets/art/Shadow.png");
	
	//Other Sprites
	jaws.assets.add("./assets/art/Jose.png");
	jaws.assets.add("./assets/art/Rogelio.png");
	jaws.assets.add("./assets/art/Ian.png");
	
	
	//HUD
	jaws.assets.add("./assets/art/DialogueBox.png");
	jaws.assets.add("./assets/art/DialogueBoxNextArrow.png");
	jaws.assets.add("./assets/art/PortraitMasterController.png");
	jaws.assets.add("./assets/art/PortraitFriedman.png");
	jaws.assets.add("./assets/art/CommandPrompt.png");
	jaws.assets.add("./assets/art/ArrowDown.png");
	jaws.assets.add("./assets/art/ArrowLeft.png");
	jaws.assets.add("./assets/art/ArrowRight.png");
	jaws.assets.add("./assets/art/ArrowUp.png");
	jaws.assets.add("./assets/art/MeterBar.png");
	jaws.assets.add("./assets/art/Battery.png");
	jaws.assets.add("./assets/art/BatteryIndicator.png");
	
	
	////Sounds
	
	//Music
	jaws.assets.add("./assets/sounds/music/metonymy.mp3");
	jaws.assets.add("./assets/sounds/music/gameover.mp3");
	jaws.assets.add("./assets/sounds/music/morallyambiguousai.mp3");
	jaws.assets.add("./assets/sounds/music/title.mp3");
	jaws.assets.add("./assets/sounds/music/intro.mp3");
	
	
	//Fx
	jaws.assets.add("./assets/sounds/fx/success.mp3");
	jaws.assets.add("./assets/sounds/fx/error.mp3");
	jaws.assets.add("./assets/sounds/fx/fall.mp3");
	jaws.assets.add("./assets/sounds/fx/powerup.mp3");
	jaws.assets.add("./assets/sounds/fx/respawn.mp3");
	jaws.assets.add("./assets/sounds/fx/move.mp3");
	jaws.assets.add("./assets/sounds/fx/reboot.mp3");
	jaws.assets.add("./assets/sounds/fx/next.mp3");
	jaws.assets.add("./assets/sounds/fx/menuselect.mp3");
	
	
	jaws.start(MenuState);
	
}
