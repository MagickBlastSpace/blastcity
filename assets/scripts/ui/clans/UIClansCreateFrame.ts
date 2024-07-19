import { _decorator, Component, Node, Button, EditBox, Label } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIClansCreateFrame')
export class UIClansCreateFrame extends UIPopupFrameBase {

    @property(Button)
    createBtn: Button = null;

    @property(Button)
    rightPrivateBtn: Button = null;
    @property(Button)
    leftPrivateBtn: Button = null;

    @property(EditBox)
    nameInput: EditBox = null;

    @property(Label)
    privacy: Label = null;

    private isPrivate: boolean = false;


    start() {
        this.isPrivate = false;
        this.privacy.string = this.isPrivate ? "Private" : "Open";

        this.createBtn.node.on(Button.EventType.CLICK, this.onCreateBtnClick, this);

        this.rightPrivateBtn.node.on(Button.EventType.CLICK, this.changePrivacy, this);
        this.leftPrivateBtn.node.on(Button.EventType.CLICK, this.changePrivacy, this);
    }

    onCreateBtnClick() {
        if(this.nameInput.string === "") {
            return;
        }

        this.node.emit("create", this.nameInput.string, this.isPrivate);
    }


    changePrivacy() {
        this.isPrivate = !this.isPrivate;

        this.privacy.string = this.isPrivate ? "Private" : "Open";
    }
}


