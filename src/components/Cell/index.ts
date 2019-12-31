import tile from "./Cell.scss";
import CellEvents from "../../enums/CellEvents";
import FlagCounter from "../../util/FlagCounter";

export interface CellEventDetails {
        coordinate: [number, number]
}

export default class Cell extends HTMLElement {

    public readonly coordinate: [number, number];

    public static get observedAttributes() {
        return ["highlighted", "neighbor-highlight", "covered", "flagged"];
    }

    constructor(coordinate: [number, number], isMined: boolean, adjacentMines: number) {
        super();

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
        this._highlightedEvent = new CustomEvent<CellEventDetails>(CellEvents.HIGHLIGHTED, customEventOptions);
        this._unhighlightedEvent = new CustomEvent<CellEventDetails>(CellEvents.UNHIGHLIGHTED, customEventOptions);
        this._uncoverEvent = new CustomEvent<CellEventDetails>(CellEvents.UNCOVERED, customEventOptions);
        this._mineUncoveredEvent = new CustomEvent<CellEventDetails>(CellEvents.MINE_UNCOVERED, customEventOptions);
        this._revealNeighborsEvent = new CustomEvent<CellEventDetails>(CellEvents.NEIGHBOR_REVEAL, customEventOptions);
        this._triggerChainReveal = new CustomEvent<CellEventDetails>(CellEvents.TRIGGER_CHAIN_REVEAL, customEventOptions);

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${tile}</style>
            <div id="cell-content"></div>
        `;

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._refContent = shadowRoot.querySelector<HTMLDivElement>("#cell-content")!;
    }

    set isHighlighted(newState: boolean){
        this.setAttribute("highlighted", JSON.stringify(newState))
    }

    get isHighlighted(){
        return JSON.parse(this.getAttribute("highlighted") || "false");
    }

    set neighborHighlight(newState: boolean){
        this.setAttribute("neighbor-highlight", JSON.stringify(newState));
    }

    get neighborHighlight(){
        return JSON.parse(this.getAttribute("neighbor-highlight") || "false");
    }

    set covered(newState: boolean){
        this.setAttribute("covered", JSON.stringify(newState));
    }

    get covered(){
        return JSON.parse(this.getAttribute("covered") || "true");
    }

    set flagged(newState: boolean){
        this.setAttribute("flagged", JSON.stringify(newState));
    }

    get flagged(){
        return JSON.parse(this.getAttribute("flagged") || "false");
    }

    connectedCallback(){
        this._addEventListeners();
    }

    disconnectedCallback(){
        this._removeEventListeners();
    }

    attributeChangedCallback(name: string, _oldVal: string, _newVal: string) {
        if (name === "covered" && _newVal === "false" && _oldVal !== "false") {
            this.dispatchEvent(this._uncoverEvent);
            if (this._isMined) {
                this._removeEventListeners();
                this._handleMineReveal();
            } else {
                this._handleStandardReveal();
            }
        }
        if (name === "covered" && _newVal === "true" && _oldVal === "false") {
            this.covered = false;
        }
        if (name === "flagged") {
            if (_newVal === "true" && FlagCounter.flagsRemaining > 0) {
                FlagCounter.setFlagsRemaining(FlagCounter.flagsRemaining - 1)
            } else if (_oldVal === "true" && _newVal === "false") {
                FlagCounter.setFlagsRemaining(FlagCounter.flagsRemaining + 1)
            }
        }
    }

    private handleMouseEnter = (event?: MouseEvent) => {
        this.isHighlighted = true;
        this.dispatchEvent( this._highlightedEvent );
    }

    private handleMouseLeave = (event?: MouseEvent) => {
        this.isHighlighted = false;
        this.dispatchEvent( this._unhighlightedEvent );
    }

    private handleMouseClick = (event: MouseEvent) => {
        // either reveal cell if un-flagged or un-flag if currently flagged
        if (this.flagged) {
            this.flagged = false;
        } else {
            this.covered = false;
        }
    }

    private handleMouseAltClick = (event: MouseEvent) => {
        // only allow flagging for covered cells
        event.preventDefault();
        if (this.covered && FlagCounter.flagsRemaining > 0) {
            this.flagged = !this.flagged;
        }
    }

    private handleMouseDblClick = (event: MouseEvent) => {
        // only allow quick reveal of neighboring cells if this cell is uncovered
        if (!this.covered) {
            this.dispatchEvent(this._revealNeighborsEvent);
        }
    }

    private readonly _isMined: boolean;
    private readonly _adjacentMines: number;
    private _refContent: HTMLDivElement;
    private _highlightedEvent: CustomEvent;
    private _unhighlightedEvent: CustomEvent;
    private _uncoverEvent: CustomEvent;
    private _mineUncoveredEvent: CustomEvent;
    private _revealNeighborsEvent: CustomEvent;
    private _triggerChainReveal: CustomEvent;
    private _inputEvents: Array<[keyof HTMLElementEventMap, any]> = [
        ["mouseenter", this.handleMouseEnter],
        ["mouseleave", this.handleMouseLeave],
        ["click", this.handleMouseClick],
        ["contextmenu", this.handleMouseAltClick],
        ["dblclick", this.handleMouseDblClick],
    ];

    private _addEventListeners(){
        this._inputEvents.forEach( (event) => {
            this.addEventListener(...event);
        })
    }

    public _removeEventListeners(){
        this._inputEvents.forEach( (event) => {
            this.removeEventListener(...event);
        })
    }

    private _handleMineReveal = () => {
        this.dispatchEvent(this._mineUncoveredEvent);
        this.setAttribute("mine", "true");
        this.isHighlighted = false;
        this.neighborHighlight = false;
    }

    private _handleStandardReveal = () => {
        if (this._adjacentMines > 0) {
            this._refContent.textContent = this._adjacentMines.toString();
        } else {
            this.isHighlighted = false;
            this._removeEventListeners();
            this.dispatchEvent(this._triggerChainReveal);
        }
        this.classList.add(`adjacency-degree--${this._adjacentMines.toString()}`);
    }
}

window.customElements.define("ms-tile", Cell);