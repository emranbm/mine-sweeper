function main() {
    window.level = 0;

    createElements();

    getGame((game) => {
        window.game = game;
        newGame();
    });

}

// Event listeners
/**
 * The smile span click listener.
 * @param event
 */
function smileClick(event) {
    newGame();
}
/**
 * Ok button in the alert modal click event.
 * @param event
 */
function nameOkClick(event) {
    //TODO
}


/**
 * Event handler for the mouse down event of each cell in the grid.
 * @param event
 */
function cellMouseDown(event) {
    let cell = event.target;
    cellMouseDown.lastDownCell = cell;
}

/**
 * Event handler for the mouse up event of each cell in the grid.
 * @param event
 */
function cellMouseUp(event) {
    let cell = event.target;

    // Down somewhere and up somewhere else is not a click!
    if (cellMouseDown.lastDownCell.id !== cell.id)
        return;

    if (game.levels[level].timer) {
        if (cellMouseUp.firstClick) {
            cellMouseUp.firstClick = false;
            startTimer(gameOver);
        }
    } else {
        let timerCounter = document.getElementById('timerCounter');
        timerCounter.innerHTML++;
    }

    if (cell.getAttribute('data-value') === 'mine')
        gameOver();
    else {
        revealNeighbors(cell);
    }

    function revealNeighbors(cell) {
        function getNeighbors(cell) {
            let gameLevel = game.levels[level];

            function getCell(x, y) {
                return document.getElementById('c' + ((y - 1) * gameLevel.cols + x));
            }

            let index = cell.id.substr(1);
            let loc = {
                x: (index - 1) % gameLevel.cols + 1,
                y: Math.floor(index / gameLevel.cols) + 1
            };

            let nCells = [];
            for (let i = -1; i <= 1; i++)
                for (let j = -1; j <= 1; j++)
                    if (!(loc.x + i < 1 || loc.x + i > gameLevel.cols || loc.y + j < 1 || loc.y + j > gameLevel.rows))
                        nCells.push(getCell(loc.x + i, loc.y + j));

            return nCells;
        }

        if (cell.hasAttribute('data-value') || hasClass(cell, 'revealed'))
            return;


        let neighbors = getNeighbors(cell);
        let bombCount = 0;
        for (let neighb of neighbors) {
            if (neighb.getAttribute('data-value') === 'mine')
                bombCount++;
        }

        cell.className += " revealed";
        if (bombCount > 0) {
            cell.setAttribute('data-value', bombCount);
        } else {
            cell.setAttribute('data-revealed', 1);
            for (let neighb of neighbors)
                revealNeighbors(neighb);
        }
    }

    revealNeighbors(cell);
}

function cellRightClick(event) {
    //TODO
    let cell = event.target;
    if (cell.isFlaged) {
        cell.isFlaged = false;
        removeClass(cell, 'flag');
        document.getElementById('mineCounter').innerHTML++;
    } else {
        cell.isFlaged = true;
        cell.className += " flag";
        document.getElementById('mineCounter').innerHTML--;
    }
}

/**
 * Gets called when the timer is finished or a bomb has been clicked.
 */
function gameOver() {
    //TODO
    if (startTimer.timerId) {
        clearTimeout(startTimer.timerId);
        startTimer.timerId = undefined;
    }
    alert("Game Over!");
}
// Event listeners - END

/**
 * Creates html elements of the page
 */
function createElements() {
    /**
     * A helper function to create an element in a single line.
     * @param tagName
     * @param className
     * @param id
     * @returns {Element}
     */
    function newElement(tagName, className, id) {
        let element = document.createElement(tagName);
        if (className)
            element.className = className;
        if (id)
            element.id = id;

        return element;
    }

    /**
     * Creates a div element having the given class and id.
     * @param className
     * @param id
     * @returns {Element}
     */
    function newDiv(className, id) {
        return newElement('div', className, id);
    }

    //Alert modal div
    let alertModalDiv = newDiv('modal', 'alert-modal');
    document.body.appendChild(alertModalDiv);

    let alertChildDiv = newDiv('modal-content');
    alertModalDiv.appendChild(alertChildDiv);

    let name = newElement('input', 'field', 'name');
    name.placeholder = 'Enter your name';
    alertChildDiv.appendChild(name);

    let okBtn = newElement('button');
    okBtn.innerHTML = 'OK';
    okBtn.onclick = nameOkClick;
    alertChildDiv.appendChild(okBtn);
    //Alert modal div - END

    let windowDiv = newDiv('window');
    document.body.appendChild(windowDiv);

    //Title bar div
    let titleBarDiv = newDiv('title-bar');
    windowDiv.appendChild(titleBarDiv);

    let gameTitleSpn = newElement('span', null, 'game-title');
    gameTitleSpn.innerHTML = 'Minesweeper Online - Beginner!';
    titleBarDiv.appendChild(gameTitleSpn);

    let titleChildDiv = newDiv();
    titleBarDiv.appendChild(titleChildDiv);

    let minimizeBtnSpn = newElement('span', 'btn', 'btn-minimize');
    titleChildDiv.appendChild(minimizeBtnSpn);

    let closeBtnSpn = newElement('span', 'btn', 'btn-close');
    titleChildDiv.appendChild(closeBtnSpn);
    //Title bar div - END

    //Top panel div
    let topDiv = newDiv('top');
    windowDiv.appendChild(topDiv);

    let counterSpn = newElement('span', 'counter', 'mineCounter');
    counterSpn.innerHTML = '123';
    topDiv.appendChild(counterSpn);

    let smileSpn = newElement('span', 'smile');
    smileSpn.setAttribute('data-value', 'normal');
    smileSpn.onclick = smileClick;
    topDiv.appendChild(smileSpn);

    let counterSpn2 = newElement('span', 'counter', 'timerCounter');
    counterSpn2.innerHTML = '321';
    topDiv.appendChild(counterSpn2);
    //Top panel div - END
}

/**
 *
 * @param callback {Function} A callback to receive the game object.
 */
function getGame(callback) {
    getGameXML((str) => {
        var oParser = new DOMParser();
        var oDOM = oParser.parseFromString(str, "text/xml");
        let gameElement = oDOM.documentElement;
        if (gameElement.id !== 'minesweeper') {
            alert('Wrong data received from the server.');
            return;
        }

        let game = {
            id: gameElement.getAttribute('id'),
            title: gameElement.getAttribute('title'),
            defaultLevel: gameElement.getElementsByTagName('levels')[0].getAttribute('default'),
            levels: []
        };

        for (let level of gameElement.getElementsByTagName('levels')[0].children) {
            game.levels.push({
                id: level.getAttribute('id'),
                title: level.getAttribute('title'),
                timer: level.getAttribute('timer') === "true",
                rows: level.getElementsByTagName('rows')[0].innerHTML,
                cols: level.getElementsByTagName('cols')[0].innerHTML,
                mines: level.getElementsByTagName('mines')[0].innerHTML,
                time: level.getElementsByTagName('time')[0].innerHTML
            })
        }

        callback(game);
    });
}

function newGame() {
    /**
     * Loads an xml file.
     * @param filename The path to the file
     * @returns {Document} xml content.
     */
    function loadXMLDoc(filename) {
        if (window.ActiveXObject) {
            xhttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        else {
            xhttp = new XMLHttpRequest();
        }
        xhttp.open("GET", filename, false);
        try {
            xhttp.responseType = "msxml-document"
        } catch (err) {
        } // Helping IE11
        xhttp.send("");
        return xhttp.responseXML;
    }

    /**
     * Transforms the xml to an html element using the given xsl.
     * @param xml
     * @param xsl
     * @returns {*} The processed html element.
     */
    function getHtmlElement(xml, xsl) {
        // code for IE
        if (window.ActiveXObject || xhttp.responseType == "msxml-document") {
            return xml.transformNode(xsl);
        }
        // code for Chrome, Firefox, Opera, etc.
        else if (document.implementation && document.implementation.createDocument) {
            xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            return xsltProcessor.transformToFragment(xml, document);
        }
    }

    getNewGame('<Request><rows>' + game.levels[level].rows + '</rows><cols>' + game.levels[level].cols + '</cols><mines>' + game.levels[level].mines + '</mines></Request>', (xmlStr) => {
        let lastGrid = document.getElementById('grid');
        if (lastGrid != null)
            document.removeChild(lastGrid);
        let levelDOM = new DOMParser().parseFromString(xmlStr, "text/xml");
        let grid = getHtmlElement(levelDOM, loadXMLDoc("./schema/level-style.xsl"));
        document.getElementsByClassName('window')[0].appendChild(grid);

        grid = document.getElementById('grid');

        let i = 1;
        for (let cell of grid.children) {
            cell.setAttribute('id', 'c' + i++);
            cell.onmousedown = (event) => {
                if (event.button === 0) {
                    if (!event.target.isFlaged) {
                        event.target.className += " active";
                        cellMouseDown(event);
                    }
                } else
                    cellRightClick(event);
            };
            cell.onmouseup = (event) => {
                if (event.button === 0) {
                    removeClass(cellMouseDown.lastDownCell, 'active');
                    cellMouseUp(event);
                }
            };
            cell.onmouseout = (event)=> {
                removeClass(event.target, 'active');
            };
        }

    });

    // Reset to defaults
    let gameLevel = game.levels[level];
    let timerCounter = document.getElementById('timerCounter');
    if (gameLevel.timer)
        timerCounter.innerHTML = gameLevel.time;
    else
        timerCounter.innerHTML = 0;
    cellMouseUp.firstClick = true;
    let mineCounter = document.getElementById('mineCounter');
    mineCounter.innerHTML = gameLevel.mines;
}

/**
 * Removes the given class from the element.
 * @param element
 * @param className
 */
function removeClass(element, className) {
    element.className = element.className.replace(new RegExp(className + "| " + className + "|" + className + " "), "")
}

/**
 * Determines whether an element has a particular class or not.
 * @param element
 * @param className
 * @returns {boolean} True if the element has the given class. False otherwise.
 */
function hasClass(element, className) {
    return new RegExp(className).test(element.className);
}

/**
 * Starts the timer count down.
 * @param endCallback {Function} {Optional} Is called when the timer reaches 0.
 */
function startTimer(endCallback) {
    let timerCounter = document.getElementById('timerCounter');
    let t = () => {
        timerCounter.innerHTML = timerCounter.innerHTML - 1;
        if (timerCounter.innerHTML <= 0) {
            if (endCallback)
                endCallback();
        } else
            startTimer.timerId = setTimeout(t, 1000);
    };
    startTimer.timerId = setTimeout(t, 1000);
};

window.onload = main;

