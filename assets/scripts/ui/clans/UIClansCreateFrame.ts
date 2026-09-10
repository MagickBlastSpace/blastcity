import { _decorator, Button, EditBox, Label } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIClansCreateFrame')
export class UIClansCreateFrame extends UIFrameBase {

    /*landscape*/
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

    /*portrait*/
    @property(Button)
    createBtn_portrait: Button = null;

    @property(Button)
    rightPrivateBtn_portrait: Button = null;
    @property(Button)
    leftPrivateBtn_portrait: Button = null;

    @property(EditBox)
    nameInput_portrait: EditBox = null;

    @property(Label)
    privacy_portrait: Label = null;

    private isPrivate: boolean = false;


    start() {
        this.isPrivate = false;
        this.privacy.string = this.isPrivate ? "Private" : "Open";

        this.createBtn.node.on(Button.EventType.CLICK, this.onCreateBtnClick, this);

        this.rightPrivateBtn.node.on(Button.EventType.CLICK, this.changePrivacy, this);
        this.leftPrivateBtn.node.on(Button.EventType.CLICK, this.changePrivacy, this);

        this.createBtn_portrait.node.on(Button.EventType.CLICK, this.onCreateBtnClick_portrait, this);

        this.rightPrivateBtn_portrait.node.on(Button.EventType.CLICK, this.changePrivacy, this);
        this.leftPrivateBtn_portrait.node.on(Button.EventType.CLICK, this.changePrivacy, this);
    }

    onCreateBtnClick() {
        if(this.nameInput.string === "") {
            return;
        }

        this.node.emit("create", this.nameInput.string, this.isPrivate);
    }

    onCreateBtnClick_portrait() {
        if(this.nameInput_portrait.string === "") {
            return;
        }

        this.node.emit("create", this.nameInput_portrait.string, this.isPrivate);
    }


    changePrivacy() {
        this.isPrivate = !this.isPrivate;

        this.privacy.string = this.isPrivate ? "Private" : "Open";
        this.privacy_portrait.string = this.isPrivate ? "Private" : "Open";
    }
}


