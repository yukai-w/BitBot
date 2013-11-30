/**
 * The Heads Up Display provides gameplay information.
 * @param {Object} player the player we're tracking
 */
function HUD(player) {

	var hud_elements = [];
	hud_elements[hud_elements.length] = new BatteryMeter(player);
	hud_elements[hud_elements.length] = new CommandPrompt(player);
	
	this.update = function() {
		jaws.update(hud_elements);
	}

	this.draw = function() {
		jaws.draw(hud_elements);
	}
}

/**
 * The command prompt which displays the commands the player has made in the game.
 * @param player the player we're tracking.
 */
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
		
		if(!player.isPlanning) {
			this.cmdSprite.alpha = 0.45;
		} else {
			this.cmdSprite.alpha = 1.0;
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
function BatteryMeter(player) {

	var METER_HUD_X = 450; //px
	var METER_HUD_Y = (1/16)*canvas.height; //px

	var x_pos = METER_HUD_X;
	var y_pos = METER_HUD_Y;

	this.batterySprite = new jaws.Sprite({image : "./assets/art/Battery.png", anchor : "center", x : x_pos, y : y_pos, scale : 2.0}); 
	
	x_pos += 60;
	this.barSprite = new jaws.Sprite({image : "./assets/art/MeterBar.png", anchor : "center", x : x_pos, y : y_pos, scale : 0.50});

	this.indicatorSprite = new jaws.Sprite({
		image : "./assets/art/BatteryIndicator.png",
		anchor : "center_left",
		x : x_pos-40,
		y : METER_HUD_Y,
		scale : 0.50
	});
	this.indicatorSprite.setWidth(0);

	this.update = function() {

		var new_indicator_sprite_width = (player.batteryLevel / 100.0) * 82;
		
		// Meter Sprite has an effective drawing width of 82 px (for 100% life),
		// we must scale it down .82 px for every unit change of battery
		this.indicatorSprite.setWidth(new_indicator_sprite_width);
	}

	this.draw = function() {
		this.batterySprite.draw();
		this.indicatorSprite.draw();
		this.barSprite.draw();

	}
}
