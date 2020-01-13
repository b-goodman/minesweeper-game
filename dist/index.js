var e;!function(e){e.UNCOVERED="uncovered",e.FLAGGED="flagged",e.UNFLAGGED="unflagged",e.MINE_UNCOVERED="mine_uncovered",e.HIGHLIGHTED="highlighted",e.UNHIGHLIGHTED="unhighlighted",e.NEIGHBOR_REVEAL="neighbor_reveal",e.TRIGGER_CHAIN_REVEAL="trigger_chain_reveal"}(e||(e={}));var t=e;class i{static setFlagsRemaining(e){i.flagsRemaining=e,window.dispatchEvent(new CustomEvent(i.COUNT_UPDATE,{detail:{newValue:i.flagsRemaining}}))}}i.COUNT_UPDATE="flag_count_update";var n,s='<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">\n <g>\n  <title>background</title>\n  <rect fill="none" id="canvas_background" height="52" width="52" y="-1" x="-1"/>\n  <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">\n   <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/>\n  </g>\n </g>\n <g>\n  <title>Flag</title>\n  <path id="svg_6" d="m4.5105,5.20324l-0.03498,40.531c0.03498,0.02866 40.5944,-20.53101 40.5944,-20.53101c0,0 1.95804,0.41958 -40.55942,-19.99999z" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="#ff0000"/>\n </g>\n</svg>';class o extends HTMLElement{constructor(e,n,s){super(),this.handleMouseEnter=e=>{this.isHighlighted=!0,this.dispatchEvent(this._highlightedEvent)},this.handleMouseLeave=e=>{this.isHighlighted=!1,this.dispatchEvent(this._unhighlightedEvent)},this.handleMouseClick=e=>{this.flagged?this.flagged=!1:this.covered=!1},this.handleMouseAltClick=e=>{e.preventDefault(),this.covered&&i.flagsRemaining>0&&(this.flagged=!this.flagged)},this.handleMouseDblClick=e=>{this.covered||this.dispatchEvent(this._revealNeighborsEvent)},this._hasChainRevealed=!1,this._hasUncovered=!1,this._inputEvents=[["mouseenter",this.handleMouseEnter],["mouseleave",this.handleMouseLeave],["click",this.handleMouseClick],["contextmenu",this.handleMouseAltClick],["dblclick",this.handleMouseDblClick]],this._handleMineReveal=()=>{this.dispatchEvent(this._mineUncoveredEvent),this.setAttribute("mine","true"),this.isHighlighted=!1,this.neighborHighlight=!1},this._handleStandardReveal=()=>{this.adjacentMines>0?this._refContent.textContent=this.adjacentMines.toString():this._hasChainRevealed||(this._hasChainRevealed=!0,this.isHighlighted=!1,this._removeEventListeners(),window.setTimeout(()=>this.dispatchEvent(this._triggerChainReveal),10)),this.classList.add(`adjacency-degree--${this.adjacentMines.toString()}`)},this.isMined=n,this.coordinate=e,this.adjacentMines=s;const o={bubbles:!0,composed:!0,detail:{coordinate:this.coordinate}};this._highlightedEvent=new CustomEvent(t.HIGHLIGHTED,o),this._unhighlightedEvent=new CustomEvent(t.UNHIGHLIGHTED,o),this._uncoverEvent=new CustomEvent(t.UNCOVERED,o),this._mineUncoveredEvent=new CustomEvent(t.MINE_UNCOVERED,o),this._revealNeighborsEvent=new CustomEvent(t.NEIGHBOR_REVEAL,o),this._triggerChainReveal=new CustomEvent(t.TRIGGER_CHAIN_REVEAL,o);const l=document.createElement("template");l.innerHTML='\n            <style>:host {\n  z-index: 1;\n  display: block;\n  width: 50px;\n  height: 50px;\n  border: 1px solid #1d1d1d;\n  background: #3D6AF2;\n  text-align: center;\n  font-size: 25px;\n  font-family: sans-serif;\n  line-height: 50px;\n}\n\n:host([mine=true]) {\n  background: black;\n}\n\n:host([highlighted=true]) {\n  outline: 1px solid #0540F2;\n  z-index: 2;\n}\n\n:host([neighbor-highlight=true]) {\n  background: #6a98c3;\n}\n\n:host(.adjacency-degree--1[covered=false]) {\n  background: #ffb3b3;\n}\n\n:host(.adjacency-degree--2[covered=false]) {\n  background: #ff9999;\n}\n\n:host(.adjacency-degree--3[covered=false]) {\n  background: #ff8080;\n}\n\n:host(.adjacency-degree--4[covered=false]) {\n  background: #ff6666;\n}\n\n:host(.adjacency-degree--5[covered=false]) {\n  background: #ff4d4d;\n}\n\n:host(.adjacency-degree--6[covered=false]) {\n  background: #ff3333;\n}\n\n:host(.adjacency-degree--7[covered=false]) {\n  background: #ff1a1a;\n}\n\n:host(.adjacency-degree--8[covered=false]) {\n  background: red;\n}\n\n:host(.adjacency-degree--0[covered=false]) {\n  background: white;\n  border: 1px solid white;\n  z-index: 0;\n}</style>\n            <div id="cell-content"></div>\n        ';const a=this.attachShadow({mode:"open"});a.appendChild(l.content.cloneNode(!0)),this._refContent=a.querySelector("#cell-content")}static get observedAttributes(){return["highlighted","neighbor-highlight","covered","flagged"]}set isHighlighted(e){this.setAttribute("highlighted",JSON.stringify(e))}get isHighlighted(){return JSON.parse(this.getAttribute("highlighted")||"false")}set neighborHighlight(e){this.setAttribute("neighbor-highlight",JSON.stringify(e))}get neighborHighlight(){return JSON.parse(this.getAttribute("neighbor-highlight")||"false")}set covered(e){this.setAttribute("covered",JSON.stringify(e))}get covered(){return JSON.parse(this.getAttribute("covered")||"true")}set flagged(e){this.setAttribute("flagged",JSON.stringify(e))}get flagged(){return JSON.parse(this.getAttribute("flagged")||"false")}connectedCallback(){this._addEventListeners()}disconnectedCallback(){this._removeEventListeners()}attributeChangedCallback(e,t,n){"covered"===e&&"false"===n&&(this._hasUncovered||(this._hasUncovered=!0,this.dispatchEvent(this._uncoverEvent),this.isMined?(this._removeEventListeners(),this._handleMineReveal()):this._handleStandardReveal())),"flagged"===e&&("true"===n&&i.flagsRemaining>0?(i.setFlagsRemaining(i.flagsRemaining-1),this._refContent.innerHTML=s):"true"===t&&"false"===n&&(i.setFlagsRemaining(i.flagsRemaining+1),this._refContent.innerHTML=""))}_addEventListeners(){this._inputEvents.forEach(e=>{this.addEventListener(...e)})}_removeEventListeners(){this._inputEvents.forEach(e=>{this.removeEventListener(...e)})}}window.customElements.define("ms-tile",o),function(e){e.WIN="win",e.LOSE="lose"}(n||(n={}));var l,a=n;!function(e){e.GAME_END="game_end"}(l||(l={}));var r=l;class d{static coordinates(e,t){return[[e[0],e[1]+1],[e[0],e[1]-1],[e[0]-1,e[1]+1],[e[0]-1,e[1]-1],[e[0]-1,e[1]],[e[0]+1,e[1]+1],[e[0]+1,e[1]-1],[e[0]+1,e[1]]].filter(e=>{const i=e.every(e=>e>=0),n=e[0]<t[0]&&e[1]<t[1];return i&&n})}}class h{static int(e,t){const i=Math.ceil(e),n=Math.floor(t);return Math.floor(Math.random()*(n-i+1))+e}}class c extends HTMLElement{constructor(){super(),this._timeElapsed=0,this.handleTimeInc=()=>{this._timeElapsed++;const e=[Math.floor(this._timeElapsed/60),this._timeElapsed%60].map(e=>e.toString().padStart(2,"0")).join(":");this._refTimeElapsed.textContent=e};const e=document.createElement("template");e.innerHTML=`\n            <style>:host {\n  font-size: 26px;\n  font-family: sans-serif;\n}\n\n#toolbar-wrapper {\n  display: flex;\n  flex-direction: row;\n}\n#toolbar-wrapper div {\n  display: flex;\n}\n#toolbar-wrapper div.icon-wrapper:not(:last-of-type) {\n  margin: 0 1em 0 0;\n}\n#toolbar-wrapper .icon {\n  margin: 0 0.5em 0 0;\n}\n#toolbar-wrapper .icon-lbl {\n  line-height: 50px;\n}</style>\n            <div id="toolbar-wrapper">\n                <div class="icon-wrapper">\n                    <div class="icon">${s}</div>\n                    <div class="icon-lbl" id="flags-remaining"></div>\n                </div>\n                <div class="icon-wrapper">\n                    <div class="icon" id="clock-icon"><svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">\n \x3c!-- Created with Method Draw - http://github.com/duopixel/Method-Draw/ --\x3e\n <g>\n  <title>background</title>\n  <rect fill="#fff" id="canvas_background" height="52" width="52" y="-1" x="-1"/>\n  <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">\n   <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/>\n  </g>\n </g>\n <g>\n  <title>Time</title>\n  <ellipse ry="21.95803" rx="21.95803" id="svg_1" cy="25.62281" cx="25.06993" stroke-width="1.5" stroke="#000" fill="#fff"/>\n  <path id="svg_3" d="m24.65035,7.44101l-0.03498,17.87366l12.02797,12.02797" opacity="0.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="#fff"/>\n </g>\n</svg></div>\n                    <div class="icon-lbl" id="time-elapsed">00:00</div>\n                </div>\n            </div>\n        `;const t=this.attachShadow({mode:"open"});t.appendChild(e.content.cloneNode(!0)),this._refFlagCounter=t.querySelector("#flags-remaining"),this._refTimeElapsed=t.querySelector("#time-elapsed"),this.flagsRemaining=i.flagsRemaining,this._timerID=this.startTimer()}static get observedAttributes(){return["flags-remaining"]}connectedCallback(){window.addEventListener(i.COUNT_UPDATE,e=>{this.flagsRemaining=e.detail.newValue})}attributeChangedCallback(e,t,i){"flags-remaining"===e&&(this._refFlagCounter.textContent=i)}get flagsRemaining(){return parseInt(this.getAttribute("flags-remaining")||"0")}set flagsRemaining(e){this.setAttribute("flags-remaining",e.toString())}addFlag(){this.flagsRemaining=this.flagsRemaining+1}removeFlag(){this.flagsRemaining=this.flagsRemaining-1}startTimer(){return window.setInterval(this.handleTimeInc,1e3)}stopTimer(){window.clearInterval(this._timerID)}resetTimer(){this._timeElapsed=0}}window.customElements.define("ms-toolbar",c);class g extends HTMLElement{constructor(e,t,n){var s;super(),this.hasGameLost=!1,this.hasGameWon=!1,this.cellRef=[],this._cellConstructorData=[],this._revealCellNeighbors=e=>{d.coordinates(e,[this.rows,this.columns]).forEach(e=>{const t=this.cellRef[e[0]][e[1]];!t.flagged&&t.covered&&(t.covered=!1)})},this._handleCellHighlight=e=>{const t=e.detail.coordinate;if(!this.cellRef[t[0]][t[1]].covered){d.coordinates(e.detail.coordinate,[this.rows,this.columns]).forEach(e=>{const t=this.cellRef[e[0]][e[1]];t.flagged||(t.neighborHighlight=!0)})}},this._handleCellUnHighlight=e=>{d.coordinates(e.detail.coordinate,[this.rows,this.columns]).forEach(e=>{const t=this.cellRef[e[0]][e[1]];t.flagged||(t.neighborHighlight=!1)})},this._handleNeighborReveal=e=>{this._revealCellNeighbors(e.detail.coordinate)},this._handleMineUncovered=e=>{this.hasGameLost=!0,this._toolbarRef.stopTimer(),this.cellRef.flat().forEach(e=>{e.flagged=!1,e.covered=!1,e._removeEventListeners()}),this.dispatchEvent(new CustomEvent(r.GAME_END,{bubbles:!0,composed:!0,detail:{state:a.LOSE}}))},this._checkEndGameStatus=e=>{!this.hasGameLost&&this.cellRef.flat().filter(e=>!e.isMined).every(e=>!e.covered)&&(this._toolbarRef.stopTimer(),this.cellRef.flat().forEach(e=>{e._removeEventListeners()}),this.dispatchEvent(new CustomEvent(r.GAME_END,{bubbles:!0,composed:!0,detail:{state:a.WIN}})))},this.rows=t,this.columns=e,this.mines=(null===(s=n)||void 0===s?void 0:s.mines)||Math.floor(Math.sqrt(t*e)),i.flagsRemaining=this.mines,this._generateCelConstructorData();const o=document.createElement("template");o.innerHTML="\n            <style>.row {\n  display: flex;\n  flex-direction: row;\n}\n\n#row-container {\n  width: fit-content;\n  overflow: scroll;\n  display: flex;\n  flex-direction: column;\n}</style>\n            <div id='toolbar'></div>\n            <div id=\"row-container\"></div>\n        ";const l=this.attachShadow({mode:"open"});l.appendChild(o.content.cloneNode(!0)),this._rowContainer=l.querySelector("#row-container"),this._toolbarRef=l.querySelector("#toolbar").appendChild(new c);for(let e=0;e<this.rows;e++)this._insertRow(e)}static get observedAttributes(){return[]}connectedCallback(){this.addEventListener(t.HIGHLIGHTED,this._handleCellHighlight),this.addEventListener(t.UNHIGHLIGHTED,this._handleCellUnHighlight),this.addEventListener(t.NEIGHBOR_REVEAL,this._handleNeighborReveal),this.addEventListener(t.MINE_UNCOVERED,this._handleMineUncovered,{once:!0}),this.addEventListener(t.TRIGGER_CHAIN_REVEAL,this._handleNeighborReveal),this.addEventListener(t.UNCOVERED,this._checkEndGameStatus)}disconnectedCallback(){this.addEventListener(t.HIGHLIGHTED,this._handleCellHighlight),this.addEventListener(t.UNHIGHLIGHTED,this._handleCellUnHighlight),this.addEventListener(t.NEIGHBOR_REVEAL,this._handleNeighborReveal),this.addEventListener(t.MINE_UNCOVERED,this._handleMineUncovered,{once:!0}),this.addEventListener(t.TRIGGER_CHAIN_REVEAL,this._handleNeighborReveal),this.addEventListener(t.UNCOVERED,this._checkEndGameStatus)}attributeChangedCallback(e,t,i){}_generateCelConstructorData(){let e=this.mines;for(let e=0;e<this.rows;e++){const e=new Array(this.columns);for(let t=0;t<this.columns;t++)e[t]={isMined:!1,adjacentMines:0};this._cellConstructorData.push(e)}do{for(let t=0;t<this.rows;t++)for(let i=0;i<this.columns;i++)!this._cellConstructorData[t][i].isMined&&e>0&&10===h.int(1,10)&&(this._cellConstructorData[t][i]={isMined:!0,adjacentMines:0},e--)}while(e>0);for(let e=0;e<this.rows;e++)for(let t=0;t<this.columns;t++)this._cellConstructorData[e][t].isMined||(this._cellConstructorData[e][t].adjacentMines=d.coordinates([e,t],[this.rows,this.columns]).map(e=>this._cellConstructorData[e[0]][e[1]].isMined?1:0).reduce((e,t)=>e+t,0))}_insertRow(e){const t=document.createElement("div");t.className="row";const i=new Array(this.columns);for(let n=0;n<this.columns;n++){const s=this._cellConstructorData[e][n],l=new o([e,n],s.isMined,s.adjacentMines);i[n]=l,t.appendChild(l)}this.cellRef.push(i),this._rowContainer.appendChild(t)}}window.customElements.define("ms-grid",g);class v extends HTMLElement{constructor(e){var t,i,n,s,o,l,a,r,d,h,c,g,v,u,f,m,p,E,b,_;super(),this._confirmBtnClickEvent=new Event("confirmed"),this._cancelBtnClickEvent=new Event("cancelled"),this._handleCancelBtnClick=e=>{this.dispatchEvent(this._cancelBtnClickEvent),this.open=!1},this._handleConfirmBtnClick=e=>{this.closeOnConfirm&&(this.open=!1),this.dispatchEvent(this._confirmBtnClickEvent)},(null===(i=null===(t=e)||void 0===t?void 0:t.confirmBtn)||void 0===i?void 0:i.include)&&(this.confirmBtn=null===(s=null===(n=e)||void 0===n?void 0:n.confirmBtn)||void 0===s?void 0:s.include),(null===(l=null===(o=e)||void 0===o?void 0:o.confirmBtn)||void 0===l?void 0:l.lbl)&&(this.confirmLbl=null===(r=null===(a=e)||void 0===a?void 0:a.confirmBtn)||void 0===r?void 0:r.lbl),(null===(h=null===(d=e)||void 0===d?void 0:d.cancelBtn)||void 0===h?void 0:h.include)&&(this.cancelBtn=null===(g=null===(c=e)||void 0===c?void 0:c.cancelBtn)||void 0===g?void 0:g.include),(null===(u=null===(v=e)||void 0===v?void 0:v.cancelBtn)||void 0===u?void 0:u.lbl)&&(this.cancelLbl=null===(m=null===(f=e)||void 0===f?void 0:f.cancelBtn)||void 0===m?void 0:m.lbl),(null===(p=e)||void 0===p?void 0:p.closeOnConfirm)&&(this.closeOnConfirm=null===(E=e)||void 0===E?void 0:E.closeOnConfirm);const w=document.createElement("template");w.innerHTML=`\n            <style>.row{display:flex;justify-content:center}.row div:not(:last-of-type){margin:0 5px 0 0}.btn,::slotted(.btn){font-size:16px;min-width:70px;height:30px;padding:0 3px;border:1px solid #000;border-radius:3px;text-align:center;line-height:30px;cursor:pointer}.btn:active,::slotted(.btn:active){box-shadow:inset 1px 1px grey}.primary,::slotted(.primary){background:#d4e8ea}.secondary,::slotted(.secondary){background:#ead4d4}div#dialog-title,slot[name=dialog-title]{font-weight:600;font-size:18px}div#dialog-content,slot[name=dialog-content]::slotted(div){padding:10px}:host([open=true]) #box{display:unset}:host([open=true]) #mask{display:unset;opacity:.5}:host{font-family:sans-serif}:host #box{padding:5px;height:auto;left:50%;top:50%;transform:translate(-50%,-50%);border:1px solid #000;background:#fff;width:300px;max-height:300px;min-height:100px;z-index:999}:host #box,:host #mask{display:none;position:absolute}:host #mask{top:0;left:0;background-color:rgba(0,0,0,.5);opacity:0;width:100vw;height:100vh;z-index:998;transition:opacity .4s ease-out}</style>\n            <div id="box">\n\n                <div id="dialog-content-wrapper">\n                    <slot name="dialog-title"></slot>\n                    <slot name="dialog-content"></slot>\n                </div>\n\n                ${null===this.querySelector("[slot='dialog-control']")?`<div class="row">\n                            ${this.confirmBtn?`<div class="btn primary" id="confirm_btn">${this.confirmLbl}</div>`:""}\n                            ${this.cancelBtn?`<div class="btn secondary" id="cancel_btn">${this.cancelLbl}</div>`:""}\n                        </div>`:'<slot name="dialog-control" class="row"></slot>'}\n            </div>\n            <div id="mask"></div>\n        `;const C=this.attachShadow({mode:"open"});if(C.appendChild(w.content.cloneNode(!0)),null===this.querySelector("[slot='dialog-title']")){const t=document.createElement("div");t.slot="dialog-title",t.innerText=(null===(b=e)||void 0===b?void 0:b.title)||"",this.appendChild(t)}if(null===this.querySelector("[slot='dialog-content']")){const t=document.createElement("div");t.slot="dialog-content",t.innerText=(null===(_=e)||void 0===_?void 0:_.content)||"",this.appendChild(t)}this._cancelBtnRef=C.querySelector("#cancel_btn")||void 0,this._confirmBtnRef=C.querySelector("#confirm_btn")||void 0,this._titleRef=this.querySelector("[slot='dialog-title']"),this._contentRef=this.querySelector("[slot='dialog-content']")}static get observedAttributes(){return["open"]}connectedCallback(){this._cancelBtnRef&&this._cancelBtnRef.addEventListener("click",this._handleCancelBtnClick),this._confirmBtnRef&&this._confirmBtnRef.addEventListener("click",this._handleConfirmBtnClick)}set open(e){this.setAttribute("open",JSON.stringify(e))}get open(){return this.hasAttribute("open")}set closeOnConfirm(e){this.setAttribute("close-on-confirm",JSON.stringify(e))}get closeOnConfirm(){return JSON.parse(this.getAttribute("close-on-confirm")||"true")}set confirmLbl(e){this.setAttribute("confirm-lbl",e)}get confirmLbl(){return this.getAttribute("confirm-lbl")||"OK"}set confirmBtn(e){this.setAttribute("confirm-btn",JSON.stringify(e))}get confirmBtn(){return JSON.parse(this.getAttribute("confirm-btn")||"true")}set cancelBtn(e){this.setAttribute("cancel-btn",JSON.stringify(e))}get cancelBtn(){return JSON.parse(this.getAttribute("cancel-btn")||"true")}set cancelLbl(e){this.setAttribute("cancel-lbl",e)}get cancelLbl(){return this.getAttribute("cancel-lbl")||"Cancel"}get dialogTitle(){return this._titleRef.innerHTML}set dialogTitle(e){this._titleRef.innerText=e}get dialogContent(){return this._contentRef.innerHTML}set dialogContent(e){this._contentRef.innerHTML=e}}window.customElements.get("dialog-box")||window.customElements.define("dialog-box",v);class u extends HTMLElement{constructor(){super(),this._handleGameEnd=e=>{console.log("Game Over: ",e.detail.state),this._dialogBoxRef.dialogTitle=e.detail.state===a.WIN?"You win":"Game Over",this._dialogBoxRef.dialogContent=e.detail.state===a.WIN?"All safe tiles uncovered.":"You uncovered a mine.",this._dialogBoxRef.open=!0};const e=document.createElement("template");e.innerHTML='\n            <style></style>\n            <div id="grid-container"></div>\n        ';const t=this.attachShadow({mode:"open"});t.appendChild(e.content.cloneNode(!0)),this._gridContainer=t.querySelector("#grid-container"),this._dialogBoxRef=t.appendChild(new v({confirmBtn:{include:!0,lbl:"New Game"}})),this.addEventListener(r.GAME_END,this._handleGameEnd),this._dialogBoxRef.addEventListener("confirmed",()=>{this.newGame()})}static get observedAttributes(){return["width","height","mines"]}connectedCallback(){this.newGame()}attributeChangedCallback(e,t,i){"width"!==e&&"height"!==e||this.newGame()}get width(){return parseInt(this.getAttribute("width")||"10")}set width(e){this.setAttribute("width",e.toString())}get height(){return parseInt(this.getAttribute("height")||"10")}set height(e){this.setAttribute("height",e.toString())}get mines(){const e=this.getAttribute("mines");return e?parseInt(e):null}set mines(e){e?this.setAttribute("mines",e.toString()):this.removeAttribute("mines")}newGame(){this._gridContainer.childNodes.forEach(e=>e.remove()),this._gridContainer.appendChild(new g(this.width,this.height,{mines:this.mines||void 0}))}}window.customElements.define("minesweeper-game",u);export default u;
//# sourceMappingURL=index.js.map
