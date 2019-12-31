var css = "";

var css$1 = ".row {\n  display: flex;\n  flex-direction: row;\n}\n\n#row-container {\n  display: flex;\n  flex-direction: column;\n}";

var css$2 = ":host {\n  display: block;\n  width: 50px;\n  height: 50px;\n  border: 1px solid gray;\n  background: #3D6AF2;\n  text-align: center;\n  font-size: 25px;\n  font-family: sans-serif;\n  line-height: 50px;\n}\n\n:host([highlighted=true]) {\n  background: #0540F2;\n}\n\n:host([neighbor-highlight=true]) {\n  background: #6a98c3;\n}\n\n:host(.adjacency-degree--1[covered=false]) {\n  background: #ffb3b3;\n}\n\n:host(.adjacency-degree--2[covered=false]) {\n  background: #ff9999;\n}\n\n:host(.adjacency-degree--3[covered=false]) {\n  background: #ff8080;\n}\n\n:host(.adjacency-degree--4[covered=false]) {\n  background: #ff6666;\n}\n\n:host(.adjacency-degree--5[covered=false]) {\n  background: #ff4d4d;\n}\n\n:host(.adjacency-degree--6[covered=false]) {\n  background: #ff3333;\n}\n\n:host(.adjacency-degree--7[covered=false]) {\n  background: #ff1a1a;\n}\n\n:host(.adjacency-degree--8[covered=false]) {\n  background: red;\n}\n\n:host(.adjacency-degree--0[covered=false]) {\n  background: white;\n}";

var CellEvents;
(function (CellEvents) {
    CellEvents["UNCOVERED"] = "uncovered";
    CellEvents["FLAGGED"] = "flagged";
    CellEvents["UNFLAGGED"] = "unflagged";
    CellEvents["MINE_UNCOVERED"] = "mine_uncovered";
    CellEvents["HIGHLIGHTED"] = "highlighted";
    CellEvents["UNHIGHLIGHTED"] = "unhighlighted";
})(CellEvents || (CellEvents = {}));
var CellEvents$1 = CellEvents;

class Tile extends HTMLElement {
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
            this.covered = false;
        };
        this.handleMouseAltClick = (event) => {
            event.preventDefault();
            this.flagged = !this.flagged;
        };
        this._inputEvents = [
            ["mouseenter", this.handleMouseEnter],
            ["mouseleave", this.handleMouseLeave],
            ["click", this.handleMouseClick],
            ["contextmenu", this.handleMouseAltClick]
        ];
        this._handleMineReveal = () => {
            this.dispatchEvent(this._mineUncoveredEvent);
            this.setAttribute("mine", "true");
            this.isHighlighted = false;
            this.neighborHighlight = false;
        };
        this._handleStandardReveal = () => {
            this._refContent.textContent = this._adjacentMines.toString();
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
            console.log("uncovering tile ", this.coordinate);
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
window.customElements.define("ms-tile", Tile);

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

class Grid extends HTMLElement {
    constructor(rows, columns) {
        super();
        this.cellRef = [];
        this._handleCellHighlight = ((event) => {
            const cellCoord = event.detail.coordinate;
            const targetCell = this.cellRef[cellCoord[0]][cellCoord[1]];
            console.log(targetCell);
            if (!targetCell.covered) {
                const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.columns, this.rows]);
                adjacentCoords.forEach((coordinate) => {
                    this.cellRef[coordinate[0]][coordinate[1]].neighborHighlight = true;
                });
            }
        });
        this._handleCellUnHighlight = ((event) => {
            const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.columns, this.rows]);
            adjacentCoords.forEach((coordinate) => {
                this.cellRef[coordinate[0]][coordinate[1]].neighborHighlight = false;
            });
        });
        this.rows = rows;
        this.columns = columns;
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${css$1}</style>
            <div id="row-container"></div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._rowContainer = shadowRoot.querySelector("#row-container");
    }
    static get observedAttributes() {
        return ["open", "position"];
    }
    connectedCallback() {
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            this._insertRow(rowIndex);
        }
        this.addEventListener(CellEvents$1.HIGHLIGHTED, this._handleCellHighlight);
        this.addEventListener(CellEvents$1.UNHIGHLIGHTED, this._handleCellUnHighlight);
    }
    attributeChangedCallback(name, _oldVal, _newVal) { }
    _insertRow(rowIndex) {
        const newRow = document.createElement("div");
        newRow.className = "row";
        const rowRef = new Array(this.columns);
        for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            const tile = new Tile([rowIndex, columnIndex], false, 2);
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
