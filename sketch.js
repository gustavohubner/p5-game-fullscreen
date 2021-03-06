let grid, colorPallete, offsetX, offsetY, moved, gameover;
let size, gap, roundness, gridBorder;

let gridX, gridY;

let matches, deleteAnim, deleteAnimLength, count;
let bonus, bonusX;

let minX, minY, maxX, maxY;

function setup() {

  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  textAlign(CENTER, CENTER);
  background(0);
  noStroke();

  size = parseInt(window.prompt("Digite o tamanho dos blocos em pixels", 30));
  gap = ceil(size / 18);
  roundness = ceil(size / 5);
  gridBorder = 2 * gap;

  gridX = floor((windowWidth) / (size + gap));
  gridY = floor((windowHeight) / (size + gap) + 2);

  minX = gridX;
  minY = gridY;
  maxX = -1;
  maxY = -1;

  gameover = false;
  bonus = false;
  offsetX = gap;
  offsetY = gap;

  grid = [[]];
  deleteAnim = false;
  deleteAnimLength = 30;
  count = deleteAnimLength;
  matches = [];

  colorPallete = ["black", "turquoise", "chartreuse", "deeppink", "mediumslateblue", "coral", "yellow", "white"];

  for (let x = 0; x < gridX; x++) {
    grid[x] = [];
    for (let y = 0; y < gridY; y++) {
      grid[x][y] = floor(random(1, 7));
    }
  }
  drawGrid();
}

function draw() {
  drawGrid();
  if (!gameover) {
    if (!deleteAnim) {
      moved = false;
      gravitate();

      if (!moved) {
        if (bonus) {
          matches = getMatches().concat(getAllMatchingColor(getBonusColor()));
          bonus = false;
          bonusX = -1;
          frameRate(60);
        }
        else matches = getMatches();
        if (matches.length > 0) {
          deleteAnim = true;
        } else {
          let chance = floor(random(0, (gridX + gridY) * 2));
          if (chance == 0) {
            frameRate(5);
            addBonusPiece();
          }
          else addPiece();
        }
      } else {
        drawGrid();
      }
    } else {
      if (count >= 0) {
        for (let i = 0; i < matches.length; i++) {
          setGridPos(matches[i], (floor(count / 2) % 7) + 1);
        }
        count--;
      } else {
        for (let i = 0; i < matches.length; i++) {
          setGridPos(matches[i], 0);
        }
        deleteAnim = false;
        count = deleteAnimLength;
      }
    }

  } else {
    for (let x = 0; x < gridX; x++) {
      grid[x] = [];
      for (let y = 0; y < gridY; y++) {
        grid[x][y] = floor(random(1, 7));
      }
    }
    gameover = false;
  }
}

function drawGrid() {
  // fill(30);
  fill(0);
  rect(offsetX - gridBorder, offsetY - gridBorder, gridX * (size + gap) + gridBorder * 2 - gap,
    (gridY - 2) * (size + gap) + gridBorder * 2 - gap, roundness);
  // for (let x = 0; x < gridX; x++) {
  //   for (let y = 0; y < (gridY - 2); y++) {
  //     fill(0);
  //     square((size + gap) * x + offsetX, (size + gap) * y + offsetY, size, roundness);
  //   }
  // }
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < (gridY - 2); y++) {
      let val = grid[x][(gridY - 3) - y];
      if (val != 0) {
        fill(colorPallete[val]);
        square((size + gap) * x + offsetX, (size + gap) * y + offsetY, size/*, roundness*/);
      }
    }
  }

}
function gravitate() {
  moved = false;
  for (let x = 0; x < gridX; x++) {
    for (let y = 1; y < gridY; y++) {
      if (grid[x][y] != 0) {
        if (grid[x][y - 1] == 0) {
          grid[x][y - 1] = grid[x][y]
          grid[x][y] = 0;
          moved = true
          updateDrawArea([x, y]);
          updateDrawArea([x, y - 1]);
        }
      }
    }
  }
}
function addPiece() {
  col = lowestCol();
  if (grid[col][gridY - 3] == 0) {
    grid[col][gridY - 1] = floor(random(1, 7));
    grid[col][gridY - 2] = floor(random(1, 7));
    grid[col][gridY - 3] = floor(random(1, 7));
  } else {
    gameover = true
  }
}
function checkGameOver() {
  for (let x = 0; x < gridX; x++) {
    for (let y = (gridY - 2); y < gridY; y++) {
      if (grid[x][y] != 0) {
        gameover = true;
        return;
      }
    }
  }
}
function getMatches() {
  let matches = [];
  for (let x = 0; x < gridX; x++) {
    // y:
    for (let y = 0; y < gridY; y++) {
      let val = grid[x][y];
      if (val == 0) {
        // break y;
        y = gridY;
      } else {
        matches = matches.concat(getMatchesPos([x, y]));
      }
    }
  }

  // let stringArray = matches.map(JSON.stringify);
  // let uniqueStringArray = new Set(stringArray);
  // matches = Array.from(uniqueStringArray, JSON.parse);

  return matches;
}
function getMatchesPos(pos) {
  let val = getGridPos(pos);
  let matches = [];
  for (let i = 2; i < 6; i++) {
    if (val == getGridPos(nextPos(pos, i)) && val != 0) {
      let m = getMatchesDir(nextPos(pos, i), i);
      if (m.length > 1) {
        updateDrawArea(pos);
        matches = matches.concat(m);
      }
    }
  }
  if (matches.length >= 2) {
    matches = [pos].concat(matches);
    return matches;
  } else {
    return [];
  }
}
function nextPos(pos, dir) {
  let result;
  let x = pos[0], y = pos[1];
  switch (dir) {
    // case 1:
    //   result = [x - 1, y];
    //   break;
    case 2:
      result = [x - 1, y + 1];
      break;
    case 3:
      result = [x, y + 1];
      break;
    case 4:
      result = [x + 1, y + 1];
      break;
    case 5:
      result = [x + 1, y];
      break;
  }
  return result
}
function getMatchesDir(pos, dir) {
  updateDrawArea(pos);
  if (getGridPos(pos) == getGridPos(nextPos(pos, dir))) {
    return [pos].concat(getMatchesDir(nextPos(pos, dir), dir));
  } else {
    return [pos];
  }
}
function getGridPos(pos) {
  let x = pos[0], y = pos[1];
  if (x >= (gridX) || y >= (gridY) || x < 0 || y < 0) {
    return 0;
  } else {
    return grid[x][y];
  }
}
function setGridPos(pos, value) {
  let x = pos[0], y = pos[1];
  grid[x][y] = value;
}
function lowestCol() {
  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      if (grid[x][y] == 0)
        return x;
    }
  }
}

function getAllMatchingColor(color) {
  let result = [];
  if (color != 0) {
    for (let x = 0; x < gridX; x++) {
      // y:
      for (let y = 0; y < gridY; y++) {
        let val = grid[x][y];
        if (val == 0) {
          y = gridY;
          // break y;
        } else if (val == color)
          result.push([x, y]);
      }
    }
  }
  return result
}

function addBonusPiece() {
  col = lowestCol();
  bonus = true;
  bonusX = col;
  if (grid[col][gridY - 3] == 0) {
    grid[col][gridY - 1] = 7;
    grid[col][gridY - 2] = 7;
    grid[col][gridY - 3] = 7;
  } else {
    gameover = true
  }
}

function getBonusColor() {
  let color = 0;
  for (let y = 0; y < gridY; y++) {
    let c = getGridPos([bonusX, y])
    if (c != 0 && c != 7) {
      color = getGridPos([bonusX, y]);
    }
  }
  return color;
}

function updateDrawArea([x, y]) {
  if (x < minX)
    minX = x;
  if (y < minY)
    minY = y;
  if (x > maxX)
    maxX = x;
  if (y > maxY)
    maxY = y;
}