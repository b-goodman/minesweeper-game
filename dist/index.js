var css = "";

var css$1 = ".row {\n  display: flex;\n  flex-direction: row;\n}\n\n#row-container {\n  display: flex;\n  flex-direction: column;\n}";

var css$2 = ":host {\n  z-index: 1;\n  display: block;\n  width: 50px;\n  height: 50px;\n  border: 1px solid gray;\n  background: #3D6AF2;\n  text-align: center;\n  font-size: 25px;\n  font-family: sans-serif;\n  line-height: 50px;\n}\n\n:host([mine=true]) {\n  background: black;\n}\n\n:host([flagged=true]) {\n  background: #215d21;\n}\n\n:host([highlighted=true]) {\n  outline: 1px solid #0540F2;\n  z-index: 2;\n}\n\n:host([neighbor-highlight=true]) {\n  background: #6a98c3;\n}\n\n:host(.adjacency-degree--1[covered=false]) {\n  background: #ffb3b3;\n}\n\n:host(.adjacency-degree--2[covered=false]) {\n  background: #ff9999;\n}\n\n:host(.adjacency-degree--3[covered=false]) {\n  background: #ff8080;\n}\n\n:host(.adjacency-degree--4[covered=false]) {\n  background: #ff6666;\n}\n\n:host(.adjacency-degree--5[covered=false]) {\n  background: #ff4d4d;\n}\n\n:host(.adjacency-degree--6[covered=false]) {\n  background: #ff3333;\n}\n\n:host(.adjacency-degree--7[covered=false]) {\n  background: #ff1a1a;\n}\n\n:host(.adjacency-degree--8[covered=false]) {\n  background: red;\n}\n\n:host(.adjacency-degree--0[covered=false]) {\n  background: white;\n  border: 1px solid white;\n}";

var CellEvents;
(function (CellEvents) {
    CellEvents["UNCOVERED"] = "uncovered";
    CellEvents["FLAGGED"] = "flagged";
    CellEvents["UNFLAGGED"] = "unflagged";
    CellEvents["MINE_UNCOVERED"] = "mine_uncovered";
    CellEvents["HIGHLIGHTED"] = "highlighted";
    CellEvents["UNHIGHLIGHTED"] = "unhighlighted";
    CellEvents["NEIGHBOR_REVEAL"] = "neighbor_reveal";
    CellEvents["TRIGGER_CHAIN_REVEAL"] = "trigger_chain_reveal";
})(CellEvents || (CellEvents = {}));
var CellEvents$1 = CellEvents;

class FlagCounter {
    static setFlagsRemaining(newValue) {
        FlagCounter.flagsRemaining = newValue;
        window.dispatchEvent(new CustomEvent(FlagCounter.COUNT_UPDATE, { detail: { newValue: FlagCounter.flagsRemaining } }));
        console.log("flagsRemaining: ", FlagCounter.flagsRemaining);
    }
}
FlagCounter.COUNT_UPDATE = "flag_count_update";

class Cell extends HTMLElement {
    constructor(coordinate, isMined, adjacentMines) {
        super();
        this.handleMouseEnter = (event) => {
            this.isHighlighted = true;
            this.dispatchEvent(this._highlightedEvent);
        };
        this.handleMouseLeave = (event) => {
            this.isHighlighted = false;
            this.dispatchEvent(this._unhighlightedEvent);
        };
        this.handleMouseClick = (event) => {
            // either reveal cell if un-flagged or un-flag if currently flagged
            if (this.flagged) {
                this.flagged = false;
            }
            else {
                this.covered = false;
            }
        };
        this.handleMouseAltClick = (event) => {
            // only allow flagging for covered cells
            event.preventDefault();
            if (this.covered && FlagCounter.flagsRemaining > 0) {
                this.flagged = !this.flagged;
            }
        };
        this.handleMouseDblClick = (event) => {
            // only allow quick reveal of neighboring cells if this cell is uncovered
            if (!this.covered) {
                this.dispatchEvent(this._revealNeighborsEvent);
            }
        };
        this._inputEvents = [
            ["mouseenter", this.handleMouseEnter],
            ["mouseleave", this.handleMouseLeave],
            ["click", this.handleMouseClick],
            ["contextmenu", this.handleMouseAltClick],
            ["dblclick", this.handleMouseDblClick],
        ];
        this._handleMineReveal = () => {
            this.dispatchEvent(this._mineUncoveredEvent);
            this.setAttribute("mine", "true");
            this.isHighlighted = false;
            this.neighborHighlight = false;
        };
        this._handleStandardReveal = () => {
            if (this._adjacentMines > 0) {
                this._refContent.textContent = this._adjacentMines.toString();
            }
            else {
                this.isHighlighted = false;
                this._removeEventListeners();
                this.dispatchEvent(this._triggerChainReveal);
            }
            this.classList.add(`adjacency-degree--${this._adjacentMines.toString()}`);
        };
        this._isMined = isMined;
        this.coordinate = coordinate;
        this._adjacentMines = adjacentMines;
        const customEventOptions = {
            bubbles: true,
            composed: true,
            detail: {
                coordinate: this.coordinate
            },
        };
        this._highlightedEvent = new CustomEvent(CellEvents$1.HIGHLIGHTED, customEventOptions);
        this._unhighlightedEvent = new CustomEvent(CellEvents$1.UNHIGHLIGHTED, customEventOptions);
        this._uncoverEvent = new CustomEvent(CellEvents$1.UNCOVERED, customEventOptions);
        this._mineUncoveredEvent = new CustomEvent(CellEvents$1.MINE_UNCOVERED, customEventOptions);
        this._revealNeighborsEvent = new CustomEvent(CellEvents$1.NEIGHBOR_REVEAL, customEventOptions);
        this._triggerChainReveal = new CustomEvent(CellEvents$1.TRIGGER_CHAIN_REVEAL, customEventOptions);
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${css$2}</style>
            <div id="cell-content"></div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._refContent = shadowRoot.querySelector("#cell-content");
    }
    static get observedAttributes() {
        return ["highlighted", "neighbor-highlight", "covered", "flagged"];
    }
    set isHighlighted(newState) {
        this.setAttribute("highlighted", JSON.stringify(newState));
    }
    get isHighlighted() {
        return JSON.parse(this.getAttribute("highlighted") || "false");
    }
    set neighborHighlight(newState) {
        this.setAttribute("neighbor-highlight", JSON.stringify(newState));
    }
    get neighborHighlight() {
        return JSON.parse(this.getAttribute("neighbor-highlight") || "false");
    }
    set covered(newState) {
        this.setAttribute("covered", JSON.stringify(newState));
    }
    get covered() {
        return JSON.parse(this.getAttribute("covered") || "true");
    }
    set flagged(newState) {
        this.setAttribute("flagged", JSON.stringify(newState));
    }
    get flagged() {
        return JSON.parse(this.getAttribute("flagged") || "false");
    }
    connectedCallback() {
        this._addEventListeners();
    }
    disconnectedCallback() {
        this._removeEventListeners();
    }
    attributeChangedCallback(name, _oldVal, _newVal) {
        if (name === "covered" && _newVal === "false" && _oldVal !== "false") {
            this.dispatchEvent(this._uncoverEvent);
            if (this._isMined) {
                this._removeEventListeners();
                this._handleMineReveal();
            }
            else {
                this._handleStandardReveal();
            }
        }
        if (name === "covered" && _newVal === "true" && _oldVal === "false") {
            this.covered = false;
        }
        if (name === "flagged") {
            if (_newVal === "true" && FlagCounter.flagsRemaining > 0) {
                FlagCounter.setFlagsRemaining(FlagCounter.flagsRemaining - 1);
            }
            else if (_oldVal === "true" && _newVal === "false") {
                FlagCounter.setFlagsRemaining(FlagCounter.flagsRemaining + 1);
            }
        }
    }
    _addEventListeners() {
        this._inputEvents.forEach((event) => {
            this.addEventListener(...event);
        });
    }
    _removeEventListeners() {
        this._inputEvents.forEach((event) => {
            this.removeEventListener(...event);
        });
    }
}
window.customElements.define("ms-tile", Cell);

class Adjacency {
    static coordinates(origin, dimensions) {
        const adjacentCoordsArray = [
            // [row, column]
            [origin[0], origin[1] + 1],
            [origin[0], origin[1] - 1],
            [origin[0] - 1, origin[1] + 1],
            [origin[0] - 1, origin[1] - 1],
            [origin[0] - 1, origin[1]],
            [origin[0] + 1, origin[1] + 1],
            [origin[0] + 1, origin[1] - 1],
            [origin[0] + 1, origin[1]],
        ];
        // discard any out of bound values ( [0,0] to 'dimensions')
        return adjacentCoordsArray.filter(coordinate => {
            const isLowerBound = coordinate.every(xy => xy >= 0);
            const isUpperBound = (coordinate[0] <= dimensions[0] - 1 && coordinate[1] <= dimensions[1] - 1);
            return isLowerBound && isUpperBound;
        });
    }
}

class Random {
    static int(min, max) {
        const _min = Math.ceil(min);
        const _max = Math.floor(max);
        return Math.floor(Math.random() * (_max - _min + 1)) + min;
    }
}

var css$3 = ":host {\n  font-size: 26px;\n  font-family: sans-serif;\n}\n\n#toolbar-wrapper {\n  display: flex;\n  flex-direction: row;\n}";

class Toolbar extends HTMLElement {
    constructor() {
        super();
        this._timeElapsed = 0;
        this.handleTimeInc = () => {
            this._timeElapsed++;
            const timeStr = [Math.floor(this._timeElapsed / 60), this._timeElapsed % 60].map((digit) => {
                return digit.toString().padStart(2, "0");
            }).join(":");
            this._refTimeElapsed.textContent = timeStr;
        };
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${css$3}</style>
            <div id="toolbar-wrapper">
                <div id="flags-remaining">${FlagCounter.flagsRemaining}</div>
                <div id="time-elapsed">00:00</div>
            </div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._refFlagCounter = shadowRoot.querySelector("#flags-remaining");
        this._refTimeElapsed = shadowRoot.querySelector("#time-elapsed");
        this.flagsRemaining = FlagCounter.flagsRemaining;
        this._timerID = this.startTimer();
    }
    static get observedAttributes() {
        return ["flags-remaining"];
    }
    connectedCallback() {
        window.addEventListener(FlagCounter.COUNT_UPDATE, (event) => {
            this.flagsRemaining = event.detail.newValue;
        });
    }
    attributeChangedCallback(name, _oldVal, _newVal) {
        if (name === "flags-remaining") {
            this._refFlagCounter.textContent = _newVal;
        }
    }
    get flagsRemaining() {
        return parseInt(this.getAttribute("flags-remaining") || "0");
    }
    set flagsRemaining(newValue) {
        this.setAttribute("flags-remaining", newValue.toString());
    }
    addFlag() {
        this.flagsRemaining = this.flagsRemaining + 1;
    }
    removeFlag() {
        this.flagsRemaining = this.flagsRemaining - 1;
    }
    startTimer() {
        return window.setInterval(this.handleTimeInc, 1000);
    }
    stopTimer() {
        window.clearInterval(this._timerID);
    }
    resetTimer() {
        this._timeElapsed = 0;
    }
}
window.customElements.define("ms-toolbar", Toolbar);

class Grid extends HTMLElement {
    constructor(rows, columns, options) {
        var _a;
        super();
        this.cellRef = [];
        this._cellConstructorData = [];
        this._revealCellNeighbors = (cellCoordinate) => {
            const adjacentCoords = Adjacency.coordinates(cellCoordinate, [this.columns, this.rows]);
            adjacentCoords.forEach((coordinate) => {
                const neighborCell = this.cellRef[coordinate[0]][coordinate[1]];
                if (!neighborCell.flagged) {
                    neighborCell.covered = false;
                }
            });
        };
        this._handleCellHighlight = ((event) => {
            const cellCoord = event.detail.coordinate;
            const targetCell = this.cellRef[cellCoord[0]][cellCoord[1]];
            if (!targetCell.covered) {
                const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.columns, this.rows]);
                adjacentCoords.forEach((coordinate) => {
                    const neighborCell = this.cellRef[coordinate[0]][coordinate[1]];
                    if (!neighborCell.flagged) {
                        neighborCell.neighborHighlight = true;
                    }
                });
            }
        });
        this._handleCellUnHighlight = ((event) => {
            const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.columns, this.rows]);
            adjacentCoords.forEach((coordinate) => {
                const neighborCell = this.cellRef[coordinate[0]][coordinate[1]];
                if (!neighborCell.flagged) {
                    neighborCell.neighborHighlight = false;
                }
            });
        });
        this._handleNeighborReveal = ((event) => {
            this._revealCellNeighbors(event.detail.coordinate);
        });
        this._handleMineUncovered = ((event) => {
            console.log("game over");
            this.cellRef.flat().forEach((cell) => {
                cell.flagged = false;
                cell.covered = false;
                cell._removeEventListeners();
            });
        });
        this.rows = rows;
        this.columns = columns;
        this.mines = ((_a = options) === null || _a === void 0 ? void 0 : _a.mines) || Math.floor(Math.sqrt(rows * columns));
        FlagCounter.flagsRemaining = this.mines;
        this._generateCelConstructorData();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${css$1}</style>
            <div id='toolbar'></div>
            <div id="row-container"></div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._rowContainer = shadowRoot.querySelector("#row-container");
        this._toolbarRef = shadowRoot.querySelector("#toolbar").appendChild(new Toolbar());
    }
    static get observedAttributes() {
        return [];
    }
    connectedCallback() {
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            this._insertRow(rowIndex);
        }
        // this._toolbarRef.flagsRemaining = this.mines;
        this.addEventListener(CellEvents$1.HIGHLIGHTED, this._handleCellHighlight);
        this.addEventListener(CellEvents$1.UNHIGHLIGHTED, this._handleCellUnHighlight);
        this.addEventListener(CellEvents$1.NEIGHBOR_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents$1.MINE_UNCOVERED, this._handleMineUncovered);
        this.addEventListener(CellEvents$1.TRIGGER_CHAIN_REVEAL, this._handleNeighborReveal);
    }
    attributeChangedCallback(name, _oldVal, _newVal) { }
    _generateCelConstructorData() {
        let minesRemaining = this.mines;
        // init data array
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            const cellRowData = new Array(this.columns);
            for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                cellRowData[columnIndex] = { isMined: false, adjacentMines: 0 };
            }
            this._cellConstructorData.push(cellRowData);
        }
        // set mines
        do {
            for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
                for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                    if (!this._cellConstructorData[rowIndex][columnIndex].isMined && minesRemaining > 0 && Random.int(1, 10) === 10) {
                        this._cellConstructorData[rowIndex][columnIndex] = { isMined: true, adjacentMines: 0 };
                        minesRemaining--;
                    }
                }
            }
        } while (minesRemaining > 0);
        // set adjacent mines for un-mined cells
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                if (!this._cellConstructorData[rowIndex][columnIndex].isMined) {
                    this._cellConstructorData[rowIndex][columnIndex].adjacentMines = Adjacency.coordinates([rowIndex, columnIndex], [this.columns, this.rows])
                        .map((coord) => {
                        return this._cellConstructorData[coord[0]][coord[1]].isMined ? 1 : 0;
                    })
                        .reduce((a, b) => a + b, 0);
                }
            }
        }
    }
    _insertRow(rowIndex) {
        const newRow = document.createElement("div");
        newRow.className = "row";
        const rowRef = new Array(this.columns);
        for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            const cellData = this._cellConstructorData[rowIndex][columnIndex];
            const tile = new Cell([rowIndex, columnIndex], cellData.isMined, cellData.adjacentMines);
            rowRef[columnIndex] = tile;
            newRow.appendChild(tile);
        }
        this.cellRef.push(rowRef);
        this._rowContainer.appendChild(newRow);
    }
}
window.customElements.define("ms-grid", Grid);

class Minesweeper extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${css}</style>
            <div id="grid-container"></div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._gridContainer = shadowRoot.querySelector("#grid-container");
    }
    connectedCallback() {
        this._gridContainer.appendChild(new Grid(5, 5));
    }
    ;
}
window.customElements.define("minesweeper-game", Minesweeper);

export default Minesweeper;
