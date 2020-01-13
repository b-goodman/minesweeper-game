import style from "./Dialog.scss";


export default class GameDialogBox extends HTMLElement {

    static get observedAttributes() {
        return ["open"];
    }

    constructor(
        opts?:{
            title?: string,
            content?: string,
            confirmBtn?:{
                include?: boolean,
                lbl?:string
            },
            cancelBtn?:{
                include?: boolean,
                lbl?:string
            },
            closeOnConfirm?:boolean
        }
        ) {
        super();

        if (opts?.confirmBtn?.include) this.confirmBtn = opts?.confirmBtn?.include;
        if (opts?.confirmBtn?.lbl) this.confirmLbl = opts?.confirmBtn?.lbl;
        if (opts?.cancelBtn?.include) this.cancelBtn = opts?.cancelBtn?.include;
        if (opts?.cancelBtn?.lbl) this.cancelLbl = opts?.cancelBtn?.lbl;
        if (opts?.closeOnConfirm) this.closeOnConfirm = opts?.closeOnConfirm;


        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <div id="box">

                <div id="dialog-content-wrapper">
                    <slot name="dialog-title"></slot>
                    <slot name="dialog-content"></slot>
                </div>

                ${this.querySelector("[slot='dialog-control']") === null
                    ? `<div class="row">
                            ${ this.confirmBtn ? `<div class="btn primary" id="confirm_btn">${this.confirmLbl}</div>` : ``}
                            ${ this.cancelBtn ? `<div class="btn secondary" id="cancel_btn">${this.cancelLbl}</div>` : `` }
                        </div>`
                    : `<slot name="dialog-control" class="row"></slot>`
                }
            </div>
            <div id="mask"></div>
        `;

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));

        if (this.querySelector("[slot='dialog-title']") === null) {
            const title = document.createElement("div");
            title.slot = "dialog-title";
            title.innerText = opts?.title || "";
            this.appendChild(title);
        };

        if (this.querySelector("[slot='dialog-content']") === null) {
            const content = document.createElement("div");
            content.slot = "dialog-content";
            content.innerText = opts?.content || "";
            this.appendChild(content);
        }

        this._cancelBtnRef = shadowRoot.querySelector<HTMLDivElement>("#cancel_btn") || undefined;
        this._confirmBtnRef = shadowRoot.querySelector<HTMLDivElement>("#confirm_btn") || undefined;

        this._titleRef = this.querySelector<HTMLDivElement>("[slot='dialog-title']")!;
        this._contentRef = this.querySelector<HTMLDivElement>("[slot='dialog-content']")!;
    }

    // attributeChangedCallback(name: string, _oldVal: string, newVal: string) {}

    connectedCallback() {
        if (this._cancelBtnRef) {
            this._cancelBtnRef.addEventListener("click", this._handleCancelBtnClick)
        };
        if (this._confirmBtnRef) {
            this._confirmBtnRef.addEventListener("click", this._handleConfirmBtnClick)
        }
    }

    // disconnecetdCallback() {}

    set open(newState: boolean){
        this.setAttribute("open", JSON.stringify(newState));
    }

    get open(){
        return this.hasAttribute("open");
    }

    set closeOnConfirm(newState: boolean){
        this.setAttribute("close-on-confirm", JSON.stringify(newState))
    }

    get closeOnConfirm(){
        return JSON.parse(this.getAttribute("close-on-confirm") || "true");
    }

    set confirmLbl(newLbl: string){
        this.setAttribute("confirm-lbl", newLbl);
    }

    get confirmLbl(){
        return this.getAttribute("confirm-lbl") || "OK";
    }

    set confirmBtn(newState: boolean){
        this.setAttribute("confirm-btn", JSON.stringify(newState))
    }

    get confirmBtn(){
        return JSON.parse(this.getAttribute("confirm-btn") || "true");
    }

    set cancelBtn(newState: boolean){
        this.setAttribute("cancel-btn", JSON.stringify(newState))
    }

    get cancelBtn(){
        return JSON.parse(this.getAttribute("cancel-btn") || "true");
    }

    set cancelLbl(newLbl: string){
        this.setAttribute("cancel-lbl", newLbl);
    }

    get cancelLbl(){
        return this.getAttribute("cancel-lbl") || "Cancel";
    }

    get dialogTitle(){
        return this._titleRef.innerHTML;
    }

    set dialogTitle(newTitle: string){
        this._titleRef.innerText = newTitle;
    }

    get dialogContent(){
        return this._contentRef.innerHTML;
    }

    set dialogContent(newContent: string){
        this._contentRef.innerHTML = newContent;
    }


    private _cancelBtnRef?: HTMLDivElement;
    private _confirmBtnRef?: HTMLDivElement;
    private _confirmBtnClickEvent: Event = new Event("confirmed");
    private _cancelBtnClickEvent: Event = new Event("cancelled");

    private _titleRef: HTMLDivElement;
    private _contentRef: HTMLDivElement;

    private _handleCancelBtnClick = (_event: MouseEvent) => {
        this.dispatchEvent(this._cancelBtnClickEvent);
        this.open = false;
    };

    private _handleConfirmBtnClick = (_event: MouseEvent) => {
        if (this.closeOnConfirm) {
            this.open = false;
        }
        this.dispatchEvent(this._confirmBtnClickEvent);
    }

}

if (!window.customElements.get("ms-dialog-box")) { window.customElements.define("ms-dialog-box", GameDialogBox); }


