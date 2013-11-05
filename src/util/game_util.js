/**
 * Returns a random number between min and max.
 * @param {Number} min the lower bound
 * @param {Number} max the upper bound
 */
function get_random_number(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Randomly returns -1 or 1.
 */
function random_sign() {
	return (random_sigmoid() < 0 ? -1 : 1);
}

/**
 * Returns a number between -1 and 1.
 * Numbers close to 0 are likely.
 * Returns a number between -1 and 1. Numbers close to 0 are likely.
 */
function random_sigmoid() {
	return (Math.random() - Math.random());
}

/**
 * Creates an n-dimensional array, as specified by the parameter list. <br>
 * e.g.
 * create_array();    ->  new Array() <br>
 * create_array(2);    -> new Array(2) <br>
 * create_array(3, 2); -> [new Array(2), new Array(2), new Array(2)] <br>
 * <br>
 * Source:
 * http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript
 */
function create_array(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = create_array.apply(this, args);
    }

    return arr;
}
