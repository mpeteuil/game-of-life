describe("gameOfLife", function() {

  it("exists", function() {
    assert.ok(gameOfLife, "the game of life exists");
  });

  it("creates a random NxN grid", function() {
    var N = 3;
    var grid = gameOfLife.createGrid(N);
    var allValuesOneOrZero = grid.every(function(row) {
      return row.every(function(col){
        return col === 0 || col === 1;
      });
    });
    var allRowsLengthN = grid.every(function(row) {
      return row.length === N;
    });

    assert.isTrue(allValuesOneOrZero, "Array contains only zeros and ones");
    assert(grid.length === N && allRowsLengthN, "grid is NxN size");
  });

  it("creates a random NxM grid");

  it("has a render method", function() {
    assert.isFunction(gameOfLife.render);
  });

  it("countLiveNeighbors returns the correct count", function() {
    var grid = [
      Uint8Array.of(0, 1, 1),
      Uint8Array.of(1, 0, 1),
      Uint8Array.of(0, 0, 1)
    ];

    assert.equal(gameOfLife.countLiveNeighbors(grid, {x: 1, y: 0}), 3);
  });

  it("has a step method", function() {
    assert.isFunction(gameOfLife.step);
  });

  it("step returns the next iteration of life", function() {
    var grid = [
      Uint8Array.of(0, 1, 1, 1),
      Uint8Array.of(1, 0, 1, 0),
      Uint8Array.of(0, 0, 1, 1),
      Uint8Array.of(1, 1, 0, 0)
    ];

    var grid2 = gameOfLife.step(grid);

    var expectedGrid2 = [
      Uint8Array.of(0, 1, 1, 1),
      Uint8Array.of(0, 0, 0, 0),
      Uint8Array.of(1, 0, 1, 1),
      Uint8Array.of(0, 1, 1, 0)
    ];

    assert.deepEqual(grid2[0], expectedGrid2[0], "First row matches");
    assert.deepEqual(grid2[1], expectedGrid2[1], "First middle row matches");
    assert.deepEqual(grid2[2], expectedGrid2[2], "Last middle row matches");
    assert.deepEqual(grid2[3], expectedGrid2[3], "Last row matches");
    assert.deepEqual(grid2, expectedGrid2);
  });

});
