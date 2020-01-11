export default class Toolbar extends HTMLElement {
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string, _oldVal: string, _newVal: string): void;
    get flagsRemaining(): number;
    set flagsRemaining(newValue: number);
    addFlag(): void;
    removeFlag(): void;
    startTimer(): number;
    stopTimer(): void;
    resetTimer(): void;
    private _refFlagCounter;
    private _refTimeElapsed;
    private _timeElapsed;
    private _timerID;
    private handleTimeInc;
}
