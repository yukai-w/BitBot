/**
 * A DialogueManager.
 */
function Dialogue() {

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
	
	this.nextSfx = new Howl({
		urls : ['./assets/sounds/fx/next.mp3']
	});
	
	this.currentBeatIsDone = true;
	this.isDone = false;
	
	this.speakerSprite = new jaws.Sprite({
		x : 18,
		y : 528,
		scale : 2
	});
	
	
	this.update = function() {
		var that = this;
		
		jaws.on_keydown(["enter", "space", "esc"], function() {
			if(!close_dialogue) {
				that.nextSfx.play();
				that.currentBeatIsDone = true;
			} else {
				that.isDone = true;
			}
		});
	}

	this.draw = function() {
		
		this.boxSprite.draw();
		this.nextArrowSprite.draw();
		this.speakerSprite.draw();
		
		jaws.context.font = "14pt VT323";
		jaws.context.fillStyle = "Black";
		wrap_text(jaws.context, speaker, 8, 520, 152, 15);
		
		jaws.context.font = "16pt VT323";
		wrap_text(jaws.context, text, 72, 545, jaws.width-72, 20);
		
	}
	
	this.newDialogueBeat = function(new_speaker, new_text, is_last) {
		speaker = new_speaker || 'Announcement';
		text = new_text.substring(0, max_text_length);
		this.currentBeatIsDone = false;
		close_dialogue = is_last;
		this.speakerSprite.setImage(Dialogue.speaker_portraits[new_speaker]);
	}
	
}

Dialogue.speaker_portraits = {
	'Master Controller' : "./assets/art/PortraitMasterController.png"
};
