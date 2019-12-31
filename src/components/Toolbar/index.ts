import style from "./Toolbar.scss";
import FlagCounter from "../../util/FlagCounter";

export default class Toolbar extends HTMLElement {

    public static get observedAttributes() {
        return ["flags-remaining"];
    }

    constructor(){
        super();

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <div id="toolbar-wrapper">
                <div id="flags-remaining">${FlagCounter.flagsRemaining}</div>
                <div id="time-elapsed">00:00</div>
            </div>
        `;

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this._refFlagCounter = shadowRoot.querySelector<HTMLDivElement>("#flags-remaining")!;
        this._refTimeElapsed = shadowRoot.querySelector<HTMLDivElement>("#time-elapsed")!;
        this.flagsRemaining = FlagCounter.flagsRemaining;
        this._timerID = this.startTimer();
    }

    connectedCallback(){
        window.addEventListener(FlagCounter.COUNT_UPDATE, (event: any) => {
            this.flagsRemaining = event.detail.newValue;
        })
    }

    attributeChangedCallback(name: string, _oldVal: string, _newVal: string) {
        if (name === "flags-remaining") {
            this._refFlagCounter.textContent = _newVal;
        }
    }

    get flagsRemaining(){
        return parseInt(this.getAttribute("flags-remaining") || "0")
    }

    set flagsRemaining(newValue: number){
        this.setAttribute("flags-remaining", newValue.toString())
    }

    public addFlag(){
        this.flagsRemaining = this.flagsRemaining + 1;
    }

    public removeFlag(){
        this.flagsRemaining = this.flagsRemaining - 1;
    }

    public startTimer(){
        return window.setInterval(this.handleTimeInc, 1000);
    }

    public stopTimer(){
        window.clearInterval(this._timerID);
    }

    public resetTimer(){
        this._timeElapsed = 0;
    }

    private _refFlagCounter: HTMLDivElement;
    private _refTimeElapsed: HTMLDivElement;
    private _timeElapsed: number = 0;
    private _timerID: number;

    private handleTimeInc = () => {
        this._timeElapsed++;
        const timeStr = [Math.floor(this._timeElapsed / 60), this._timeElapsed % 60].map( (digit) => {
            return digit.toString().padStart(2, "0")
        }).join(":");
        this._refTimeElapsed.textContent = timeStr;
    }

}

window.customElements.define("ms-toolbar", Toolbar);
