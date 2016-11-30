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
 * Event handler for the click event of each cell in the grid.
 * @param event
 */
function cellClick(event) {
    if (game.levels[level].timer) {
        if (cellClick.firstClick) {
            cellClick.firstClick = false;
            startTimer();
        }
    } else {
        let timerCounter = document.getElementById('timerCounter');
        timerCounter.innerHTML++;
    }
    //TODO
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

    let counterSpn = newElement('span', 'counter', 'flagCounter');
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
            cell.onclick = cellClick;
        }

    });

    // Reset to defaults
    let timerCounter = document.getElementById('timerCounter');
    if (game.levels[level].timer)
        timerCounter.innerHTML = game.levels[level].time;
    else
        timerCounter.innerHTML = 0;
    cellClick.firstClick = true;
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
            setTimeout(t, 1000);
    };
    setTimeout(t, 1000);
};

window.onload = main;

