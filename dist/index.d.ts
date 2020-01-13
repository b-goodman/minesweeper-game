export default class Minesweeper extends HTMLElement {
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string, _oldVal: string, _newVal: string): void;
    get width(): number;
    set width(newValue: number);
    get height(): number;
    set height(newValue: number);
    get mines(): number | null;
    set mines(newValue: number | null);
    get scale(): number;
    set scale(newValue: number);
    newGame(): void;
    private _gridContainer;
    private _dialogBoxRef;
    private _handleGameEnd;
}
