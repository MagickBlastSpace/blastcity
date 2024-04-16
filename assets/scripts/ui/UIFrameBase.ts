import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIFrameBase')
export class UIFrameBase extends Component {
    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    hideClean() {
        this.hide();
    }
}


