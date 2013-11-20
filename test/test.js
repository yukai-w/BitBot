/**
 * @author R. E. Cardona-Rivera
 */

// @test game_util.js#antidiagonal_transform(rectangular_matrix);

function test_antidiagonal_transform() {
	var test_matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
	var transformed_matrix = antidiagonal_transform(test_matrix);

	for (var i = 0; i < 3; i++) {
		console.log(transformed_matrix[i][0] + "," + transformed_matrix[i][1] + "," + transformed_matrix[i][2] + "," + transformed_matrix[i][3])
	}
}

function test_goog_queue() {
	var q = new goog.structs.Queue();
	q.enqueue(2);
	q.enqueue(3);
	q.enqueue(4);
	console.log(q.dequeue());
	console.log(q);
	
	
}

