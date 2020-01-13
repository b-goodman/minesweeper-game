export default class GameDialogBox extends HTMLElement {
    static get observedAttributes(): string[];
    constructor(opts?: {
        title?: string;
        content?: string;
        confirmBtn?: {
            include?: boolean;
            lbl?: string;
        };
        cancelBtn?: {
            include?: boolean;
            lbl?: string;
        };
        closeOnConfirm?: boolean;
    });
    connectedCallback(): void;
    set open(newState: boolean);
    get open(): boolean;
    set closeOnConfirm(newState: boolean);
    get closeOnConfirm(): boolean;
    set confirmLbl(newLbl: string);
    get confirmLbl(): string;
    set confirmBtn(newState: boolean);
    get confirmBtn(): boolean;
    set cancelBtn(newState: boolean);
    get cancelBtn(): boolean;
    set cancelLbl(newLbl: string);
    get cancelLbl(): string;
    get dialogTitle(): string;
    set dialogTitle(newTitle: string);
    get dialogContent(): string;
    set dialogContent(newContent: string);
    private _cancelBtnRef?;
    private _confirmBtnRef?;
    private _confirmBtnClickEvent;
    private _cancelBtnClickEvent;
    private _titleRef;
    private _contentRef;
    private _handleCancelBtnClick;
    private _handleConfirmBtnClick;
}
