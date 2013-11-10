
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
	
	
	//Blocks
	jaws.assets.add("./assets/art/StartBlock.png");
	jaws.assets.add("./assets/art/GoalBlock.png");
	jaws.assets.add("./assets/art/Block.png");
	
	
	//Music
	// jaws.assets.add("./assets/sound/crowd.wav");
	jaws.start(MenuState);
	
}
