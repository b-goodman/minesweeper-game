var css = "";

var css$1 = ".row {\n  display: flex;\n  flex-direction: row;\n}\n\n#row-container {\n  display: flex;\n  flex-direction: column;\n}";

var css$2 = ":host {\n  z-index: 1;\n  display: block;\n  width: 50px;\n  height: 50px;\n  border: 1px solid #1d1d1d;\n  background: #3D6AF2;\n  text-align: center;\n  font-size: 25px;\n  font-family: sans-serif;\n  line-height: 50px;\n}\n\n:host([mine=true]) {\n  background: black;\n}\n\n:host([highlighted=true]) {\n  outline: 1px solid #0540F2;\n  z-index: 2;\n}\n\n:host([neighbor-highlight=true]) {\n  background: #6a98c3;\n}\n\n:host(.adjacency-degree--1[covered=false]) {\n  background: #ffb3b3;\n}\n\n:host(.adjacency-degree--2[covered=false]) {\n  background: #ff9999;\n}\n\n:host(.adjacency-degree--3[covered=false]) {\n  background: #ff8080;\n}\n\n:host(.adjacency-degree--4[covered=false]) {\n  background: #ff6666;\n}\n\n:host(.adjacency-degree--5[covered=false]) {\n  background: #ff4d4d;\n}\n\n:host(.adjacency-degree--6[covered=false]) {\n  background: #ff3333;\n}\n\n:host(.adjacency-degree--7[covered=false]) {\n  background: #ff1a1a;\n}\n\n:host(.adjacency-degree--8[covered=false]) {\n  background: red;\n}\n\n:host(.adjacency-degree--0[covered=false]) {\n  background: white;\n  border: 1px solid white;\n  z-index: 0;\n}";

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
    }
}
FlagCounter.COUNT_UPDATE = "flag_count_update";

var flagIcon = "<svg width=\"50\" height=\"50\" xmlns=\"http://www.w3.org/2000/svg\">\n <g>\n  <title>background</title>\n  <rect fill=\"none\" id=\"canvas_background\" height=\"52\" width=\"52\" y=\"-1\" x=\"-1\"/>\n  <g display=\"none\" overflow=\"visible\" y=\"0\" x=\"0\" height=\"100%\" width=\"100%\" id=\"canvasGrid\">\n   <rect fill=\"url(#gridpattern)\" stroke-width=\"0\" y=\"0\" x=\"0\" height=\"100%\" width=\"100%\"/>\n  </g>\n </g>\n <g>\n  <title>Flag</title>\n  <path id=\"svg_6\" d=\"m4.5105,5.20324l-0.03498,40.531c0.03498,0.02866 40.5944,-20.53101 40.5944,-20.53101c0,0 1.95804,0.41958 -40.55942,-19.99999z\" stroke-opacity=\"null\" stroke-width=\"1.5\" stroke=\"#000\" fill=\"#ff0000\"/>\n </g>\n</svg>";

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
        this._hasChainRevealed = false;
        this._hasUncovered = false;
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
            if (this.adjacentMines > 0) {
                this._refContent.textContent = this.adjacentMines.toString();
            }
            else {
                if (!this._hasChainRevealed) {
                    this._hasChainRevealed = true;
                    this.isHighlighted = false;
                    this._removeEventListeners();
                    window.setTimeout(() => this.dispatchEvent(this._triggerChainReveal), 10);
                }
            }
            this.classList.add(`adjacency-degree--${this.adjacentMines.toString()}`);
        };
        this.isMined = isMined;
        this.coordinate = coordinate;
        this.adjacentMines = adjacentMines;
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
        if (name === "covered" && _newVal === "false") {
            if (!this._hasUncovered) {
                this._hasUncovered = true;
                this.dispatchEvent(this._uncoverEvent);
                if (this.isMined) {
                    this._removeEventListeners();
                    this._handleMineReveal();
                }
                else {
                    this._handleStandardReveal();
                }
            }
        }
        if (name === "flagged") {
            if (_newVal === "true" && FlagCounter.flagsRemaining > 0) {
                FlagCounter.setFlagsRemaining(FlagCounter.flagsRemaining - 1);
                this._refContent.innerHTML = flagIcon;
            }
            else if (_oldVal === "true" && _newVal === "false") {
                FlagCounter.setFlagsRemaining(FlagCounter.flagsRemaining + 1);
                this._refContent.innerHTML = "";
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

var EndgameStates;
(function (EndgameStates) {
    EndgameStates["WIN"] = "win";
    EndgameStates["LOSE"] = "lose";
})(EndgameStates || (EndgameStates = {}));
var EndgameStates$1 = EndgameStates;

var GameEvents;
(function (GameEvents) {
    GameEvents["GAME_END"] = "game_end";
})(GameEvents || (GameEvents = {}));
var GameEvent = GameEvents;

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

var css$3 = ":host {\n  font-size: 26px;\n  font-family: sans-serif;\n}\n\n#toolbar-wrapper {\n  display: flex;\n  flex-direction: row;\n}\n#toolbar-wrapper div {\n  display: flex;\n}\n#toolbar-wrapper div.icon-wrapper:not(:last-of-type) {\n  margin: 0 1em 0 0;\n}\n#toolbar-wrapper .icon {\n  margin: 0 0.5em 0 0;\n}\n#toolbar-wrapper .icon-lbl {\n  line-height: 50px;\n}";

var clockIcon = "<svg width=\"50\" height=\"50\" xmlns=\"http://www.w3.org/2000/svg\">\n <!-- Created with Method Draw - http://github.com/duopixel/Method-Draw/ -->\n <g>\n  <title>background</title>\n  <rect fill=\"#fff\" id=\"canvas_background\" height=\"52\" width=\"52\" y=\"-1\" x=\"-1\"/>\n  <g display=\"none\" overflow=\"visible\" y=\"0\" x=\"0\" height=\"100%\" width=\"100%\" id=\"canvasGrid\">\n   <rect fill=\"url(#gridpattern)\" stroke-width=\"0\" y=\"0\" x=\"0\" height=\"100%\" width=\"100%\"/>\n  </g>\n </g>\n <g>\n  <title>Time</title>\n  <ellipse ry=\"21.95803\" rx=\"21.95803\" id=\"svg_1\" cy=\"25.62281\" cx=\"25.06993\" stroke-width=\"1.5\" stroke=\"#000\" fill=\"#fff\"/>\n  <path id=\"svg_3\" d=\"m24.65035,7.44101l-0.03498,17.87366l12.02797,12.02797\" opacity=\"0.5\" fill-opacity=\"null\" stroke-opacity=\"null\" stroke-width=\"1.5\" stroke=\"#000\" fill=\"#fff\"/>\n </g>\n</svg>";

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
                <div class="icon-wrapper">
                    <div class="icon">${flagIcon}</div>
                    <div class="icon-lbl" id="flags-remaining"></div>
                </div>
                <div class="icon-wrapper">
                    <div class="icon" id="clock-icon">${clockIcon}</div>
                    <div class="icon-lbl" id="time-elapsed">00:00</div>
                </div>
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
        this.hasGameLost = false;
        this.hasGameWon = false;
        this.cellRef = [];
        this._cellConstructorData = [];
        this._revealCellNeighbors = (cellCoordinate) => {
            const adjacentCoords = Adjacency.coordinates(cellCoordinate, [this.columns, this.rows]);
            adjacentCoords.forEach((coordinate) => {
                const neighborCell = this.cellRef[coordinate[0]][coordinate[1]];
                if (!neighborCell.flagged && neighborCell.covered) {
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
            this.hasGameLost = true;
            this._toolbarRef.stopTimer();
            this.cellRef.flat().forEach((cell) => {
                cell.flagged = false;
                cell.covered = false;
                cell._removeEventListeners();
            });
            this.dispatchEvent(new CustomEvent(GameEvent.GAME_END, { bubbles: true, composed: true, detail: { state: EndgameStates$1.LOSE } }));
        });
        this._checkEndGameStatus = ((event) => {
            const hasGameWon = !this.hasGameLost && this.cellRef.flat().filter(cell => !cell.isMined).every(cell => !cell.covered);
            if (hasGameWon) {
                this._toolbarRef.stopTimer();
                this.cellRef.flat().forEach((cell) => {
                    cell._removeEventListeners();
                });
                this.dispatchEvent(new CustomEvent(GameEvent.GAME_END, { bubbles: true, composed: true, detail: { state: EndgameStates$1.WIN } }));
            }
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
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            this._insertRow(rowIndex);
        }
    }
    static get observedAttributes() {
        return [];
    }
    connectedCallback() {
        this.addEventListener(CellEvents$1.HIGHLIGHTED, this._handleCellHighlight);
        this.addEventListener(CellEvents$1.UNHIGHLIGHTED, this._handleCellUnHighlight);
        this.addEventListener(CellEvents$1.NEIGHBOR_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents$1.MINE_UNCOVERED, this._handleMineUncovered, { once: true });
        this.addEventListener(CellEvents$1.TRIGGER_CHAIN_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents$1.UNCOVERED, this._checkEndGameStatus);
    }
    disconnectedCallback() {
        this.addEventListener(CellEvents$1.HIGHLIGHTED, this._handleCellHighlight);
        this.addEventListener(CellEvents$1.UNHIGHLIGHTED, this._handleCellUnHighlight);
        this.addEventListener(CellEvents$1.NEIGHBOR_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents$1.MINE_UNCOVERED, this._handleMineUncovered, { once: true });
        this.addEventListener(CellEvents$1.TRIGGER_CHAIN_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents$1.UNCOVERED, this._checkEndGameStatus);
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

var css$4 = ".row{display:flex;justify-content:center}.row div:not(:last-of-type){margin:0 5px 0 0}.btn,::slotted(.btn){font-size:16px;min-width:70px;height:30px;padding:0 3px;border:1px solid #000;border-radius:3px;text-align:center;line-height:30px;cursor:pointer}.btn:active,::slotted(.btn:active){box-shadow:inset 1px 1px grey}.primary,::slotted(.primary){background:#d4e8ea}.secondary,::slotted(.secondary){background:#ead4d4}div#dialog-title,slot[name=dialog-title]{font-weight:600;font-size:18px}div#dialog-content,slot[name=dialog-content]::slotted(div){padding:10px}:host([open=true]) #box{display:unset}:host([open=true]) #mask{display:unset;opacity:.5}:host{font-family:sans-serif}:host #box{padding:5px;height:auto;left:50%;top:50%;transform:translate(-50%,-50%);border:1px solid #000;background:#fff;width:300px;max-height:300px;min-height:100px;z-index:999}:host #box,:host #mask{display:none;position:absolute}:host #mask{top:0;left:0;background-color:rgba(0,0,0,.5);opacity:0;width:100vw;height:100vh;z-index:998;transition:opacity .4s ease-out}";

class DialogBox extends HTMLElement {
    constructor(opts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        super();
        this._confirmBtnClickEvent = new Event("confirmed");
        this._cancelBtnClickEvent = new Event("cancelled");
        this._handleCancelBtnClick = (_event) => {
            this.dispatchEvent(this._cancelBtnClickEvent);
            this.open = false;
        };
        this._handleConfirmBtnClick = (_event) => {
            if (this.closeOnConfirm) {
                this.open = false;
            }
            this.dispatchEvent(this._confirmBtnClickEvent);
        };
        if ((_b = (_a = opts) === null || _a === void 0 ? void 0 : _a.confirmBtn) === null || _b === void 0 ? void 0 : _b.include)
            this.confirmBtn = (_d = (_c = opts) === null || _c === void 0 ? void 0 : _c.confirmBtn) === null || _d === void 0 ? void 0 : _d.include;
        if ((_f = (_e = opts) === null || _e === void 0 ? void 0 : _e.confirmBtn) === null || _f === void 0 ? void 0 : _f.lbl)
            this.confirmLbl = (_h = (_g = opts) === null || _g === void 0 ? void 0 : _g.confirmBtn) === null || _h === void 0 ? void 0 : _h.lbl;
        if ((_k = (_j = opts) === null || _j === void 0 ? void 0 : _j.cancelBtn) === null || _k === void 0 ? void 0 : _k.include)
            this.cancelBtn = (_m = (_l = opts) === null || _l === void 0 ? void 0 : _l.cancelBtn) === null || _m === void 0 ? void 0 : _m.include;
        if ((_p = (_o = opts) === null || _o === void 0 ? void 0 : _o.cancelBtn) === null || _p === void 0 ? void 0 : _p.lbl)
            this.cancelLbl = (_r = (_q = opts) === null || _q === void 0 ? void 0 : _q.cancelBtn) === null || _r === void 0 ? void 0 : _r.lbl;
        if ((_s = opts) === null || _s === void 0 ? void 0 : _s.closeOnConfirm)
            this.closeOnConfirm = (_t = opts) === null || _t === void 0 ? void 0 : _t.closeOnConfirm;
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${css$4}</style>
            <div id="box">

                <div id="dialog-content-wrapper">
                    <slot name="dialog-title"></slot>
                    <slot name="dialog-content"></slot>
                </div>

                ${this.querySelector("[slot='dialog-control']") === null
            ? `<div class="row">
                            ${this.confirmBtn ? `<div class="btn primary" id="confirm_btn">${this.confirmLbl}</div>` : ``}
                            ${this.cancelBtn ? `<div class="btn secondary" id="cancel_btn">${this.cancelLbl}</div>` : ``}
                        </div>`
            : `<slot name="dialog-control" class="row"></slot>`}
            </div>
            <div id="mask"></div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        if (this.querySelector("[slot='dialog-title']") === null) {
            const title = document.createElement("div");
            title.slot = "dialog-title";
            title.innerText = ((_u = opts) === null || _u === void 0 ? void 0 : _u.title) || "";
            this.appendChild(title);
        }
        if (this.querySelector("[slot='dialog-content']") === null) {
            const content = document.createElement("div");
            content.slot = "dialog-content";
            content.innerText = ((_v = opts) === null || _v === void 0 ? void 0 : _v.content) || "";
            this.appendChild(content);
        }
        this._cancelBtnRef = shadowRoot.querySelector("#cancel_btn") || undefined;
        this._confirmBtnRef = shadowRoot.querySelector("#confirm_btn") || undefined;
        this._titleRef = this.querySelector("[slot='dialog-title']");
        this._contentRef = this.querySelector("[slot='dialog-content']");
    }
    static get observedAttributes() {
        return ["open"];
    }
    connectedCallback() {
        if (this._cancelBtnRef) {
            this._cancelBtnRef.addEventListener("click", this._handleCancelBtnClick);
        }
        if (this._confirmBtnRef) {
            this._confirmBtnRef.addEventListener("click", this._handleConfirmBtnClick);
        }
    }
    set open(newState) {
        this.setAttribute("open", JSON.stringify(newState));
    }
    get open() {
        return this.hasAttribute("open");
    }
    set closeOnConfirm(newState) {
        this.setAttribute("close-on-confirm", JSON.stringify(newState));
    }
    get closeOnConfirm() {
        return JSON.parse(this.getAttribute("close-on-confirm") || "true");
    }
    set confirmLbl(newLbl) {
        this.setAttribute("confirm-lbl", newLbl);
    }
    get confirmLbl() {
        return this.getAttribute("confirm-lbl") || "OK";
    }
    set confirmBtn(newState) {
        this.setAttribute("confirm-btn", JSON.stringify(newState));
    }
    get confirmBtn() {
        return JSON.parse(this.getAttribute("confirm-btn") || "true");
    }
    set cancelBtn(newState) {
        this.setAttribute("cancel-btn", JSON.stringify(newState));
    }
    get cancelBtn() {
        return JSON.parse(this.getAttribute("cancel-btn") || "true");
    }
    set cancelLbl(newLbl) {
        this.setAttribute("cancel-lbl", newLbl);
    }
    get cancelLbl() {
        return this.getAttribute("cancel-lbl") || "Cancel";
    }
    get dialogTitle() {
        return this._titleRef.innerHTML;
    }
    set dialogTitle(newTitle) {
        this._titleRef.innerText = newTitle;
    }
    get dialogContent() {
        return this._contentRef.innerHTML;
    }
    set dialogContent(newContent) {
        this._contentRef.innerHTML = newContent;
    }
}
window.customElements.define("dialog-box", DialogBox);

class Minesweeper extends HTMLElement {
    constructor() {
        super();
        this._handleGameEnd = ((_event) => {
            console.log("Game Over: ", _event.detail.state);
            this._dialogBoxRef.dialogTitle = (_event.detail.state === EndgameStates$1.WIN) ? "You win" : "Game Over";
            this._dialogBoxRef.dialogContent = (_event.detail.state === EndgameStates$1.WIN) ? "All safe tiles uncovered." : "You uncovered a mine.";
            this._dialogBoxRef.open = true;
        });
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${css}</style>
            <div id="grid-container"></div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._gridContainer = shadowRoot.querySelector("#grid-container");
        this._dialogBoxRef = shadowRoot.appendChild(new DialogBox({
            confirmBtn: { include: true, lbl: "New Game" },
        }));
        this.addEventListener(GameEvent.GAME_END, this._handleGameEnd);
        this._dialogBoxRef.addEventListener("confirmed", () => {
            this.newGame();
        });
    }
    static get observedAttributes() {
        return ["width", "height"];
    }
    connectedCallback() {
        this.newGame();
    }
    ;
    attributeChangedCallback(name, _oldVal, _newVal) {
        if (name === "width" || name === "height") {
            this.newGame();
        }
    }
    get width() {
        return parseInt(this.getAttribute("width") || "10");
    }
    set width(newValue) {
        this.setAttribute("width", newValue.toString());
    }
    get height() {
        return parseInt(this.getAttribute("height") || "10");
    }
    set height(newValue) {
        this.setAttribute("height", newValue.toString());
    }
    newGame() {
        this._gridContainer.childNodes.forEach(node => node.remove());
        this._gridContainer.appendChild(new Grid(this.width, this.height));
    }
}
window.customElements.define("minesweeper-game", Minesweeper);

export default Minesweeper;
