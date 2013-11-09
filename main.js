
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
	jaws.assets.add("./assets/art/Level0Tile.png");
	jaws.assets.add("./assets/art/Level1Tile.png");
	jaws.assets.add("./assets/art/Level2Tile.png");
	jaws.assets.add("./assets/art/Level3Tile.png");
	jaws.assets.add("./assets/art/TileGap.png");
	jaws.assets.add("./assets/art/StartTile.png");
	jaws.assets.add("./assets/art/GoalTile.png");
	jaws.assets.add("./assets/art/Level1TileLadderD.png");
	jaws.assets.add("./assets/art/Level1TileLadderR.png");
	jaws.assets.add("./assets/art/Level2TileLadderD.png");
	jaws.assets.add("./assets/art/Level2TileLadderR.png");
	jaws.assets.add("./assets/art/Level3TileLadderD.png");
	jaws.assets.add("./assets/art/Level3TileLadderR.png");
	
	
	//Blocks
	jaws.assets.add("./assets/art/StartBlock.png");
	jaws.assets.add("./assets/art/GoalBlock.png");
	jaws.assets.add("./assets/art/Block.png");
	jaws.assets.add("./assets/art/LadderLeftBlock.png");
	jaws.assets.add("./assets/art/LadderRightBlock.png");
	
	
	//Music
	// jaws.assets.add("./assets/sound/crowd.wav");
	jaws.start(MenuState);
	
}
