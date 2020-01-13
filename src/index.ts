import style from "./index.scss";
import Grid, {EndgameEventState} from "./components/Grid/index";
import GameEvent from "./enums/GameEvents";
// import EndgameStates from "./enums/EndgameStates";
import GameDialogBox from "./components/GameDialogBox/index";
import EndgameStates from "./enums/EndgameStates";

export default class Minesweeper extends HTMLElement {

    public static get observedAttributes() {
        return ["width", "height", "mines", "scale"];
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
        this._dialogBoxRef = shadowRoot.appendChild(
            new GameDialogBox({
                confirmBtn:{include: true, lbl: "New Game"},
            })
        );

        this.addEventListener(GameEvent.GAME_END, this._handleGameEnd);
        this._dialogBoxRef.addEventListener("confirmed", () => {
            this.newGame();
        });
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

    get mines(){
        const attr = this.getAttribute("mines");
        return attr ? parseInt(attr) : null;
    }

    set mines(newValue: number|null){
        if (newValue) {
            this.setAttribute("mines", newValue.toString())
        } else {
            this.removeAttribute("mines");
        }
    }

    get scale(){
        const attr = this.getAttribute("scale");
        return attr ? parseFloat(attr) : 1;
    }

    set scale(newValue: number){
        if (newValue) {
            this.setAttribute("scale", newValue.toString())
        } else {
            this.removeAttribute("scale");
        }
    }

    public newGame(){
        this._gridContainer.childNodes.forEach( node => node.remove());
        this._gridContainer.appendChild( new Grid(this.width, this.height, {mines: this.mines || undefined, scale: this.scale}) );
    }



    private _gridContainer: HTMLDivElement;
    private _dialogBoxRef: GameDialogBox;

    private _handleGameEnd = ((_event: CustomEvent<EndgameEventState>) => {
        console.log("Game Over: ", _event.detail.state);
        this._dialogBoxRef.dialogTitle = (_event.detail.state === EndgameStates.WIN) ? "You win" : "Game Over";
        this._dialogBoxRef.dialogContent = (_event.detail.state === EndgameStates.WIN) ? "All safe tiles uncovered." : "You uncovered a mine.";
        this._dialogBoxRef.open = true;
    }) as EventListener
}

window.customElements.define("minesweeper-game", Minesweeper);