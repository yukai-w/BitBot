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
 */
function random_sigmoid() {
	return (Math.random() - Math.random());
}
