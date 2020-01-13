export interface CellEventDetails {
    coordinate: [number, number];
}
export default class Cell extends HTMLElement {
    readonly coordinate: [number, number];
    readonly isMined: boolean;
    readonly adjacentMines: number;
    static get observedAttributes(): string[];
    constructor(coordinate: [number, number], isMined: boolean, adjacentMines: number, opts?: {
        scale?: number;
    });
    set isHighlighted(newState: boolean);
    get isHighlighted(): boolean;
    set neighborHighlight(newState: boolean);
    get neighborHighlight(): boolean;
    set covered(newState: boolean);
    get covered(): boolean;
    set flagged(newState: boolean);
    get flagged(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, _oldVal: string, _newVal: string): void;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleMouseClick;
    private handleMouseAltClick;
    private handleMouseDblClick;
    private _refContent;
    private _highlightedEvent;
    private _unhighlightedEvent;
    private _uncoverEvent;
    private _mineUncoveredEvent;
    private _revealNeighborsEvent;
    private _triggerChainReveal;
    private _hasChainRevealed;
    private _hasUncovered;
    private _inputEvents;
    private _addEventListeners;
    _removeEventListeners(): void;
    private _handleMineReveal;
    private _handleStandardReveal;
}
