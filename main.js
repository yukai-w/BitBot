
function init() {
	//Art
	jaws.assets.add("./assets/art/person1.png");

	//Tiles
	jaws.assets.add("./assets/art/Level0Tile.png");
	jaws.assets.add("./assets/art/Level1Tile.png");
	jaws.assets.add("./assets/art/Level2Tile.png");
	jaws.assets.add("./assets/art/Level3Tile.png");
	jaws.assets.add("./assets/art/TileGap.png");
	jaws.assets.add("./assets/art/StartTile.png");
	jaws.assets.add("./assets/art/GoalTile.png");
	
	//Music
	// jaws.assets.add("./assets/sound/crowd.wav");
	jaws.start(MenuState);
	
}
