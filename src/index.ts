import style from "./index.scss";
import Grid from "./components/Grid/index";

export default class Minesweeper extends HTMLElement {

    constructor(){
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <div id="grid-container"></div>
        `;

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._gridContainer = shadowRoot.querySelector<HTMLDivElement>("#grid-container")!;

    }

    connectedCallback(){
        this._gridContainer.appendChild( new Grid(5, 5) );
    };

    private _gridContainer: HTMLDivElement;
}

window.customElements.define("minesweeper-game", Minesweeper);