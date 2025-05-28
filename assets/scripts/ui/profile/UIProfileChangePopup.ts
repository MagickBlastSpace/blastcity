import { _decorator, Component, Node, Button, EditBox, Label, Sprite } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIProfileChangeItem } from './UIProfileChangeItem';
import { Profile } from '../../game/Profile';
import { UIProfileSavePopup } from './UIProfileSavePopup';
import { UITab } from '../main/UITab';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIProfileChangePopup')
export class UIProfileChangePopup extends UIPopupFrameBase {

    @property([UIProfileChangeItem])
    items_Avatar: UIProfileChangeItem[] = [];
    @property([UIProfileChangeItem])
    items_Frame: UIProfileChangeItem[] = [];
    @property([UIProfileChangeItem])
    items_Color: UIProfileChangeItem[] = [];
    @property([UIProfileChangeItem])
    items_Badge: UIProfileChangeItem[] = [];
    @property([UIProfileChangeItem])
    items_Nickname: UIProfileChangeItem[] = [];

    @property(Profile)
    profile: Profile;

    @property(UIProfileSavePopup)
    savePopup: UIProfileSavePopup;

    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    saveBtn: Button = null;

    @property(Button)
    changeNameBtn: Button = null;
    @property(Button)
    saveNameBtn: Button = null;

    @property(Node)
    inputNameContainer: Node = null;
    @property(EditBox)
    inputName: EditBox = null;

    @property(Label)
    playerName: Label = null;

    @property([UITab])
    tabs: UITab = [];
    @property([Node])
    frames: Node[] = [];

    @property(Sprite)
    avatar: Sprite = null;
    @property(Sprite)
    frame: Sprite = null;
    @property(Sprite)
    badge: Sprite = null;

    @property([Sprite])
    colors: Sprite[] = [];

    private avatarIndexValue: number = 0;
    private frameIndexValue: number = 0;
    private colorIndexValue: number = 0;
    private badgeIndexValue: number = 0;
    private nameIndexValue: number = 0;

    private isUpdated: boolean = false;
    private isNameUpdated: boolean = false;


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.saveBtn.node.on(Button.EventType.CLICK, this.onSaveBtnClick, this);

        this.changeNameBtn.node.on(Button.EventType.CLICK, this.onChangeNameBtnClick, this);
        this.saveNameBtn.node.on(Button.EventType.CLICK, this.onSaveNameBtnClick, this);

        this.inputName.node.on('editing-did-ended', this.onNameUpdate, this);
        this.inputName.node.on('text-changed', this.onNameUpdate, this);

        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].node.on("tab", (index) => this.showFrame(index));
        }

        let avatars = this.profile.getAvatars();

        for(let i = 0; i < this.items_Avatar.length; i++) {
            if(i >= avatars.length) {
                this.items_Avatar[i].node.active = false;
            }
            else {
                this.items_Avatar[i].init("avatar", avatars[i]);
                this.items_Avatar[i].node.on("click", () => {
                    this.avatarIndexValue = i;

                    this.isUpdated = true;

                    this.refresh();
                });
            }
        }

        let frames = this.profile.getFrames();

        for(let i = 0; i < this.items_Frame.length; i++) {
            if(i >= frames.length) {
                this.items_Frame[i].node.active = false;
            }
            else {
                this.items_Frame[i].init("frame", frames[i]);
                this.items_Frame[i].node.on("click", () => {
                    this.frameIndexValue = i;

                    this.isUpdated = true;

                    this.refresh();
                });
            }
        }

        let colors = this.profile.getColors();

        for(let i = 0; i < this.items_Color.length; i++) {
            if(i >= colors.length) {
                this.items_Color[i].node.active = false;
            }
            else {
                this.items_Color[i].initColor(colors[i]);
                this.items_Color[i].node.on("click", () => {
                    this.colorIndexValue = i;

                    this.isUpdated = true;

                    this.refresh();
                });
            }
        }

        let nickNames = this.profile.getNicknames();
        let outlines = this.profile.getOutlines();

        for(let i = 0; i < this.items_Nickname.length; i++) {
            if(i >= nickNames.length || i >= outlines.length) {
                this.items_Nickname[i].node.active = false;
            }
            else {
                this.items_Nickname[i].initNickName(nickNames[i], outlines[i]);
                this.items_Nickname[i].node.on("click", () => {
                    this.nameIndexValue = i;

                    this.isUpdated = true;

                    this.refresh();
                });
            }
        }

        let badges = this.profile.getBadges();

        for(let i = 0; i < this.items_Badge.length; i++) {
            if(i >= badges.length) {
                this.items_Badge[i].node.active = false;
            }
            else {
                this.items_Badge[i].init("badge", badges[i]);
                this.items_Badge[i].node.on("click", () => {
                    this.badgeIndexValue = i;

                    this.isUpdated = true;

                    this.refresh();
                });
            }
        }


        this.savePopup.node.on("save", () => {
            this.save();

            this.hide();
        });

        this.savePopup.node.on("not_save", () => {
            this.hide();
        });
    }

    
    show() {
        super.show();

        this.isUpdated = false;
        this.isNameUpdated = false;

        this.showFrame(0);

        this.playerName.string = UserData.instance.getPlayerName();
        this.saveBtn.node.active = false;

        this.avatarIndexValue = this.profile.getAvatarId();
        this.frameIndexValue = this.profile.getFrameId();
        this.colorIndexValue = this.profile.getColorId();
        this.badgeIndexValue = this.profile.getBadgeId();
        this.nameIndexValue = this.profile.getNameId();

        this.refresh();
    }


    refresh() {
        this.setAllInactive();

        this.items_Avatar[this.avatarIndexValue].setActive(true);
        this.items_Frame[this.frameIndexValue].setActive(true);
        this.items_Color[this.colorIndexValue].setActive(true);
        this.items_Badge[this.badgeIndexValue].setActive(true);
        this.items_Nickname[this.nameIndexValue].setActive(true);

        this.avatar.spriteFrame = this.profile.getAvatarById(this.avatarIndexValue);
        this.frame.spriteFrame = this.profile.getFrameById(this.frameIndexValue);
        this.badge.spriteFrame = this.profile.getBadgeById(this.badgeIndexValue);
        for(let i = 0; i < this.colors.length; i++) {
            this.colors[i].color = this.profile.getColorById(this.colorIndexValue);
        }
        this.playerName.color = this.profile.getNameById(this.nameIndexValue);
        this.playerName.outlineColor = this.profile.getOutlineById(this.nameIndexValue);

        for(let i = 0; i < this.items_Badge.length; i++) {
            this.items_Badge[i].setLocked(!this.profile.isBadgeAvailable(i));
        }
        for(let i = 0; i < this.items_Frame.length; i++) {
            this.items_Frame[i].setLockedPremium();
        }
        for(let i = 0; i < this.items_Nickname.length; i++) {
            this.items_Nickname[i].setLockedPremium();
        }

        this.saveBtn.node.active = this.isNameUpdated || this.isUpdated;
    }

    setAllInactive() {
        for(let i = 0; i < this.items_Avatar.length; i++) {
            this.items_Avatar[i].setActive(false);
        }

        for(let i = 0; i < this.items_Frame.length; i++) {
            this.items_Frame[i].setActive(false);
        }

        for(let i = 0; i < this.items_Color.length; i++) {
            this.items_Color[i].setActive(false);
        }

        for(let i = 0; i < this.items_Badge.length; i++) {
            this.items_Badge[i].setActive(false);
        }

        for(let i = 0; i < this.items_Nickname.length; i++) {
            this.items_Nickname[i].setActive(false);
        }
    }


    onCloseBtnClick() {
        if(this.isUpdated || this.isNameUpdated) {
            this.savePopup.show();

            return;
        }

        this.hide();
    }

    onSaveBtnClick() {
        this.save();
    }


    save() {
        this.profile.setAvatarId(this.avatarIndexValue);
        this.profile.setFrameId(this.frameIndexValue);
        this.profile.setColorId(this.colorIndexValue);
        this.profile.setBadgeId(this.badgeIndexValue);
        this.profile.setNameId(this.nameIndexValue);

        if(this.isNameUpdated) {
            UserData.instance.updateName(this.playerName.string);

            this.isNameUpdated = false;
        }

        this.isUpdated = false;

        this.node.emit("save");
    }


    hide() {
        super.hide();

        this.hideAllFrames();

        this.node.emit("refresh");
    }


    showFrame(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.tabs[index].setActiveIcon(true);

        this.frames[index].active = true;
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.frames.length; i++) {
            this.frames[i].active = false;
        }
    }


    onChangeNameBtnClick() {
        this.inputNameContainer.active = true;

        this.inputName.string = UserData.instance.getPlayerName();
    }

    onSaveNameBtnClick() {
        if(this.inputName.string !== "") {
            this.isNameUpdated = true;

            this.playerName.string = this.inputName.string;

            this.refresh();
        }
        
        this.inputNameContainer.active = false;
    }


    onNameUpdate() {
        this.isNameUpdated = true;

        this.playerName.string = this.inputName.string;

        this.refresh();
    }
}


