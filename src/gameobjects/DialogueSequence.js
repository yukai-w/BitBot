/**
 * A DialogueSequence.
 */
function DialogueSequence() {

	var max_text_length = 107; //actually, it's 106 characters
	
	//enclosing box
	this.boxSprite = new jaws.Sprite({
		x : 0,
		y : jaws.height* 7/8,
		image : "./assets/art/DialogueBox.png"
	});
	
	//small arrow in the bottom right corner
	this.nextArrowSprite = new jaws.Sprite({
		x : jaws.width * 17/18,
		y : (jaws.height * 16/18)-2,
		image : "./assets/art/DialogueBoxNextArrow.png"
	});
	
	//sound that plays when the user advances the conversation
	this.nextSfx = new Howl({
		urls : ['./assets/sounds/fx/next.mp3', './assets/sounds/fx/next.ogg', './assets/sounds/fx/next.wav'],
		volume : 0.12
	});
	
	//picture of the speaker who's speaking
	this.speakerSprite = new jaws.Sprite({
		x : 18,
		y : 528,
		scale : 2
	});
	
	this.isFinished = false;
	this.dialogueSequence = new goog.structs.Queue();
	
	var current_text = undefined;
	var current_speaker = undefined;
	
	jaws.preventDefaultKeys(["enter", "space", "esc"]);
	
	this.start = function() {
		this.nextSfx.play();
		if(! this.dialogueSequence.isEmpty()) {
			var beat = this.dialogueSequence.dequeue();
			current_text = beat.text;
			current_speaker = beat.speaker;
			if(current_speaker != '???') {
				this.speakerSprite.setImage(beat.portrait_img_string);
			}
			
		} else {
			that.isFinished = true;
		}
	}
	
	this.update = function() {
		var that = this;
		
		if (jaws.pressedWithoutRepeat(["space"])) {
			
			if (! that.dialogueSequence.isEmpty()) {
				that.nextSfx.play();
				var beat = that.dialogueSequence.dequeue();
				current_text = beat.text;
				current_speaker = beat.speaker;
				
				if(current_speaker != '???') {
					that.speakerSprite.setImage(beat.portrait_img_string);	
				}

			} else {
				that.isFinished = true;
			}
		}
	}

	this.draw = function() {
		
		this.boxSprite.draw();
		this.nextArrowSprite.draw();
		
		if(current_speaker != '???') {
			this.speakerSprite.draw();
		} else {
			jaws.context.font = "30pt Orbitron";
			jaws.context.fillStyle = "Black";
			wrap_text(jaws.context, "?", 24, 560, 152, 15);
		}
		
		jaws.context.font = "10pt Orbitron";
		jaws.context.fillStyle = "Black";
		wrap_text(jaws.context, current_speaker, 8, 520, 152, 15);
		
		jaws.context.font = "14pt Orbitron";
		jaws.context.fillStyle = "Black";
		wrap_text(jaws.context, current_text, 72, 545, jaws.width-72, 20);
		
	}
	
	this.enqueueDialogueBeat = function(speaker, text) {
		
		var beat_text =  text.substring(0, max_text_length);
		
		var dialogue_beat = {
			'portrait_img_string' : DialogueSequence.speaker_portraits[speaker],
			'speaker' : speaker,
			'text' : beat_text
		};
		
		this.dialogueSequence.enqueue(dialogue_beat);
	}
	
}

DialogueSequence.speaker_portraits = {
	'Holo Controller' : "./assets/art/PortraitHoloMasterController.png",
	'Master Controller' : "./assets/art/PortraitMasterController.png",
	'Friedman' : "./assets/art/PortraitFriedman.png",
	'0xBE57B07' : "./assets/art/PortraitPlayer.png",
	'???' : undefined
};
