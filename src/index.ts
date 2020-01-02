import style from "./index.scss";
import Grid from "./components/Grid/index";

export default class Minesweeper extends HTMLElement {

    public static get observedAttributes() {
        return ["width", "height"];
    }

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
        this.newGame();
    };

    attributeChangedCallback(name: string, _oldVal: string, _newVal: string) {
        if (name === "width" || name === "height") {
            this.newGame();
        }
    }

    get width(){
        return parseInt(this.getAttribute("width") || "10");
    }

    set width(newValue: number){
        this.setAttribute("width", newValue.toString());
    }

    get height(){
        return parseInt(this.getAttribute("height") || "10");
    }

    set height(newValue: number){
        this.setAttribute("height", newValue.toString());
    }

    public newGame(){
        this._gridContainer.childNodes.forEach( node => node.remove());
        this._gridContainer.appendChild( new Grid(this.width, this.height) );
    }



    private _gridContainer: HTMLDivElement;
}

window.customElements.define("minesweeper-game", Minesweeper);