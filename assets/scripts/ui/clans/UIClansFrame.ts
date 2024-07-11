import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { Clans } from '../../game/Clans';
import { UIFrameBase } from '../UIFrameBase';
import { ClanData } from '../../data/ClanData';
import { UIClanInfoPopup } from './UIClanInfoPopup';
import { UIClansObserveFrame } from './UIClansObserveFrame';
import { UITab } from '../main/UITab';
const { ccclass, property } = _decorator;

@ccclass('UIClansFrame')
export class UIClansFrame extends UIFrameBase {

    @property(UIClanInfoPopup)
    clanInfoPopup: UIClanInfoPopup = null;

    @property(UIClansObserveFrame)
    clansObserveFrame: UIClansObserveFrame = null;

    @property(Button)
    createBtn: Button = null;

    @property([UITab])
    tabs: UITab = [];

    @property([UIFrameBase])
    frames: UIFrameBase = [];

    @property(Clans)
    clans: Clans = null;


    start() {
        this.clans.node.on("refresh", (clansData) => this.refresh(clansData));

        this.createBtn.node.on(Button.EventType.CLICK, this.onCreateBtnClick, this);

        this.clanInfoPopup.node.on("join", (id) => this.join(id));
        this.clanInfoPopup.node.on("leave", (id) => this.leave(id));

        this.clansObserveFrame.node.on("show_info", (data) => this.showClanInfo(data));

        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].node.on("tab", (index) => this.showFrame(index));
        }
    }


    refresh(data: ClanData[]) {
        this.clansObserveFrame.refresh(data);

        this.createBtn.node.active = !this.clans.isJoined();

        this.clanInfoPopup.refresh();
    }

    show() {
        super.show();

        this.createBtn.node.active = false;

        this.clans.refresh();

        this.showFrame(0);
    }

    hide() {
        super.hide();

        this.clanInfoPopup.hideClean();

        this.hideAllFrames();
    }


    join(id: number) {
        this.clans.joinClan(id);
    }

    leave(id: number) {
        this.clans.leaveClan(id);
    }


    onCreateBtnClick() {
        this.clans.createClan();
    }


    showClanInfo(data: ClanData) {
        if(this.clanInfoPopup.node.active) {
            return;
        }

        this.clanInfoPopup.init(data);

        this.clanInfoPopup.show();
    }


    showFrame(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.tabs[index].setActiveIcon(true);

        this.frames[index].show();
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.frames.length; i++) {
            this.frames[i].hideClean();
        }
    }
}


