var grid = gameOfLife.createGrid(75);
var isBirthOfLife = true;

var intervalId = setInterval(function life() {
  if (isBirthOfLife) {
    isBirthOfLife = false;
    gameOfLife.render(grid);
  } else {
    grid = gameOfLife.step(grid);
    gameOfLife.render(grid);
  }
}, 1000);
