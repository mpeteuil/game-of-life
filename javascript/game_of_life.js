var gameOfLife = (function() {

  // Returns:
  //
  //  [value0, value1, value3, ..., valueN]
  //
  // Ex: value = 0,
  //         n = 3
  //
  //  [0, 0, 0]
  //
  // Ex: value = fn(n){ return [0, 1, 0]; },
  //         n = 3
  //
  //  [ [0, 1, 0], [0, 1, 0], [0, 1, 0] ]
  //
  function defaultValueArray(value, n) {
    var arr = new Array(n);
    var m = n;
    while (n > 0) {
      if (typeof value === 'function') {
        arr[--n] = value(m);
      } else {
        arr[--n] = value;
      }
    }

    return arr;
  }

  // Returns:
  //   **Random** array of 0s and 1s
  //
  // [zeroOrOne1, zeroOrOne2, zeroOrOne3, ..., zeroOrOneN]
  //
  // Ex: n = 5
  //
  //  [1, 0, 0, 1, 1]
  //
  //
  function randomBinaryArray(n) {
    function getRandomIntInclusive(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var random = new Uint8Array(n);
    var count = 0;
    while(count < n) {
      random[count] = getRandomIntInclusive(0, 1);
      ++count;
    }

    return random;
  }

  // Ex: gridSize = 3
  //
  //     -1:  0: 1: 2:  3:
  // -1:  X   X  X  X   X
  //  0:  X [ 0, 1, 0 ] X
  //  1:  X [ 1, 0, 1 ] X
  //  2:  X [ 1, 1, 0 ] X
  //  3:  X   X  X  X   X
  //

  function render(grid) {
    console.clear();
    console.table(grid);
  }

  var countLiveNeighbors = (function() {
    // All Possible Scenarios
    //
    // key:
    //      OOB = Out of Bounds
    //
    // left cell, first row (starting position)
    //
    // [ (  OOB   ), ( OOB  ), (  OOB   ) ]
    // [ (  OOB   ), (x, y  ), (x+1, y  ) ]
    // [ (  OOB   ), (x, y-1), (x+1, y-1) ]
    //
    // middle cell, first row
    //
    // [ (  OOB   ), ( OOB  ), (  OOB   ) ]
    // [ (x-1, y  ), (x, y  ), (x+1, y  ) ]
    // [ (x-1, y-1), (x, y-1), (x+1, y-1) ]
    //
    // right cell, first row
    //
    // [ (  OOB   ), ( OOB  ), (  OOB   ) ]
    // [ (x-1, y  ), (x, y  ), (  OOB   ) ]
    // [ (x-1, y-1), (x, y-1), (  OOB   ) ]
    //
    //
    //
    // left cell, middle row
    //
    // [ (  OOB   ), (x, y+1), (x+1, y+1) ]
    // [ (  OOB   ), (x, y  ), (x+1, y  ) ]
    // [ (  OOB   ), (x, y-1), (x+1, y-1) ]
    //
    // middle cell, middle row
    //
    // [ (x-1, y+1), (x, y+1), (x+1, y+1) ]
    // [ (x-1, y  ), (x, y  ), (x+1, y  ) ]
    // [ (x-1, y-1), (x, y-1), (x+1, y-1) ]
    //
    // right cell, middle row
    //
    // [ (x-1, y+1), (x, y+1), (  OOB   ) ]
    // [ (x-1, y  ), (x, y  ), (  OOB   ) ]
    // [ (x-1, y-1), (x, y-1), (  OOB   ) ]
    //
    //
    //
    //
    // left cell, bottom row
    //
    // [ (  OOB   ), (x, y+1), (x+1, y+1) ]
    // [ (  OOB   ), (x, y  ), (x+1, y  ) ]
    // [ (  OOB   ), ( OOB  ), (  OOB   ) ]
    //
    // middle cell, bottom row
    //
    // [ (x-1, y+1), (x, y+1), (x+1, y+1) ]
    // [ (x-1, y  ), (x, y  ), (x+1, y  ) ]
    // [ (  OOB   ), ( OOB  ), (  OOB   ) ]
    //
    // right cell, bottom row
    //
    // [ (x-1, y+1), (x, y+1), (  OOB   ) ]
    // [ (x-1, y  ), (x, y  ), (  OOB   ) ]
    // [ (  OOB   ), ( OOB  ), (  OOB   ) ]

    var x;
    var y;

    function getCell(grid, x, y) {
      //     *  *  *
      // * [ x, x, x ]
      // * [ x, x, x ]
      // * [ x, x, x ]
      //
      if (x < 0 || y < 0) {
        return 0;

      //
      //   [ x, x, x ] *
      //   [ x, x, x ] *
      //   [ x, x, x ] *
      //     *  *  *
      } else if (x > grid.length - 1 || y > grid[x].length - 1) {
        return 0;
      } else {
        return grid[y][x];
      }
    }

    return function countLiveNeighbors(grid, coords) {
      x = coords.x;
      y = coords.y;

      return [
        getCell(grid, x-1, y+1), getCell(grid, x, y+1),    getCell(grid, x+1, y+1),

        getCell(grid, x-1, y),   /*getCell(grid, x, y),*/  getCell(grid, x+1, y),

        getCell(grid, x-1, y-1), getCell(grid, x, y-1),    getCell(grid, x+1, y-1)
      ].reduce(function sum(a, b){ return a+b; });
    }
  })();

  function step(grid) {
    // 1) Any live cell with fewer than two live neighbours dies, as if caused by under-population
    // 2) Any live cell with two or three live neighbours lives on to the next generation.
    // 3) Any live cell with more than three live neighbours dies, as if by overcrowding.
    // 4) Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

    // @grid
    //            @x
    //   [
    //     [ 0, 1, 0, 0, 0 ]
    //     [ 1, 0, 0, 1, 1 ]
    // @y  [ 1, 1, 0, 0, 1 ]
    //     [ 0, 0, 0, 1, 1 ]
    //     [ 0, 0, 1, 1, 0 ]
    //                       ]
    //

    var newGrid = new Array(grid.length);

    grid.forEach(function(row, y) {
      newGrid[y] = new Uint8Array(grid[y].length);

      row.forEach(function(cell, x) {
        var numLive = countLiveNeighbors(grid, { x: x, y: y });
        var cellNext = 0;

        // death by under-population
        if (numLive < 2 && cell === 1) {
          cellNext = 0;
        // life by survival (aging)
        } else if (numLive >= 2 && numLive <= 3 && cell === 1) {
          cellNext = 1;
        // death by overcrowding
        } else if (numLive > 3 && cell === 1) {
          cellNext = 0;
        // life by reproduction (birth)
        } else if (numLive === 3 && cell === 0) {
          cellNext = 1;
        // dead stay dead
        } else {
          cellNext = 0;
        }

        newGrid[y][x] = cellNext;
      })
    })

    return newGrid;
  }


  return {
    render: render,
    step: step,
    countLiveNeighbors: countLiveNeighbors,
    createGrid: function(gridSize) {
     return defaultValueArray(randomBinaryArray, gridSize);
    }
  };
})();
