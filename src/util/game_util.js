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


/**
 * Returns a matrix which's rows are now composed of the elements along the
 * antidiagonal of the parameter rectangular matrix.
 *
 * For example, if the matrix is as follows,
 * [
 * 	[1, 2, 3, 4]
 * 	[5, 6, 7, 8]
 *  [9, 10, 11, 12]
 * ]
 *
 * This function returns,
 * [
 * 	[1, 5, 2, 9]
 *  [6, 3, 10, 7]
 *  [4, 11, 8, 12]
 * ]
 *
 * @param {Object} rectangular_matrix the matrix to be transformed.
 * @return {Object} the transformed rectangular_matrix
 */
function antidiagonal_transform(rectangular_matrix) {
	
	if (rectangular_matrix != null) {
		if (rectangular_matrix.length != null && rectangular_matrix.length > 0) {
			if (rectangular_matrix[0].length != null && rectangular_matrix[0].length > 0) {
				var rows = rectangular_matrix.length;
				var cols = rectangular_matrix[0].length;
				
				var t_matrix = create_array(rows, cols);
				var t_matrix_row_idx = 0;
				var t_matrix_col_idx = 0;
				t_matrix[0][0] = 0;

				/**
				 * Source: http://stackoverflow.com/questions/2112832/traverse-rectangular-matrix-in-diagonal-strips
				 */
				for (var antidiagonal = 0; antidiagonal < rows + cols - 1; antidiagonal++) {
					var offset_from_left = antidiagonal < rows ? 0 : antidiagonal - rows + 1;
					var limit_from_top = antidiagonal < cols ? 0 : antidiagonal - cols + 1;

					for (var iter_index = antidiagonal - offset_from_left; iter_index >= limit_from_top; iter_index--) {
						var row_idx = iter_index;
						var col_idx = antidiagonal - iter_index;
						
						t_matrix[t_matrix_row_idx][t_matrix_col_idx] = rectangular_matrix[row_idx][col_idx];

						t_matrix_col_idx = ((t_matrix_col_idx + 1) % cols);
						if (t_matrix_col_idx == 0) {//it means we've cycled through an entire row
							t_matrix_row_idx++;
							//next row please!
						}
					}
				}

				return t_matrix;
			} else {
				return rectangular_matrix;
			}

		} else {
			return rectangular_matrix;
		}
	} else {
		return null;
	}	

}

/** 
  * Returns true if the item is outside the game's canvas.
  * @param {Object} item an object that has a coordinate
  */
function is_outside_canvas(item) { 
	return (item.x < 0 || item.y < 0 || item.x > jaws.width || item.y > jaws.height); 
}

/**
 * Like is_outside_canvas, but only checks vertical distance, and checks for items
 * whose y is twice the screen's height. 
 * @param {Object} item an object that has a coordinate
 */
function has_fallen_twice_screen_height(item) {
	return (item.y > 2*jaws.height);
}


