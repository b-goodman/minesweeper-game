import grid from "./Grid.scss";
import Cell, {CellEventDetails} from "../Cell/index";
import CellEvents from "../../enums/CellEvents";
import EndgameStates from "../../enums/EndgameStates";
import GameEvents from "../../enums/GameEvents";
import Adjacency from "../../util/Adjacency";
import Random from "../../util/Random";
import Toolbar from "../Toolbar/index";
import FlagCounter from "../../util/FlagCounter";

export interface EndgameEventState {
    state: EndgameStates;
}

export default class Grid extends HTMLElement {

    public static get observedAttributes() {
        return [];
    }

    public readonly rows: number;
    public readonly columns: number;
    public readonly mines: number;
    public hasGameLost: boolean = false;
    public hasGameWon: boolean = false;

    public cellRef: Array<Cell[]> = [];

    constructor(columns: number, rows: number, options?:{mines?:number, scale?: number}) {
        super();

        this.scale = options?.scale || 1;
        this.style.setProperty( "--grid-width", (this.scale * 50 * columns).toString() + "px" );

        this.rows = rows;
        this.columns = columns;
        this.mines = options?.mines || Math.floor(Math.sqrt(rows * columns));
        FlagCounter.flagsRemaining = this.mines;
        this._generateCelConstructorData();

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${grid}</style>
            <div id='toolbar'></div>
            <div id="row-container"></div>
        `;

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._rowContainer = shadowRoot.querySelector<HTMLDivElement>("#row-container")!;
        this._toolbarRef = shadowRoot.querySelector<HTMLDivElement>("#toolbar")!.appendChild(new Toolbar());

        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            this._insertRow(rowIndex);
        };
    }

    connectedCallback(){
        this.addEventListener(CellEvents.HIGHLIGHTED, this._handleCellHighlight);
        this.addEventListener(CellEvents.UNHIGHLIGHTED, this._handleCellUnHighlight);
        this.addEventListener(CellEvents.NEIGHBOR_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents.MINE_UNCOVERED, this._handleMineUncovered, {once: true});
        this.addEventListener(CellEvents.TRIGGER_CHAIN_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents.UNCOVERED, this._checkEndGameStatus);
    }

    disconnectedCallback(){
        this.addEventListener(CellEvents.HIGHLIGHTED, this._handleCellHighlight);
        this.addEventListener(CellEvents.UNHIGHLIGHTED, this._handleCellUnHighlight);
        this.addEventListener(CellEvents.NEIGHBOR_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents.MINE_UNCOVERED, this._handleMineUncovered, {once: true});
        this.addEventListener(CellEvents.TRIGGER_CHAIN_REVEAL, this._handleNeighborReveal);
        this.addEventListener(CellEvents.UNCOVERED, this._checkEndGameStatus)
    }

    attributeChangedCallback(name: string, _oldVal: string, _newVal: string) {}

    private _toolbarRef: Toolbar;
    private _rowContainer: HTMLDivElement;
    private _cellConstructorData: Array<{isMined: boolean, adjacentMines: number}[]> = [];
    private scale?: number;

    private _generateCelConstructorData(){
        let minesRemaining = this.mines;
        // init data array
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            const cellRowData: {isMined: boolean, adjacentMines: number}[] = new Array(this.columns);
            for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                cellRowData[columnIndex] = {isMined: false, adjacentMines: 0}
            };
            this._cellConstructorData.push(cellRowData);
        };
        // set mines
        do {
            for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
                for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                    if (!this._cellConstructorData[rowIndex][columnIndex].isMined && minesRemaining > 0 && Random.int(1,10) === 10) {
                        this._cellConstructorData[rowIndex][columnIndex] = {isMined: true, adjacentMines: 0};
                        minesRemaining--;
                    }
                };
            }
        } while (minesRemaining > 0);
        // set adjacent mines for un-mined cells
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
                if (!this._cellConstructorData[rowIndex][columnIndex].isMined) {
                    this._cellConstructorData[rowIndex][columnIndex].adjacentMines = Adjacency.coordinates([rowIndex, columnIndex], [this.rows, this.columns])
                        .map( (coord) => {
                            return this._cellConstructorData[coord[0]][coord[1]].isMined ? 1 : 0;
                        })
                        .reduce((a:number, b:number) => a + b, 0);
                }
            };
        };
    }

    private _insertRow(rowIndex: number){
        const newRow = document.createElement("div");
        newRow.className = "row";
        const rowRef: Cell[] = new Array(this.columns);
        for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            const cellData = this._cellConstructorData[rowIndex][columnIndex];
            const tile = new Cell([rowIndex, columnIndex], cellData.isMined, cellData.adjacentMines, {scale: this.scale});
            rowRef[columnIndex] = tile;
            newRow.appendChild( tile )
        };
        this.cellRef.push(rowRef);
        this._rowContainer.appendChild(newRow);
    }

    private _revealCellNeighbors = (cellCoordinate: [number, number]) => {
        const adjacentCoords = Adjacency.coordinates(cellCoordinate, [this.rows, this.columns]);
        adjacentCoords.forEach( (coordinate) => {
            const neighborCell = this.cellRef[coordinate[0]][coordinate[1]];
            if (!neighborCell.flagged && neighborCell.covered){
                neighborCell.covered = false;
            }
        });
    };

    private _handleCellHighlight = ((event: CustomEvent<CellEventDetails>): void => {
        const cellCoord = event.detail.coordinate;
        const targetCell = this.cellRef[cellCoord[0]][cellCoord[1]];
        if (!targetCell.covered) {
            const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.rows, this.columns]);
            adjacentCoords.forEach( (coordinate) => {
                const neighborCell = this.cellRef[coordinate[0]][coordinate[1]];
                if (!neighborCell.flagged){
                    neighborCell.neighborHighlight = true;
                }
            });
        }
    }) as EventListener;

    private _handleCellUnHighlight = ((event: CustomEvent<CellEventDetails>): void => {
        const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.rows, this.columns]);
        adjacentCoords.forEach( (coordinate) => {
            const neighborCell = this.cellRef[coordinate[0]][coordinate[1]];
            if (!neighborCell.flagged){
                neighborCell.neighborHighlight = false;
            }
        });
    }) as EventListener;

    private _handleNeighborReveal = ((event: CustomEvent<CellEventDetails>): void => {
        this._revealCellNeighbors(event.detail.coordinate)
    }) as EventListener;

    private _handleMineUncovered = ((event: CustomEvent<CellEventDetails>): void => {
        this.hasGameLost = true;
        this._toolbarRef.stopTimer();
        this.cellRef.flat().forEach( (cell) => {
            cell.flagged = false;
            cell.covered = false;
            cell._removeEventListeners();
        });
        this.dispatchEvent( new CustomEvent<EndgameEventState>(GameEvents.GAME_END, {bubbles: true, composed: true, detail: {state: EndgameStates.LOSE}}) );
    }) as EventListener;

    private _checkEndGameStatus = ((event: CustomEvent<CellEventDetails>): void => {
        const hasGameWon = !this.hasGameLost && this.cellRef.flat().filter( cell => !cell.isMined).every( cell => !cell.covered);
        if (hasGameWon) {
            this._toolbarRef.stopTimer();
            this.cellRef.flat().forEach( (cell) => {
                cell._removeEventListeners();
            });
            this.dispatchEvent( new CustomEvent<EndgameEventState>(GameEvents.GAME_END, {bubbles: true, composed: true, detail: {state: EndgameStates.WIN}}) );
        };
    }) as EventListener;

}

window.customElements.define("ms-grid", Grid);