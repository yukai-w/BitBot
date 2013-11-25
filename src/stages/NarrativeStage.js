/*
 * The NarrativeStage.
 */
function NarrativeStage() {

	/* Game logic attributes */
	this.isPlaying = true;
	this.isDone = false;

	/* Level initialization */
	var dialogue;
	var background_img_string;

	/* Synchronous data loading! */
	$.ajax({
		url : 'http://localhost/game-off-2013/assets/levels/level0.json',
		async : false,
		dataType : 'json',
		success : function(data) {
			dialogue = data.dialogue;
			background_img_string = data.background_img_string;
		}
	});

	this.dialogueSequence = new DialogueSequence();
	this.backgroundSprite = undefined;

	if (background_img_string != null) {
		this.backgroundSprite = new jaws.Sprite({
			x : 0,
			y : 0,
			image : background_img_string
		})
	} else {

		this.backgroundSprite = new jaws.Sprite({
			x : 0,
			y : 0,
			width : jaws.width,
			height : jaws.height,
			color : 'black'
		})
	}

	this.setup = function() {
		//queue up the narrative
		var that = this;
		$.each(dialogue, function(index, dialogue_beat) {
			$.each(dialogue_beat, function(speaker, text) {
				// console.log(speaker +": "+text)
				that.dialogueSequence.enqueueDialogueBeat(speaker, text);
			});
		});

		this.dialogueSequence.start();

	}

	this.update = function() {

		if (this.isPlaying) {
			this.dialogueSequence.update();

			if (this.dialogueSequence.isFinished) {
				this.setMode('done');
			}
		}
	}

	this.draw = function() {

		jaws.clear();

		this.backgroundSprite.draw();

		if (this.isPlaying) {
			this.dialogueSequence.draw();
		}
	}
	/**
	 * This function is meant to be called once when the NarrativeStage has concluded,
	 * and a new Stage will be loaded.  All code cleanup should be done here.
	 */
	this.destroy = function() {
		delete this.backgroundSprite;
		delete this.dialogueSequence;
		delete this.isPlaying;
		delete this.isDone;
	}

	this.setMode = function(mode) {
		this.isPlaying = false;
		this.isDone = false;

		if (mode == "playing") {
			this.isPlaying = true;
		} else {//done
			this.isDone = true;
		}
	}
}

