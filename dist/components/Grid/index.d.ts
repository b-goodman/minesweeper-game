import Cell from "../Cell/index";
import EndgameStates from "../../enums/EndgameStates";
export interface EndgameEventState {
    state: EndgameStates;
}
export default class Grid extends HTMLElement {
    static get observedAttributes(): never[];
    readonly rows: number;
    readonly columns: number;
    readonly mines: number;
    hasGameLost: boolean;
    hasGameWon: boolean;
    cellRef: Array<Cell[]>;
    constructor(columns: number, rows: number, options?: {
        mines?: number;
        scale?: number;
    });
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, _oldVal: string, _newVal: string): void;
    private _toolbarRef;
    private _rowContainer;
    private _cellConstructorData;
    private scale?;
    private _generateCelConstructorData;
    private _insertRow;
    private _revealCellNeighbors;
    private _handleCellHighlight;
    private _handleCellUnHighlight;
    private _handleNeighborReveal;
    private _handleMineUncovered;
    private _checkEndGameStatus;
}
