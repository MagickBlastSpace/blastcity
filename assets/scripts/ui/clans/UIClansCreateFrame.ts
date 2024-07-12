import { _decorator, Component, Node, Button, EditBox } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIClansCreateFrame')
export class UIClansCreateFrame extends UIPopupFrameBase {

    @property(Button)
    createBtn: Button = null;

    @property(EditBox)
    nameInput: EditBox = null;


    start() {
        this.createBtn.node.on(Button.EventType.CLICK, this.onCreateBtnClick, this);
    }

    onCreateBtnClick() {
        if(this.nameInput.string === "") {
            return;
        }

        this.node.emit("create", this.nameInput.string);
    }
}


