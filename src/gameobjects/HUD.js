/**
 * The Heads Up Display provides gameplay information.
 * @param {Object} player the player we're tracking
 */
function HUD(player) {

	// var batteryHUD = new BatteryMeter(player);
	// var levelHUD   = new LevelCounter(player);
	// var timeHUD    = new LevelTimeCounter(player);
	
	var hud_elements = [];
	hud_elements[hud_elements.length] = new CommandPrompt(player);
	// hudElements.push(batteryHUD);
	// hudElements.push(levelHUD);
	// hudElements.push(timeHUD);

	this.update = function() {
		jaws.update(hud_elements);
	}

	this.draw = function() {
		jaws.draw(hud_elements);
	}
}

function CommandPrompt(player) {
	var cmd_HUD_x = 0;
	var cmd_HUD_y = (7/8)*canvas.height;
	var cmd_img_str = "./assets/art/CommandPrompt.png"
	
	this.cmdSprite = new jaws.Sprite({image: cmd_img_str, x:cmd_HUD_x, y:cmd_HUD_y});
	this.planningOverlay = new jaws.Sprite({color:'black', x:0, y:0, alpha:0.45});
	this.planningOverlay.resizeTo(canvas.width, cmd_HUD_y)
	
	var action_img_map = {
		'left' : "./assets/art/ArrowLeft.png",
		'right' : "./assets/art/ArrowRight.png",
		'down' : "./assets/art/ArrowDown.png",
		'up' : "./assets/art/ArrowUp.png"
	};
	
	var actionQueue_cache = undefined;
	var action_offset = canvas.width/player.actionQueueSizeMax; //48px
	var action_offset_padding = action_offset/6; //8px
	
	this.actionQueueSprites = [];
	
	this.update = function() {
		
		// if undefined, or if the cache is stale, update it
		if(actionQueue_cache == undefined ||
			!goog.array.equals(actionQueue_cache, player.actionQueue.getValues())) {
			actionQueue_cache = player.actionQueue.getValues();
			goog.array.clear(this.actionQueueSprites);
		
			// arrows should be drawn with padding.  arrows are 32x32, but if 12 can be
			// drawn, then the spaces to draw arrows are canvas.width/12 = 48 px wide
			// (so 48x48) - therefore, draw (padding+img+padding)
			var cache_length = actionQueue_cache.length;
			var x_pos = 0;
			var y_pos = cmd_HUD_y + 26;
			for (var action_idx = 0; action_idx < cache_length; action_idx++) {
				
				x_pos = action_offset_padding + (action_idx*action_offset);
				
				this.actionQueueSprites[action_idx] = new jaws.Sprite({
					image : action_img_map[actionQueue_cache[action_idx]],
					x :  x_pos,
					y :  y_pos
				});
			}
		}
	}
	
	this.draw = function() {
		this.cmdSprite.draw();
		jaws.draw(this.actionQueueSprites);
		
		if(player.isPlanning) {
			this.planningOverlay.draw();
		}
		
	}
	 
}












/**
 * The BatteryMeter is the HUD Element which conveys information about battery life.  
 * Battery life is lost over time and is gained by in-game batteries.
 * @param {Object} player the player we're tracking
 */
function BatteryMeter(player, canvas_position) {

	// RECOMMENDED VALUES
	// var METER_HUD_X = 450; //px
	// var METER_HUD_Y = 185; //px

	var x_pos = canvas_position.x;
	var y_pos = canvas_position.y;
	
	var battery_img_str = "./assets/art/Battery.png";
	var battery_img_scale = 1.0;
	this.batterySprite = new jaws.Sprite({image : battery_img_str, anchor : "center", x : x_pos, y : y_pos, scale : battery_img_scale}); 
	
	

	this.barSprite = new jaws.Sprite({image : "./assets/art/MeterBar.png", anchor : "center", x : METER_HUD_X, y : METER_HUD_Y, scale : 0.75});

	this.indicatorSprite = new jaws.Sprite({
		image : "./assets/art/MeterBar.png",
		anchor : "center_left",
		x : 615.1,
		y : METER_HUD_Y,
		scale : 0.75
	});
	this.indicatorSprite.setWidth(0);

	this.update = function() {

		var new_indicator_sprite_width;

		if (type == 'medicine') {
			new_indicator_sprite_width = (player.medicineLife / 100.0) * 122;
		} else if (type == 'light') {
			new_indicator_sprite_width = (player.lightExposure / 100.0) * 122;
		}

		// Meter Sprite has an effective drawing width of 122 px (for 100% life),
		// we must scale it down 1.22 px for every unit change of fluid
		this.indicatorSprite.setWidth(new_indicator_sprite_width);
	}

	this.draw = function() {
		this.indicatorSprite.draw();
		this.barSprite.draw();

	}
}

/**
 * The ItemCounter is the HUD Element which conveys information about
 * the number of items that have been picked up during gameplay.
 * @param {Object} player the player we're tracking
 */
function ItemCounter(player) {

	var ITEM_HUD_X = 510;
	var ITEM_HUD_Y = 90;
	var BOTTLECAP_COUNTER_INDEX = 0;
	var RATIONS_COUNTER_INDEX = 1;
	var WATERS_COUNTER_INDEX = 2;
	var counters = new Array();

	this.bottlecapAnimation = new jaws.Animation({
		sprite_sheet : "./assets/art/bottlecap_anim.png",
		frame_size : [104, 104],
		loop : true
	});
	counters[BOTTLECAP_COUNTER_INDEX] = 0;
	this.bottlecapSprite = new jaws.Sprite({
		anchor : "center",
		x : ITEM_HUD_X,
		y : ITEM_HUD_Y - 40,
		scale : 0.40
	});
	this.bottlecapSprite.setImage(this.bottlecapAnimation.next());

	this.rationsAnimation = new jaws.Animation({
		sprite_sheet : "./assets/art/rations_anim.png",
		frame_size : [104, 104],
		loop : true
	});
	counters[RATIONS_COUNTER_INDEX] = 0;
	this.rationsSprite = new jaws.Sprite({
		anchor : "center",
		x : ITEM_HUD_X,
		y : ITEM_HUD_Y,
		scale : 0.40
	});
	this.rationsSprite.setImage(this.rationsAnimation.next());

	this.watersAnimation = new jaws.Animation({
		sprite_sheet : "./assets/art/water_anim.png",
		frame_size : [104, 104],
		loop : true
	});
	counters[WATERS_COUNTER_INDEX] = 0;
	this.watersSprite = new jaws.Sprite({
		anchor : "center",
		x : ITEM_HUD_X,
		y : ITEM_HUD_Y + 40,
		scale : 0.40
	});
	this.watersSprite.setImage(this.watersAnimation.next());

	this.update = function() {

		if (player.numberOfBottlecapsCollected != counters[BOTTLECAP_COUNTER_INDEX]) {
			counters[BOTTLECAP_COUNTER_INDEX] = player.numberOfBottlecapsCollected;
			this.bottlecapSprite.setImage(this.bottlecapAnimation.next());

			var bcSprite = this.bottlecapSprite;
			//keep references for anon. function
			var bcAnim = this.bottlecapAnimation;
			setTimeout(function() {
				bcSprite.setImage(bcAnim.next());
			}, 500);
		}

		if (player.numberOfRationsCollected != counters[RATIONS_COUNTER_INDEX]) {
			counters[RATIONS_COUNTER_INDEX] = player.numberOfRationsCollected;
			this.rationsSprite.setImage(this.rationsAnimation.next());

			var rSprite = this.rationsSprite;
			//keep references for anon. function
			var rAnim = this.rationsAnimation;
			setTimeout(function() {
				rSprite.setImage(rAnim.next());
			}, 500);
		}

		if (player.numberOfWatersCollected != counters[WATERS_COUNTER_INDEX]) {
			counters[WATERS_COUNTER_INDEX] = player.numberOfWatersCollected;
			this.watersSprite.setImage(this.watersAnimation.next());

			var wSprite = this.watersSprite;
			//keep references for anon. function
			var wAnim = this.watersAnimation;
			setTimeout(function() {
				wSprite.setImage(wAnim.next());
			}, 500);
		}

	}

	this.draw = function() {
		this.bottlecapSprite.draw();
		this.rationsSprite.draw();
		this.watersSprite.draw();

		for (var counterIndex = 0; counterIndex < counters.length; counterIndex++) {

			jaws.context.font = "24pt Denk One";
			jaws.context.lineWidth = 20;
			jaws.context.fillStyle = "#1C1C1C";
			jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
			jaws.context.fillText("x" + counters[counterIndex], ITEM_HUD_X + 30, ITEM_HUD_Y - 26 + (counterIndex * 40));
		}
	}
}

function TimeAliveCounter(player) {

	var TIME_COUNTER_HUD_X = 20;
	var TIME_COUNTER_HUD_Y = 60;

	this.decisecondsAlive = 0.0;
	this.secondsAlive = 0.0;
	this.minutesAlive = 0.0;

	this.desisecondsString = "";
	this.secondsString = "";
	this.minutesString = "";

	this.update = function() {
		this.desisecondsAlive = Math.floor((player.timeAlive / 100) % 10);
		this.secondsAlive = Math.floor((player.timeAlive / (1000)) % 60);
		this.minutesAlive = Math.floor((player.timeAlive / (1000 * 60)) % 60);

		this.desisecondsString = "" + this.desisecondsAlive;
		this.secondsString = "X".replace("X", (this.secondsAlive < 10 ? ("0" + this.secondsAlive) : (this.secondsAlive)));
		this.minutesString = "X".replace("X", (this.minutesAlive < 10 ? ("0" + this.minutesAlive) : (this.minutesAlive)));
	}

	this.draw = function() {
		jaws.context.font = "24pt Denk One";
		jaws.context.lineWidth = 20;
		jaws.context.fillStyle = "#1C1C1C";
		jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
		jaws.context.fillText("Time Alive:", TIME_COUNTER_HUD_X, TIME_COUNTER_HUD_Y);

		jaws.context.font = "32pt Geo";
		jaws.context.lineWidth = 20;
		jaws.context.fillStyle = "#990000";
		jaws.context.strokeStyle = "rgba(200,200,200,0.0)";
		jaws.context.fillText(this.minutesString + ":" + this.secondsString + ":" + this.desisecondsString, TIME_COUNTER_HUD_X + 160, TIME_COUNTER_HUD_Y);
	}
}
