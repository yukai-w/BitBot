/*
 * The NarrativeStage.
 */
function NarrativeStage(options) {

	/* Game logic attributes */
	this.isPlaying = true;
	this.isDone = false;
	this.isNarrativeStage = true;

	/* Level initialization */
	var dialogue = options.dialogue;
	var background_img_string = options.background_img_string;
	var music = options.music;

	this.dialogueSequence = new DialogueSequence();
	this.backgroundSprite = undefined;

	if (background_img_string != null) {
		this.backgroundSprite = new jaws.Sprite({
			x : 0,
			y : 0,
			image : background_img_string,
			alpha : 0.0
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
		if (music != undefined) {
			music.pos(0);
			music.play();
		}

	}

	this.update = function() {

		if (this.isPlaying) {
			this.dialogueSequence.update();

			if (this.dialogueSequence.isFinished) {
				this.setMode('done');
				
				if (music != undefined) {
					var thisMusic = music;
					var fade_time = 750; //ms
					music.fadeOut(0.0,fade_time, function(){
						thisMusic.stop();
					});
				}
			}
			
			this.backgroundSprite.alpha += 0.01
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

