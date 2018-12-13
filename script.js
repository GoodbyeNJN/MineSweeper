var currentDifficulty = 1;
var maxRowNum = 8;
var maxColNum = 8;
var maxMineNum = 10;
var remainMineNum = 10;
var newGame = 1;
var boardStatus = new Object();

var timer;
var second = 0;

var previousMouseStatus = 0;
var lButtonIsPressed = 0;
var rButtonIsPressed = 0;

function initBoardStatus() {
    for (let i = 1; i <= maxRowNum; i++) {
        var rowStatus = new Object();
        for (let j = 1; j <= maxColNum; j++) {
            var colStatus = new Object();
            colStatus.isMine = 0;
            colStatus.nearbyMineNum = 0;
            colStatus.nearbyCoords = new Array();
            colStatus.adjacentCoords = new Array();
            colStatus.cornerCoords = new Array();
            colStatus.displayStatus = "";
            colStatus.pressedStatus = "";
            colStatus.isChecked = 0;

            var nearbyCoordsMap = new Map();
            nearbyCoordsMap.set("1", [i - 1, j - 1]);
            nearbyCoordsMap.set("2", [i - 1, j]);
            nearbyCoordsMap.set("3", [i - 1, j + 1]);
            nearbyCoordsMap.set("4", [i, j - 1]);
            nearbyCoordsMap.set("6", [i, j + 1]);
            nearbyCoordsMap.set("7", [i + 1, j - 1]);
            nearbyCoordsMap.set("8", [i + 1, j]);
            nearbyCoordsMap.set("9", [i + 1, j + 1]);

            if (i === 1) {
                nearbyCoordsMap.delete("1");
                nearbyCoordsMap.delete("2");
                nearbyCoordsMap.delete("3");
            } else if (i === maxRowNum) {
                nearbyCoordsMap.delete("7");
                nearbyCoordsMap.delete("8");
                nearbyCoordsMap.delete("9");
            }
            if (j === 1) {
                nearbyCoordsMap.delete("1");
                nearbyCoordsMap.delete("4");
                nearbyCoordsMap.delete("7");
            } else if (j === maxColNum) {
                nearbyCoordsMap.delete("3");
                nearbyCoordsMap.delete("6");
                nearbyCoordsMap.delete("9");
            }
            nearbyCoordsMap.forEach(function(value) {
                colStatus.nearbyCoords.push(value);
            });

            var adjacentCoordsMap = new Map(nearbyCoordsMap);
            adjacentCoordsMap.delete("1");
            adjacentCoordsMap.delete("3");
            adjacentCoordsMap.delete("7");
            adjacentCoordsMap.delete("9");
            adjacentCoordsMap.forEach(function(value) {
                colStatus.adjacentCoords.push(value);
            });

            var cornerCoordsMap = new Map(nearbyCoordsMap);
            cornerCoordsMap.delete("2");
            cornerCoordsMap.delete("4");
            cornerCoordsMap.delete("6");
            cornerCoordsMap.delete("8");
            cornerCoordsMap.forEach(function(value) {
                colStatus.cornerCoords.push(value);
            });

            rowStatus[j] = colStatus;
        }
        boardStatus[i] = rowStatus;
    }
}

function initGame() {
    remainMineNum = maxMineNum;
    newGame = 1;
    second = 0;
    previousMouseStatus = 0;
    lButtonIsPressed = 0;
    rButtonIsPressed = 0;
    initBoardStatus();

    document.getElementById("id-mine-remain").innerText = (Array(3).join("0") + maxMineNum).slice(-3);
    document.getElementById("id-time-passed").innerText = "000";
    setStartBtnStatus("start");
    stopTimer();

    for (const element of document.getElementsByClassName("board")) {
        element.classList.remove("visible");
        element.classList.add("invisible");
    }
    document.getElementsByClassName("board")[currentDifficulty - 1].classList.remove("invisible");
    document.getElementsByClassName("board")[currentDifficulty - 1].classList.add("visible");
    switch (currentDifficulty) {
        case 1:
            document.getElementsByClassName("game-container")[0].setAttribute("style", "width: 180px;");
            break;
        case 2:
            document.getElementsByClassName("game-container")[0].setAttribute("style", "width: 296px;");
            break;
        case 3:
            document.getElementsByClassName("game-container")[0].setAttribute("style", "width: 520px;");
            break;
    }
    for (const element of document.getElementsByClassName("mine")) {
        element.oncontextmenu = function() {
            return false;
        };
        element.addEventListener("mousedown", mouseIsDown);
        element.addEventListener("mouseup", mouseIsUp);
    }
    for (let i = 1; i <= maxRowNum; i++) {
        for (let j = 1; j <= maxColNum; j++) {
            setMineBtnStatus(i, j, "default");
        }
    }
}

function setDifficulty(difficulty, rowNum, colNum, mineNum) {
    switch (difficulty) {
        case 0:
            currentDifficulty = 0;
            maxRowNum = rowNum;
            maxColNum = colNum;
            maxMineNum = mineNum;
            document.getElementById("id-current-difficulty-text").innerText = "自定义";
            break;
        case 1:
            currentDifficulty = 1;
            maxRowNum = 8;
            maxColNum = 8;
            maxMineNum = 10;
            document.getElementById("id-current-difficulty-text").innerText = "初级";
            break;
        case 2:
            currentDifficulty = 2;
            maxRowNum = 16;
            maxColNum = 16;
            maxMineNum = 40;
            document.getElementById("id-current-difficulty-text").innerText = "中级";
            break;
        case 3:
            currentDifficulty = 3;
            maxRowNum = 16;
            maxColNum = 30;
            maxMineNum = 99;
            document.getElementById("id-current-difficulty-text").innerText = "高级";
            break;
    }
    initGame();
}

function setMines(row, col) {
    var jackpot = new Array();
    for (let i = 1; i <= maxRowNum; i++) {
        for (let j = 1; j <= maxColNum; j++) {
            if (i === row && j === col) {
                continue;
            }
            jackpot.push([i, j]);
        }
    }
    for (let i = 1; i <= maxMineNum; i++) {
        var min = Math.ceil(0);
        var max = Math.floor(jackpot.length - 1);
        var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        var rowToSetMine = jackpot[randomNum][0];
        var colToSetMine = jackpot[randomNum][1];
        boardStatus[rowToSetMine][colToSetMine].isMine = 1;
        jackpot.splice(randomNum, 1);
    }
    setNearbyMineNum();
}

function setNearbyMineNum() {
    for (let i = 1; i <= maxRowNum; i++) {
        var rowStatus = boardStatus[i];
        for (let j = 1; j <= maxColNum; j++) {
            var colStatus = rowStatus[j];
            var mineNum = 0;
            for (const coords of colStatus.nearbyCoords) {
                if (boardStatus[coords[0]][coords[1]].isMine === 1) {
                    mineNum++;
                }
            }
            boardStatus[i][j].nearbyMineNum = mineNum;
        }
    }
}

function setStartBtnStatus(status) {
    document.getElementById("id-btn-game-start").className = status;
}

function setMineBtnStatus(row, col, status) {
    boardStatus[row][col].displayStatus = status;
    document.querySelector(`.visible .row-${row} .col-${col} div`).className = status;
}

function setRemainMineNumText(status) {
    if (status === "+") {
        remainMineNum++;
    } else if (status === "-") {
        remainMineNum--;
    }
    document.getElementById("id-mine-remain").innerHTML = (Array(3).join("0") + remainMineNum).slice(-3);
}

function getClickCoords(event) {
    var row = event.srcElement.parentNode.parentNode.className;
    var col = event.srcElement.parentNode.classList[0];
    row = Number(row.slice(4, row.length + 1));
    col = Number(col.slice(4, col.length + 1));
    return [row, col];
}

function isGameOver() {
    var count = 0;
    for (let i = 1; i <= maxRowNum; i++) {
        for (let j = 1; j <= maxColNum; j++) {
            if (boardStatus[i][j].displayStatus === "default" || boardStatus[i][j].displayStatus === "flag") {
                count++;
            } else if (boardStatus[i][j].displayStatus === "have-mine") {
                stopTimer();
                return "fail";
            }
        }
    }
    if (count === maxMineNum) {
        stopTimer();
        return "success";
    }
}

function checkClick(row, col) {
    var clickMineBtn = boardStatus[row][col];
    var adjacentCoords = clickMineBtn.adjacentCoords;
    var cornerCoords = clickMineBtn.cornerCoords;
    if (clickMineBtn.isChecked === 1) {
        return;
    }
    if (clickMineBtn.displayStatus === "flag") {
        return;
    } else if (clickMineBtn.isMine === 1) {
        boardStatus[row][col].isChecked = 1;
        for (let i = 1; i <= maxRowNum; i++) {
            for (let j = 1; j <= maxColNum; j++) {
                if (boardStatus[i][j].isMine === 1 && boardStatus[i][j].displayStatus !== "flag") {
                    setMineBtnStatus(i, j, "have-mine");
                }
            }
        }
        setMineBtnStatus(row, col, "boom-mine");
        return;
    } else if (clickMineBtn.nearbyMineNum !== 0) {
        boardStatus[row][col].isChecked = 1;
        setMineBtnStatus(row, col, `have-${clickMineBtn.nearbyMineNum}-mine`);
        return;
    } else if (clickMineBtn.nearbyMineNum === 0) {
        boardStatus[row][col].isChecked = 1;
        setMineBtnStatus(row, col, "empty");
        adjacentCoords.forEach(function(coords) {
            checkClick(coords[0], coords[1]);
        });
        cornerCoords.forEach(function(coords) {
            if (boardStatus[coords[0]][coords[1]].nearbyMineNum === 0) {
                return;
            }
            checkClick(coords[0], coords[1]);
        });
        return;
    }
    return;
}

function checkDoubleClick(row, col, mineBtnStatus) {
    var clickMineBtn = boardStatus[row][col];
    var nearbyCoords = clickMineBtn.nearbyCoords;
    if (mineBtnStatus === "down") {
        if (
            clickMineBtn.displayStatus === "default" ||
            clickMineBtn.displayStatus === "flag" ||
            clickMineBtn.displayStatus === "empty"
        ) {
            nearbyCoords.forEach(function(coords) {
                var row = coords[0];
                var col = coords[1];
                if (boardStatus[row][col].displayStatus === "default") {
                    boardStatus[row][col].pressedStatus = "empty";
                    document.querySelector(`.visible .row-${row} .col-${col} div`).className = "empty";
                }
            });
            if (clickMineBtn.displayStatus === "default") {
                boardStatus[row][col].pressedStatus = "empty";
                document.querySelector(`.visible .row-${row} .col-${col} div`).className = "empty";
            }
        } else if (clickMineBtn.displayStatus.match(/have-\d-mine/)) {
            nearbyCoords.forEach(function(coords) {
                var row = coords[0];
                var col = coords[1];
                if (boardStatus[row][col].displayStatus === "default") {
                    boardStatus[row][col].pressedStatus = "empty";
                    document.querySelector(`.visible .row-${row} .col-${col} div`).className = "empty";
                }
            });
        }
    } else if (mineBtnStatus === "up") {
        if (
            clickMineBtn.displayStatus === "default" ||
            clickMineBtn.displayStatus === "flag" ||
            clickMineBtn.displayStatus === "empty"
        ) {
            nearbyCoords.forEach(function(coords) {
                var row = coords[0];
                var col = coords[1];
                if (boardStatus[row][col].pressedStatus === "empty") {
                    boardStatus[row][col].pressedStatus = "";
                    document.querySelector(`.visible .row-${row} .col-${col} div`).className =
                        boardStatus[row][col].displayStatus;
                }
            });
            if (clickMineBtn.displayStatus === "default") {
                boardStatus[row][col].pressedStatus = "";
                document.querySelector(`.visible .row-${row} .col-${col} div`).className =
                    boardStatus[row][col].displayStatus;
            }
        } else if (clickMineBtn.displayStatus.match(/have-\d-mine/)) {
            var count = 0;
            nearbyCoords.forEach(function(coords) {
                var row = coords[0];
                var col = coords[1];
                if (boardStatus[row][col].displayStatus === "flag") {
                    count++;
                }
            });
            if (clickMineBtn.nearbyMineNum === count) {
                nearbyCoords.forEach(function(coords) {
                    var row = coords[0];
                    var col = coords[1];
                    checkClick(row, col);
                });
            } else {
                nearbyCoords.forEach(function(coords) {
                    var row = coords[0];
                    var col = coords[1];
                    if (boardStatus[row][col].pressedStatus === "empty") {
                        boardStatus[row][col].pressedStatus = "";
                        document.querySelector(`.visible .row-${row} .col-${col} div`).className =
                            boardStatus[row][col].displayStatus;
                    }
                });
                boardStatus[row][col].pressedStatus = "";
                document.querySelector(`.visible .row-${row} .col-${col} div`).className =
                    boardStatus[row][col].displayStatus;
            }
        }
    }
}

function mouseIsDown(event) {
    if (event.buttons - previousMouseStatus === 1) {
        lButtonIsDown(event);
    } else if (event.buttons - previousMouseStatus === 2) {
        rButtonIsDown(event);
    }
    previousMouseStatus = event.buttons;
}

function mouseIsUp(event) {
    if (previousMouseStatus - event.buttons === 1) {
        lButtonIsUp(event);
    } else if (previousMouseStatus - event.buttons === 2) {
        rButtonIsUp(event);
    }
    previousMouseStatus = event.buttons;
    if (isGameOver() === "success") {
        setStartBtnStatus("success");
        for (const element of document.getElementsByClassName("mine")) {
            element.removeEventListener("mousedown", mouseIsDown);
            element.removeEventListener("mouseup", mouseIsUp);
        }
    } else if (isGameOver() === "fail") {
        setStartBtnStatus("fail");
        for (const element of document.getElementsByClassName("mine")) {
            element.removeEventListener("mousedown", mouseIsDown);
            element.removeEventListener("mouseup", mouseIsUp);
        }
    }
}

function lButtonIsDown(event) {
    lButtonIsPressed = 1;
    var row = getClickCoords(event)[0];
    var col = getClickCoords(event)[1];
    if (rButtonIsPressed === 1) {
        checkDoubleClick(row, col, "down");
    } else {
        if (boardStatus[row][col].displayStatus === "default") {
            boardStatus[row][col].pressedStatus = "empty";
            document.querySelector(`.visible .row-${row} .col-${col} div`).className = "empty";
        }
    }
    setStartBtnStatus("click");
}

function lButtonIsUp(event) {
    lButtonIsPressed = 0;
    var row = getClickCoords(event)[0];
    var col = getClickCoords(event)[1];
    if (newGame === 1) {
        startTimer();
        newGame = 0;
        setMines(row, col);
    }
    if (rButtonIsPressed === 0) {
        var returnStatus = checkClick(row, col);
    } else if (rButtonIsPressed === 1) {
        checkDoubleClick(row, col, "up");
    }
    if (returnStatus !== "game over") {
        setStartBtnStatus("start");
    }
}

function rButtonIsDown(event) {
    rButtonIsPressed = 1;
    var row = getClickCoords(event)[0];
    var col = getClickCoords(event)[1];
    if (lButtonIsPressed === 1) {
        checkDoubleClick(row, col, "down");
    } else if (lButtonIsPressed === 0) {
        if (boardStatus[row][col].displayStatus === "default") {
            setMineBtnStatus(row, col, "flag");
            setRemainMineNumText("-");
        } else if (boardStatus[row][col].displayStatus === "flag") {
            setMineBtnStatus(row, col, "default");
            setRemainMineNumText("+");
        }
    }
}

function rButtonIsUp(event) {
    rButtonIsPressed = 0;
    var row = getClickCoords(event)[0];
    var col = getClickCoords(event)[1];
    if (lButtonIsPressed === 1) {
        checkDoubleClick(row, col, "up");
    }
}

function startTimer() {
    timer = setTimeout("startTimer()", 1000);
    document.getElementById("id-time-passed").innerHTML = (Array(3).join("0") + second).slice(-3);
    second++;
}

function stopTimer() {
    second = 0;
    clearTimeout(timer);
}

setDifficulty(1);

document.getElementById("id-btn-game-start").addEventListener("mousedown", function(event) {
    if (event.buttons === previousMouseStatus + 1) {
        setStartBtnStatus("starting");
        stopTimer();
    }
    previousMouseStatus = event.buttons;
});
document.getElementById("id-btn-game-start").addEventListener("mouseup", function(event) {
    if (event.buttons === previousMouseStatus - 1) {
        initGame();
    }
    previousMouseStatus = event.buttons;
});

for (const element of document.getElementsByClassName("difficulty-btn")) {
    element.addEventListener("click", function(event) {
        if (event.srcElement.id === "id-btn-beginner") {
            setDifficulty(1);
        } else if (event.srcElement.id === "id-btn-intermediate") {
            setDifficulty(2);
        } else if (event.srcElement.id === "id-btn-expert") {
            setDifficulty(3);
        }
    });
}

// document.oncontextmenu = function () {
//     return false;
// };

function test() {
    for (let i = 1; i <= maxRowNum; i++) {
        for (let j = 1; j <= maxColNum; j++) {
            if (boardStatus[i][j].isMine === 1) {
                setMineBtnStatus(i, j, "have-mine");
            } else if (boardStatus[i][j].nearbyMineNum === 0) {
                setMineBtnStatus(i, j, "empty");
            } else if (boardStatus[i][j].nearbyMineNum !== 0) {
                setMineBtnStatus(i, j, `have-${boardStatus[i][j].nearbyMineNum}-mine`);
            }
        }
    }
}

// for (const rowStatus of boardStatus) {
//     for (const colStatus of rowStatus) {
//     }
// }

// for (let i = 1; i <= maxRowNum; i++) {
//     var rowStatus = boardStatus[i];
//     for (let j = 1; j <= maxColNum; j++) {
//         var colStatus = rowStatus[j];
//         // colStatus.isMine = 0;
//         // colStatus.nearbyMineNum = 0;
//         // colStatus.nearbyCoords = new Array();
//         // colStatus.displayStatus = "";
//         // colStatus.whichButton = "";

//     }
// }
