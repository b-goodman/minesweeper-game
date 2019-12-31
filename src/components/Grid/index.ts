import grid from "./Grid.scss";
import Tile, {TileEventDetails} from "../Tile/index";
import CellEvents from "../../enums/CellEvents";
import Adjacency from "../../util/Adjacency";

export default class Grid extends HTMLElement {

    public static get observedAttributes() {
        return ["open", "position"];
    }

    public readonly rows: number;
    public readonly columns: number;

    public cellRef: Array<Tile[]> = [];

    constructor(rows: number, columns: number) {
        super();

        this.rows = rows;
        this.columns = columns;

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${grid}</style>
            <div id="row-container"></div>
        `;

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._rowContainer = shadowRoot.querySelector<HTMLDivElement>("#row-container")!;
    }


    connectedCallback(){
        for (let rowIndex = 0; rowIndex < this.rows; rowIndex++) {
            this._insertRow(rowIndex);
        }
        this.addEventListener(CellEvents.HIGHLIGHTED, this._handleCellHighlight);
        this.addEventListener(CellEvents.UNHIGHLIGHTED, this._handleCellUnHighlight);
    }

    attributeChangedCallback(name: string, _oldVal: string, _newVal: string) {}

    private _rowContainer: HTMLDivElement;

    private _insertRow(rowIndex: number){
        const newRow = document.createElement("div");
        newRow.className = "row";
        const rowRef: Tile[] = new Array(this.columns);
        for (let columnIndex = 0; columnIndex < this.columns; columnIndex++) {
            const tile = new Tile([rowIndex, columnIndex], false, 2);
            rowRef[columnIndex] = tile;
            newRow.appendChild( tile )
        };
        this.cellRef.push(rowRef);
        this._rowContainer.appendChild(newRow);
    }

    private _handleCellHighlight = ((event: CustomEvent<TileEventDetails>): void => {
        const cellCoord = event.detail.coordinate;
        const targetCell = this.cellRef[cellCoord[0]][cellCoord[1]];
        if (!targetCell.covered) {
            const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.columns, this.rows]);
            adjacentCoords.forEach( (coordinate) => {
                this.cellRef[coordinate[0]][coordinate[1]].neighborHighlight = true;
            });
        }
    }) as EventListener;

    private _handleCellUnHighlight = ((event: CustomEvent<TileEventDetails>): void => {
        const adjacentCoords = Adjacency.coordinates(event.detail.coordinate, [this.columns, this.rows]);
        adjacentCoords.forEach( (coordinate) => {
            this.cellRef[coordinate[0]][coordinate[1]].neighborHighlight = false;
        });
    }) as EventListener

}

window.customElements.define("ms-grid", Grid);