import tile from "./Tile.scss";
import CellEvents from "../../enums/CellEvents";

export interface TileEventDetails {
        coordinate: [number, number]
}

export default class Tile extends HTMLElement {

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
        this._highlightedEvent = new CustomEvent<TileEventDetails>(CellEvents.HIGHLIGHTED, customEventOptions);
        this._unhighlightedEvent = new CustomEvent<TileEventDetails>(CellEvents.UNHIGHLIGHTED, customEventOptions);
        this._uncoverEvent = new CustomEvent<TileEventDetails>(CellEvents.UNCOVERED, customEventOptions);
        this._mineUncoveredEvent = new CustomEvent<TileEventDetails>(CellEvents.MINE_UNCOVERED, customEventOptions);

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
            console.log("uncovering tile ", this.coordinate);
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
    }

    public handleMouseEnter = (event?: MouseEvent) => {
        this.isHighlighted = true;
        this.dispatchEvent( this._highlightedEvent );
    }

    public handleMouseLeave = (event?: MouseEvent) => {
        this.isHighlighted = false;
        this.dispatchEvent( this._unhighlightedEvent );
    }

    public handleMouseClick = (event: MouseEvent) => {
        this.covered = false;
    }

    public handleMouseAltClick = (event: MouseEvent) => {
        event.preventDefault();
        this.flagged = !this.flagged;
    }

    private readonly _isMined: boolean;
    private readonly _adjacentMines: number;
    private _refContent: HTMLDivElement;
    private _highlightedEvent: CustomEvent;
    private _unhighlightedEvent: CustomEvent;
    private _uncoverEvent: CustomEvent;
    private _mineUncoveredEvent: CustomEvent;
    private _inputEvents: Array<[keyof HTMLElementEventMap, any]> = [
        ["mouseenter", this.handleMouseEnter],
        ["mouseleave", this.handleMouseLeave],
        ["click", this.handleMouseClick],
        ["contextmenu", this.handleMouseAltClick]
    ];

    private _addEventListeners(){
        this._inputEvents.forEach( (event) => {
            this.addEventListener(...event);
        })
    }

    private _removeEventListeners(){
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
        this._refContent.textContent = this._adjacentMines.toString();
        this.classList.add(`adjacency-degree--${this._adjacentMines.toString()}`);
    }
}

window.customElements.define("ms-tile", Tile);